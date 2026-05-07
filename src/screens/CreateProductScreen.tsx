import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult, CardSearch } from '@components';
import { useCreateProduct, useCategories } from '@hooks';
import { apiService } from '@services/api';
import { ScryfallCard, Category, ProductImage } from '@types';
import type { RootStackParamList } from '@navigation/types';
import { getAllCardImages } from '@utils/getCardImage';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProduct'>;

export const CreateProductScreen = ({ navigation }: Props) => {
  const { categories, loading: loadingCategories } = useCategories();

  const roots = useMemo(
    () => categories.filter(c => c.parentId === 0),
    [categories]
  );

  const [selectedRoot, setSelectedRoot] = useState<Category | null>(null);
  const [selectedLeafShortName, setSelectedLeafShortName] = useState<string>('');
  const [showLeafDropdown, setShowLeafDropdown] = useState(false);

  const leafCategories = useMemo(() => {
    if (!selectedRoot) return [];
    const children = categories.filter(c => c.parentId === selectedRoot.id);
    return children.length > 0 ? children : [selectedRoot];
  }, [selectedRoot, categories]);

  const isSingleType = selectedRoot?.shortName === 'SIN';

  const [images, setImages] = useState<ImageUploadResult[]>([]);

  // Common fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [priceUsdFoil, setPriceUsdFoil] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Single-specific fields
  const [cardName, setCardName] = useState('');
  const [set, setSet] = useState('');
  const [collectorNumber, setCollectorNumber] = useState('');
  const [condition, setCondition] = useState('');
  const [language, setLanguage] = useState('');
  const [hasFoil, setHasFoil] = useState(false);
  const [isFoil, setIsFoil] = useState(false);
  const [scryfallId, setScryfallId] = useState('');

  // Sealed-specific fields
  const [releaseDate, setReleaseDate] = useState('');

  const selectedCategory = categories.find(c => c.shortName === selectedLeafShortName);

  const resetForm = () => {
    // tipo
    setSelectedRoot(null);
    setSelectedLeafShortName('');

    // comunes
    setName('');
    setDescription('');
    setPriceUsd('');
    setPriceUsdFoil('');
    setPrice('');
    setStock('');
    setImages([]);

    // single
    setCardName('');
    setSet('');
    setCollectorNumber('');
    setCondition('');
    setLanguage('');
    setIsFoil(false);
    setHasFoil(false);
    setScryfallId('');

    // sealed
    setReleaseDate('');
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetForm();
      };
    }, [])
  );

  const { execute: createProduct, loading } = useCreateProduct((product) => {
    Alert.alert('Éxito', 'Producto creado correctamente', [
      {
        text: 'OK',
        onPress: () => {
          resetForm();
          navigation.goBack();
        },
      },
    ]);
  });

  const getPrice = (usd: string | undefined) => {
    if (!usd) return '';

    const base = Number(usd);
    if (isNaN(base)) return '';
    let price = base;
    if (price < 10)
      price *= 1.3;
    else
      price *= 1.4;

    // Floor mínimo
    if (price < 0.5) {
      price = 0.5;
    }
    
    return price.toFixed(2);
  };

  const handleFoilChange = () => {
    if(hasFoil && !isFoil) {
      setPrice(priceUsdFoil);
    } else {
      setPrice(priceUsd);
    }
    setIsFoil(!isFoil);
  };

  const handleSelectCard = (card: ScryfallCard) => {
    const newPriceUsd = getPrice(card.prices?.usd);
    const newPriceUsdFoil = getPrice(card.prices?.usd_foil);

    setName(card.name);
    setCardName(card.name);
    setSet(card.set_name);
    setCollectorNumber(card.collector_number);
    setScryfallId(card.id);

    setDescription(
      card.oracle_text ||
      card.card_faces?.map(f => f.oracle_text).filter(Boolean).join('\n---\n') ||
      ''
    );
    setHasFoil(card.foil || false);
    setPriceUsd(newPriceUsd);
    setPriceUsdFoil(newPriceUsdFoil);
    if (card.foil && isFoil) {
      setPrice(newPriceUsdFoil);
    } else if (newPriceUsd) {
      setIsFoil(false);
      setPrice(newPriceUsd);
    } else {
      // solo tiene precio foil (carta solo-foil)
      setIsFoil(true);
      setPrice(newPriceUsdFoil);
    }
    setStock('1');
    setCondition('Near Mint');
    setLanguage('English');

    const cardImages = getAllCardImages(card);
    if (cardImages.length > 0) {
      setImages(cardImages.map((uri, i) => ({
        uri,
        name: `${card.name}_face${i + 1}.png`,
        type: 'image/png',
      })));
    } else {
      setImages([]);
    }
  };

  const handleSelectRoot = (root: Category) => {
    setSelectedRoot(root);
    const children = categories.filter(c => c.parentId === root.id);
    const leaves = children.length > 0 ? children : [root];
    if (leaves.length === 1) {
      setSelectedLeafShortName(leaves[0].shortName);
    } else {
      setSelectedLeafShortName('');
    }
  };

  const handleCreateProduct = async () => {
    if (!selectedRoot) {
      Alert.alert('Error', 'Debes seleccionar un tipo de producto');
      return;
    }
    if (!selectedLeafShortName) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return;
    }
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
      if (!cardName.trim() || !set.trim()) {
        Alert.alert('Error', 'Para singles debes especificar la carta y el set');
        return;
      }
    }

    try {
      const productData: any = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        type: selectedLeafShortName,
      };

      // Add type-specific fields
      if (isSingleType) {
        productData.cardName = cardName.trim();
        productData.set = set.trim();
        productData.collectorNumber = collectorNumber.trim();
        if (condition) productData.condition = condition;
        if (language) productData.language = language;
        productData.isFoil = isFoil;
        if (scryfallId) productData.scryfallId = scryfallId;
      }

      const createdProduct = await createProduct(productData);
      const productId = createdProduct.id;

      if (!isSingleType && images.length > 0) {
        for (const img of images) {
          try {
            await apiService.uploadImage(productId, img.uri, img.name);
          } catch (imageError) {
            console.error('Error subiendo imagen:', imageError);
          }
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo crear el producto: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      );
    }
  };

  if (!selectedRoot) {
    return (
      <View style={styles.container}>
        {/* Type Selection */}
        <View style={styles.typeSelectionContainer}>
          <Text style={styles.title}>Selecciona el tipo de producto</Text>
          <Text style={styles.subtitle}>
            Elige qué tipo de producto deseas crear
          </Text>

          {loadingCategories ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            roots.map((root) => (
              <TouchableOpacity
                key={root.shortName}
                style={styles.typeOption}
                onPress={() => handleSelectRoot(root)}
              >
                <View style={styles.typeOptionContent}>
                  <Text style={styles.typeOptionLabel}>{root.name}</Text>
                </View>
                <Text style={styles.typeOptionArrow}>→</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        style={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={115}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedRoot(null)}>
              <Text style={styles.backButton}>← Atrás</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Nuevo {selectedRoot.name}
            </Text>
          </View>

          {/* Image Uploader */}
          <View style={styles.section}>
            <ImageUploader
              selectedImages={images}
              onImagesSelected={setImages}
              maxImages={5}
              multiple={true}
              allowsEditing={true}
              readonly={isSingleType}
            />
          </View>

          {/* Leaf Category Selection */}
          {!isSingleType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categoría</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowLeafDropdown(true)}
                disabled={loading}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedLeafShortName
                    ? leafCategories.find(l => l.shortName === selectedLeafShortName)?.name
                    : 'Selecciona una categoría...'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              <Modal
                visible={showLeafDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLeafDropdown(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowLeafDropdown(false)}>
                  <View style={styles.dropdownOverlay}>
                    <View style={styles.dropdownMenu}>
                      <FlatList
                        data={leafCategories}
                        keyExtractor={(item) => item.shortName}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.dropdownItem,
                              selectedLeafShortName === item.shortName && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSelectedLeafShortName(item.shortName);
                              setShowLeafDropdown(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedLeafShortName === item.shortName && styles.dropdownItemTextActive,
                              ]}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </View>
          )}

          {/* Common Fields */}
          {!isSingleType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información básica</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />

              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Descripción"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Precio"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="Stock"
                  placeholderTextColor="#9ca3af"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>
          )}

          {/* Single Product Fields */}
          {isSingleType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de la Carta</Text>

              <CardSearch onCardSelected={handleSelectCard} disabled={loading} />

              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Descripción"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Precio"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="Stock"
                  placeholderTextColor="#9ca3af"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Set"
                  placeholderTextColor="#9ca3af"
                  value={set}
                  onChangeText={setSet}
                  editable={!loading}
                />
                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="Collector #"
                  placeholderTextColor="#9ca3af"
                  value={collectorNumber}
                  onChangeText={setCollectorNumber}
                  editable={!loading}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="Condición"
                  placeholderTextColor="#9ca3af"
                  value={condition}
                  onChangeText={setCondition}
                  editable={!loading}
                />
                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="Idioma"
                  placeholderTextColor="#9ca3af"
                  value={language}
                  onChangeText={setLanguage}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.input, styles.foilToggle, isFoil && styles.foilActive, !hasFoil && styles.disabled]}
                onPress={handleFoilChange}
                disabled={loading || !hasFoil}
              >
                <Text style={styles.foilToggleText}>
                  {isFoil ? '✓' : '○'} Foil
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Create Button */}
          <View style={styles.createSection}>
            <TouchableOpacity
              style={[styles.createButton, loading && styles.disabled]}
              onPress={handleCreateProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Crear Producto</Text>
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
  typeSelectionContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  typeOptionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  typeOptionArrow: {
    fontSize: 20,
    color: '#9ca3af',
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
  backButton: {
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
  foilToggle: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
  },
  foilActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  foilToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  createSection: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  createButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 13,
    color: '#1f2937',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 300,
    width: '80%',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemActive: {
    backgroundColor: '#eff6ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dropdownItemTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
