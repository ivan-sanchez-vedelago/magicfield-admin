import { useState, useCallback, useMemo, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageUploader, ImageUploadResult, CardSearch, StockStepper } from '@components';
import { useCreateProduct, useCategories, useConditions, useLanguages, useFinishes } from '@hooks';
import { apiService } from '@services/api';
import { ScryfallCard, Category } from '@types';
import type { RootStackParamList } from '@navigation/types';
import { getAllCardImages } from '@utils/getCardImage';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProduct'>;

export const CreateProductScreen = ({ navigation }: Props) => {
  const { categories, loading: loadingCategories } = useCategories();
  const { conditions } = useConditions();
  const { languages } = useLanguages();
  const { finishes } = useFinishes();

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

  const isSingleType = selectedLeaf?.shortName === 'SIN';

  const handleCategoryPress = (cat: Category) => {
    const children = getChildren(cat.id);
    if (children.length === 0) {
      // Solo las hojas (sin hijos) son seleccionables
      setSelectedLeaf(cat);
    } else {
      // Las ramas solo expanden/colapsan
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
  const [conditionId, setConditionId] = useState<number | null>(null);
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [availableFinishes, setAvailableFinishes] = useState<string[]>(['NONFOIL']);
  const [finish, setFinish] = useState('NONFOIL');
  const [priceUsdEtched, setPriceUsdEtched] = useState('');
  const [scryfallId, setScryfallId] = useState('');

  // Apenas cargan las listas, se preselecciona el primer registro de cada una
  // (menor id -- NM e English con la semilla actual) en vez de un string fijo.
  useEffect(() => {
    if (conditions.length > 0 && conditionId === null) {
      setConditionId(conditions[0].id);
    }
  }, [conditions, conditionId]);

  useEffect(() => {
    if (languages.length > 0 && languageId === null) {
      setLanguageId(languages[0].id);
    }
  }, [languages, languageId]);

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
    setConditionId(null);
    setLanguageId(null);
    setAvailableFinishes(['NONFOIL']);
    setFinish('NONFOIL');
    setPriceUsdEtched('');
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
    Alert.alert(
      'Éxito',
      product.merged
        ? 'Ya existía ese producto: se sumó el stock al existente'
        : 'Producto creado correctamente',
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            navigation.goBack();
          },
        },
      ]
    );
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
    
    return String(price);
  };

  // Precio estimado para mostrar en el form según el finish elegido -- el precio real
  // que termina quedando en el producto lo recalcula el backend contra Scryfall al crear.
  const priceForFinish = (f: string, usd = priceUsd, foil = priceUsdFoil, etched = priceUsdEtched) => {
    if (f === 'ETCHED') return etched || foil;
    if (f === 'FOIL' || f === 'GLOSSY') return foil;
    return usd || foil; // fallback: cartas solo-foil no tienen precio nonfoil
  };

  const handleFinishChange = (newFinish: string) => {
    setFinish(newFinish);
    setPrice(priceForFinish(newFinish));
  };

  const handleSelectCard = (card: ScryfallCard) => {
    const newPriceUsd = getPrice(card.prices?.usd);
    const newPriceUsdFoil = getPrice(card.prices?.usd_foil);
    const newPriceUsdEtched = getPrice(card.prices?.usd_etched);

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
    setPriceUsd(newPriceUsd);
    setPriceUsdFoil(newPriceUsdFoil);
    setPriceUsdEtched(newPriceUsdEtched);

    // El array `finishes` de Scryfall es la fuente real de qué acabados existen para
    // esta impresión puntual (fallback a foil/nonfoil por si algún día no viniera).
    const finishes = card.finishes && card.finishes.length > 0
      ? card.finishes.map(f => f.toUpperCase())
      : (card.foil ? ['NONFOIL', 'FOIL'] : ['NONFOIL']);
    const defaultFinish = finishes.includes('NONFOIL') ? 'NONFOIL' : finishes[0];
    setAvailableFinishes(finishes);
    setFinish(defaultFinish);
    setPrice(priceForFinish(defaultFinish, newPriceUsd, newPriceUsdFoil, newPriceUsdEtched));
    setStock('1');

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
    if (stock && isNaN(parseInt(stock))) {
      Alert.alert('Error', 'El stock debe ser un número válido');
      return;
    }

    const selectedFinishId = finishes.find(f => f.shortName === finish)?.id;

    if (isSingleType) {
      if (!cardName.trim() || !set.trim()) {
        Alert.alert('Error', 'Para singles debes especificar la carta y el set');
        return;
      }
      if (conditionId === null || languageId === null || selectedFinishId === undefined) {
        Alert.alert('Error', 'Debes seleccionar condición, idioma y finish');
        return;
      }
    }

    try {
      const productData: any = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 1,
        type: selectedLeaf.shortName,
      };

      // Add type-specific fields
      if (isSingleType) {
        productData.cardName = cardName.trim();
        productData.set = set.trim();
        productData.collectorNumber = collectorNumber.trim();
        productData.conditionId = conditionId;
        productData.languageId = languageId;
        productData.finishId = selectedFinishId;
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
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={150}
        extraHeight={150}
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
                  style={[styles.input, styles.flex1, styles.rowInput]}
                  placeholder="Precio"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <StockStepper
                  style={[styles.flex1, styles.marginLeft, styles.rowInput]}
                  value={stock}
                  onChangeValue={setStock}
                  placeholder="Stock"
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
                  style={[styles.input, styles.flex1, styles.rowInput]}
                  placeholder="Precio"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <StockStepper
                  style={[styles.flex1, styles.marginLeft, styles.rowInput]}
                  value={stock}
                  onChangeValue={setStock}
                  placeholder="Stock"
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

              <SelectField
                label="Condición"
                options={conditions.map(c => ({ key: String(c.id), label: c.longName }))}
                selectedKey={conditionId !== null ? String(conditionId) : null}
                onSelect={(key) => setConditionId(Number(key))}
                disabled={loading}
              />

              <SelectField
                label="Idioma"
                options={languages.map(l => ({ key: String(l.id), label: l.longName }))}
                selectedKey={languageId !== null ? String(languageId) : null}
                onSelect={(key) => setLanguageId(Number(key))}
                disabled={loading}
              />

              <SelectField
                label="Finish"
                options={availableFinishes.map(f => ({
                  key: f,
                  label: finishes.find(cf => cf.shortName === f)?.longName ?? f,
                }))}
                selectedKey={finish}
                onSelect={handleFinishChange}
                disabled={loading}
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

interface SelectOption {
  key: string;
  label: string;
}

// Input que al tocarlo despliega un modal con la lista de opciones (en vez de una fila de
// chips) -- el valor elegido queda mostrado como texto legible dentro del campo cerrado.
const SelectField = ({
  label,
  options,
  selectedKey,
  onSelect,
  disabled,
}: {
  label: string;
  options: SelectOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.key === selectedKey)?.label;

  return (
    <View style={styles.selectGroup}>
      <Text style={styles.chipGroupLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, disabled && styles.disabled]}
        onPress={() => setOpen(true)}
        disabled={disabled}
      >
        <Text style={selectedLabel ? styles.selectValueText : styles.selectPlaceholderText}>
          {selectedLabel ?? 'Seleccionar...'}
        </Text>
        <Text style={styles.selectChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.selectModalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.selectModalContent}>
            <Text style={styles.selectModalTitle}>{label}</Text>
            <ScrollView>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.selectOption, opt.key === selectedKey && styles.selectOptionActive]}
                  onPress={() => {
                    onSelect(opt.key);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      opt.key === selectedKey && styles.selectOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  rowInput: {
    height: 42,
  },
  chipGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 4,
  },
  selectGroup: {
    marginBottom: 4,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectValueText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  selectPlaceholderText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  selectChevron: {
    fontSize: 13,
    color: '#9ca3af',
  },
  selectModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  selectModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    paddingVertical: 8,
  },
  selectModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectOptionActive: {
    backgroundColor: '#eff6ff',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectOptionTextActive: {
    color: '#3b82f6',
    fontWeight: '700',
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
