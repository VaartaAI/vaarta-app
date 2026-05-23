import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

const CATEGORIES = [
  { key: 'politics',      label: 'Politics',      icon: 'megaphone-outline',     accent: colors.catPolitics },
  { key: 'business',      label: 'Business',      icon: 'briefcase-outline',     accent: colors.catBusiness },
  { key: 'tech',          label: 'Technology',    icon: 'hardware-chip-outline', accent: colors.catTech     },
  { key: 'sports',        label: 'Sports',        icon: 'football-outline',      accent: colors.catSports   },
  { key: 'entertainment', label: 'Entertainment', icon: 'film-outline',          accent: colors.catEnt      },
  { key: 'health',        label: 'Health',        icon: 'fitness-outline',       accent: colors.catHealth   },
  { key: 'science',       label: 'Science',       icon: 'flask-outline',         accent: colors.catScience  },
  { key: 'general',       label: 'General',       icon: 'globe-outline',         accent: colors.catGeneral  },
];

const MIN_PICKS = 3;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const isEditMode = route.name === 'EditInterests';
  const { savePreferences, preferences, user } = useAuth();
  const [selected, setSelected] = useState(new Set(preferences || []));
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canContinue = selected.size >= MIN_PICKS;

  const handleContinue = async () => {
    if (!canContinue) return;
    setSaving(true);
    try {
      await savePreferences(Array.from(selected));
      if (isEditMode && navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save', e?.message || 'Try again');
    } finally {
      setSaving(false);
    }
  };

  const firstName = (user?.name || '').split(' ')[0] || 'there';

  return (
    <View style={styles.page}>
      {isEditMode ? (
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={26} color={colors.text1} />
        </TouchableOpacity>
      ) : null}

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {isEditMode ? 'YOUR INTERESTS' : `WELCOME, ${firstName.toUpperCase()}`}
          </Text>
          <Text style={styles.title}>
            {isEditMode ? 'Edit your\ninterests' : 'What are you\ninterested in?'}
          </Text>
          <Text style={styles.subtitle}>
            Pick at least {MIN_PICKS} topics. We'll personalise your feed around them.
          </Text>
        </View>

        <View style={styles.grid}>
          {CATEGORIES.map(cat => {
            const isSel = selected.has(cat.key);
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.card,
                  isSel && {
                    borderColor: cat.accent,
                    backgroundColor: cat.accent + '14',
                  },
                ]}
                onPress={() => toggle(cat.key)}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.cardIcon,
                  isSel && { backgroundColor: cat.accent + '22' },
                ]}>
                  <Icon
                    name={cat.icon}
                    size={22}
                    color={isSel ? cat.accent : colors.text2}
                  />
                </View>
                <Text style={[
                  styles.cardLabel,
                  isSel && { color: colors.text1, fontWeight: '600' },
                ]}>
                  {cat.label}
                </Text>
                {isSel ? (
                  <View style={[styles.check, { backgroundColor: cat.accent }]}>
                    <Icon name="checkmark" size={12} color="#fff" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Text style={styles.counter}>
          {selected.size} selected{selected.size < MIN_PICKS ? ` · pick ${MIN_PICKS - selected.size} more` : ''}
        </Text>
        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          disabled={!canContinue || saving}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#0a0a0c" />
          ) : (
            <>
              <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
                {isEditMode ? 'Save' : 'Continue'}
              </Text>
              <Icon
                name="arrow-forward"
                size={18}
                color={canContinue ? '#0a0a0c' : colors.text4}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },

  backBtn: {
    position: 'absolute',
    left: 12,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },

  header: { paddingHorizontal: 24, marginBottom: 28 },
  eyebrow: {
    fontSize: 10, fontWeight: '700',
    color: colors.saffron, letterSpacing: 1.6,
    marginBottom: 12,
  },
  title: {
    fontSize: 30, fontWeight: '600',
    fontFamily: 'serif', letterSpacing: -1,
    lineHeight: 36, color: colors.text1,
  },
  subtitle: {
    marginTop: 12, fontSize: 14,
    lineHeight: 20, color: colors.text3,
  },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  card: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surfaceTop,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14, color: colors.text2,
    letterSpacing: -0.2,
  },
  check: {
    position: 'absolute',
    top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 22, paddingTop: 14,
    backgroundColor: 'rgba(10,10,12,0.96)',
    borderTopWidth: 1, borderTopColor: colors.hairline,
  },
  counter: {
    fontSize: 12, color: colors.text3,
    textAlign: 'center', marginBottom: 12,
    letterSpacing: 0.2,
  },
  cta: {
    height: 54, borderRadius: 14,
    backgroundColor: colors.text1,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 10,
  },
  ctaDisabled: { backgroundColor: colors.surfaceTop },
  ctaText: {
    fontSize: 15, fontWeight: '600',
    color: '#0a0a0c', letterSpacing: -0.2,
  },
  ctaTextDisabled: { color: colors.text4 },
});
