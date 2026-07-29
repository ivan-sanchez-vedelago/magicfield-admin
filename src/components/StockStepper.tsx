import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface StockStepperProps {
  value: string;
  onChangeValue: (value: string) => void;
  min?: number;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const StockStepper: React.FC<StockStepperProps> = ({
  value,
  onChangeValue,
  min = 0,
  editable = true,
  style,
}) => {
  const step = (delta: number) => {
    const current = parseInt(value, 10);
    const base = isNaN(current) ? min : current;
    const next = Math.max(min, base + delta);
    onChangeValue(String(next));
  };

  const currentValue = parseInt(value, 10);
  const canDecrease = editable && (isNaN(currentValue) || currentValue > min);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
        onPress={() => step(-1)}
        disabled={!canDecrease}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeValue}
        keyboardType="number-pad"
        editable={editable}
        textAlign="center"
      />

      <TouchableOpacity
        style={[styles.button, !editable && styles.buttonDisabled]}
        onPress={() => step(1)}
        disabled={!editable}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  button: {
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  input: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
    minWidth: 0,
  },
});
