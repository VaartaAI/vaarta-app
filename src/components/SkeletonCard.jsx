import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

function Bone({ style }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.bone, style, { opacity }]} />;
}

export function SkeletonLeadCard() {
  return (
    <View style={styles.leadCard}>
      <Bone style={styles.leadImage} />
      <Bone style={styles.metaLine} />
      <Bone style={styles.headlineLine1} />
      <Bone style={styles.headlineLine2} />
      <Bone style={styles.previewLine1} />
      <Bone style={styles.previewLine2} />
      <Bone style={styles.footLine} />
    </View>
  );
}

export function SkeletonRowCard() {
  return (
    <View style={styles.rowCard}>
      <View style={styles.rowContent}>
        <Bone style={styles.rowMeta} />
        <Bone style={styles.rowLine1} />
        <Bone style={styles.rowLine2} />
        <Bone style={styles.rowFoot} />
      </View>
      <Bone style={styles.rowImage} />
    </View>
  );
}

const BONE_COLOR = colors.surfaceTop || '#181820';

const styles = StyleSheet.create({
  bone: {
    backgroundColor: BONE_COLOR,
    borderRadius: 6,
  },

  // Lead skeleton
  leadCard: {
    padding: 22,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  leadImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  metaLine:    { width: 100, height: 10, marginBottom: 10 },
  headlineLine1: { width: '95%', height: 18, marginBottom: 6 },
  headlineLine2: { width: '70%', height: 18, marginBottom: 12 },
  previewLine1:  { width: '100%', height: 12, marginBottom: 6 },
  previewLine2:  { width: '80%', height: 12, marginBottom: 14 },
  footLine:      { width: 100, height: 10 },

  // Row skeleton
  rowCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 8 },
  rowMeta:  { width: 80,   height: 9  },
  rowLine1: { width: '95%', height: 14 },
  rowLine2: { width: '75%', height: 14 },
  rowFoot:  { width: 80,   height: 9  },
  rowImage: { width: 76, height: 76, borderRadius: 10, flexShrink: 0 },
});
