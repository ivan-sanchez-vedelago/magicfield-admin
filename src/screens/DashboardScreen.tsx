import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDashboardStats } from '@hooks/index';
import { VercelStatsCard } from '@components/VercelStatsCard';
import { TopPagesCard } from '@components/TopPagesCard';
import { ReferrersCard } from '@components/ReferrersCard';
import { CountriesCard } from '@components/CountriesCard';
import { DeviceBreakdown } from '@components/DeviceBreakdown';
import { PeriodSelector } from '@components/PeriodSelector';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7days');
  const { stats, loading, refetch } = useDashboardStats(selectedPeriod);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#3b82f6']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Análisis de tu negocio y estadísticas</Text>
      </View>

      {/* Period Selector */}
      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

      {/* Business Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Negocio</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Productos"
            value={String(stats?.totalProducts ?? 0)}
            color="#3b82f6"
          />
          <StatCard
            title="Valor Inventario"
            value={formatCurrency(stats?.totalInventoryValue)}
            color="#f59e0b"
          />
        </View>
      </View>

      {/* Order Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Órdenes</Text>
        <View style={styles.statusRow}>
          <StatusBadge label="Pendientes" count={stats?.pendingOrders ?? 0} color="#f59e0b" />
          <StatusBadge label="Completadas" count={stats?.completedOrders ?? 0} color="#22c55e" />
          <StatusBadge label="Canceladas" count={stats?.cancelledOrders ?? 0} color="#ef4444" />
        </View>
      </View>

      {/* Vercel Analytics Section */}
      {stats?.vercelAnalytics && (
        <>
          {/* Main Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analítica Web</Text>
            <View style={styles.metricsGrid}>
              <VercelStatsCard
                label="Visitantes"
                value={stats.vercelAnalytics.totalVisitors.toLocaleString()}
                color="#3b82f6"
              />
              <VercelStatsCard
                label="Page Views"
                value={stats.vercelAnalytics.pageViews.toLocaleString()}
                color="#22c55e"
              />
              <VercelStatsCard
                label="Bounce Rate"
                value={`${stats.vercelAnalytics.bounceRate.toFixed(1)}%`}
                color="#f59e0b"
              />
            </View>
          </View>

          {/* Top Pages */}
          {stats.vercelAnalytics.topPages && stats.vercelAnalytics.topPages.length > 0 && (
            <TopPagesCard pages={stats.vercelAnalytics.topPages} />
          )}

          {/* Referrers */}
          {stats.vercelAnalytics.topReferrers && stats.vercelAnalytics.topReferrers.length > 0 && (
            <ReferrersCard referrers={stats.vercelAnalytics.topReferrers} />
          )}

          {/* Countries */}
          {stats.vercelAnalytics.topCountries && stats.vercelAnalytics.topCountries.length > 0 && (
            <CountriesCard countries={stats.vercelAnalytics.topCountries} />
          )}

          {/* Devices, Browsers, OS */}
          <DeviceBreakdown
            devices={stats.vercelAnalytics.devices || []}
            browsers={stats.vercelAnalytics.browsers || []}
            operatingSystems={stats.vercelAnalytics.operatingSystems || []}
          />
        </>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.getParent()?.navigate('CreateProductStack' as any)}
        >
          <Text style={styles.actionButtonText}>➕ Crear Producto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.getParent()?.navigate('ProductsStack' as any)}
        >
          <Text style={styles.actionButtonText}>📦 Ver Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
          onPress={() => navigation.getParent()?.navigate('OrdersStack' as any)}
        >
          <Text style={styles.actionButtonText}>🧾 Ver Órdenes</Text>
        </TouchableOpacity>
      </View>

      {/* Last Updated */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Última actualización: {new Date().toLocaleString('es-AR')}
        </Text>
        <Text style={styles.infoHint}>Desliza hacia abajo para actualizar</Text>
      </View>
    </ScrollView>
  );
};

// --- Sub-components ---

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

interface StatusBadgeProps {
  label: string;
  count: number;
  color: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, count, color }) => (
  <View style={[styles.statusBadge, { borderColor: color }]}>
    <Text style={[styles.statusCount, { color }]}>{count}</Text>
    <Text style={styles.statusLabel}>{label}</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
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
  },Horizontal: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    gap: 8,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    margin: '2%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
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
    marginHorizontal: 0,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  statusBadge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  statusLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  infoHint: {
    fontSize: 11,
    color: '#6b7280nter',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
});
