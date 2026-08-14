import * as Crypto from 'expo-crypto';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'default-secret-change-in-production';

async function getSecret(): Promise<string> {
  return ENCRYPTION_SECRET;
}

export async function encrypt(email: string, collection: string): Promise<string> {
  const plaintext = JSON.stringify({ email, collection });
  const secret = await getSecret();
  
  // Simple base64 encoding for now - in production, use proper encryption
  const encoded = btoa(plaintext + '|' + secret);
  return encoded;
}

export async function encryptSharedCollectionLink(opts: {
  email: string;
  collection: string;
  access?: "view" | "edit";
  sharedCollectionId?: string;
}): Promise<string> {
  const plaintext = JSON.stringify({
    email: opts.email,
    collection: opts.collection,
    access: opts.access ?? "view",
    sharedCollectionId: opts.sharedCollectionId,
  });
  const secret = await getSecret();
  
  const encoded = btoa(plaintext + '|' + secret);
  return encoded;
}

export async function decrypt(encoded: string): Promise<any> {
  try {
    const decoded = atob(encoded);
    const [plaintext, secret] = decoded.split('|');
    
    // Verify secret
    const expectedSecret = await getSecret();
    if (secret !== expectedSecret) {
      throw new Error('Invalid encryption secret');
    }
    
    return JSON.parse(plaintext);
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}