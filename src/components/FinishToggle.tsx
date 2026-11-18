import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { SelectOption } from './SelectField';

export interface FinishToggleProps {
  placeholder?: string;
  options: SelectOption[];
  selectedKey: string | null;
  selectedLabel?: string;
  onToggle: (key: string) => void;
  disabled?: boolean;
}

export const FinishToggle: React.FC<FinishToggleProps> = ({
  placeholder = 'Seleccionar finish...',
  options,
  selectedKey,
  selectedLabel,
  onToggle,
  disabled = false,
}) => {
  const hasSelection = options.some(option => option.key === selectedKey);
  const unselectedLabel = selectedLabel ?? selectedKey ?? placeholder;

  return (
    <View style={styles.group}>
      {options.length > 0 && !hasSelection && (
        <Text style={styles.placeholder}>{unselectedLabel}</Text>
      )}
      <View style={styles.options}>
        {options.length > 0 ? options.map(option => {
          const isSelected = option.key === selectedKey;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                isSelected ? styles.optionSelected : styles.optionUnselected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => onToggle(option.key)}
              disabled={disabled || isSelected}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, disabled: disabled || isSelected }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        }) : (
          <View style={[styles.option, styles.optionUnselected, styles.emptyOption]}>
            <Text style={styles.optionText}>{unselectedLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginBottom: 4,
  },
  placeholder: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6,
    marginTop: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  option: {
    flexGrow: 1,
    flexBasis: '20%',
    minWidth: 64,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  optionUnselected: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  emptyOption: {
    flexBasis: '100%',
  },
  optionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#3b82f6',
  },
});
