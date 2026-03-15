import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { API_CONFIG, ENDPOINTS } from './config';
import {
  Product,
  ApiResponse,
  ApiErrorResponse,
  ScryfallCard,
  ScryfallSearchResult,
} from '@types';

class ApiService {
  private client: AxiosInstance;
  private retryCount: Record<string, number> = {};

  constructor() {
    console.log("API BASE URL:", API_CONFIG.BASE_URL);
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        console.log("API ERROR:", error.message);
        console.log("API ERROR URL:", error.config?.url);
        console.log("API ERROR STATUS:", error.response?.status);
        const config = error.config;

        if (config && error.response?.status !== 401) {
          const key = `${config.method}_${config.url}`;
          this.retryCount[key] = (this.retryCount[key] || 0) + 1;

          if (this.retryCount[key] < API_CONFIG.RETRY_ATTEMPTS) {
            await new Promise((resolve) =>
              setTimeout(resolve, API_CONFIG.RETRY_DELAY)
            );
            return this.client.request(config);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await this.client.get<Product[]>(ENDPOINTS.PRODUCTS.LIST);
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get<Product>(
      ENDPOINTS.PRODUCTS.GET(id)
    );
    return response.data;
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await this.client.post<Product>(
      ENDPOINTS.PRODUCTS.CREATE,
      product
    );
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await this.client.put<Product>(
      ENDPOINTS.PRODUCTS.UPDATE(id),
      product
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.client.delete(ENDPOINTS.PRODUCTS.DELETE(id));
  }

  // Quick stock update
  async updateProductStock(id: string, stock: number): Promise<Product> {
    const response = await this.client.patch(
      `/api/products/${id}/stock?stock=${stock}`
    );
    return response.data;
  }

  // Quick price update
  async updateProductPrice(id: string, price: number): Promise<Product> {
    return this.updateProduct(id, { price });
  }

  // Images
  async uploadImage(
    productId: string,
    imageUri: string,
    fileName: string
  ) {
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    const response = await this.client.post(
      `/api/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.client.delete(ENDPOINTS.IMAGES.DELETE(imageId));
  }

  // Scryfall Integration
  async searchScryfallCards(query: string): Promise<ScryfallCard[]> {
    try {
      const response = await axios.get<ScryfallSearchResult>(
        'https://api.scryfall.com/cards/search',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MagicFieldApp/1.0 (your-email@example.com)'
          },
          params: { q: query },
          timeout: 30000,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Scryfall search error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health', {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Update base URL for different environments
  updateBaseUrl(url: string) {
    this.client.defaults.baseURL = url;
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.client.defaults.baseURL || API_CONFIG.BASE_URL;
  }
}

export const apiService = new ApiService();
