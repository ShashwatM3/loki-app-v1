// Use require for React Native Firebase modules due to TypeScript export issues
const auth = require('@react-native-firebase/auth').default;
const firestore = require('@react-native-firebase/firestore').default;
const storage = require('@react-native-firebase/storage').default;

// Initialize Firebase
const db = firestore();

// Export as named exports
export { auth, db, storage };
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseStorage = storage;