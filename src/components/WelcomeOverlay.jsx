import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function WelcomeOverlay() {
  const { user, justSignedIn, consumeWelcome } = useAuth();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const y = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!justSignedIn) return;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 100, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(y, { toValue: -8, duration: 380, useNativeDriver: true }),
      ]).start(() => consumeWelcome());
    }, 1700);

    return () => clearTimeout(t);
  }, [justSignedIn]);

  if (!justSignedIn) return null;

  const firstName = (user?.name || '').split(' ')[0] || 'reader';

  return (
    <View pointerEvents="none" style={[styles.wrap, { paddingTop: insets.top + 14 }]}>
      <Animated.View style={[
        styles.card,
        { opacity, transform: [{ scale }, { translateY: y }] },
      ]}>
        {user?.photo_url ? (
          <Image source={{ uri: user.photo_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.name} numberOfLines={1}>{firstName}</Text>
        </View>
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    alignItems: 'center',
    zIndex: 10000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: width - 32,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: 'rgba(20,20,24,0.96)',
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceTop,
  },
  avatarFallback: { backgroundColor: colors.surfaceTop },
  hello: { fontSize: 11, color: colors.text3, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '600' },
  name:  { fontSize: 15, fontWeight: '600', color: colors.text1, marginTop: 2 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.saffron,
    marginRight: 4,
  },
});
