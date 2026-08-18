import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useScryfallSets } from '@hooks';
import { ScryfallSet } from '@types';

export interface SetPickerProps {
  value: string;
  onSelect: (setName: string) => void;
  disabled?: boolean;
}

// Mismo shell visual que CardSearch (buscador + lista scrolleable), pero mucho más simple:
// la lista de sets ya viene chica, filtrada y cacheada desde el backend (GET
// /api/scryfall/sets), así que alcanza con traerla una sola vez y filtrarla en el cliente --
// sin debounce, sin cache por query, sin el flag "selectingRef" de CardSearch (no hay
// búsqueda en vivo contra Scryfall que suprimir).
export const SetPicker: React.FC<SetPickerProps> = ({ value, onSelect, disabled = false }) => {
  const { sets, loading } = useScryfallSets();
  const [query, setQuery] = useState(value);
  const [showResults, setShowResults] = useState(false);

  // Si el valor cambia desde afuera (ej. se terminó de cargar el producto a editar),
  // sincronizar el texto mostrado sin que dispare nada más.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = query.trim()
    ? sets.filter(s => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    : sets;

  const handleSelect = (set: ScryfallSet) => {
    setQuery(set.name);
    setShowResults(false);
    onSelect(set.name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput]}
          placeholder="Buscar set..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          editable={!disabled}
        />

        {loading && (
          <ActivityIndicator style={styles.spinner} color="#3b82f6" size="small" />
        )}
      </View>

      {showResults && (
        <ScrollView
          style={styles.resultsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>Sin resultados</Text>
          ) : (
            filtered.map((set) => (
              <TouchableOpacity
                key={set.code}
                style={styles.resultItem}
                onPress={() => handleSelect(set)}
              >
                <Text style={styles.setName}>{set.name}</Text>
              </TouchableOpacity>
            ))
          )}
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

  setName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },

  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    padding: 12,
    textAlign: 'center',
  },

});
