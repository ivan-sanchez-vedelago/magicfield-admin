// Product Types
export type ProductType = string;

export interface Category {
  id: number;
  name: string;
  shortName: string;
  parentId: number;
}

export interface Condition {
  id: number;
  shortName: string;
  longName: string;
  priceMultiplier: number;
}

export interface Language {
  id: number;
  shortName: string;
  longName: string;
}

export interface Finish {
  id: number;
  shortName: string;
  longName: string;
}

// Set curado de Scryfall para el picker de "set" de productos sellados -- ya viene filtrado
// desde el backend (sin promos/variantes/digitales), ver GET /api/scryfall/sets.
export interface ScryfallSet {
  code: string;
  name: string;
  iconSvgUri?: string;
}

export interface BaseProduct {
  id: string;
  name: string;
  // Nombre + tags de variante de arte/marco concatenados (ej. "Lightning Bolt (Borderless)"),
  // calculado por el backend. Usar esto para mostrar al usuario; `name` queda puro para los
  // campos editables (viaja de vuelta tal cual al guardar, no debe llevar el sufijo pegado).
  displayName?: string;
  variantTags?: string[];
  description: string;
  price: number;
  stock: number;
  type: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Solo viene lleno en la respuesta de crear un producto: true si en vez de crear una
  // fila nueva se sumó el stock pedido a una variante ya existente.
  merged?: boolean;
}

export interface SingleProduct extends BaseProduct {
  type: 'SIN';
  set: string;
  collectorNumber: string;
  conditionId?: number;
  conditionName?: string;
  languageId?: number;
  languageName?: string;
  finishId?: number;
  finishShortName?: string;
  finishName?: string;
  scryfallId?: string;
}

export interface SealedProduct extends BaseProduct {
  // NUNCA literalmente 'PSL' en un producto real: es el shortName de la subcategoría hoja
  // (ej. "PRECON"), ver src/utils/categoryTree.ts. No sirve como discriminante de tipo.
  type: string;
  set?: string;
  conditionId?: number;
  conditionName?: string;
  languageId?: number;
  languageName?: string;
}

export interface OtherProduct extends BaseProduct {
  type: 'ACC';
}

export type Product = SingleProduct | SealedProduct | OtherProduct | BaseProduct;

export interface PagedProducts {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isMain: boolean;
  uploadedAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  active: boolean;
  sortOrder: number;
}

export interface CsvImportRowError {
  row: number;
  cardName: string;
  reason: string;
}

export interface CsvImportResult {
  totalRows: number;
  created: number;
  updatedExisting: number;
  errors: CsvImportRowError[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Scryfall Types
export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  oracle_text?: string;
  foil?: boolean;
  nonfoil?: boolean;
  // Scryfall real: 'nonfoil' | 'foil' | 'etched' | 'glossy' — reemplaza a foil/nonfoil
  // como fuente de verdad de qué finishes existen para esta impresión puntual.
  finishes?: string[];
  // Variantes de arte/marco de esta impresión puntual -- ver utils/scryfallVariantTags.ts,
  // espejo de ScryfallService.extractVariantTags en el backend.
  border_color?: string;
  frame_effects?: string[];
  full_art?: boolean;
  image_uris?: {
    small: string;
    normal: string;
    large?: string;
    png?: string;
  };
  prices?: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
  };
  card_faces?: {
    name?: string;
    oracle_text?: string;
    image_uris?: {
      small?: string;
      normal?: string;
      large?: string;
      png?: string;
    };
  }[];
}

export interface ScryfallSearchResult {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}
