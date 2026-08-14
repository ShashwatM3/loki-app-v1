import { apiClient, WEB_BASE_URL } from '../services/apiClient';

/**
 * Create a shareable link for a collection.
 *
 * Encryption happens on the Loki backend (POST /api/encrypt) — the same route the
 * website uses — so links generated here open correctly at lokidxb.com/collection/<token>.
 */
export async function createCollectionShareLink(opts: {
  email: string;
  collection: string;
  access?: 'view' | 'edit';
  sharedCollectionId?: string;
}): Promise<{ link: string; token: string; sharedCollectionId: string }> {
  const response = await apiClient.post('/api/encrypt', {
    email: opts.email,
    collection: opts.collection,
    access: opts.access ?? 'view',
    sharedCollectionId: opts.sharedCollectionId,
  });

  if (!response?.token) {
    throw new Error(response?.error || 'Failed to generate share link');
  }

  return {
    token: response.token,
    sharedCollectionId: response.sharedCollectionId,
    link: `${WEB_BASE_URL}/collection/${response.token}`,
  };
}

/** Decrypt a shared-collection token via the backend (POST /api/decrypt). */
export async function decryptShareToken(token: string): Promise<any> {
  const response = await apiClient.post('/api/decrypt', { token });
  return response;
}
