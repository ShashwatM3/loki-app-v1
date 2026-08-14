import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { firebaseAuth } from '../lib/firebase';
import { doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { db } from '../lib/firebase';
import { apiClient } from './apiClient';
import type { UserData } from '../lib/types';

class AuthService {
  constructor() {
    this.configureGoogleSignIn();
  }

  private configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.FIREBASE_CLIENT_ID,
      offlineAccess: true,
    });
  }

  async signInWithGoogle(): Promise<UserData> {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      // Create Firebase credential
      const googleCredential = firebaseAuth.GoogleAuthProvider.credential(tokens.idToken);
      
      // Sign in to Firebase
      const userCredential = await firebaseAuth().signInWithCredential(googleCredential);
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
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw error;
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      await firebaseAuth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    const user = firebaseAuth().currentUser;
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
    return firebaseAuth().onAuthStateChanged(async (firebaseUser: any) => {
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