'use client';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Referrer } from '@hooks/useDashboardStats';

interface ReferrersCardProps {
  referrers: Referrer[];
}

export const ReferrersCard: React.FC<ReferrersCardProps> = ({ referrers }) => {
  const formatReferrer = (ref: string) => {
    if (!ref || ref === '(direct)' || ref === 'direct') return 'Directo';
    try {
      const url = new URL(ref);
      return url.hostname;
    } catch {
      return ref;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Principales Fuentes</Text>
      <ScrollView
        scrollEnabled={referrers.length > 4}
        nestedScrollEnabled={true}
        style={styles.listContainer}
      >
        {referrers.length === 0 ? (
          <Text style={styles.emptyText}>Sin datos</Text>
        ) : (
          referrers.map((ref, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.referrerName} numberOfLines={1}>
                  {formatReferrer(ref.referrer)}
                </Text>
                <Text style={styles.count}>{ref.count} visitas</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `rgba(59, 130, 246, ${0.1 + index * 0.05})` },
                ]}
              >
                <Text style={styles.badgeText}>{ref.count}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  listContainer: {
    maxHeight: 250,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowContent: {
    flex: 1,
  },
  referrerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#6b7280',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
