'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VercelStatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}

export const VercelStatsCard: React.FC<VercelStatsCardProps> = ({
  label,
  value,
  unit,
  color,
}) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  unit: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
