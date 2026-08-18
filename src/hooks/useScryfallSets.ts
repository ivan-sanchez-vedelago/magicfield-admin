import { apiService } from '@services/api';
import { ScryfallSet } from '@types';
import { useAsync } from './useAsync';

export function useScryfallSets() {
  const { data, loading, error } = useAsync(
    () => apiService.getScryfallSets(),
    [],
    true
  );

  return {
    sets: (data || []) as ScryfallSet[],
    loading,
    error,
  };
}
