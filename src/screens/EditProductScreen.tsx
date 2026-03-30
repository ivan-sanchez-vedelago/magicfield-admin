import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult } from '@components';
import { useProductById, useUpdateProduct } from '@hooks';
import { apiService } from '@services/api';
import { Product, ProductImage } from '@types';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProduct'>;

export const EditProductScreen = ({
  route,
  navigation,
}: Props) => {
  const { productId } = route.params;
  const { product, loading: loadingProduct, error } = useProductById(productId);
  const { execute: updateProduct, loading: updateLoading } = useUpdateProduct(
    () => {
      Alert.alert('Éxito', 'Producto actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  );

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<ImageUploadResult[]>([]);
  const [currentImages, setCurrentImages] = useState<ProductImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setHasChanges(false);
      loadProductImages(product.id);
    }
  }, [product]);

  const loadProductImages = async (productId: string) => {
    try {
      setLoadingImages(true);
      const images = await apiService.getProductImages(productId);
      setCurrentImages(images || []);
    } catch (err) {
      console.warn('Error loading product images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que quieres eliminar esta imagen?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await apiService.deleteImage(imageId);
              setCurrentImages(currentImages.filter(img => img.id !== imageId));
              Alert.alert('Éxito', 'Imagen eliminada correctamente');
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la imagen');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleFieldChange = () => {
    setHasChanges(true);
  };

  const handleUpdateProduct = async () => {
    if (!product) return;

    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!price || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return;
    }

    if (!stock || isNaN(parseInt(stock))) {
      Alert.alert('Error', 'El stock debe ser un número válido');
      return;
    }

    try {
      const updates: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        type: product.type,
      };

      // Upload new images
      if (images.length > 0) {
        for (const img of images) {
          try {
            await apiService.uploadImage(productId, img.uri, img.name);
          } catch (imageError) {
            console.warn('Image upload error, continuing without image:', imageError);
          }
        }
        // Reload images after upload
        await loadProductImages(productId);
        setImages([]);
      }

      await updateProduct({ id: productId, ...updates } as Product);
    } catch (err) {
      Alert.alert(
        'Error',
        'No se pudo actualizar el producto: ' +
          (err instanceof Error ? err.message : 'Error desconocido')
      );
    }
  };

  if (loadingProduct) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error al cargar el producto</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Producto</Text>
      </View>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imágenes Actuales ({currentImages.length})</Text>
          {loadingImages ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <View style={styles.imagesGrid}>
              {currentImages.map((img) => (
                <View key={img.id} style={styles.imageItem}>
                  <Image
                    source={{ uri: img.url }}
                    style={styles.thumbnailImage}
                  />
                  {img.isMain && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>Principal</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => handleDeleteImage(img.id)}
                  >
                    <Text style={styles.deleteImageButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Image Uploader */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agregar Imágenes</Text>
        <Text style={styles.sectionSubtitle}>
          {currentImages.length > 0 ? `${currentImages.length} imagen(es) actual(es)` : 'Sin imágenes aún'}
        </Text>
        <ImageUploader
          onImagesSelected={setImages}
          selectedImages={images}
          maxImages={5}
          multiple={true}
          allowsEditing={true}
        />
      </View>

      {/* Product Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Producto</Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={styles.infoValue}>
            {product.type.toUpperCase()}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={name}
          onChangeText={(text) => {
            setName(text);
            handleFieldChange();
          }}
          editable={!updateLoading}
        />

        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Descripción"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            handleFieldChange();
          }}
          multiline
          numberOfLines={3}
          editable={!updateLoading}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            placeholder="Precio"
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              handleFieldChange();
            }}
            keyboardType="decimal-pad"
            editable={!updateLoading}
          />
          <TextInput
            style={[styles.input, styles.flex1, styles.marginLeft]}
            placeholder="Stock"
            value={stock}
            onChangeText={(text) => {
              setStock(text);
              handleFieldChange();
            }}
            keyboardType="number-pad"
            editable={!updateLoading}
          />
        </View>
      </View>

      {/* Type-specific Info */}
      {product.type === 'single' && 'cardName' in product && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Carta</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Nombre de la Carta</Text>
            <Text style={styles.infoValue}>{product.cardName}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.infoBox, styles.flex1]}>
              <Text style={styles.label}>Set</Text>
              <Text style={styles.infoValue}>{product.set}</Text>
            </View>
            <View style={[styles.infoBox, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Collector #</Text>
              <Text style={styles.infoValue}>{product.collectorNumber}</Text>
            </View>
          </View>

          <View style={styles.row}>
            {product.condition && (
              <View style={[styles.infoBox, styles.flex1]}>
                <Text style={styles.label}>Condición</Text>
                <Text style={styles.infoValue}>{product.condition}</Text>
              </View>
            )}
            {product.language && (
              <View style={[styles.infoBox, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Idioma</Text>
                <Text style={styles.infoValue}>{product.language}</Text>
              </View>
            )}
          </View>

          {product.isFoil && (
            <View style={styles.foilBadge}>
              <Text style={styles.foilBadgeText}>✨ Foil</Text>
            </View>
          )}
        </View>
      )}

      {/* Update Button */}
      <View style={styles.updateSection}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            (updateLoading || !hasChanges) && styles.disabled,
          ]}
          onPress={handleUpdateProduct}
          disabled={updateLoading || !hasChanges}
        >
          {updateLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>
              {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
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
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  currentImageContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currentImagePlaceholder: {
    color: '#6b7280',
    fontSize: 13,
  },
  foilBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  foilBadgeText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
  updateSection: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  updateButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  mainBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteImageButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
