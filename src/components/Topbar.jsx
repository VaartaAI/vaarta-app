import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/theme';

export default function Topbar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Text style={styles.markText}>वा</Text>
        </View>
        <Text style={styles.wordmark}>
          {'Vaarta'}
          <Text style={styles.wordmarkAI}>{'AI'}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    fontFamily: 'serif',
    letterSpacing: -0.3,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'serif',
    letterSpacing: -0.6,
    color: colors.text1,
  },
  wordmarkAI: {
    color: colors.saffron,
    fontStyle: 'italic',
    fontWeight: '400',
  },
});
