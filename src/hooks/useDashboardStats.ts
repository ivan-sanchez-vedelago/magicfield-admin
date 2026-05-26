import { apiService } from '@services/api';
import { useAsync } from './useAsync';

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalInventoryValue: number;
  outOfStockProducts: number;
  ordersToday: number;
  revenueToday: number;
  ordersThisWeek: number;
  revenueThisWeek: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topProducts: { productId: string; productName: string; totalQuantity: number }[];
}

export function useDashboardStats() {
  const { data, loading, error, execute } = useAsync<DashboardStats>(
    () => apiService.getDashboardStats(),
    [],
    true
  );

  return {
    stats: data,
    loading,
    error,
    refetch: execute,
  };
}
