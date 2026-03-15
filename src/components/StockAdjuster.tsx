import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export interface StockAdjusterProps {
  initialStock: number;
  onStockChange: (newStock: number) => Promise<unknown>;
  disabled?: boolean;
}

export const StockAdjuster: React.FC<StockAdjusterProps> = ({
  initialStock,
  onStockChange,
  disabled = false,
}) => {
  const [stock, setStock] = useState(initialStock);
  const [loading, setLoading] = useState(false);

  const handleDecrease = async () => {
    if (loading || disabled || stock <= 0) return;

    const newStock = stock - 1;
    setStock(newStock);
    setLoading(true);

    try {
      await onStockChange(newStock);
    } catch (error) {
      // Revert on error
      setStock(stock);
      console.error('Failed to update stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async () => {
    if (loading || disabled) return;

    const newStock = stock + 1;
    setStock(newStock);
    setLoading(true);

    try {
      await onStockChange(newStock);
    } catch (error) {
      // Revert on error
      setStock(stock);
      console.error('Failed to update stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.decreaseButton, disabled && styles.disabled]}
        onPress={handleDecrease}
        disabled={disabled || loading || stock <= 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>−</Text>
        )}
      </TouchableOpacity>

      <View style={styles.stockDisplay}>
        <Text style={styles.stockText}>{stock}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.increaseButton, disabled && styles.disabled]}
        onPress={handleIncrease}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>+</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  decreaseButton: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  increaseButton: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockDisplay: {
    minWidth: 50,
    alignItems: 'center',
  },
  stockText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
