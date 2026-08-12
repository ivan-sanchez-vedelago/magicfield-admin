import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult, StockStepper, SelectField } from '@components';
import { useProductById, useUpdateProduct, useConditions, useLanguages, useFinishes } from '@hooks';
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
  const { conditions } = useConditions();
  const { languages } = useLanguages();
  const { finishes } = useFinishes();
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

  // Single-specific fields -- antes solo se mostraban de solo lectura, ni siquiera se
  // mandaban al actualizar (update() en el backend los ignoraba por completo).
  const [set, setSet] = useState('');
  const [collectorNumber, setCollectorNumber] = useState('');
  const [conditionId, setConditionId] = useState<number | null>(null);
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [finish, setFinish] = useState<string | null>(null);
  // Vacío = todavía no se consultó Scryfall (o falló): mientras tanto se muestran las 4
  // opciones fijas de `finishes` para no dejar el selector sin nada.
  const [availableFinishes, setAvailableFinishes] = useState<string[]>([]);

  // 'set' (no 'cardName': ProductResponse nunca manda ese campo -- chequear contra él
  // siempre daba false y por eso esta sección nunca se mostraba) es un campo real que sí
  // viene siempre para singles, así que sirve tanto para angostar el tipo en TS como para
  // el chequeo en runtime.
  const isSingleType = !!product && product.type === 'SIN' && 'set' in product;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setStock(product.stock.toString());

      if (product.type === 'SIN' && 'set' in product) {
        setSet(product.set ?? '');
        setCollectorNumber(product.collectorNumber ?? '');
        setConditionId(product.conditionId ?? null);
        setLanguageId(product.languageId ?? null);
        setFinish(product.finishShortName ?? null);
      }

      setHasChanges(false);
      loadProductImages(product.id);
    }
  }, [product]);

  // La carta puede no tener las 4 variantes de finish (hay promos foil-only, por ejemplo):
  // se consulta Scryfall con el scryfallId ya guardado para saber cuáles existen realmente,
  // mismo criterio que ya usa CreateProductScreen al elegir la carta por primera vez.
  useEffect(() => {
    if (!product || product.type !== 'SIN' || !('scryfallId' in product) || !product.scryfallId) {
      return;
    }
    let cancelled = false;
    apiService.getScryfallCardById(product.scryfallId)
      .then(card => {
        if (cancelled) return;
        const scryfallFinishes = card.finishes && card.finishes.length > 0
          ? card.finishes.map(f => f.toUpperCase())
          : (card.foil ? ['NONFOIL', 'FOIL'] : ['NONFOIL']);
        setAvailableFinishes(scryfallFinishes);
      })
      .catch(err => {
        console.warn('No se pudieron obtener los finishes de Scryfall:', err);
      });
    return () => {
      cancelled = true;
    };
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

    if (isSingleType) {
      if (conditionId === null || languageId === null || !finish) {
        Alert.alert('Error', 'Debes seleccionar condición, idioma y finish');
        return;
      }
    }

    try {
      const updates: any = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        type: product.type,
      };

      if (isSingleType) {
        updates.set = set.trim();
        updates.collectorNumber = collectorNumber.trim();
        updates.conditionId = conditionId;
        updates.languageId = languageId;
        updates.finishId = finishes.find(f => f.shortName === finish)?.id;
      }

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={150}
        extraHeight={150}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
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

      {/* Image Uploader (no aplica a singles: sus imágenes vienen de Scryfall) */}
      {product.type !== 'SIN' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agregar Imágenes</Text>
          <Text style={styles.sectionSubtitle}>
            {currentImages.length > 0 ? `${currentImages.length} imagen(es) actual(es)` : 'Sin imágenes aún'}
          </Text>
          <ImageUploader
            onImagesSelected={(newImages) => {
              setImages(newImages);
              handleFieldChange();
            }}
            selectedImages={images}
            maxImages={5}
            multiple={true}
            allowsEditing={true}
          />
        </View>
      )}

      {/* Product Info -- solo para no-singles; los singles tienen su propia sección más
          abajo con Nombre inmutable, así que no tiene sentido repetir "Información del
          Producto" con un Nombre editable duplicado. */}
      {!isSingleType && (
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
              style={[styles.input, styles.flex1, styles.rowInput]}
              placeholder="Precio"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                handleFieldChange();
              }}
              keyboardType="decimal-pad"
              editable={!updateLoading}
            />
            <StockStepper
              style={[styles.flex1, styles.marginLeft, styles.rowInput]}
              value={stock}
              placeholder="Stock"
              onChangeValue={(text) => {
                setStock(text);
                handleFieldChange();
              }}
              editable={!updateLoading}
            />
          </View>
        </View>
      )}

      {/* Info de la carta -- todo en una sola sección para singles: Tipo y Nombre quedan
          inmutables (mismo estilo que ya tenían), Set/Collector # van antes de la
          Descripción, y cada campo ahora tiene su label (antes varios solo se distinguían
          por el placeholder, que desaparece apenas el campo tiene un valor cargado). */}
      {isSingleType && 'set' in product && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la Carta</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Tipo</Text>
            <Text style={styles.infoValue}>{product.type.toUpperCase()}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Nombre de la Carta</Text>
            <Text style={styles.infoValue}>{product.name}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Set</Text>
              <TextInput
                style={styles.input}
                placeholder="Set"
                value={set}
                onChangeText={(text) => {
                  setSet(text);
                  handleFieldChange();
                }}
                editable={!updateLoading}
              />
            </View>
            <View style={[styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Collector #</Text>
              <TextInput
                style={styles.input}
                placeholder="Collector #"
                value={collectorNumber}
                onChangeText={(text) => {
                  setCollectorNumber(text);
                  handleFieldChange();
                }}
                editable={!updateLoading}
              />
            </View>
          </View>

          <Text style={styles.label}>Descripción</Text>
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
            <View style={styles.flex1}>
              <Text style={styles.label}>Precio</Text>
              <TextInput
                style={[styles.input, styles.rowInput]}
                placeholder="Precio"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  handleFieldChange();
                }}
                keyboardType="decimal-pad"
                editable={!updateLoading}
              />
            </View>
            <View style={[styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Stock</Text>
              <StockStepper
                style={styles.rowInput}
                value={stock}
                placeholder="Stock"
                onChangeValue={(text) => {
                  setStock(text);
                  handleFieldChange();
                }}
                editable={!updateLoading}
              />
            </View>
          </View>

          <SelectField
            label="Condición"
            options={conditions.map(c => ({ key: String(c.id), label: c.longName }))}
            selectedKey={conditionId !== null ? String(conditionId) : null}
            onSelect={(key) => {
              setConditionId(Number(key));
              handleFieldChange();
            }}
            disabled={updateLoading}
          />

          <SelectField
            label="Idioma"
            options={languages.map(l => ({ key: String(l.id), label: l.longName }))}
            selectedKey={languageId !== null ? String(languageId) : null}
            onSelect={(key) => {
              setLanguageId(Number(key));
              handleFieldChange();
            }}
            disabled={updateLoading}
          />

          <SelectField
            label="Finish"
            options={(() => {
              const shortNames = availableFinishes.length > 0
                ? availableFinishes
                : finishes.map(f => f.shortName);
              // El finish ya guardado siempre queda seleccionable, aunque por algún dato
              // viejo no esté entre los que Scryfall reporta hoy para la carta.
              const withCurrent = finish && !shortNames.includes(finish)
                ? [...shortNames, finish]
                : shortNames;
              return withCurrent.map(shortName => ({
                key: shortName,
                label: finishes.find(cf => cf.shortName === shortName)?.longName ?? shortName,
              }));
            })()}
            selectedKey={finish}
            onSelect={(key) => {
              setFinish(key);
              handleFieldChange();
            }}
            disabled={updateLoading}
          />
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
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 180,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 4,
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
  rowInput: {
    height: 42,
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
