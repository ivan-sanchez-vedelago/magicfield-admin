import { apiService } from '@services/api';
import { Product } from '@types';
import { useAsync, useAsyncMutation } from './useAsync';

export function useProducts() {
  const { data, loading, error, execute } = useAsync(
    () => apiService.getProducts(),
    [],
    false
  );

  return {
    products: data || [],
    loading,
    error,
    refetch: execute,
  };
}

export function useProductsPaged(
  page: number,
  size: number,
  search: string,
  categories: string[]
) {
  const categoriesKey = categories.join(',');
  const { data, loading, error, execute } = useAsync(
    () => apiService.getProductsPaged(page, size, search || undefined, categories.length > 0 ? categories : undefined),
    [page, size, search, categoriesKey],
    true
  );

  return {
    products: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    refetch: execute,
  };
}

export function useProductById(id: string | null) {
  const { data, loading, error, execute } = useAsync(
    () => {
      if (!id) return Promise.resolve(null);
      return apiService.getProduct(id);
    },
    [id],
    !!id
  );

  return {
    product: data as Product | null,
    loading,
    error,
    refetch: execute,
  };
}

export function useCreateProduct(onSuccess?: (product: Product) => void) {
  return useAsyncMutation(
    (product: Omit<Product, 'id'>) => apiService.createProduct(product),
    onSuccess
  );
}

export function useUpdateProduct(onSuccess?: (product: Product) => void) {
  return useAsyncMutation(
    ({ id, ...product }: Product) =>
      apiService.updateProduct(id, product),
    onSuccess
  );
}

export function useDeleteProduct(onSuccess?: () => void) {
  return useAsyncMutation(
    (id: string) => apiService.deleteProduct(id).then(() => undefined),
    () => onSuccess?.()
  );
}

export function useUpdateProductStock(
  onSuccess?: (product: Product) => void
) {
  return useAsyncMutation(
    ({ productId, stock }: { productId: string; stock: number }) =>
      apiService.updateProductStock(productId, stock),
    onSuccess
  );
}

export function useUpdateProductPrice(
  onSuccess?: (product: Product) => void
) {
  return useAsyncMutation(
    ({ productId, price }: { productId: string; price: number }) =>
      apiService.updateProductPrice(productId, price),
    onSuccess
  );
}