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
import {
  UmamiStatsCard,
  TopPagesCard,
  ReferrersCard,
  CountriesCard,
  DeviceBreakdown,
  PeriodSelector,
} from '@components/index';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const { stats, loading, refetch } = useDashboardStats(selectedPeriod);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  const umami = stats?.umamiAnalytics;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#3b82f6']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Negocio y analítica web</Text>
      </View>

      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

      {/* Negocio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Negocio</Text>
        <View style={styles.statsRow}>
          <StatCard title="Productos" value={String(stats?.totalProducts ?? 0)} color="#3b82f6" />
          <StatCard title="Valor Inventario" value={formatCurrency(stats?.totalInventoryValue)} color="#f59e0b" />
        </View>
      </View>

      {/* Estado de Órdenes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Órdenes</Text>
        <View style={styles.statusRow}>
          <StatusBadge label="Pendientes" count={stats?.pendingOrders ?? 0} color="#f59e0b" />
          <StatusBadge label="Completadas" count={stats?.completedOrders ?? 0} color="#22c55e" />
          <StatusBadge label="Canceladas" count={stats?.cancelledOrders ?? 0} color="#ef4444" />
        </View>
      </View>

      {/* Analítica Web */}
      {umami && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analítica Web</Text>
            <View style={styles.metricsRow}>
              <UmamiStatsCard label="Sesiones" value={umami.sessions.toLocaleString()} color="#3b82f6" />
              <UmamiStatsCard label="Page Views" value={umami.pageViews.toLocaleString()} color="#22c55e" />
              <UmamiStatsCard label="Bounce Rate" value={`${umami.bounceRate.toFixed(1)}%`} color="#f59e0b" />
            </View>
          </View>
          {umami.topPages?.length > 0 && <TopPagesCard pages={umami.topPages} />}
          {umami.referrers?.length > 0 && <ReferrersCard referrers={umami.referrers} />}
          {umami.countries?.length > 0 && <CountriesCard countries={umami.countries} />}
          <DeviceBreakdown
            devices={umami.devices ?? []}
            browsers={umami.browsers ?? []}
            operatingSystems={umami.operatingSystems ?? []}
          />
        </>
      )}

      {/* Acciones Rápidas */}
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
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
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
    elevation: 1,
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
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
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
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  salesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  salesCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  salesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  salesOrderCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  salesRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
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
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  topProductName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  topProductQty: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
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
