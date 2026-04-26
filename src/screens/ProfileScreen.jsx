import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.msg}>Profile coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  msg: { fontSize: 14, color: colors.text3 },
});
