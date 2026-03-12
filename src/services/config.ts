// API Configuration
// This file handles environment-specific API URLs

const ENV = {
  DEV: 'http://192.168.0.18:8080',
  PROD: 'https://magicfield-backend-production.up.railway.app',
};

// Detect current environment
const isProduction = process.env.NODE_ENV === 'production';

export const API_CONFIG = {
  BASE_URL: isProduction ? ENV.PROD : ENV.DEV,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: {
    LIST: '/api/products',
    GET: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
    IMAGES: (id: string) => `/api/products/${id}/images`,
  },
  IMAGES: {
    UPLOAD: '/api/images/upload',
    DELETE: (id: string) => `/api/images/${id}`,
  },
};

// For development, you can override the BASE_URL
export const setApiBaseUrl = (url: string) => {
  API_CONFIG.BASE_URL = url;
};

// Get current API base URL
export const getApiBaseUrl = () => {
  console.log("API BASE URL:", API_CONFIG.BASE_URL);
  return API_CONFIG.BASE_URL;
};
