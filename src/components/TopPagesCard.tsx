'use client';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PageView } from '@hooks/useDashboardStats';

interface TopPagesCardProps {
  pages: PageView[];
}

export const TopPagesCard: React.FC<TopPagesCardProps> = ({ pages }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Páginas Más Visitadas</Text>
      <ScrollView
        scrollEnabled={pages.length > 4}
        nestedScrollEnabled={true}
        style={styles.listContainer}
      >
        {pages.length === 0 ? (
          <Text style={styles.emptyText}>Sin datos</Text>
        ) : (
          pages.map((page, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.pageName} numberOfLines={1}>
                  {page.page || '/'}
                </Text>
                <Text style={styles.visitors}>{page.visitors} visitantes</Text>
              </View>
              <Text style={styles.ranking}>#{index + 1}</Text>
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
  pageName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  visitors: {
    fontSize: 12,
    color: '#6b7280',
  },
  ranking: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
