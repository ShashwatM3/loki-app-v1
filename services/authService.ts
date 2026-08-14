import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { apiClient } from './apiClient';
import type { UserData } from '../lib/types';

interface SignInResult {
  userData: UserData;
  isNewUser: boolean;
}

/** Default account shape — identical to the website's /api/create-account route. */
function buildNewUserData(email: string, name?: string | null, photo?: string | null): UserData {
  return {
    name: name || email.split('@')[0],
    email,
    photo: photo || '',
    collections: [
      {
        name: 'Favorites',
        type: 'personal',
        gradient: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
        places: [],
        createdBy: email,
        ownerEmail: email,
        access: 'edit',
      },
    ],
  };
}

function friendlyAuthError(error: any): string {
  const code: string = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}

class AuthService {
  /**
   * Fetch-or-create the Firestore account for a signed-in Firebase user.
   * Mirrors the website flow: POST /api/create-account with { userData },
   * falling back to a direct Firestore read/write if the API is unreachable.
   */
  private async ensureAccount(user: User): Promise<SignInResult> {
    try {
      const response = await apiClient.post('/api/create-account', {
        userData: {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
      if (response?.userData) {
        return { userData: response.userData as UserData, isNewUser: !!response.isNewUser };
      }
    } catch (error) {
      console.warn('create-account API unavailable, falling back to Firestore:', error);
    }

    // Fallback: same logic as the API route, straight against Firestore
    const userDocRef = doc(db, 'users', user.email!);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { userData: userDocSnap.data() as UserData, isNewUser: false };
    }
    const newUserData = buildNewUserData(user.email!, user.displayName, user.photoURL);
    await setDoc(userDocRef, newUserData);
    return { userData: newUserData, isNewUser: true };
  }

  async signInWithEmail(email: string, password: string): Promise<SignInResult> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return await this.ensureAccount(credential.user);
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(friendlyAuthError(error));
    }
  }

  async signUpWithEmail(name: string, email: string, password: string): Promise<SignInResult> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      return await this.ensureAccount(credential.user);
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw new Error(friendlyAuthError(error));
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
    if (!user?.email) return null;

    try {
      const userDocRef = doc(db, 'users', user.email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserData;
      }
      // Auth user exists but no Firestore doc yet — create it
      const { userData } = await this.ensureAccount(user);
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /** Subscribe to auth state. Fires with the Firestore UserData (or null) whenever auth changes. */
  onAuthStateChanged(callback: (user: UserData | null) => void) {
    return auth.onAuthStateChanged(async (firebaseUser) => {
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
