import { apiService } from '@services/api';
import { Category } from '@types';
import { useAsync } from './useAsync';

export function useCategories(onlyWithProducts?: boolean) {
  const { data, loading, error } = useAsync(
    () => apiService.getCategories(onlyWithProducts),
    [onlyWithProducts],
    true
  );

  return {
    categories: (data || []).filter(c => c.id !== 0) as Category[],
    loading,
    error,
  };
}

export function getAllDescendants(
  categoryId: number,
  categories: Category[]
): Category[] {
  const children = categories.filter(c => c.parentId === categoryId);
  if (children.length === 0) return [];
  return [
    ...children,
    ...children.flatMap(child => getAllDescendants(child.id, categories))
  ];
}
