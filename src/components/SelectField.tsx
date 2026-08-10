import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export interface SelectOption {
  key: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  disabled?: boolean;
}

// Mismo patrón que el dropdown de CardSearch (lista inline debajo del input, no un modal
// superpuesto): tocar el input despliega la lista de opciones justo debajo, tocar de nuevo
// la cierra. No es editable como texto -- solo se puede elegir una opción de la lista.
// Compartido entre CreateProductScreen y EditProductScreen para condición/idioma/finish.
export const SelectField = ({
  label,
  options,
  selectedKey,
  onSelect,
  disabled,
}: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.key === selectedKey)?.label;

  return (
    <View style={styles.selectGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, disabled && styles.disabled]}
        onPress={() => setOpen(o => !o)}
        disabled={disabled}
      >
        <Text style={selectedLabel ? styles.selectValueText : styles.selectPlaceholderText}>
          {selectedLabel ?? 'Seleccionar...'}
        </Text>
        <Text style={styles.selectChevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {open && (
        <ScrollView
          style={styles.selectOptionsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {options.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.selectOption, opt.key === selectedKey && styles.selectOptionActive]}
              onPress={() => {
                onSelect(opt.key);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  opt.key === selectedKey && styles.selectOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  selectGroup: {
    marginBottom: 4,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectValueText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  selectPlaceholderText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  selectChevron: {
    fontSize: 13,
    color: '#9ca3af',
  },
  selectOptionsList: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    maxHeight: 220,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectOptionActive: {
    backgroundColor: '#eff6ff',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectOptionTextActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
