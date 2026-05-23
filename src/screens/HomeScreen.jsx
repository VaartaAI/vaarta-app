import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { getFeed } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { timeAgo, catColor, formatCategory } from '../utils/helpers';
import { colors } from '../utils/theme';

const CATEGORIES = [
  { key: 'politics',      label: 'Politics',  icon: 'megaphone-outline',     accent: colors.catPolitics },
  { key: 'business',      label: 'Business',  icon: 'briefcase-outline',     accent: colors.catBusiness },
  { key: 'tech',          label: 'Tech',      icon: 'hardware-chip-outline', accent: colors.catTech     },
  { key: 'sports',        label: 'Sports',    icon: 'football-outline',      accent: colors.catSports   },
  { key: 'entertainment', label: 'Entertain', icon: 'film-outline',          accent: colors.catEnt      },
  { key: 'health',        label: 'Health',    icon: 'fitness-outline',       accent: colors.catHealth   },
  { key: 'science',       label: 'Science',   icon: 'flask-outline',         accent: colors.catScience  },
  { key: 'general',       label: 'General',   icon: 'globe-outline',         accent: colors.catGeneral  },
];

// Placeholder market data — wire to real API later
const MARKET = [
  { label: 'Gold',    sub: 'per gram',  value: '₹6,234', change: '+0.8%', up: true,  icon: 'trending-up'   },
  { label: 'Silver',  sub: 'per kg',    value: '₹78,500',change: '-0.3%', up: false, icon: 'trending-down' },
  { label: 'USD/INR', sub: 'spot',      value: '84.32',  change: '+0.1%', up: true,  icon: 'trending-up'   },
];

function CategoryTile({ cat, onPress }) {
  return (
    <TouchableOpacity style={styles.catTile} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.catIcon, { backgroundColor: cat.accent + '20' }]}>
        <Icon name={cat.icon} size={22} color={cat.accent} />
      </View>
      <Text style={styles.catLabel}>{cat.label}</Text>
    </TouchableOpacity>
  );
}

function MarketCard({ item }) {
  const tone = item.up ? '#4caf7d' : '#e05c5c';
  return (
    <View style={styles.market}>
      <Text style={styles.marketLabel}>{item.label}</Text>
      <Text style={styles.marketValue}>{item.value}</Text>
      <View style={styles.marketRow}>
        <Icon name={item.icon} size={11} color={tone} />
        <Text style={[styles.marketChange, { color: tone }]}>{item.change}</Text>
        <Text style={styles.marketSub}>· {item.sub}</Text>
      </View>
    </View>
  );
}

function TopStoryCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.topCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topImageWrap}>
        {item.image_url
          ? <Image source={{ uri: item.image_url }} style={styles.topImage} resizeMode="cover" />
          : <View style={[styles.topImage, { backgroundColor: '#1a2030' }]} />}
        <View style={styles.topScrim} />
        <View style={[styles.topCatChip, { backgroundColor: catColor(item.category) + '33', borderColor: catColor(item.category) + '66' }]}>
          <Text style={[styles.topCatText, { color: catColor(item.category) }]}>
            {formatCategory(item.category)}
          </Text>
        </View>
      </View>
      <View style={styles.topBody}>
        <Text style={styles.topHeadline} numberOfLines={3}>{item.headline}</Text>
        <Text style={styles.topMeta}>
          {item.source_count} source{item.source_count !== 1 ? 's' : ''} · {timeAgo(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [topStories, setTopStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      // pull non-personalized feed for top stories
      const items = await getFeed('all', 1, 8);
      setTopStories(items.slice(0, 6));
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const goToCategory = (cat) => {
    navigation.navigate('CategoryFeed', { category: cat.key, label: cat.label });
  };

  const goToStory = (item) => {
    navigation.navigate('StoryDetail', { clusterId: item.cluster_id });
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing} onRefresh={onRefresh}
          tintColor={colors.saffron}
        />
      }
    >
      {/* ── Greeting ─────────────────────────── */}
      <View style={styles.greeting}>
        <Text style={styles.greetEyebrow}>{today.toUpperCase()}</Text>
        <Text style={styles.greetTitle}>Hi, {firstName}</Text>
      </View>

      {/* ── Markets ──────────────────────────── */}
      <View style={styles.markets}>
        {MARKET.map(m => <MarketCard key={m.label} item={m} />)}
      </View>

      {/* ── Top Stories ──────────────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Top stories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
          <Text style={styles.sectionAction}>See all →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.topLoader}>
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 14 }}
        >
          {topStories.map(item => (
            <TopStoryCard key={item.id} item={item} onPress={() => goToStory(item)} />
          ))}
        </ScrollView>
      )}

      {/* ── Explore by category ──────────────── */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Explore</Text>
      </View>
      <View style={styles.catGrid}>
        {CATEGORIES.map(cat => (
          <CategoryTile key={cat.key} cat={cat} onPress={() => goToCategory(cat)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },

  // Greeting
  greeting: { paddingHorizontal: 22, marginBottom: 18 },
  greetEyebrow: {
    fontSize: 10, fontWeight: '700',
    color: colors.saffron, letterSpacing: 1.6,
    marginBottom: 6,
  },
  greetTitle: {
    fontSize: 28, fontWeight: '600',
    fontFamily: 'serif', letterSpacing: -0.8,
    color: colors.text1,
  },

  // Markets
  markets: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 26,
  },
  market: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.hairline,
    padding: 12,
  },
  marketLabel: {
    fontSize: 10, fontWeight: '700',
    color: colors.text3, letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  marketValue: {
    fontSize: 16, fontWeight: '700',
    color: colors.text1,
    marginTop: 8, letterSpacing: -0.4,
  },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  marketChange: { fontSize: 11, fontWeight: '600' },
  marketSub:    { fontSize: 10, color: colors.text4 },

  // Sections
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 8, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17, fontWeight: '600',
    color: colors.text1, letterSpacing: -0.4,
  },
  sectionAction: {
    fontSize: 12, color: colors.saffron,
    fontWeight: '600',
  },

  // Top stories
  topLoader: { paddingVertical: 32, alignItems: 'center' },
  topCard: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.hairline,
    overflow: 'hidden',
  },
  topImageWrap: {
    width: '100%', height: 130,
    backgroundColor: '#1a2030',
  },
  topImage: { width: '100%', height: '100%' },
  topScrim: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topCatChip: {
    position: 'absolute',
    bottom: 10, left: 10,
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 999, borderWidth: 1,
  },
  topCatText: {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 0.7, textTransform: 'uppercase',
  },
  topBody: { padding: 12 },
  topHeadline: {
    fontSize: 13.5,
    fontFamily: 'serif',
    fontWeight: '500',
    lineHeight: 19,
    color: colors.text1,
    letterSpacing: -0.3,
  },
  topMeta: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 8,
  },

  // Categories grid
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
    marginTop: 4,
  },
  catTile: {
    width: '23%',
    aspectRatio: 0.95,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.hairline,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  catIcon: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  catLabel: {
    fontSize: 11, fontWeight: '500',
    color: colors.text2,
    letterSpacing: -0.1,
  },
});
