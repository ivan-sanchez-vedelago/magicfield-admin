import { apiService } from '@services/api';
import { Condition } from '@types';
import { useAsync } from './useAsync';

// applicableType ("SIN"/"PSL") filtra del lado del backend qué condiciones tiene sentido
// ofrecer -- NM/LP/... no aplica a sellados, ni NEW/USD a singles. Sin el param, trae todo.
export function useConditions(applicableType?: string) {
  const { data, loading, error } = useAsync(
    () => apiService.getConditions(applicableType),
    [applicableType],
    true
  );

  return {
    conditions: (data || []) as Condition[],
    loading,
    error,
  };
}
