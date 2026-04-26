import React from 'react';
import {
  View, FlatList, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeed } from '../hooks/useFeed';
import Topbar from '../components/Topbar';
import CategoryFilter from '../components/CategoryFilter';
import NewsCard from '../components/NewsCard';
import { SkeletonLeadCard, SkeletonRowCard } from '../components/SkeletonCard';
import { colors } from '../utils/theme';

const SKELETON_DATA = [
  { id: 's0', _skeleton: true, isLead: true  },
  { id: 's1', _skeleton: true, isLead: false },
  { id: 's2', _skeleton: true, isLead: false },
  { id: 's3', _skeleton: true, isLead: false },
  { id: 's4', _skeleton: true, isLead: false },
];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { items, loading, error, activeCategory, setCategory, refresh } = useFeed();

  const listData = loading ? SKELETON_DATA : items;

  return (
    <View style={styles.page}>
      <Topbar />
      <CategoryFilter activeCategory={activeCategory} onSelect={setCategory} />

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn't load stories</Text>
          <Text style={styles.errorSub}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={item => String(item.id)}
          renderItem={({ item, index }) => {
            if (item._skeleton) {
              return item.isLead ? <SkeletonLeadCard /> : <SkeletonRowCard />;
            }
            return <NewsCard item={item} isLead={index === 0} />;
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          onRefresh={!loading ? refresh : undefined}
          refreshing={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.center}>
                <Text style={styles.errorTitle}>No stories found</Text>
                <Text style={styles.errorSub}>Try a different category.</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
    marginTop: 80,
  },
  errorTitle: { fontSize: 15, fontWeight: '600', color: colors.text1 },
  errorSub:   { fontSize: 13, color: colors.text3, textAlign: 'center' },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.saffron,
  },
  retryText: { fontSize: 13, fontWeight: '600', color: colors.saffron },
});
