import { apiService } from '@services/api';
import { Condition } from '@types';
import { useAsync } from './useAsync';

export function useConditions() {
  const { data, loading, error } = useAsync(
    () => apiService.getConditions(),
    [],
    true
  );

  return {
    conditions: (data || []) as Condition[],
    loading,
    error,
  };
}
