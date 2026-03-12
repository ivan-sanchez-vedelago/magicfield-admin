import { useState, useCallback } from 'react';
import { apiService } from '@services/api';
import { ScryfallCard } from '@types';

export function useScryfallSearch() {
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cards = await apiService.searchScryfallCards(query);
      setResults(cards);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}
