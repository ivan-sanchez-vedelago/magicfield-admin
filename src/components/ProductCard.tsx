import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Product, Category } from '@types';
import { StockAdjuster } from './StockAdjuster';

export interface ProductCardProps {
  product: Product;
  categories: Category[];
  onPress: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockChange: (productId: string, newStock: number) => Promise<void>;
  deletingId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categories,
  onPress,
  onEdit,
  onDelete,
  onStockChange,
  deletingId,
}) => {
  const isDeleting = deletingId === product.id;

  const getProductTypeBadge = () => {
    const typeColors: Record<string, string> = {
      SIN: '#3b82f6',
      PSL: '#8b5cf6',
      ACC: '#6b7280',
    };

    const category = categories.find(c => c.shortName === product.type);
    const categoryName = category?.name || product.type.toUpperCase();

    return (
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: typeColors[product.type] || typeColors.ACC },
        ]}
      >
        <Text style={styles.typeBadgeText}>{categoryName}</Text>
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

        {/* LEFT: IMAGE */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        {/* RIGHT: CONTENT */}
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            {getProductTypeBadge()}
          </View>

          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

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
              <Text style={styles.editButtonText}>Editar</Text>
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
                <ActivityIndicator color="#ef4444" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>

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
    gap: 12,
  },

  image: {
    width: 80,
    height: 110,
    borderRadius: 6,
    flexShrink: 0,
  },

  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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

  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },

  actions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#eff6ff',
  },

  editButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 13,
  },

  deleteButton: {
    backgroundColor: '#fef2f2',
  },

  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },

  disabledButton: {
    opacity: 0.6,
  },

});