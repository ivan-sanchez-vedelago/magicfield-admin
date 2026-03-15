import { useState, useEffect, useCallback } from 'react';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  deps: any[] = [],
  immediate = true
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();

      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
  };
}

export function useAsyncMutation<T, P>(
  asyncFunction: (params: P) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (params: P): Promise<T> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await asyncFunction(params);

        setState({
          data: result,
          loading: false,
          error: null,
        });

        onSuccess?.(result);

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(String(err));

        setState({
          data: null,
          loading: false,
          error,
        });

        onError?.(error);

        throw error;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  return {
    execute,
    loading: state.loading,
    error: state.error,
    data: state.data,
  };
}