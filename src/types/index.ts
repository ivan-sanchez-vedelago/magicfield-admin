// Product Types
export type ProductType = string;

export interface Category {
  id: number;
  name: string;
  shortName: string;
  parentId: number;
}

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  type: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SingleProduct extends BaseProduct {
  type: 'SIN';
  cardName: string;
  set: string;
  collectorNumber: string;
  condition?: string;
  language?: string;
  isFoil?: boolean;
  scryfallId?: string;
}

export interface SealedProduct extends BaseProduct {
  type: 'PSL';
  releaseDate?: string;
}

export interface OtherProduct extends BaseProduct {
  type: 'ACC';
}

export type Product = SingleProduct | BaseProduct;

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
  image_uris?: {
    small: string;
    normal: string;
    large?: string;
    png?: string;
  };
  prices?: {
    usd?: string;
    usd_foil?: string;
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
