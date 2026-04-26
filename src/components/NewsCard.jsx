import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { timeAgo, catColor, formatCategory } from '../utils/helpers';
import { colors } from '../utils/theme';

export default function NewsCard({ item, isLead = false }) {
  const navigation = useNavigation();
  const handlePress = () => navigation.navigate('StoryDetail', { clusterId: item.cluster_id });

  if (isLead) {
    return (
      <TouchableOpacity style={styles.leadCard} onPress={handlePress} activeOpacity={0.85}>
        {/* Hero image */}
        <View style={styles.leadImageWrap}>
          {item.image_url
            ? <Image source={{ uri: item.image_url }} style={styles.leadImage} resizeMode="cover" />
            : <View style={styles.leadImageFallback} />}
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={[styles.cat, { color: catColor(item.category) }]}>
            {formatCategory(item.category)}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metaTime}>{timeAgo(item.created_at)}</Text>
        </View>

        {/* Headline */}
        <Text style={styles.leadHeadline} numberOfLines={2}>{item.headline}</Text>

        {/* Summary */}
        <Text style={styles.leadPreview} numberOfLines={2}>{item.summary}</Text>

        {/* Footer */}
        <View style={styles.cardFoot}>
          <View style={styles.sourcesRow}>
            <View style={styles.sourcesDot} />
            <Text style={styles.sourcesText}>
              Across {item.source_count} source{item.source_count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.rowCard} onPress={handlePress} activeOpacity={0.75}>
      <View style={styles.rowContent}>
        <View style={styles.rowMeta}>
          <Text style={[styles.cat, { color: catColor(item.category) }]}>
            {formatCategory(item.category)}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metaTime}>{timeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.rowHeadline} numberOfLines={3}>{item.headline}</Text>
        <Text style={styles.rowFoot}>
          Across {item.source_count} source{item.source_count !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.rowImageWrap}>
        {item.image_url
          ? <Image source={{ uri: item.image_url }} style={styles.rowImage} resizeMode="cover" />
          : <View style={styles.rowImageFallback} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Lead ─────────────────────────────────────────────────────────────
  leadCard: {
    padding: 22,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  leadImageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a2030',
    marginBottom: 14,
  },
  leadImage: { width: '100%', height: '100%' },
  leadImageFallback: { width: '100%', height: '100%', backgroundColor: '#1a2030' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cat: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
  },
  dot: {
    width: 2, height: 2,
    borderRadius: 1,
    backgroundColor: colors.text4,
    marginHorizontal: 8,
  },
  metaTime: { fontSize: 10.5, color: colors.text3 },

  leadHeadline: {
    fontFamily: 'serif',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 26,
    letterSpacing: -0.5,
    color: colors.text1,
    marginBottom: 8,
  },
  leadPreview: {
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.text2,
    letterSpacing: -0.1,
    marginBottom: 14,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourcesRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sourcesDot: {
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.saffron,
  },
  sourcesText: {
    fontSize: 11,
    color: colors.text2,
    fontWeight: '500',
  },

  // ── Row ──────────────────────────────────────────────────────────────
  rowCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 18,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 6 },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rowHeadline: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.4,
    color: colors.text1,
  },
  rowFoot: {
    marginTop: 4,
    fontSize: 10.5,
    color: colors.text3,
  },
  rowImageWrap: {
    width: 76, height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  rowImage: { width: '100%', height: '100%' },
  rowImageFallback: {
    width: '100%', height: '100%',
    backgroundColor: '#2a2a30',
  },
});
