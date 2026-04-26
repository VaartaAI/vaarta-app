import React, { useState, useRef } from 'react';
import {
  StatusBar, View, Text, Animated,
  TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

const { width } = Dimensions.get('screen');

function SplashScreen({ onDismiss }: { onDismiss: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.splash, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      {/* Saffron glow behind — approximates the radial gradient from the design */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Centre content */}
      <View style={styles.splashContent}>
        <View style={styles.logoMark}>
          <Text style={styles.logoChar}>वा</Text>
        </View>

        <Text style={styles.splashTitle}>
          {'Vaarta'}
          <Text style={styles.splashAI}>{'AI'}</Text>
        </Text>

        <Text style={styles.splashTagline}>News, simplified.</Text>

        <View style={styles.splashDivider} />
      </View>

      {/* Bottom CTA */}
      <View style={styles.splashFoot}>
        <TouchableOpacity style={styles.cta} onPress={onDismiss} activeOpacity={0.88}>
          <Text style={styles.ctaText}>Read Today's News</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </TouchableOpacity>
        <Text style={styles.footnote}>
          {'SUMMARISED'}
          <Text style={styles.footDot}>{'  ·  '}</Text>
          {'CLUSTERED'}
          <Text style={styles.footDot}>{'  ·  '}</Text>
          {'TRUSTED'}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  const dismissSplash = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 420,
      useNativeDriver: true,
    }).start(() => setSplashVisible(false));
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0c" translucent={false} />
      <AppNavigator />
      {splashVisible && (
        <Animated.View style={[styles.overlay, { opacity }]}>
          <SplashScreen onDismiss={dismissSplash} />
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0,
    width,
    height: '100%',
    zIndex: 9999,
    elevation: 9999,
  },

  splash: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  // Soft saffron glow at the top (approximates CSS radial-gradient)
  glowOuter: {
    position: 'absolute',
    top: -220,
    alignSelf: 'center',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255,107,53,0.05)',
  },
  glowInner: {
    position: 'absolute',
    top: -160,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,107,53,0.07)',
  },

  // ── Centre ───────────────────────────────────────────────────────────
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // Inner highlight to match the CSS ::before gradient
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoChar: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },

  splashTitle: {
    fontSize: 44,
    fontWeight: '600',
    fontFamily: 'serif',
    letterSpacing: -1.5,
    color: '#f0f0ec',
    lineHeight: 48,
  },
  splashAI: {
    color: '#ff6b35',
    fontStyle: 'italic',
    fontWeight: '400',
  },

  splashTagline: {
    marginTop: 16,
    fontSize: 14,
    color: '#94948e',
    letterSpacing: -0.1,
  },

  splashDivider: {
    marginTop: 32,
    width: 24,
    height: 1,
    backgroundColor: '#38383a',
  },

  // ── Bottom ───────────────────────────────────────────────────────────
  splashFoot: {
    gap: 18,
  },

  cta: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f0f0ec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0c',
    letterSpacing: -0.2,
  },
  ctaArrow: {
    fontSize: 16,
    color: '#0a0a0c',
    fontWeight: '500',
  },

  footnote: {
    textAlign: 'center',
    fontSize: 10,
    color: '#5a5a55',
    letterSpacing: 1.4,
    fontWeight: '500',
    textTransform: 'uppercase',
    paddingBottom: 4,
  },
  footDot: {
    color: '#38383a',
    letterSpacing: 0,
  },
});
