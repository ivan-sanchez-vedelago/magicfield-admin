import { apiService } from '@services/api';
import { useAsync } from './useAsync';

export interface PageView {
  page: string;
  visitors: number;
}

export interface Referrer {
  referrer: string;
  count: number;
}

export interface Country {
  country: string;
  countryCode: string;
  visitors: number;
}

export interface Device {
  device: string;
  count: number;
}

export interface Browser {
  browser: string;
  count: number;
}

export interface OS {
  os: string;
  count: number;
}

export interface VercelAnalytics {
  totalVisitors: number;
  pageViews: number;
  bounceRate: number;
  topPages: PageView[];
  topReferrers: Referrer[];
  topCountries: Country[];
  devices: Device[];
  browsers: Browser[];
  operatingSystems: OS[];
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  vercelAnalytics: VercelAnalytics;
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
