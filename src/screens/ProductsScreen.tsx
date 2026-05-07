import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProductCard } from '@components';
import { useProducts, useDeleteProduct, useUpdateProductStock, useCategories, getAllDescendants } from '@hooks';
import { Product } from '@types';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export const ProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { products, loading, error, refetch } = useProducts();
  const { categories } = useCategories();

  const { execute: deleteProduct } = useDeleteProduct(() => refetch());
  const { execute: updateStock } = useUpdateProductStock(() => refetch());

  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const PRODUCT_TYPES_FILTER = [
    { label: 'Todos', value: 'all' },
    ...categories
      .filter(c => c.parentId === 0)
      .map(c => ({ label: c.name, value: c.shortName })),
  ];

  const getDescendantShortNames = useCallback((rootShortName: string): string[] => {
    const root = categories.find(c => c.shortName === rootShortName);
    if (!root) return [rootShortName];
    const allDescendants = getAllDescendants(root.id, categories);
    if (allDescendants.length === 0) return [rootShortName];
    return [rootShortName, ...allDescendants.map(c => c.shortName)];
  }, [categories]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );
  
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => {
        if (selectedTypeFilter === 'all') return true;
        const descendants = getDescendantShortNames(selectedTypeFilter);
        return descendants.includes(p.type);
      });
  }, [products, search, selectedTypeFilter]);

  const handleEditProduct = (product: Product) => {
    navigation.navigate('EditProduct', { productId: product.id });
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            setDeletingId(product.id);
            try {
              await deleteProduct(product.id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            } finally {
              setDeletingId(undefined);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleStockChange = async (productId: string, newStock: number) => {
    await updateStock({ productId, stock: newStock });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error al cargar productos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Intentar de Nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Productos</Text>
      </View>

      {/* Botones de filtro */}
      <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContentContainer}
      >
        {PRODUCT_TYPES_FILTER.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterButton,
              selectedTypeFilter === type.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedTypeFilter(type.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedTypeFilter === type.value && styles.filterButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar productos..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            categories={categories}
            onPress={handleProductPress}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onStockChange={handleStockChange}
            deletingId={deletingId}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos</Text>
            <TouchableOpacity style={styles.createEmptyButton}>
              <Text style={styles.createEmptyButtonText}>Crear Primero</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={
          filteredProducts.length === 0 ? { flex: 1 } : undefined
        }
      />
    </View>
  );
};

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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  searchInput: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
  },

  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },

  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },

  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },

  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },

  createEmptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  createEmptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  filterContainer: {
    height: 58,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  filterContentContainer: {
    paddingHorizontal: 16,
    gap: 10,
    flexGrow: 0,
    alignItems: 'center',
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
  },

  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },

  filterButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },

  filterButtonTextActive: {
    color: '#fff',
  },
});