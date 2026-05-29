import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MetricItem } from '@hooks/useDashboardStats';

interface Props {
  countries: MetricItem[];
}

const getFlag = (code: string): string => {
  if (!code || code.length !== 2) return '🌍';
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  } catch {
    return '🌍';
  }
};

export const CountriesCard: React.FC<Props> = ({ countries }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Países</Text>
    {countries.slice(0, 10).map((c, i) => (
      <View key={i} style={styles.row}>
        <Text style={styles.flag}>{getFlag(c.x)}</Text>
        <Text style={styles.name}>{c.x || 'Desconocido'}</Text>
        <Text style={styles.count}>{c.y}</Text>
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
  flag: {
    fontSize: 20,
    marginRight: 10,
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
