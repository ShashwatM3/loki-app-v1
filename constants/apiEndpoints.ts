// API Endpoints — all backend routes live on the deployed Loki website under /api/*
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://lokidxb.com';
export const API_BASE_URL = `${WEB_BASE_URL}/api`;

export const API_ENDPOINTS = {
  // Authentication / accounts
  CREATE_ACCOUNT: `${API_BASE_URL}/create-account`,

  // Shared collections
  ENCRYPT: `${API_BASE_URL}/encrypt`,
  DECRYPT: `${API_BASE_URL}/decrypt`,
  SHARED_COLLECTION: `${API_BASE_URL}/shared-collection`,

  // External services
  GOOGLE_PLACES: `${API_BASE_URL}/google-places`,
  GEOCODE: `${API_BASE_URL}/geocode`,
  GPT: `${API_BASE_URL}/gpt`,
} as const;

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  PLACES: 'places',
  SHARED_COLLECTIONS: 'sharedCollections',
  CONFIG: 'config',
  FEATURES: 'features',
} as const;
