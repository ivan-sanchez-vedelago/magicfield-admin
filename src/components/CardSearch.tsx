import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { debounce } from '@utils';
import { useScryfallSearch } from '@hooks';
import { ScryfallCard } from '@types';

export interface CardSearchProps {
  onCardSelected: (card: ScryfallCard) => void;
  disabled?: boolean;
}

export const CardSearch: React.FC<CardSearchProps> = ({
  onCardSelected,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading, error, search, clearResults } = useScryfallSearch();
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        search(query);
        setShowResults(true);
      } else {
        clearResults();
        setShowResults(false);
      }
    }, 500),
    [search, clearResults]
  );

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleSelectCard = (card: ScryfallCard) => {
    onCardSelected(card);
    setSearchQuery('');
    clearResults();
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          placeholder="Buscar carta en Scryfall..."
          value={searchQuery}
          onChangeText={handleChangeText}
          editable={!disabled}
          placeholderTextColor="#9ca3af"
        />
        {loading && (
          <ActivityIndicator
            style={styles.spinner}
            color="#3b82f6"
            size="small"
          />
        )}
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>
            Error en la búsqueda: {error.message}
          </Text>
        </View>
      )}

      {showResults && results.length > 0 && (
        <ScrollView
          style={styles.resultsList}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {results.slice(0, 8).map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.resultItem}
              onPress={() => handleSelectCard(card)}
            >
              <View style={styles.resultContent}>
                {card.image_uris?.small && (
                  <Image
                    source={{ uri: card.image_uris.small }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {card.name}
                  </Text>
                  <Text style={styles.cardSet}>
                    {card.set.toUpperCase()} • #{card.collector_number}
                  </Text>
                  {card.prices?.usd && (
                    <Text style={styles.cardPrice}>${card.prices.usd}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showResults && results.length === 0 && !loading && searchQuery.trim() && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No se encontraron cartas</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  searchBox: {
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
  },
  spinner: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  resultsList: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    maxHeight: 300,
    backgroundColor: '#fff',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  resultContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 50,
    height: 70,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  resultInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  cardSet: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
  },
  noResults: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
