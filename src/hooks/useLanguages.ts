import { apiService } from '@services/api';
import { Language } from '@types';
import { useAsync } from './useAsync';

export function useLanguages() {
  const { data, loading, error } = useAsync(
    () => apiService.getLanguages(),
    [],
    true
  );

  return {
    languages: (data || []) as Language[],
    loading,
    error,
  };
}
