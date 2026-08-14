# LOKI React Native App - Architecture Strategy

## Executive Summary
This document outlines the comprehensive strategy for building a React Native version of LOKI that leverages the existing Firebase backend, API routes, and database structure without any modifications. The approach prioritizes code reuse, feature parity, and native mobile experience while maintaining compatibility with the current web application.

**IMPORTANT**: The implementation uses **Expo Go with web Firebase SDK** for maximum compatibility and simplicity. No native building or configuration is required.

## Core Architecture Principles

### 1. Backend Reuse Strategy
- **Zero Backend Changes**: Use existing Firebase configuration, API routes, and database schema
- **API Compatibility**: Consume existing Next.js API routes from React Native
- **Firebase Direct Integration**: Use Firebase web SDK for direct database access (works in Expo Go)
- **Shared Authentication**: Maintain compatibility with existing Google Auth flow

### 2. Technology Stack Alignment
- **React Native**: Cross-platform mobile development
- **Expo Go**: Development platform - no native build required
- **TypeScript**: Type safety matching web application
- **Firebase Web SDK**: Firebase integration (works in Expo Go without native modules)
- **React Navigation**: Mobile navigation patterns
- **React Native Paper**: UI component library

### 3. Code Reuse Opportunities
- **Business Logic**: Port state management and data fetching logic
- **Type Definitions**: Share TypeScript interfaces
- **Utility Functions**: Reuse helper functions from `lib/` directory
- **API Integration**: Adapt existing API calling patterns

## React Native Technology Stack

### Core Framework
- **React Native 0.86+**: Latest stable version
- **Expo 57**: Development platform and tooling
- **TypeScript 6**: Type safety
- **React 19**: UI library

### Navigation
- **React Navigation 7**: Mobile navigation
  - Stack Navigator for main navigation
  - Tab Navigator for bottom navigation
  - Drawer Navigator for side menu (tablet)
- **Navigation State Management**: Integration with app state

### Firebase Integration
- **firebase**: Web Firebase SDK (works in Expo Go)
  - firebase/app: Firebase core
  - firebase/auth: Authentication
  - firebase/firestore: Database
  - firebase/storage: File storage
- **Email/password authentication**: signInWithEmailAndPassword / createUserWithEmailAndPassword (fully supported in Expo Go; `signInWithPopup` does NOT exist on React Native, and native Google Sign-In requires a development build)

### UI Component Libraries
- **React Native Paper**: Material Design components
- **@expo/vector-icons**: Icon set (bundled with Expo)

### Maps & Location
- **expo-location**: Location services
- **Placeholder Maps**: Simple map view (maps integration optional)

### HTTP & Networking
- **Axios**: HTTP client (same as web)

### State Management
- **Zustand**: Lightweight state management (same as web)
- **Async Storage**: Local persistence

### Other Libraries
- **date-fns**: Date manipulation (same as web)
- **react-native-vector-icons**: Icon library

## App Architecture

### Project Structure
```
loki-app/
├── app/                          # React Navigation structure
│   ├── auth/                     # Authentication screens
│   │   └── LoginScreen.tsx
│   └── main/                     # Main authenticated screens
│       ├── BrowseScreen.tsx      # Discovery interface
│       ├── MapsScreen.tsx        # Map view
│       ├── CollectionsScreen.tsx # Collection management
│       └── ProfileScreen.tsx     # User profile
├── components/                   # Reusable UI components
├── lib/
│   ├── firebase.ts               # Firebase configuration (web SDK)
│   ├── store.ts                  # Zustand store (ported)
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions
├── services/
│   ├── authService.ts            # Authentication service
│   └── apiClient.ts              # API client
├── navigation/
│   └── AppNavigator.tsx          # App navigation setup
├── constants/
│   └── apiEndpoints.ts           # API endpoint constants
└── assets/                       # Images, fonts, etc.
```

## Key Implementation Details

### Firebase Integration (Web SDK for Expo Go)

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```

### Email/Password Authentication (Expo Go compatible)

```typescript
// services/authService.ts
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

class AuthService {
  async signInWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // then fetch-or-create the Firestore account via POST /api/create-account
    // (same flow as the website, keyed by email)
  }
}
```

Note: `signInWithPopup` is web-only and throws on React Native. Google OAuth on mobile
requires a development build with `@react-native-google-signin/google-signin`.

## Feature Implementation Status

### Phase 1: Core Features (MVP) ✅ COMPLETED
1. **Authentication**: Email/password sign-in + sign-up, persistent sessions ✅
2. **Browse Screen**: Place discovery, search, vibes, explore filtering ✅
3. **Place Details**: Full details + save to collection ✅
4. **Collections**: Create / delete / share (real encrypted links via backend) ✅
5. **AI Chatbot**: "Ask Loki" via the real /api/gpt backend ✅
6. **Maps**: Simplified pin view ✅
7. **Profile**: User info, stats, sign out ✅

### Phase 2: Enhanced Features (Future)
1. **Google OAuth**: Requires development build
2. **Full interactive map**: react-native-maps or MapLibre via dev build
3. **Shared Collections**: Collaboration features
4. **Collection Voting**: Swipe deck for decisions
5. **Image Optimization**: Caching and preloading

### Phase 3: Advanced Features (Future)
1. **Real-time Collaboration**: Live collection updates
2. **Hyperframes Integration**: Video generation/display
3. **Offline Support**: Full offline capabilities
4. **Push Notifications**: Collection updates, recommendations
5. **Advanced Analytics**: Usage tracking and insights

## Deployment Strategy

### Development
- Use Expo Go for rapid development
- Test on both iOS and Android
- Use Expo Dev Tools for debugging

### Distribution
- **Primary**: Expo Go (no app store submission needed)
- **Optional**: EAS Build for app store submission (if native build needed)

### Updates
- Over-the-air updates with Expo Updates
- Instant updates via Expo Go

## Conclusion

This React Native architecture strategy enables building a fully-featured mobile version of LOKI without modifying the existing backend infrastructure. By leveraging Firebase web SDK (for Expo Go compatibility), reusing business logic, and adapting the UI patterns for mobile, we achieve feature parity while providing a native mobile experience.

**Key Advantage**: Using Expo Go with web Firebase SDK eliminates the need for native building, making development faster and deployment simpler. The app can be tested and distributed immediately via Expo Go without app store submission.