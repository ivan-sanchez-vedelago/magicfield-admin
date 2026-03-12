// Product Types
export type ProductType = 'single' | 'sealed' | 'other';

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  type: ProductType;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SingleProduct extends BaseProduct {
  type: 'single';
  cardName: string;
  set: string;
  collectorNumber: string;
  condition?: string;
  language?: string;
  isFoil?: boolean;
  scryfallId?: string;
}

export interface SealedProduct extends BaseProduct {
  type: 'sealed';
  releaseDate?: string;
}

export interface OtherProduct extends BaseProduct {
  type: 'other';
}

export type Product = SingleProduct | SealedProduct | OtherProduct;

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isMain: boolean;
  uploadedAt: string;
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
  collector_number: string;
  image_uris?: {
    normal?: string;
    small?: string;
  };
  prices?: {
    usd?: string;
  };
}

export interface ScryfallSearchResult {
  object: string;
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}
