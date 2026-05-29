import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MetricItem } from '@hooks/useDashboardStats';

interface Props {
  pages: MetricItem[];
}

export const TopPagesCard: React.FC<Props> = ({ pages }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Páginas más visitadas</Text>
    {pages.slice(0, 10).map((p, i) => (
      <View key={i} style={styles.row}>
        <Text style={styles.rank}>{i + 1}</Text>
        <Text style={styles.name} numberOfLines={1}>{p.x}</Text>
        <Text style={styles.count}>{p.y}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rank: {
    width: 24,
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  name: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
});
