import { useState, useCallback } from 'react';
import { apiService } from '@services/api';
import { Product } from '@types';
import { useAsync, useAsyncMutation } from './useAsync';

export function useProducts() {
  const { data, loading, error, execute } = useAsync(
    () => apiService.getProducts(),
    [],
    true
  );

  return {
    products: data || [],
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
    product: data,
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
  productId: string,
  onSuccess?: (product: Product) => void
) {
  return useAsyncMutation(
    (stock: number) => apiService.updateProductStock(productId, stock),
    onSuccess
  );
}

export function useUpdateProductPrice(
  productId: string,
  onSuccess?: (product: Product) => void
) {
  return useAsyncMutation(
    (price: number) => apiService.updateProductPrice(productId, price),
    onSuccess
  );
}
