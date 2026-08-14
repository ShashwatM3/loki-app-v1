import { initializeApp, getApp, getApps } from 'firebase/app';
// getReactNativePersistence exists in the react-native build of firebase/auth (which Metro
// resolves), but the published web types omit it — see types/firebase-auth-rn.d.ts
import { getAuth, initializeAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCzGEGORei6VZcrKKt7rA5cp9ecmdaNaNE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'loki-bc0bb.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'loki-bc0bb',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'loki-bc0bb.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '927182099419',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:927182099419:web:60940b9ddec86f6f014dfe',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-0NSEHMZ3FG',
};

// Initialize Firebase (guard against re-initialization during fast refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth with persistent sessions backed by AsyncStorage (the React Native way).
// See https://expo.fyi/firebase-js-auth-setup
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth throws if called twice (fast refresh) — fall back to the existing instance
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
