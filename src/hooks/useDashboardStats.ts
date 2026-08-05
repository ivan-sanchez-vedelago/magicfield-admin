import { apiService } from '@services/api';
import { useAsync } from './useAsync';

export interface MetricItem {
  x: string;
  y: number;
}

export interface ProductMetricItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  count: number;
}

export interface SiteAnalytics {
  pageViews: number;
  sessions: number;
  bounceRate: number;
  topFrontPages: MetricItem[];
  topProducts: ProductMetricItem[];
  referrers: MetricItem[];
  countries: MetricItem[];
  browsers: MetricItem[];
  devices: MetricItem[];
  operatingSystems: MetricItem[];
  available: boolean;
  unavailableReason?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  siteAnalytics: SiteAnalytics;
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
