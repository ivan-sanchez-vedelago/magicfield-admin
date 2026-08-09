import { apiService } from '@services/api';
import { Finish } from '@types';
import { useAsync } from './useAsync';

export function useFinishes() {
  const { data, loading, error } = useAsync(
    () => apiService.getFinishes(),
    [],
    true
  );

  return {
    finishes: (data || []) as Finish[],
    loading,
    error,
  };
}
