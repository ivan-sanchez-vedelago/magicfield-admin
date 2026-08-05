import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { ProductMetricItem } from '@hooks/useDashboardStats';

interface Props {
  products: ProductMetricItem[];
}

export const TopProductsCard: React.FC<Props> = ({ products }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Productos más visitados</Text>
    {products.map((p, i) => (
      <View key={p.productId ?? i} style={styles.row}>
        <Text style={styles.rank}>{i + 1}</Text>
        {p.imageUrl ? (
          <Image source={{ uri: p.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>📦</Text>
          </View>
        )}
        <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
        <Text style={styles.count}>{p.count}</Text>
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
    gap: 10,
  },
  rank: {
    width: 18,
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
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
