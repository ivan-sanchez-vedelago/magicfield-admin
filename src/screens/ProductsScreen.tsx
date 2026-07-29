import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useProductsPaged, useDeleteProduct, useUpdateProductStock, useCategories, getAllDescendants } from '@hooks';
import { Product, Category } from '@types';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export const ProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { categories } = useCategories();

  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const rootCategories = useMemo(
    () => categories.filter(c => c.parentId === 0),
    [categories]
  );

  // Un slider por nivel: raíces, luego los hijos de cada categoría seleccionada
  const categoryLevels = useMemo(() => {
    const levels: Category[][] = [rootCategories];
    for (const selected of selectedPath) {
      const children = categories.filter(c => c.parentId === selected.id);
      if (children.length > 0) levels.push(children);
    }
    return levels;
  }, [rootCategories, selectedPath, categories]);

  const handleSelectCategory = (depth: number, category: Category) => {
    setSelectedPath(prev => {
      // Tocar la ya seleccionada la deselecciona (y a sus hijos seleccionados)
      if (prev[depth]?.id === category.id) return prev.slice(0, depth);
      return [...prev.slice(0, depth), category];
    });
  };

  const selectedTypeFilter = useMemo(
    () => (selectedPath.length > 0 ? selectedPath[selectedPath.length - 1].shortName : 'all'),
    [selectedPath]
  );

  const getDescendantShortNames = useCallback((rootShortName: string): string[] => {
    const root = categories.find(c => c.shortName === rootShortName);
    if (!root) return [rootShortName];
    const allDescendants = getAllDescendants(root.id, categories);
    if (allDescendants.length === 0) return [rootShortName];
    return [rootShortName, ...allDescendants.map(c => c.shortName)];
  }, [categories]);

  const activeCategories = useMemo(() => {
    if (selectedTypeFilter === 'all') return [];
    return getDescendantShortNames(selectedTypeFilter);
  }, [selectedTypeFilter, getDescendantShortNames]);

  // Debounce search input (400 ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTypeFilter]);

  const { products, totalPages, totalElements, loading, error, refetch } = useProductsPaged(
    currentPage,
    pageSize,
    debouncedSearch,
    activeCategories
  );

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Limpia hiddenIds para los IDs que el servidor ya no devuelve (cache expirado)
  useEffect(() => {
    if (!loading && hiddenIds.size > 0) {
      setHiddenIds(prev => {
        const next = new Set(prev);
        for (const id of prev) {
          if (!products.some(p => p.id === id)) next.delete(id);
        }
        return next;
      });
    }
  }, [loading, products]);

  const visibleProducts = useMemo(
    () => products.filter(p => !hiddenIds.has(p.id)),
    [products, hiddenIds]
  );

  const { execute: deleteProduct } = useDeleteProduct();
  const { execute: updateStock } = useUpdateProductStock();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
              setHiddenIds(prev => { const s = new Set(prev); s.add(product.id); return s; });
              refetch();
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
    try {
      await updateStock({ productId, stock: newStock });
      if (newStock === 0) {
        setHiddenIds(prev => { const s = new Set(prev); s.add(productId); return s; });
      }
      refetch();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el stock');
    }
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
      {/* Sliders de categorías: raíces primero, luego un slider por cada nivel de hijos */}
      {categoryLevels.map((levelCategories, depth) => (
        <View key={depth} style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContentContainer}
          >
            {depth === 0 && (
              <TouchableOpacity
                style={[styles.filterButton, selectedPath.length === 0 && styles.filterButtonActive]}
                onPress={() => setSelectedPath([])}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedPath.length === 0 && styles.filterButtonTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
            )}
            {levelCategories.map((cat) => {
              const isSelected = selectedPath[depth]?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterButton,
                    depth > 0 && styles.filterButtonChild,
                    isSelected && styles.filterButtonActive,
                  ]}
                  onPress={() => handleSelectCategory(depth, cat)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      isSelected && styles.filterButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}

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
        data={visibleProducts}
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
        ListFooterComponent={
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <Text style={styles.paginationButtonText}>Anterior</Text>
            </TouchableOpacity>
            <Text style={styles.paginationInfo}>
              {currentPage + 1} / {totalPages}  ({totalElements})
            </Text>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <Text style={styles.paginationButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={
          visibleProducts.length === 0 ? { flex: 1 } : undefined
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

  filterButtonChild: {
    borderColor: '#3b82f6',
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

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },

  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },

  paginationButtonDisabled: {
    opacity: 0.4,
  },

  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  paginationInfo: {
    fontSize: 13,
    color: '#6b7280',
  },
});