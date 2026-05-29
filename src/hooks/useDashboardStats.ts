import { apiService } from '@services/api';
import { useAsync } from './useAsync';

export interface MetricItem {
  x: string;
  y: number;
}

export interface UmamiAnalytics {
  pageViews: number;
  sessions: number;
  bounceRate: number;
  topPages: MetricItem[];
  referrers: MetricItem[];
  countries: MetricItem[];
  browsers: MetricItem[];
  devices: MetricItem[];
  operatingSystems: MetricItem[];
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  umamiAnalytics: UmamiAnalytics;
  period: string;
}

export function useDashboardStats(period: string = '7days') {
  const { data, loading, error, execute } = useAsync<DashboardStats>(
    () => apiService.getDashboardStats(period),
    [period],
    true
  );

  return {
    stats: data,
    loading,
    error,
    refetch: execute,
  };
}
