import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Product } from '@types';
import { StockAdjuster } from './StockAdjuster';

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockChange: (productId: string, newStock: number) => Promise<void>;
  deletingId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onEdit,
  onDelete,
  onStockChange,
  deletingId,
}) => {
  const isDeleting = deletingId === product.id;
  console.log("Rendering ProductCard for:", product);

  const getProductTypeBadge = () => {
    const typeColors: Record<string, string> = {
      single: '#3b82f6',
      sealed: '#8b5cf6',
      other: '#6b7280',
    };

    return (
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: typeColors[product.type] || typeColors.other },
        ]}
      >
        <Text style={styles.typeBadgeText}>{product.type.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>

        {/* LEFT SIDE */}
        <View style={styles.left}>

          <View style={styles.header}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            {getProductTypeBadge()}
          </View>

          <View style={styles.info}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text
              style={[
                styles.stock,
                product.stock === 0 && styles.outOfStock,
              ]}
            >
              Stock: {product.stock}
            </Text>
          </View>

          <StockAdjuster
            initialStock={product.stock}
            onStockChange={(newStock) =>
              onStockChange(product.id, newStock)
            }
            disabled={isDeleting}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(product)}
              disabled={isDeleting}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
                isDeleting && styles.disabledButton,
              ]}
              onPress={() => onDelete(product)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>

        {/* RIGHT SIDE IMAGE */}
        {product.imageUrl && (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({

  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    padding: 14,
  },

  row: {
    flexDirection: 'row',
  },

  left: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 6,
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  info: {
    marginBottom: 8,
  },

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },

  stock: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  outOfStock: {
    color: '#ef4444',
  },

  image: {
    width: 70,
    height: 100,
    borderRadius: 6,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#3b82f6',
  },

  deleteButton: {
    backgroundColor: '#ef4444',
  },

  disabledButton: {
    opacity: 0.6,
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

});