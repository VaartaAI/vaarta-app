import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookmarkIds } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

function StatCard({ value, label, icon }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={18} color={colors.saffron} style={{ marginBottom: 6 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, value, onPress, danger, last }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <>
      <Wrap style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.rowIcon, danger && { backgroundColor: 'rgba(224,92,92,0.12)' }]}>
          <Icon
            name={icon}
            size={16}
            color={danger ? '#e05c5c' : colors.text2}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, danger && { color: '#e05c5c' }]}>{label}</Text>
          {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
        </View>
        {onPress && !danger ? (
          <Icon name="chevron-forward" size={16} color={colors.text4} />
        ) : null}
      </Wrap>
      {!last && <View style={styles.divider} />}
    </>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, signOut, preferences } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useFocusEffect(useCallback(() => {
    fetchBookmarkIds()
      .then(r => setBookmarkCount((r?.cluster_ids || []).length))
      .catch(() => {});
  }, []));

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const initials = (user?.name || user?.email || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ─────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          {user?.photo_url ? (
            <Image source={{ uri: user.photo_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name || 'Reader'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Member</Text>
        </View>
      </View>

      {/* ── Stats ────────────────────────────────── */}
      <View style={styles.stats}>
        <StatCard value={String(bookmarkCount)} label="Bookmarks" icon="bookmark" />
        <View style={styles.statSep} />
        <StatCard value="0"  label="Read"      icon="newspaper-outline" />
        <View style={styles.statSep} />
        <StatCard value="—"  label="Streak"    icon="flame-outline" />
      </View>

      {/* ── Account ──────────────────────────────── */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.card}>
        <Row icon="mail-outline"   label="Email"  value={user?.email} />
        <Row icon="person-outline" label="Name"   value={user?.name || '—'} last />
      </View>

      {/* ── Preferences ──────────────────────────── */}
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      <View style={styles.card}>
        <Row
          icon="sparkles-outline"
          label="Edit interests"
          value={preferences?.length ? `${preferences.length} selected` : 'Set'}
          onPress={() => navigation.navigate('EditInterests')}
        />
        <Row icon="notifications-outline" label="Notifications" onPress={() => {}} />
        <Row icon="globe-outline"         label="Language"      value="English" onPress={() => {}} />
        <Row icon="moon-outline"          label="Appearance"    value="Dark"    onPress={() => {}} last />
      </View>

      {/* ── About ────────────────────────────────── */}
      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={styles.card}>
        <Row icon="information-circle-outline" label="Version" value="1.0.0" />
        <Row icon="document-text-outline"      label="Privacy Policy" onPress={() => {}} />
        <Row icon="shield-checkmark-outline"   label="Terms of Service" onPress={() => {}} last />
      </View>

      {/* ── Danger zone ──────────────────────────── */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <Row icon="log-out-outline" label="Sign out" onPress={handleSignOut} danger last />
      </View>

      <Text style={styles.footnote}>Made with ❤︎ by VaartaAI</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },

  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    padding: 3,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,53,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 14,
    elevation: 6,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.surfaceTop,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.text1 },

  name: { fontSize: 20, fontWeight: '600', color: colors.text1, letterSpacing: -0.4 },
  email: { fontSize: 13, color: colors.text3, marginTop: 4 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1, borderColor: colors.saffronLine,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.saffron,
  },
  badgeText: {
    fontSize: 10, fontWeight: '700',
    color: colors.saffron,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  // Stats
  stats: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: colors.hairline,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text1, letterSpacing: -0.3 },
  statLabel: { fontSize: 10.5, color: colors.text3, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '600', marginTop: 4 },
  statSep: { width: 1, backgroundColor: colors.hairline, marginVertical: 4 },

  // Sections
  sectionLabel: {
    fontSize: 9, fontWeight: '700',
    color: colors.text3, letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginTop: 26, marginBottom: 10,
    paddingHorizontal: 22,
  },
  card: {
    marginHorizontal: 18,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.hairline,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    gap: 12,
  },
  rowIcon: {
    width: 30, height: 30,
    borderRadius: 9,
    backgroundColor: colors.surfaceTop,
    alignItems: 'center', justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, color: colors.text1, fontWeight: '500' },
  rowValue: { fontSize: 12, color: colors.text3, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.hairline, marginLeft: 56 },

  footnote: {
    textAlign: 'center',
    fontSize: 11, color: colors.text4,
    marginTop: 28, letterSpacing: 0.3,
  },
});
