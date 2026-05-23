import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { getFeed } from '../services/api';
import NewsCard from '../components/NewsCard';
import { catColor } from '../utils/helpers';
import { colors } from '../utils/theme';

export default function CategoryFeedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { category, label } = params;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getFeed(category, 1, 30);
      setItems(data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const accent = catColor(category);

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} activeOpacity={0.7}>
          <Icon name="chevron-back" size={24} color={colors.text1} />
        </TouchableOpacity>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={styles.title}>{label}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.saffron} size="large" />
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
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.saffron}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No stories in {label} right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  back: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
  title: {
    fontSize: 18, fontWeight: '600',
    color: colors.text1, marginLeft: 6,
    fontFamily: 'serif', letterSpacing: -0.3,
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80,
  },
  empty: { fontSize: 14, color: colors.text3 },
});
