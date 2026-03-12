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
      <View style={styles.content}>
        {/* Header with type badge */}
        <View style={styles.header}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          {getProductTypeBadge()}
        </View>

        {/* Image */}
        {product.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Description */}
        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {/* Price and Stock Info */}
        <View style={styles.infoRow}>
          <View style={styles.priceSection}>
            <Text style={styles.label}>Precio</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stockSection}>
            <Text style={styles.label}>Stock</Text>
            <Text
              style={[
                styles.stock,
                product.stock === 0 && styles.outOfStock,
              ]}
            >
              {product.stock} unidades
            </Text>
          </View>
        </View>

        {/* Stock Adjuster */}
        <View style={styles.adjusters}>
          <StockAdjuster
            initialStock={product.stock}
            onStockChange={(newStock) =>
              onStockChange(product.id, newStock)
            }
            disabled={isDeleting}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(product)}
            disabled={isDeleting}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton, isDeleting && styles.disabledButton]}
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: 180,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  priceSection: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  stockSection: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  stock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  outOfStock: {
    color: '#ef4444',
  },
  adjusters: {
    marginBottom: 12,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
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
    fontSize: 13,
  },
});
