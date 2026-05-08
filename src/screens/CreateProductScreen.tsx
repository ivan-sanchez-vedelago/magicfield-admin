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
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult, CardSearch } from '@components';
import { useCreateProduct, useCategories } from '@hooks';
import { apiService } from '@services/api';
import { ScryfallCard, Category } from '@types';
import type { RootStackParamList } from '@navigation/types';
import { getAllCardImages } from '@utils/getCardImage';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProduct'>;

export const CreateProductScreen = ({ navigation }: Props) => {
  const { categories, loading: loadingCategories } = useCategories();

  // Category tree selection state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedLeaf, setSelectedLeaf] = useState<Category | null>(null);

  const getChildren = useCallback(
    (parentId: number) => categories.filter(c => c.parentId === parentId),
    [categories]
  );

  // Flattened tree respecting expanded state
  const flatTree = useMemo(() => {
    const result: { category: Category; depth: number }[] = [];
    const addLevel = (parentId: number, depth: number) => {
      const children = categories.filter(c => c.parentId === parentId);
      for (const cat of children) {
        result.push({ category: cat, depth });
        if (expandedIds.has(cat.id)) {
          addLevel(cat.id, depth + 1);
        }
      }
    };
    addLevel(0, 0);
    return result;
  }, [categories, expandedIds]);

  const findRoot = useCallback(
    (category: Category): Category => {
      if (category.parentId === 0) return category;
      const parent = categories.find(c => c.id === category.parentId);
      return parent ? findRoot(parent) : category;
    },
    [categories]
  );

  const isSingleType = useMemo(
    () => (selectedLeaf ? findRoot(selectedLeaf).shortName === 'SIN' : false),
    [selectedLeaf, findRoot]
  );

  const handleCategoryPress = (cat: Category) => {
    const children = getChildren(cat.id);
    if (children.length === 0) {
      setSelectedLeaf(cat);
    } else {
      setExpandedIds(prev => {
        const next = new Set(prev);
        if (next.has(cat.id)) {
          next.delete(cat.id);
        } else {
          next.add(cat.id);
        }
        return next;
      });
    }
  };


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
    setSelectedLeaf(null);
    setExpandedIds(new Set());

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

  const handleCreateProduct = async () => {
    if (!selectedLeaf) {
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
        type: selectedLeaf.shortName,
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

  if (!selectedLeaf) {
    return (
      <View style={styles.container}>
        <View style={styles.typeSelectionHeader}>
          <Text style={styles.title}>Selecciona el tipo de producto</Text>
          <Text style={styles.subtitle}>
            Elige qué tipo de producto deseas crear
          </Text>
        </View>

        {loadingCategories ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 32 }} />
        ) : (
          <ScrollView
            style={styles.treeScroll}
            contentContainerStyle={styles.treeScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {flatTree.map(({ category, depth }) => {
              const hasChildren = getChildren(category.id).length > 0;
              const isExpanded = expandedIds.has(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.treeNode,
                    depth === 0 ? styles.treeNodeRoot : styles.treeNodeChild,
                    { paddingLeft: 16 + depth * 20 },
                  ]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.treeNodeText,
                      depth === 0 && styles.treeNodeTextRoot,
                      !hasChildren && styles.treeNodeTextLeaf,
                    ]}
                  >
                    {category.name}
                  </Text>
                  <Text style={styles.treeArrow}>
                    {hasChildren ? (isExpanded ? '▼' : '▶') : '→'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
            <TouchableOpacity onPress={() => setSelectedLeaf(null)}>
              <Text style={styles.backButton}>← Atrás</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Nuevo {selectedLeaf.name}
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
  typeSelectionHeader: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    marginBottom: 4,
  },
  treeScroll: {
    flex: 1,
  },
  treeScrollContent: {
    paddingBottom: 24,
  },
  treeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  treeNodeRoot: {
    backgroundColor: '#fff',
  },
  treeNodeChild: {
    backgroundColor: '#f3f4f6',
  },
  treeNodeText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  treeNodeTextRoot: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1f2937',
  },
  treeNodeTextLeaf: {
    color: '#3b82f6',
  },
  treeArrow: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
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
