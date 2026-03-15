import React, { useState, useCallback, useRef } from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

import { debounce } from '@utils';
import { ScryfallCard } from '@types';
import { getCardImage } from '@utils/getCardImage';

const autocompleteCache: Record<string, string[]> = {};
const editionsCache: Record<string, ScryfallCard[]> = {};

export interface CardSearchProps {
  onCardSelected: (card: ScryfallCard) => void;
  disabled?: boolean;
}

export const CardSearch: React.FC<CardSearchProps> = ({
  onCardSelected,
  disabled = false,
}) => {

  const [query, setQuery] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [editions, setEditions] = useState<ScryfallCard[]>([]);
  const [showEditions, setShowEditions] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const selectingRef = useRef(false);

  const searchAutocomplete = async (text: string) => {

    if (autocompleteCache[text]) {
      setNames(autocompleteCache[text]);
      return;
    }

    try {

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const res = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(text)}`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MagicFieldApp/1.0 (your-email@example.com)'
          },
          signal: controller.signal
        }
      );

      const data = await res.json();

      autocompleteCache[text] = data.data || [];
      setNames(data.data || []);

    } catch (err: any) {

      if (err.name !== 'AbortError') {
        console.error(err);
      }

    } finally {

      setLoading(false);

    }

  };

  const loadEditions = async (name: string) => {

    if (editionsCache[name]) {
      setNames([]);
      setEditions(editionsCache[name]);
      setShowEditions(true);
      return;
    }

    try {
      setNames([]);
      setLoading(true);

      const query = `name:"${name}"`;
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints&order=released&dir=desc`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MagicFieldApp/1.0'
          }
        }
      )
      const data = await res.json();

      editionsCache[name] = data.data;

      setEditions(data.data);
      setShowEditions(true);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {

      if (text.length < 2) {
        setNames([]);
        return;
      }

      searchAutocomplete(text);

    }, 350),
    []
  );

  const handleChange = (text: string) => {

    setQuery(text);

    if (selectingRef.current) {
      selectingRef.current = false;
      return;
    }

    if (text.length < 2) {
      setNames([]);
      setEditions([]);
      setShowEditions(false);
      return;
    }

    setShowEditions(false);

    debouncedSearch(text);

  };

  const handleSelectEdition = (card: ScryfallCard) => {
    selectingRef.current = true;
    Keyboard.dismiss();

    setQuery(card.name);

    setNames([]);
    setEditions([]);
    setShowEditions(false);

    onCardSelected(card);

  };

  return (
    <View style={styles.container}>

      <View style={styles.searchBox}>

        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          placeholder="Buscar carta..."
          value={query}
          onChangeText={handleChange}
          editable={!disabled}
        />

        {loading && (
          <ActivityIndicator
            style={styles.spinner}
            color="#3b82f6"
            size="small"
          />
        )}

      </View>

      {!showEditions && names.length > 0 && (
        <ScrollView
          style={styles.resultsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {names.map((name) => (
            <TouchableOpacity
              key={name}
              style={styles.resultItem}
              onPress={() => loadEditions(name)}
            >
              <Text style={styles.cardName}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showEditions && (
        <ScrollView
          style={styles.resultsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {editions.map((card) => {

            const image = getCardImage(card);

            return (
              <TouchableOpacity
                key={card.id}
                style={styles.resultItem}
                onPress={() => handleSelectEdition(card)}
              >
                <View style={styles.resultContent}>

                  {image && (
                    <Image
                      source={{ uri: image }}
                      style={styles.cardImage}
                    />
                  )}

                  <View style={{ flex: 1 }}>

                    <Text style={styles.cardName}>
                      {card.name}
                    </Text>

                    <Text style={styles.cardSet}>
                      {card.set_name} • #{card.collector_number}
                    </Text>

                    {card.prices?.usd && (
                      <Text style={styles.cardPrice}>
                        ${card.prices.usd}
                      </Text>
                    )}

                  </View>

                </View>
              </TouchableOpacity>
            );

          })}
        </ScrollView>
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

  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },

  cardSet: {
    fontSize: 12,
    color: '#6b7280',
  },

  cardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },

});