import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { fetchBookmarks } from '../services/api';
import NewsCard from '../components/NewsCard';
import { colors } from '../utils/theme';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchBookmarks(1, 50);
      setItems(data?.items || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // refresh whenever this tab regains focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'story' : 'stories'}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Icon name="bookmark-outline" size={42} color={colors.text3} />
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>Tap the bookmark icon on any story to save it for later.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={({ item, index }) => (
            <NewsCard item={item} isLead={index === 0} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.saffron}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 22, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  title: {
    fontSize: 22, fontWeight: '600',
    color: colors.text1, fontFamily: 'serif',
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: 12, color: colors.text3, marginTop: 2 },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text1, marginTop: 6 },
  emptySub: {
    fontSize: 13, color: colors.text3,
    textAlign: 'center', marginTop: 4,
    paddingHorizontal: 24, lineHeight: 19,
  },
});
