import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MetricItem } from '@hooks/useDashboardStats';

interface Props {
  devices: MetricItem[];
  browsers: MetricItem[];
  operatingSystems: MetricItem[];
}

interface BarListProps {
  title: string;
  items: MetricItem[];
}

const BarList: React.FC<BarListProps> = ({ title, items }) => {
  const top = items.slice(0, 5);
  const max = top[0]?.y || 1;
  return (
    <View style={styles.column}>
      <Text style={styles.colTitle}>{title}</Text>
      {top.map((item, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{item.x || '?'}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.round((item.y / max) * 100)}%` as any }]} />
          </View>
          <Text style={styles.barCount}>{item.y}</Text>
        </View>
      ))}
    </View>
  );
};

export const DeviceBreakdown: React.FC<Props> = ({ devices, browsers, operatingSystems }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Dispositivos y Tecnología</Text>
    <View style={styles.grid}>
      <BarList title="Dispositivos" items={devices} />
      <BarList title="Navegadores" items={browsers} />
      <BarList title="S.O." items={operatingSystems} />
    </View>
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
  },
  colTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  barRow: {
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  barBg: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  barCount: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 1,
  },
});
