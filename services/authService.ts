import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { apiClient } from './apiClient';
import type { UserData } from '../lib/types';

class AuthService {
  async signInWithGoogle(): Promise<UserData> {
    try {
      // For Expo Go, we use browser-based Google Sign-In
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user document exists, create if not
      const userDocRef = doc(db, 'users', user.email!);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new user document
        const newUser: UserData = {
          name: user.displayName || user.email!.split('@')[0],
          email: user.email!,
          photo: user.photoURL || '',
          collections: [{
            name: "Favorites",
            type: "personal",
            gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
            places: [],
            createdBy: user.email!,
            ownerEmail: user.email!,
            access: "edit"
          }]
        };

        await setDoc(userDocRef, newUser);

        // Call create-account API
        try {
          await apiClient.post('/api/create-account', {
            email: user.email,
            name: user.displayName,
            photo: user.photoURL
          });
        } catch (apiError) {
          console.error('API call failed, but user created in Firestore:', apiError);
        }

        return newUser;
      }

      return userDocSnap.data() as UserData;

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