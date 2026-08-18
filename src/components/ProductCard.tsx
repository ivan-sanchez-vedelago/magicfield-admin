import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Product, Category } from '@types';
import { StockAdjuster } from './StockAdjuster';
import { SCRYFALL_IMAGE_HEADERS } from '@utils/getCardImage';
import { isDescendantOfOrSelf } from '@utils/categoryTree';

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

  // product.type es el shortName de la subcategoría hoja (ej. "PRE" bajo Sellados), nunca
  // literalmente "SIN"/"PSL"/"ACC" -- hay que subir por la cadena de ancestros buscando cada
  // uno (puede haber más de un nivel de anidamiento en el medio, ej. "Singles"/"Sellados"
  // cuelgan de "Magic the gathering", no de la raíz directamente).
  const productCategory = categories.find(c => c.shortName === product.type);
  const rootShortName = !productCategory
    ? null
    : isDescendantOfOrSelf(productCategory, 'SIN', categories)
      ? 'SIN'
      : isDescendantOfOrSelf(productCategory, 'PSL', categories)
        ? 'PSL'
        : isDescendantOfOrSelf(productCategory, 'ACC', categories)
          ? 'ACC'
          : null;

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
          { backgroundColor: typeColors[rootShortName ?? ''] || typeColors.ACC },
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

        {/* LEFT: IMAGE + VARIANT BUBBLES */}
        <View style={styles.imageColumn}>
          {product.imageUrls?.[0] ? (
            <Image
              source={{ uri: product.imageUrls[0], headers: SCRYFALL_IMAGE_HEADERS }}
              style={styles.image}
              contentFit="cover"
              onError={(e) =>
                console.warn('[ProductCard] Error cargando imagen', product.imageUrls![0], e.error)
              }
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}

          {rootShortName === 'SIN' && 'collectorNumber' in product && (
            <View style={styles.variantBubbles}>
              {product.conditionName && (
                <View style={[styles.bubble, styles.bubbleCondition]}>
                  <Text style={styles.bubbleText}>{product.conditionName}</Text>
                </View>
              )}
              {product.languageName && (
                <View style={[styles.bubble, styles.bubbleLanguage]}>
                  <Text style={styles.bubbleText}>{product.languageName}</Text>
                </View>
              )}
              {product.finishShortName && product.finishShortName !== 'NONFOIL' && (
                <View style={[styles.bubble, styles.bubbleFinish]}>
                  <Text style={styles.bubbleText}>{product.finishName ?? product.finishShortName}</Text>
                </View>
              )}
            </View>
          )}

          {rootShortName === 'PSL' && 'conditionId' in product && (
            <View style={styles.variantBubbles}>
              {product.conditionName && (
                <View style={[styles.bubble, styles.bubbleCondition]}>
                  <Text style={styles.bubbleText}>{product.conditionName}</Text>
                </View>
              )}
              {product.languageName && (
                <View style={[styles.bubble, styles.bubbleLanguage]}>
                  <Text style={styles.bubbleText}>{product.languageName}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* RIGHT: CONTENT */}
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.displayName ?? product.name}
            </Text>
            {getProductTypeBadge()}
          </View>

          {rootShortName === 'SIN' && 'collectorNumber' in product && (
            <Text style={styles.variantSubtitle} numberOfLines={1}>
              {product.set}{product.collectorNumber ? ` · #${product.collectorNumber}` : ''}
            </Text>
          )}

          {rootShortName === 'PSL' && 'conditionId' in product && product.set && (
            <Text style={styles.variantSubtitle} numberOfLines={1}>
              {product.set}
            </Text>
          )}

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

  imageColumn: {
    width: 80,
    flexShrink: 0,
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

  variantBubbles: {
    marginTop: 6,
    gap: 4,
    alignItems: 'flex-start',
  },

  bubble: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  bubbleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  bubbleCondition: {
    backgroundColor: '#6b7280',
  },

  bubbleLanguage: {
    backgroundColor: '#0d9488',
  },

  bubbleFinish: {
    backgroundColor: '#7c3aed',
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

  variantSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6b7280',
    marginBottom: 4,
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