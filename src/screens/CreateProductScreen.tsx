import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult, CardSearch } from '@components';
import { useCreateProduct } from '@hooks';
import { apiService } from '@services/api';
import { ScryfallCard, ProductType, ProductImage } from '@types';
import type { RootStackParamList } from '@navigation/types';
import { getCardImage } from '@utils/getCardImage';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProduct'>;

type ProductTypeOption = {
  label: string;
  value: ProductType;
  description: string;
};

const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    label: 'Single',
    value: 'single',
    description: 'Carta individual con datos de Scryfall',
  },
  {
    label: 'Sealed',
    value: 'sealed',
    description: 'Producto sellado (booster, caja, etc)',
  },
  {
    label: 'Otro',
    value: 'other',
    description: 'Otro tipo de producto',
  },
];

export const CreateProductScreen: React.FC<Props> = ({ navigation }) => {
  const [productType, setProductType] = useState<ProductType | null>(null);
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

  const resetForm = () => {
    // tipo
    setProductType(null);

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

    setDescription(card.oracle_text || '');
    setHasFoil(card.foil || false);
    setPriceUsd(newPriceUsd);
    setPriceUsdFoil(newPriceUsdFoil);
    if(card.foil && isFoil) {
      setPrice(newPriceUsdFoil);
    } else {
      setIsFoil(false);
      setPrice(newPriceUsd);
    }
    setStock('1');
    setCondition('Near Mint');
    setLanguage('English');

    const imageUrl = getCardImage(card);
    if (imageUrl) {
      setImages([{ uri: imageUrl, name: `${card.name}.png`, type: 'image/png' }]);
    } else {
      setImages([]);
    }
  };

  const handleCreateProduct = async () => {
    if (!productType) {
      Alert.alert('Error', 'Debes seleccionar un tipo de producto');
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

    if (productType === 'single') {
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
        type: productType,
      };

      // Add type-specific fields
      if (productType === 'single') {
        productData.cardName = cardName.trim();
        productData.set = set.trim();
        productData.collectorNumber = collectorNumber.trim();
        if (condition) productData.condition = condition;
        if (language) productData.language = language;
        productData.isFoil = isFoil;
        if (scryfallId) productData.scryfallId = scryfallId;
      } else if (productType === 'sealed' && releaseDate) {
        productData.releaseDate = releaseDate;
      }

      const createdProduct = await createProduct(productData);
      const productId = createdProduct.id;

      if (images.length > 0) {
        try {
          const uploadedImage = await apiService.uploadImage(
            productId,
            images[0].uri,
            images[0].name
          );
        } catch (imageError) {
          console.error('Error subiendo imagen:', imageError);
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

  if (!productType) {
    return (
      <View style={styles.container}>
        {/* Type Selection Modal */}
        <View style={styles.typeSelectionContainer}>
          <Text style={styles.title}>Selecciona el tipo de producto</Text>
          <Text style={styles.subtitle}>
            Elige qué tipo de producto deseas crear
          </Text>

          {PRODUCT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={styles.typeOption}
              onPress={() => setProductType(type.value)}
            >
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionLabel}>{type.label}</Text>
                <Text style={styles.typeOptionDescription}>
                  {type.description}
                </Text>
              </View>
              <Text style={styles.typeOptionArrow}>→</Text>
            </TouchableOpacity>
          ))}
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
            <TouchableOpacity onPress={() => setProductType(null)}>
              <Text style={styles.backButton}>← Atrás</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Nuevo {PRODUCT_TYPES.find((t) => t.value === productType)?.label}
            </Text>
          </View>

          {/* Image Uploader */}
          <View style={styles.section}>
            <ImageUploader
              selectedImages={images}
              onImagesSelected={setImages}
              maxImages={5}
              multiple={true}
              readonly={productType === 'single'}
            />
          </View>

          {/* Common Fields */}
          {productType !== 'single' && (
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
          {productType === 'single' && (
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

          {/* Sealed Product Fields */}
          {productType === 'sealed' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Sealed</Text>

              <TextInput
                style={styles.input}
                placeholder="Fecha de lanzamiento (YYYY-MM-DD)"
                placeholderTextColor="#9ca3af"
                value={releaseDate}
                onChangeText={setReleaseDate}
                editable={!loading}
              />
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
});
