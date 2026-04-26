import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const CATEGORIES = ['all', 'politics', 'business', 'tech', 'sports', 'entertainment', 'health', 'science'];

const LABELS = {
  all: 'All',
  politics: 'Politics',
  business: 'Business',
  tech: 'Tech',
  sports: 'Sports',
  entertainment: 'Culture',
  health: 'Health',
  science: 'Science',
};

export default function CategoryFilter({ activeCategory, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map(cat => {
        const active = activeCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelect(cat)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {LABELS[cat]}
            </Text>
            {active && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    height: 48,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.bg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 18,
  },
  tab: {
    paddingVertical: 8,
    paddingBottom: 12,
    position: 'relative',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '450',
    color: colors.text3,
    letterSpacing: -0.1,
  },
  labelActive: {
    color: colors.text1,
    fontWeight: '500',
  },
  underline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.text1,
  },
});
