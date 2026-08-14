// API Endpoints
export const API_BASE_URL = process.env.API_BASE_URL || 'https://loki-bc0bb.web.app/api';

export const API_ENDPOINTS = {
  // Authentication
  CREATE_ACCOUNT: `${API_BASE_URL}/create-account`,
  
  // Shared Collections
  SHARED_COLLECTION_SAVE: `${API_BASE_URL}/shared-collection/save`,
  SHARED_COLLECTION_MUTATE: `${API_BASE_URL}/shared-collection/mutate`,
  SHARED_COLLECTION_VOTE: `${API_BASE_URL}/shared-collection/vote`,
  SHARED_COLLECTION_SEARCH_PLACES: `${API_BASE_URL}/shared-collection/search-places`,
  
  // Admin
  ADMIN_PLACES: (id: string) => `${API_BASE_URL}/admin/places/${id}`,
  ADMIN_UPLOAD_PLACE_IMAGE: `${API_BASE_URL}/admin/upload-place-image`,
  ADMIN_PLACE_FROM_TEXT: `${API_BASE_URL}/admin/place-from-text`,
  
  // External Services
  GOOGLE_PLACES: `${API_BASE_URL}/google-places`,
  GEOCODE: `${API_BASE_URL}/geocode`,
  GPT: `${API_BASE_URL}/gpt`,
  
  // Agent
  AGENT_SESSIONS: `${API_BASE_URL}/agent/sessions`,
  AGENT_SESSION: (id: string) => `${API_BASE_URL}/agent/sessions/${id}`,
} as const;

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  PLACES: 'places',
  SHARED_COLLECTIONS: 'sharedCollections',
  CONFIG: 'config',
  FEATURES: 'features',
} as const;