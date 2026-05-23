import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import {
  loginWithGoogle as apiLoginWithGoogle,
  fetchPreferences,
  updatePreferences as apiUpdatePreferences,
} from '../services/api';
import {
  saveToken, loadToken, clearToken,
  saveUser, loadUser, clearUser,
} from '../services/authStorage';

export const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID
  || '518781130076-5pjh6vq7gn0uq6g0lt6oorivnf347v3n.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [preferences, setPreferences] = useState(null);   // null = unknown, [] = onboarded but empty, [...] = picked

  // Restore session on cold start
  useEffect(() => {
    (async () => {
      try {
        const [token, cachedUser] = await Promise.all([loadToken(), loadUser()]);
        if (token && cachedUser) {
          setUser(cachedUser);
          // refresh prefs in background
          fetchPreferences()
            .then(p => setPreferences(p?.categories || []))
            .catch(() => setPreferences([]));
        }
      } catch {} finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const signIn = useCallback(async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();

    const idToken = result?.idToken || result?.data?.idToken;
    if (!idToken) throw new Error('No ID token from Google');

    const { token, user: serverUser } = await apiLoginWithGoogle(idToken);
    await Promise.all([saveToken(token), saveUser(serverUser)]);
    setUser(serverUser);
    setJustSignedIn(true);

    // Fetch preferences immediately so navigator can route correctly
    try {
      const p = await fetchPreferences();
      setPreferences(p?.categories || []);
    } catch {
      setPreferences([]);
    }
    return serverUser;
  }, []);

  const signOut = useCallback(async () => {
    try { await GoogleSignin.signOut(); } catch {}
    await Promise.all([clearToken(), clearUser()]);
    setUser(null);
    setPreferences(null);
    setJustSignedIn(false);
  }, []);

  const savePreferences = useCallback(async (categories) => {
    const saved = await apiUpdatePreferences(categories);
    setPreferences(saved?.categories || categories);
    return saved;
  }, []);

  const consumeWelcome = useCallback(() => setJustSignedIn(false), []);

  return (
    <AuthContext.Provider value={{
      user, bootstrapping, justSignedIn, preferences,
      signIn, signOut, consumeWelcome, savePreferences,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
