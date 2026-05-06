import { apiService } from '@services/api';
import { Category } from '@types';
import { useAsync } from './useAsync';

export function useCategories() {
  const { data, loading, error } = useAsync(
    () => apiService.getCategories(),
    [],
    true
  );

  return {
    categories: (data || []) as Category[],
    loading,
    error,
  };
}
