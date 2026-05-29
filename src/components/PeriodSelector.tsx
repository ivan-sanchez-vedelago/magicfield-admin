import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PERIODS = [
  { label: '24h', value: '1day' },
  { label: '7d', value: '7days' },
  { label: '30d', value: '30days' },
  { label: '1y', value: '365days' },
];

interface Props {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const PeriodSelector: React.FC<Props> = ({ selectedPeriod, onPeriodChange }) => (
  <View style={styles.container}>
    {PERIODS.map(p => (
      <TouchableOpacity
        key={p.value}
        style={[styles.btn, selectedPeriod === p.value && styles.btnActive]}
        onPress={() => onPeriodChange(p.value)}
      >
        <Text style={[styles.btnText, selectedPeriod === p.value && styles.btnTextActive]}>
          {p.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  btnActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  btnTextActive: {
    color: '#fff',
  },
});
