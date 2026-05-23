import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

function GoogleG() {
  return (
    <View style={gStyles.wrap}>
      <Text style={[gStyles.letter, { color: '#4285F4' }]}>G</Text>
    </View>
  );
}

const gStyles = StyleSheet.create({
  wrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  letter: {
    fontSize: 16, fontWeight: '900',
    fontFamily: 'sans-serif-medium',
    lineHeight: 18,
  },
});

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  // entrance animation
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(20)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1, friction: 6, tension: 80, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(lift, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Subtle pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn();
    } catch (e) {
      if (e?.code !== '-5' && e?.code !== '12501') {  // user cancelled
        Alert.alert('Sign-in failed', e?.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const glowScale   = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <View style={[styles.page, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View style={[
        styles.glowOuter, { opacity: glowOpacity, transform: [{ scale: glowScale }] },
      ]} />
      <Animated.View style={[
        styles.glowInner, { opacity: glowOpacity, transform: [{ scale: glowScale }] },
      ]} />

      <View style={styles.content}>
        <Animated.View style={[styles.logo, { transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logoChar}>वा</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }] }}>
          <Text style={styles.title}>
            Vaarta<Text style={styles.titleAI}>AI</Text>
          </Text>
          <Text style={styles.tagline}>News, simplified.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <Text style={styles.helper}>Sign in to save stories and follow topics you care about.</Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.googleBtnLoading]}
          onPress={handleGoogle}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#0a0a0c" size="small" />
              <Text style={styles.googleText}>Signing in…</Text>
            </>
          ) : (
            <>
              <GoogleG />
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimerRow}>
          <Icon name="lock-closed" size={11} color={colors.text3} />
          <Text style={styles.disclaimer}>
            Secure sign-in. We only use your name, email & photo.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  glowOuter: {
    position: 'absolute',
    top: -240, alignSelf: 'center',
    width: 540, height: 540, borderRadius: 270,
    backgroundColor: 'rgba(255,107,53,0.06)',
  },
  glowInner: {
    position: 'absolute',
    top: -180, alignSelf: 'center',
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(255,107,53,0.09)',
  },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: colors.saffron,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 18,
    elevation: 12,
  },
  logoChar: {
    color: '#fff', fontSize: 28,
    fontWeight: '700', fontStyle: 'italic',
    fontFamily: 'serif', letterSpacing: -0.5,
  },
  title: {
    fontSize: 46, fontWeight: '600',
    fontFamily: 'serif', letterSpacing: -1.5,
    color: colors.text1, textAlign: 'center',
  },
  titleAI: { color: colors.saffron, fontStyle: 'italic', fontWeight: '400' },
  tagline: {
    marginTop: 14, fontSize: 14,
    color: colors.text3, textAlign: 'center',
    letterSpacing: -0.1,
  },

  footer: { gap: 16 },
  helper: {
    fontSize: 13, color: colors.text2,
    textAlign: 'center', lineHeight: 19,
    paddingHorizontal: 16,
  },
  googleBtn: {
    height: 56, borderRadius: 14,
    backgroundColor: colors.text1,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
    elevation: 6,
  },
  googleBtnLoading: { opacity: 0.7 },
  googleText: { fontSize: 15, fontWeight: '600', color: '#0a0a0c', letterSpacing: -0.2 },

  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  disclaimer: { fontSize: 11, color: colors.text3, letterSpacing: 0.1 },
});
