import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { API_CONFIG, ENDPOINTS } from './config';
import {
  Product,
  PagedProducts,
  ApiResponse,
  ApiErrorResponse,
  ScryfallCard,
  ScryfallSearchResult,
  Banner,
  BannerRequest,
  Category,
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

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>(ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await this.client.get<Product[]>(ENDPOINTS.PRODUCTS.LIST);
    return response.data;
  }

  async getProductsPaged(
    page: number,
    size: number,
    search?: string,
    categories?: string[]
  ): Promise<PagedProducts> {
    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
    };
    if (search) params.search = search;
    if (categories && categories.length > 0) params.categories = categories.join(',');
    const response = await this.client.get<PagedProducts>(ENDPOINTS.PRODUCTS.PAGED, { params });
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
  async getProductImages(productId: string) {
    const response = await this.client.get(
      ENDPOINTS.PRODUCTS.IMAGES(productId)
    );
    return response.data;
  }

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

  // Banners
  async getActiveBanners(): Promise<Banner[]> {
    const response = await this.client.get<Banner[]>(ENDPOINTS.BANNERS.LIST_ACTIVE);
    return response.data;
  }

  async getAllBanners(): Promise<Banner[]> {
    const response = await this.client.get<Banner[]>(ENDPOINTS.BANNERS.LIST_ALL);
    return response.data;
  }

  async createBanner(request: BannerRequest): Promise<Banner> {
    const response = await this.client.post<Banner>(ENDPOINTS.BANNERS.CREATE, request);
    return response.data;
  }

  async updateBanner(id: number, request: BannerRequest): Promise<Banner> {
    const response = await this.client.put<Banner>(ENDPOINTS.BANNERS.UPDATE(id), request);
    return response.data;
  }

  async uploadBannerImage(id: number, imageUri: string, fileName: string): Promise<Banner> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);
    const response = await this.client.post<Banner>(
      ENDPOINTS.BANNERS.UPLOAD_IMAGE(id),
      formData,
      { 
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutos para uploads de imágenes
      }
    );
    return response.data;
  }

  async deleteBanner(id: number): Promise<void> {
    await this.client.delete(ENDPOINTS.BANNERS.DELETE(id));
  }

  // Orders / Sales Audit
  async getAllSalesAudits() {
    const response = await this.client.get(ENDPOINTS.ORDERS.ALL);
    return response.data;
  }

  async finalizeOrder(orderId: string): Promise<void> {
    await this.client.post(`/api/orders/${orderId}/finalize`);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.client.post(`/api/orders/${orderId}/cancel`, { isAdmin: 'true' });
  }

  // Dashboard Stats
  async getDashboardStats(period: string = '7days') {
    const response = await this.client.get(ENDPOINTS.DASHBOARD.STATS, {
      params: { period },
    });
    return response.data;
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
