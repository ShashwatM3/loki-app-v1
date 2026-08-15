import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

/** Read a single Firestore document (returns null when it does not exist). */
export async function getDocument(collectionName: string, id: string): Promise<unknown | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? snap.data() : null;
}

/** Merge-update a Firestore document. */
export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

/** Create or overwrite a Firestore document. */
export async function setDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(db, collectionName, id), data);
}

/**
 * Upload a local image (file:// URI from expo-image-picker) to Firebase
 * Storage with progress callbacks — mirrors the web `uploadImage` helper.
 */
export async function uploadImage(
  localUri: string,
  storagePath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, blob);

  return new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
