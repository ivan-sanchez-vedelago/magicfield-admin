import Constants from 'expo-constants';

// Obtiene IP automáticamente en Expo
const getDevApiUrl = () => {
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  const host = debuggerHost?.split(':')[0];

  if (!host) return 'http://localhost:8080';
  return `http://${host}:8080`;
};

const ENV = {
  DEV: getDevApiUrl(),
  PROD: 'https://magicfield-backend-production.up.railway.app',
};

const isProduction = process.env.NODE_ENV === 'production';

export const API_CONFIG = {
  BASE_URL: isProduction ? ENV.PROD : ENV.DEV,
  TIMEOUT: 30000, // 30 segundos timeout default
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: {
    LIST: '/api/products',
    PAGED: '/api/products/paged',
    GET: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
    IMAGES: (id: string) => `/api/products/${id}/images`,
  },
  CATEGORIES: {
    LIST: '/api/categories',
  },
  IMAGES: {
    UPLOAD: '/api/images/upload',
    DELETE: (id: string) => `/api/images/${id}`,
  },
  BANNERS: {
    LIST_ACTIVE: '/api/banners',
    LIST_ALL: '/api/banners/all',
    CREATE: '/api/banners',
    UPDATE: (id: number) => `/api/banners/${id}`,
    DELETE: (id: number) => `/api/banners/${id}`,
    UPLOAD_IMAGE: (id: number) => `/api/banners/${id}/image`,
  },
  ORDERS: {
    ALL: '/api/sales-audit',
  },
  DASHBOARD: {
    STATS: '/api/admin/dashboard-stats',
  },
};

// For development, you can override the BASE_URL
export const setApiBaseUrl = (url: string) => {
  API_CONFIG.BASE_URL = url;
};

// Get current API base URL
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};
