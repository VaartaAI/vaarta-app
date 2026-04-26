import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, FlatList, Text,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchFeed } from '../services/api';
import NewsCard from '../components/NewsCard';
import { colors } from '../utils/theme';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); setError(null); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchFeed(query.trim());
        setResults(data);
      } catch {
        setError('Search failed. Try again.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const showEmpty = !loading && !error && query.trim().length >= 2 && results.length === 0;
  const showHint  = !loading && !error && query.trim().length < 2;

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.inputRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.input}
            placeholder="Stories, topics, people…"
            placeholderTextColor={colors.text4}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* States */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      )}
      {showHint && (
        <View style={styles.center}>
          <Text style={styles.hintIcon}>🔍</Text>
          <Text style={styles.hintTitle}>Search VaartaAI</Text>
          <Text style={styles.hintSub}>Find stories about politics, business, sports and more</Text>
        </View>
      )}
      {showEmpty && (
        <View style={styles.center}>
          <Text style={styles.hintIcon}>😶</Text>
          <Text style={styles.hintTitle}>No results for "{query}"</Text>
          <Text style={styles.hintSub}>Try different keywords</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => String(item.id)}
          renderItem={({ item, index }) => <NewsCard item={item} isLead={index === 0} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.5,
    marginBottom: 12,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchIcon: { fontSize: 17, color: colors.text3 },
  input: { flex: 1, fontSize: 15, color: colors.text1 },
  clearBtn: { fontSize: 12, color: colors.text3, padding: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  errorIcon: { fontSize: 28 },
  stateText: { fontSize: 14, color: colors.text3, textAlign: 'center' },
  hintIcon: { fontSize: 36, marginBottom: 4 },
  hintTitle: { fontSize: 16, fontWeight: '600', color: colors.text1 },
  hintSub: { fontSize: 13, color: colors.text3, textAlign: 'center', lineHeight: 19 },
});
