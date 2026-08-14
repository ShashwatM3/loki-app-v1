import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { apiClient } from './apiClient';
import type { UserData } from '../lib/types';

interface SignInResult {
  userData: UserData;
  isNewUser: boolean;
}

class AuthService {
  async signInWithGoogle(): Promise<SignInResult> {
    try {
      // Set persistence to match web app
      await setPersistence(auth, browserLocalPersistence);

      // For Expo Go, we use browser-based Google Sign-In
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Call create-account API first (matches web app flow)
      const response = await apiClient.post('/api/create-account', {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL
      });

      // Fetch user data from Firestore (API returns the same data)
      const userDocRef = doc(db, 'users', user.email!);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserData;
        
        // Check if this is a new user (has only "Favorites" collection)
        const isNewUser = userData.collections.length === 1 && 
                         userData.collections[0].name === "Favorites" &&
                         userData.collections[0].places.length === 0;

        return { userData, isNewUser };
      }

      throw new Error('User document not found after sign-in');

    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDocRef = doc(db, 'users', user.email!);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: UserData | null) => void) {
    return auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        const userData = await this.getCurrentUser();
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

export default new AuthService();