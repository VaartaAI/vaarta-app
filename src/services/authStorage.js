import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_SERVICE = 'vaarta.auth.token';
const USER_KEY = '@vaarta/user';

// ── JWT (encrypted in OS Keystore/Keychain) ─────────────────────
export async function saveToken(token) {
  await Keychain.setGenericPassword('jwt', token, { service: TOKEN_SERVICE });
}

export async function loadToken() {
  const creds = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
  return creds ? creds.password : null;
}

export async function clearToken() {
  await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
}

// ── User profile (plain — fast UI on cold start) ────────────────
export async function saveUser(user) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadUser() {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}
