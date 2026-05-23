import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStory } from '../hooks/useStory';
import { addBookmark, removeBookmark, fetchBookmarkIds } from '../services/api';
import { timeAgo, catColor, faviconPalette, formatCategory } from '../utils/helpers';
import { colors } from '../utils/theme';

function TrustBar({ score }) {
  const filled = Math.round(score ?? 0);
  return (
    <View style={styles.trustBar}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[styles.trustSeg, i < filled ? styles.trustOn : styles.trustOff]}
        />
      ))}
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function StoryDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const insets = useSafeAreaInsets();
  const { story, loading, error } = useStory(params?.clusterId);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!params?.clusterId) return;
    fetchBookmarkIds()
      .then(r => setBookmarked((r?.cluster_ids || []).includes(params.clusterId)))
      .catch(() => {});
  }, [params?.clusterId]);

  const toggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);  // optimistic
    try {
      if (next) await addBookmark(params.clusterId);
      else      await removeBookmark(params.clusterId);
    } catch {
      setBookmarked(!next);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.saffron} size="large" />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={styles.errorTitle}>Story not found</Text>
        <TouchableOpacity style={styles.backPill} onPress={() => navigation.goBack()}>
          <Text style={styles.backPillText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = catColor(story.category);

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <View style={styles.hero}>
          {story.image_url
            ? <Image source={{ uri: story.image_url }} style={styles.heroImg} resizeMode="cover" />
            : <View style={styles.heroFallback} />}

          {/* gradient overlay */}
          <View style={styles.heroGrad} />

          {/* back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 14 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* bookmark button */}
          <TouchableOpacity
            style={[styles.bookmarkBtn, { top: insets.top + 14 }]}
            onPress={toggleBookmark}
            activeOpacity={0.75}
          >
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? colors.saffron : '#fff'}
            />
          </TouchableOpacity>

          {/* category + time pinned to bottom of hero */}
          <View style={styles.heroMeta}>
            <View style={[styles.catChip, { backgroundColor: accent + '30', borderColor: accent + '70' }]}>
              <Text style={[styles.catChipText, { color: accent }]}>
                {formatCategory(story.category)}
              </Text>
            </View>
            <Text style={styles.heroTime}>{timeAgo(story.created_at)}</Text>
          </View>
        </View>

        {/* ── Body ───────────────────────────────────────────── */}
        <View style={styles.body}>

          {/* Headline */}
          <Text style={styles.headline}>{story.headline}</Text>

          {/* Byline */}
          <View style={styles.byline}>
            <View style={[styles.bylineDot, { backgroundColor: accent }]} />
            <Text style={styles.bylineText}>
              {story.sources?.length ?? 0} source{(story.sources?.length ?? 0) !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.bylineSep}>·</Text>
            <Text style={styles.bylineText}>3 min read</Text>
          </View>

          {/* Why it matters */}
          {story.why_it_matters ? (
            <View style={[styles.whyBox, { borderLeftColor: accent }]}>
              <Text style={[styles.whyLabel, { color: accent }]}>WHY IT MATTERS</Text>
              <Text style={styles.whyText}>{story.why_it_matters}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* Summary */}
          <Text style={styles.summary}>{story.summary}</Text>

          {/* Background */}
          {story.background ? (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <SectionLabel>BACKGROUND</SectionLabel>
                <Text style={styles.bgText}>{story.background}</Text>
              </View>
            </>
          ) : null}

          {/* Topics */}
          {story.topics?.length > 0 && (
            <View style={styles.section}>
              <SectionLabel>TOPICS</SectionLabel>
              <View style={styles.chips}>
                {story.topics.map((t, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Entities */}
          {story.entities?.length > 0 && (
            <View style={styles.section}>
              <SectionLabel>KEY PEOPLE & PLACES</SectionLabel>
              <View style={styles.chips}>
                {story.entities.map((e, i) => (
                  <View key={i} style={[styles.chip, {
                    backgroundColor: accent + '14',
                    borderColor: accent + '44',
                  }]}>
                    <Text style={[styles.chipText, { color: accent }]}>{e}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sources */}
          {story.sources?.length > 0 && (
            <View style={styles.section}>
              <SectionLabel>COVERED BY</SectionLabel>
              {story.sources.map((src, i) => {
                const pal = faviconPalette(i);
                const initials = src.name
                  .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <View key={i} style={[
                    styles.sourceRow,
                    i === story.sources.length - 1 && { borderBottomWidth: 0 },
                  ]}>
                    <View style={[styles.avatar, { backgroundColor: pal.bg }]}>
                      <Text style={[styles.avatarText, { color: pal.color }]}>{initials}</Text>
                    </View>
                    <Text style={styles.sourceName} numberOfLines={1}>{src.name}</Text>
                    <TrustBar score={src.trust_score} />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const HERO_H = 290;

const styles = StyleSheet.create({
  page:   { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.bg },

  errorTitle: { fontSize: 16, fontWeight: '600', color: colors.text1 },
  backPill: {
    paddingHorizontal: 22, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1,
    borderColor: colors.saffron,
  },
  backPillText: { fontSize: 13, fontWeight: '600', color: colors.saffron },

  // ── Hero
  hero: { height: HERO_H, backgroundColor: colors.surfaceHigh },
  heroImg: { width: '100%', height: '100%' },
  heroFallback: { width: '100%', height: '100%', backgroundColor: '#1a1f2e' },
  heroGrad: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,12,0.48)',
  },

  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 30, lineHeight: 34, marginTop: -2, marginLeft: -1 },
  bookmarkBtn: {
    position: 'absolute',
    right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroMeta: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catChip: {
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  catChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  heroTime: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)' },

  // ── Body
  body: { paddingHorizontal: 22, paddingTop: 24 },

  headline: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.text1,
    marginBottom: 14,
  },

  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 6,
  },
  bylineDot: { width: 6, height: 6, borderRadius: 3 },
  bylineText: { fontSize: 12, color: colors.text3 },
  bylineSep:  { fontSize: 12, color: colors.text4 },

  whyBox: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 4,
    marginBottom: 22,
  },
  whyLabel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.8,
    textTransform: 'uppercase', marginBottom: 7,
  },
  whyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text1,
    fontStyle: 'italic',
  },

  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: 22,
  },

  summary: {
    fontSize: 15.5,
    lineHeight: 26,
    color: colors.text2,
    letterSpacing: -0.1,
  },

  section: { marginTop: 28 },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text3,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  bgText: { fontSize: 14, lineHeight: 22, color: colors.text2 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 12.5, color: colors.text2 },

  // sources
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 13,
  },
  avatar: {
    width: 36, height: 36,
    borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 11.5, fontWeight: '800' },
  sourceName: { flex: 1, fontSize: 13.5, fontWeight: '500', color: colors.text1 },

  // trust bar
  trustBar: { flexDirection: 'row', gap: 3 },
  trustSeg: { width: 14, height: 4, borderRadius: 2 },
  trustOn:  { backgroundColor: colors.gold },
  trustOff: { backgroundColor: colors.text4 },
});
