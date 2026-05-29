import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MetricItem } from '@hooks/useDashboardStats';

interface Props {
  referrers: MetricItem[];
}

const extractDomain = (url: string): string => {
  if (!url || url.trim() === '') return 'Directo';
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
};

export const ReferrersCard: React.FC<Props> = ({ referrers }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Fuentes de tráfico</Text>
    {referrers.slice(0, 10).map((r, i) => (
      <View key={i} style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{extractDomain(r.x)}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{r.y}</Text>
        </View>
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
  name: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
  },
});
