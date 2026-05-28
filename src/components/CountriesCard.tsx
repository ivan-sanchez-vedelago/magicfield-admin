'use client';

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Country } from '@hooks/useDashboardStats';

interface CountriesCardProps {
  countries: Country[];
}

export const CountriesCard: React.FC<CountriesCardProps> = ({ countries }) => {
  const getCountryFlag = (code: string) => {
    if (!code || code.length !== 2) return '🌍';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Países</Text>
      <ScrollView
        scrollEnabled={countries.length > 4}
        nestedScrollEnabled={true}
        style={styles.listContainer}
      >
        {countries.length === 0 ? (
          <Text style={styles.emptyText}>Sin datos</Text>
        ) : (
          countries.map((country, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.flagContainer}>
                <Text style={styles.flag}>{getCountryFlag(country.countryCode)}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.countryName}>{country.country}</Text>
                <Text style={styles.visitors}>{country.visitors} visitantes</Text>
              </View>
              <Text style={styles.percentage}>
                {country.visitors}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  listContainer: {
    maxHeight: 250,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  flagContainer: {
    marginRight: 12,
  },
  flag: {
    fontSize: 24,
  },
  rowContent: {
    flex: 1,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  visitors: {
    fontSize: 12,
    color: '#6b7280',
  },
  percentage: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
