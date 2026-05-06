import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StockAdjuster } from '@components/index';
import { useProductById, useDeleteProduct, useUpdateProductStock } from '@hooks/index';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export const ProductDetailScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;
  const { product, loading: loadingProduct } = useProductById(productId);
  const { execute: deleteProduct } = useDeleteProduct(() => {
    Alert.alert('Éxito', 'Producto eliminado', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  });
  const { execute: updateStock } = useUpdateProductStock();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar "${product?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteProduct(productId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loadingProduct) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Producto no encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeColors: Record<string, string> = {
    SIN: '#3b82f6',
    PSL: '#8b5cf6',
    ACC: '#6b7280',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      {product.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.productName}>{product.name}</Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeColors[product.type] || typeColors.ACC },
            ]}
          >
            <Text style={styles.typeBadgeText}>{product.type.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Price and Stock Info */}
      <View style={styles.section}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Precio</Text>
            <Text style={styles.infoValue}>${product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stock</Text>
            <Text
              style={[
                styles.infoValue,
                product.stock === 0 && styles.outOfStock,
              ]}
            >
              {product.stock}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {product.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      )}

      {/* Stock Adjuster */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ajustar Stock</Text>
        <StockAdjuster
          initialStock={product.stock}
          onStockChange={(newStock) =>
            updateStock({ productId, stock: newStock })
          }
        />
      </View>

      {/* Type-specific Information */}
      {product.type === 'SIN' && 'cardName' in product && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Carta</Text>

          <View style={styles.detailBox}>
            <DetailRow label="Nombre de Carta" value={product.cardName} />
            <Divider />
            <DetailRow label="Set" value={product.set} />
            <Divider />
            <DetailRow label="Collector #" value={product.collectorNumber} />
            {product.condition && (
              <>
                <Divider />
                <DetailRow label="Condición" value={product.condition} />
              </>
            )}
            {product.language && (
              <>
                <Divider />
                <DetailRow label="Idioma" value={product.language} />
              </>
            )}
            {product.isFoil && (
              <>
                <Divider />
                <DetailRow label="Foil" value="✨ Sí" />
              </>
            )}
          </View>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.detailBox}>
          <DetailRow label="ID" value={product.id} small />
          {product.createdAt && (
            <>
              <Divider />
              <DetailRow
                label="Creado"
                value={new Date(product.createdAt).toLocaleString()}
                small
              />
            </>
          )}
          {product.updatedAt && (
            <>
              <Divider />
              <DetailRow
                label="Actualizado"
                value={new Date(product.updatedAt).toLocaleString()}
                small
              />
            </>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProduct', { productId })}
        >
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  small?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, small }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, small && styles.smallText]}>{label}</Text>
    <Text
      style={[styles.detailValue, small && styles.smallText]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.detailDivider} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  outOfStock: {
    color: '#ef4444',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  detailBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    flex: 0.4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    flex: 0.6,
    textAlign: 'right',
  },
  smallText: {
    fontSize: 11,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginVertical: 24,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
});
