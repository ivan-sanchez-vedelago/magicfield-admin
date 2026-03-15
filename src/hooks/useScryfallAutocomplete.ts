import { useState } from 'react';

export function useScryfallAutocomplete() {

  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (query: string) => {

    try {

      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MagicFieldApp/1.0 (your-email@example.com)'
          }
        }
      );

      const data = await response.json();

      setResults(data.data || []);

    } catch (err) {

      setError(err instanceof Error ? err : new Error(String(err)));

    } finally {

      setLoading(false);

    }

  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}