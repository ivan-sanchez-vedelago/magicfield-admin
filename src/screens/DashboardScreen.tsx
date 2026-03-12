import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProducts } from '@hooks/index';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { products, loading } = useProducts();

  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((acc, p) => acc + p.stock, 0),
    totalValue: products.reduce((acc, p) => acc + p.price * p.stock, 0),
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  const productTypes = {
    single: products.filter((p) => p.type === 'single').length,
    sealed: products.filter((p) => p.type === 'sealed').length,
    other: products.filter((p) => p.type === 'other').length,
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Resumen de tu inventario</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Productos"
          value={stats.totalProducts.toString()}
          color="#3b82f6"
        />
        <StatCard
          title="Stock Total"
          value={stats.totalStock.toString()}
          color="#22c55e"
        />
        <StatCard
          title="Valor Total"
          value={`$${(stats.totalValue / 1000).toFixed(1)}k`}
          color="#f59e0b"
        />
        <StatCard
          title="Sin Stock"
          value={stats.outOfStock.toString()}
          color="#ef4444"
        />
      </View>

      {/* Product Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Productos</Text>
        <View style={styles.typesList}>
          <TypeCard label="Singles" count={productTypes.single} color="#3b82f6" />
          <TypeCard label="Sealed" count={productTypes.sealed} color="#8b5cf6" />
          <TypeCard label="Otros" count={productTypes.other} color="#6b7280" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateProduct')}
        >
          <Text style={styles.actionButtonText}>➕ Crear Producto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.actionButtonText}>📦 Ver Productos</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Información</Text>
        <Text style={styles.infoText}>
          Última actualización: {new Date().toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

interface TypeCardProps {
  label: string;
  count: number;
  color: string;
}

const TypeCard: React.FC<TypeCardProps> = ({ label, count, color }) => (
  <View style={[styles.typeCard, { backgroundColor: color }]}>
    <Text style={styles.typeCount}>{count}</Text>
    <Text style={styles.typeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 0.5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  typesList: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  typeCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
  },
});
