'use client';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PERIOD_OPTIONS = [
  { label: 'Última 24h', value: '1day' },
  { label: 'Últimos 7d', value: '7days' },
  { label: 'Último mes', value: '30days' },
  { label: 'Último año', value: '365days' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Periodo</Text>
      <View style={styles.buttonGroup}>
        {PERIOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              selectedPeriod === option.value && styles.buttonActive,
            ]}
            onPress={() => onPeriodChange(option.value)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedPeriod === option.value && styles.buttonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
});
