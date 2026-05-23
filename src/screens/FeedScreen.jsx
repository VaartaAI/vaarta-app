import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, StyleSheet, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { getFeed, addBookmark, removeBookmark, fetchBookmarkIds } from '../services/api';
import { timeAgo, catColor, formatCategory } from '../utils/helpers';
import { colors } from '../utils/theme';

const { height: SCREEN_H } = Dimensions.get('window');

const PAGE_SIZE      = 15;
const PREFETCH_AHEAD = 3;

function ReelCard({ item, cardHeight, isBookmarked, onToggleBookmark }) {
  const accent = catColor(item.category);

  return (
    <View style={[styles.card, { height: cardHeight }]}>
      {/* ── Image (top) ───────────────────────────── */}
      <View style={styles.imageWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: '#1a2030' }]} />
        )}

        {/* Full-cover overlay so text on top is always readable */}
        <View style={styles.imageScrim} />

        <View style={[styles.catChip, { backgroundColor: accent + '33', borderColor: accent + '70' }]}>
          <Text style={[styles.catText, { color: accent }]}>
            {formatCategory(item.category)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={onToggleBookmark}
          activeOpacity={0.75}
        >
          <Icon
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? colors.saffron : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Body (rest) ───────────────────────────── */}
      <View style={styles.body}>
        <Text style={styles.headline} numberOfLines={3}>{item.headline}</Text>

        <Text style={styles.summary} numberOfLines={6}>{item.summary}</Text>

        {item.why_it_matters ? (
          <View style={[styles.whyBox, { borderLeftColor: accent }]}>
            <Text style={[styles.whyLabel, { color: accent }]}>WHY IT MATTERS</Text>
            <Text style={styles.whyText} numberOfLines={4}>{item.why_it_matters}</Text>
          </View>
        ) : null}

        <View style={styles.foot}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={styles.footMeta}>
            Across {item.source_count} source{item.source_count !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.footSep}>·</Text>
          <Text style={styles.footMeta}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkSet, setBookmarkSet] = useState(new Set());

  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const itemsRef = useRef([]);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const TAB_BAR_H  = 56 + insets.bottom;
  const cardHeight = SCREEN_H - insets.top - TAB_BAR_H;

  const prefetchUpcoming = useCallback((startIdx) => {
    const list = itemsRef.current;
    for (let i = startIdx + 1; i <= startIdx + PREFETCH_AHEAD && i < list.length; i++) {
      const url = list[i]?.image_url;
      if (url) Image.prefetch(url).catch(() => {});
    }
  }, []);

  const loadFirst = useCallback(async () => {
    try {
      const [feed, bm] = await Promise.all([
        getFeed('all', 1, PAGE_SIZE),
        fetchBookmarkIds().catch(() => ({ cluster_ids: [] })),
      ]);
      setItems(feed);
      setPage(1);
      setHasMore(feed.length === PAGE_SIZE);
      setBookmarkSet(new Set(bm.cluster_ids || []));

      feed.slice(0, PREFETCH_AHEAD + 1).forEach(it => {
        if (it.image_url) Image.prefetch(it.image_url).catch(() => {});
      });
    } catch {
      // empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const more = await getFeed('all', next, PAGE_SIZE);
      if (more.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => {
          const seen = new Set(prev.map(i => i.id));
          const fresh = more.filter(i => !seen.has(i.id));
          return [...prev, ...fresh];
        });
        setPage(next);
        if (more.length < PAGE_SIZE) setHasMore(false);
      }
    } catch {} finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  const onRefresh = () => { setRefreshing(true); loadFirst(); };

  const toggleBookmark = async (item) => {
    const has = bookmarkSet.has(item.cluster_id);
    setBookmarkSet(prev => {
      const next = new Set(prev);
      has ? next.delete(item.cluster_id) : next.add(item.cluster_id);
      return next;
    });
    try {
      if (has) await removeBookmark(item.cluster_id);
      else     await addBookmark(item.cluster_id);
    } catch {
      setBookmarkSet(prev => {
        const next = new Set(prev);
        has ? next.add(item.cluster_id) : next.delete(item.cluster_id);
        return next;
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length === 0) return;
    const last = viewableItems[viewableItems.length - 1];
    if (typeof last.index === 'number') prefetchUpcoming(last.index);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const getItemLayout = useCallback((_, index) => ({
    length: cardHeight,
    offset: cardHeight * index,
    index,
  }), [cardHeight]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.saffron} size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Icon name="newspaper-outline" size={42} color={colors.text3} />
        <Text style={styles.emptyTitle}>No stories yet</Text>
        <Text style={styles.emptySub}>Pull down to refresh.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        // ── Snap behavior ─────────────────────────
        snapToInterval={cardHeight}
        snapToAlignment="start"
        decelerationRate={Platform.OS === 'ios' ? 0.985 : 0.95}
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        // ── Layout & perf ─────────────────────────
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={2}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.saffron}
          />
        }
        renderItem={({ item }) => (
          <ReelCard
            item={item}
            cardHeight={cardHeight}
            isBookmarked={bookmarkSet.has(item.cluster_id)}
            onToggleBookmark={() => toggleBookmark(item)}
          />
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={[styles.footerLoader, { height: cardHeight }]}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          ) : !hasMore && items.length > 0 ? (
            <View style={[styles.footerEnd, { height: cardHeight }]}>
              <Icon name="checkmark-circle-outline" size={36} color={colors.text3} />
              <Text style={styles.footerEndText}>You're all caught up</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg, gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text1, marginTop: 6 },
  emptySub:   { fontSize: 13, color: colors.text3 },

  card: {
    width: '100%',
    backgroundColor: colors.bg,
  },

  imageWrap: {
    height: '38%',
    backgroundColor: '#1a2030',
  },
  image: { width: '100%', height: '100%' },
  imageScrim: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,12,0.42)',
  },
  catChip: {
    position: 'absolute',
    bottom: 14, left: 18,
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  catText: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 0.7, textTransform: 'uppercase',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 14, right: 14,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },

  body: {
    flex: 1,
    padding: 22,
    paddingTop: 18,
  },

  headline: {
    fontFamily: 'serif',
    fontSize: 21,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.5,
    color: colors.text1,
    marginBottom: 12,
  },
  summary: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text2,
    marginBottom: 14,
  },

  whyBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 2,
    marginBottom: 16,
  },
  whyLabel: {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  whyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.text1,
    fontStyle: 'italic',
  },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    marginTop: 'auto',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footMeta: { fontSize: 11.5, color: colors.text3 },
  footSep:  { fontSize: 11.5, color: colors.text4, marginHorizontal: 2 },

  footerLoader: { alignItems: 'center', justifyContent: 'center' },
  footerEnd: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.bg,
  },
  footerEndText: {
    fontSize: 13,
    color: colors.text3,
    letterSpacing: 0.4,
  },
});
