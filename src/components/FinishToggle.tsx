import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SelectOption } from './SelectField';

export interface FinishToggleProps {
  label?: string;
  options: SelectOption[];
  selectedKey: string | null;
  selectedLabel?: string;
  onToggle: (key: string) => void;
  disabled?: boolean;
}

export const FinishToggle: React.FC<FinishToggleProps> = ({
  label = 'Finish',
  options,
  selectedKey,
  selectedLabel,
  onToggle,
  disabled = false,
}) => {
  const selectedIndex = options.findIndex(option => option.key === selectedKey);
  const currentLabel = selectedIndex >= 0
    ? options[selectedIndex].label
    : selectedLabel ?? selectedKey ?? 'Seleccionar...';
  const canChange = options.length > 0 && (options.length > 1 || selectedIndex < 0);
  const isDisabled = disabled || !canChange;

  const toggleFinish = () => {
    if (options.length === 0) return;
    const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + 1) % options.length;
    onToggle(options[nextIndex].key);
  };

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={toggleFinish}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${currentLabel}. Tocar para cambiar`}
      >
        <Text style={styles.value}>{currentLabel}</Text>
        {canChange && <Text style={styles.toggleIcon}>↻</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 4,
  },
  button: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  value: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  toggleIcon: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '700',
  },
});
