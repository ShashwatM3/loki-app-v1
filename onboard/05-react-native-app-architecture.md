# LOKI React Native App - Architecture Strategy

## Executive Summary
This document outlines a comprehensive strategy for building a React Native version of LOKI that leverages the existing Firebase backend, API routes, and database structure without any modifications. The approach prioritizes code reuse, feature parity, and native mobile experience while maintaining compatibility with the current web application.

## Core Architecture Principles

### 1. Backend Reuse Strategy
- **Zero Backend Changes**: Use existing Firebase configuration, API routes, and database schema
- **API Compatibility**: Consume existing Next.js API routes from React Native
- **Firebase Direct Integration**: Use Firebase React Native SDK for direct database access
- **Shared Authentication**: Maintain compatibility with existing Google Auth flow

### 2. Technology Stack Alignment
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type safety matching web application
- **Firebase React Native SDK**: Native mobile Firebase integration
- **React Navigation**: Mobile navigation patterns
- **Native Base / React Native Paper**: UI component libraries

### 3. Code Reuse Opportunities
- **Business Logic**: Port state management and data fetching logic
- **Type Definitions**: Share TypeScript interfaces
- **Utility Functions**: Reuse helper functions from `lib/` directory
- **API Integration**: Adapt existing API calling patterns

## React Native Technology Stack

### Core Framework
- **React Native 0.73+**: Latest stable version
- **Expo 50+**: Development platform and tooling
- **TypeScript 5**: Type safety
- **React 18**: UI library

### Navigation
- **React Navigation 6**: Mobile navigation
  - Stack Navigator for main navigation
  - Tab Navigator for bottom navigation
  - Drawer Navigator for side menu (tablet)
- **Navigation State Management**: Integration with app state

### Firebase Integration
- **@react-native-firebase/app**: Firebase core
- **@react-native-firebase/auth**: Authentication
- **@react-native-firebase/firestore**: Database
- **@react-native-firebase/storage**: File storage
- **@react-native-firebase/analytics**: Analytics

### UI Component Libraries
- **React Native Paper**: Material Design components
- **Native Base**: Alternative UI component library
- **React Native Reanimated**: Animations
- **React Native Gesture Handler**: Touch gestures

### Maps & Location
- **react-native-maps**: Google Maps integration
- **@react-native-async-storage/async-storage**: Local caching
- **react-native-geolocation-service**: Location services

### HTTP & Networking
- **Axios**: HTTP client (same as web)
- **React Query / TanStack Query**: Data fetching and caching
- **WebSocket**: Real-time updates (if needed)

### Media & Animations
- **react-native-video**: Video playback
- **lottie-react-native**: Lottie animations
- **react-native-image-picker**: Image selection
- **react-native-fast-image**: Optimized image loading

### State Management
- **Zustand**: Lightweight state management (same as web)
- **React Context**: Global state
- **Async Storage**: Local persistence

### Other Libraries
- **date-fns**: Date manipulation (same as web)
- **React Hook Form**: Form management
- **Zod**: Schema validation (same as web)
- **Sonner**: Toast notifications (mobile alternative)

## App Architecture

### Project Structure
```
loki-app/
├── app/                          # React Navigation structure
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (main)/                  # Main authenticated screens
│   │   ├── browse.tsx           # Discovery interface
│   │   ├── maps.tsx             # Map view
│   │   ├── collections.tsx      # Collection management
│   │   ├── profile.tsx          # User profile
│   │   └── _layout.tsx          # Main layout with bottom nav
│   ├── collection/[token]/      # Shared collection access
│   ├── place/[id]/              # Place details
│   └── _layout.tsx              # Root layout
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── browse/                  # Browse-specific components
│   ├── collections/             # Collection components
│   ├── maps/                    # Map components
│   └── shared/                  # Shared components
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── api.ts                   # API client functions
│   ├── store.ts                 # Zustand store (ported)
│   ├── types.ts                 # TypeScript interfaces
│   └── utils/                   # Utility functions
├── hooks/
│   ├── useAuth.ts               # Authentication hook
│   ├── usePlaces.ts             # Places data hook
│   └── useCollections.ts        # Collections hook
├── services/
│   ├── authService.ts           # Authentication service
│   ├── placesService.ts         # Places API service
│   └── collectionService.ts     # Collection service
├── constants/
│   ├── apiEndpoints.ts          # API endpoint constants
│   └── config.ts                # App configuration
└── assets/                      # Images, fonts, etc.
```

## Screen-by-Screen Implementation Strategy

### 1. Authentication Flow

#### Login Screen
**Web Equivalent**: `/Authentication`
**Implementation**:
- Use Firebase React Native Auth with Google provider
- Reuse existing Firebase configuration
- Implement Google Sign-In button with React Native Google Sign-In
- Maintain same user creation flow via existing API
- Store auth state in AsyncStorage for persistence

**Key Components**:
- Google Sign-In button
- Loading states
- Error handling
- Navigation to main app on success

**API Integration**:
- Call existing `/api/create-account` on first login
- Use same Firebase project configuration

#### Onboarding Flow
**Web Equivalent**: `/onboarding`
**Implementation**:
- Port onboarding questions from web
- Use similar UI patterns (swipe cards, selection)
- Store preferences locally and sync to Firestore
- Skip for returning users

### 2. Main App Layout

#### Bottom Navigation
**Web Equivalent**: Mobile bottom navigation in dashboard
**Implementation**:
- React Navigation Tab Navigator
- Icons for Browse, Maps, Collections, Profile
- Badge notifications for collections
- Active state highlighting

**Tabs**:
- Browse: Main discovery interface
- Maps: Map view of places
- Collections: User collections
- Profile: User profile and settings

#### Tablet Layout
**Web Equivalent**: Desktop sidebar navigation
**Implementation**:
- React Navigation Drawer Navigator
- Similar sidebar layout to web
- Adaptive design based on screen size

### 3. Browse Screen

#### Discovery Interface
**Web Equivalent**: `/dashboard/browse`
**Implementation**:
- Port the vibe-based discovery system
- Category filtering with horizontal scrolling
- Place cards with images and details
- Pull-to-refresh for data updates
- Infinite scroll for places

**Key Features**:
- Personalized greeting (time-based + user name)
- "Ask Loki" AI chatbot access
- Explore section with categories
- Curated albums/vibes
- Quick access buttons
- Today's picks carousel

**Components Needed**:
- PlaceCard (mobile-optimized)
- CategoryChip (horizontal scroll)
- VibeSelector
- SearchBar (expandable)
- QuickAccessButton

**Data Integration**:
- Direct Firestore access via React Native Firebase
- Reuse existing place data structure
- Implement image caching with Fast Image
- Use React Query for data fetching and caching

#### AI Chatbot Interface
**Web Equivalent**: Loki chat sheet
**Implementation**:
- Modal or full-screen chat interface
- Use existing AI API endpoints
- Implement streaming responses
- Tool integration for place recommendations

### 4. Maps Screen

#### Map Interface
**Web Equivalent**: `/dashboard/maps`
**Implementation**:
- React Native Maps with Google Maps
- Custom markers for places
- Cluster markers for performance
- Filter by category/vibe
- Place details on marker tap
- User location display

**Key Features**:
- Map style matching web design
- Place markers with images
- Filter controls
- Search on map
- Route calculation (if needed)

**Components Needed**:
- MapView with custom markers
- MarkerCluster (for performance)
- FilterBottomSheet
- PlacePreview (on marker tap)

**Data Integration**:
- Use existing place coordinates
- Implement marker clustering
- Cache map tiles for offline use

### 5. Collections Screen

#### Collection Management
**Web Equivalent**: `/dashboard/collections`
**Implementation**:
- List of user collections with gradients
- Swipe-to-delete functionality
- Pull-to-create new collection
- Collection detail view
- Share functionality

**Key Features**:
- Collection cards with place counts
- Add collection modal
- Collection detail with place list
- Share collection via link
- Collaborator management

**Components Needed**:
- CollectionCard
- CollectionList
- CreateCollectionModal
- CollectionDetailView
- ShareModal

**Data Integration**:
- Direct Firestore access for user collections
- Implement shared collection sync
- Use existing share token system

#### Collection Detail View
**Web Equivalent**: Individual collection view
**Implementation**:
- Place grid within collection
- Add/remove places
- Swipe deck for place voting
- Map view of collection places
- Collection settings

**Special Features**:
- Tinder-style swipe for decision making
- Real-time collaboration updates
- Collection voting system
- Hyperframes video generation (if feasible)

### 6. Profile Screen

#### User Profile
**Web Equivalent**: `/dashboard/profile`
**Implementation**:
- User avatar and name
- Account settings
- Preferences management
- Logout functionality

**Key Features**:
- Profile picture display
- Account information
- App settings
- Notification preferences
- About section

## Data Layer Architecture

### Firebase Integration Strategy

#### Direct Firestore Access
```typescript
// lib/firebase.ts (React Native version)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Use same Firebase configuration as web
const firebaseConfig = {
  // Same config from web app
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { auth, firestore };
```

#### State Management Port
```typescript
// lib/store.ts (ported from web)
import create from 'zustand';

// Use same interfaces and logic
export const useCounterStore = create((set, get) => ({
  userData: { name: '', email: '', photo: '', collections: [] },
  places: [],
  // Port existing methods with React Native Firebase
  fetchPlaces: async () => {
    const placesSnapshot = await firestore().collection('places').get();
    // Process data same as web
  },
  // ... other methods
}));
```

### API Client Layer

#### HTTP Client Setup
```typescript
// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://your-web-app.com/api', // Point to existing API
  timeout: 10000,
});

// Add auth headers
apiClient.interceptors.request.use(async (config) => {
  const token = await auth().currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Service Layer
```typescript
// services/placesService.ts
import apiClient from '@/lib/api';

export const placesService = {
  async searchPlaces(query: string) {
    const response = await apiClient.post('/google-places', { query });
    return response.data;
  },
  
  async getPlaceDetails(placeId: string) {
    const response = await apiClient.get(`/admin/places/${placeId}`);
    return response.data;
  },
  // ... other methods
};
```

### Caching Strategy

#### Multi-Layer Caching
1. **Async Storage**: User preferences, auth tokens
2. **React Query Cache**: API responses, automatic refetching
3. **Image Caching**: Fast Image for downloaded images
4. **Firestore Offline**: Enable offline persistence

#### Implementation
```typescript
// hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';
import { useCounterStore } from '@/lib/store';

export const usePlaces = () => {
  const fetchPlaces = useCounterStore(state => state.fetchPlaces);
  
  return useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Component Migration Strategy

### UI Component Mapping

| Web Component | React Native Equivalent | Implementation Notes |
|---------------|------------------------|---------------------|
| Radix UI Dialog | Modal/BottomSheet | Use react-native-paper Modal |
| Radix UI Sheet | BottomSheet | Use @gorhom/bottom-sheet |
| Radix UI Dropdown | Menu/ActionSheet | Use react-native-paper Menu |
| Next.js Image | Fast Image | Use react-native-fast-image |
| HTML Buttons | TouchableOpacity | Use with proper styling |
| Web Maps | react-native-maps | Google Maps integration |
| Web Scroll | ScrollView/FlatList | Use FlatList for performance |

### Styling Approach

#### Option 1: NativeBase
- Pre-built components
- Theme system
- Responsive design
- Less custom styling needed

#### Option 2: React Native Paper
- Material Design
- Comprehensive component library
- Good documentation
- Active community

#### Option 3: Custom Styling
- StyleSheet with custom components
- More control but more work
- Can match web design exactly

**Recommendation**: Start with React Native Paper for faster development, customize as needed.

## Feature Implementation Priorities

### Phase 1: Core Features (MVP)
1. **Authentication**: Google Sign-In, user creation
2. **Browse Screen**: Place discovery, search, filtering
3. **Collections**: Basic collection management
4. **Maps**: Map view with place markers
5. **Profile**: Basic user profile

### Phase 2: Enhanced Features
1. **AI Chatbot**: "Ask Loki" functionality
2. **Shared Collections**: Collaboration features
3. **Collection Voting**: Swipe deck for decisions
4. **Advanced Filtering**: Vibe-based discovery
5. **Image Optimization**: Caching and preloading

### Phase 3: Advanced Features
1. **Real-time Collaboration**: Live collection updates
2. **Hyperframes Integration**: Video generation/display
3. **Offline Support**: Full offline capabilities
4. **Push Notifications**: Collection updates, recommendations
5. **Advanced Analytics**: Usage tracking and insights

## Technical Challenges & Solutions

### 1. Map Integration
**Challenge**: MapLibre GL vs react-native-maps
**Solution**: Use react-native-maps with Google Maps for better mobile support and native performance

### 2. Animation Performance
**Challenge**: Complex web animations in React Native
**Solution**: 
- Use React Native Reanimated for smooth animations
- Simplify complex animations for mobile
- Consider Lottie for complex motion graphics

### 3. Image Loading
**Challenge**: Loading many place images efficiently
**Solution**: 
- Use react-native-fast-image with caching
- Implement progressive loading
- Add placeholder and error states

### 4. Real-time Updates
**Challenge**: Firestore real-time listeners on mobile
**Solution**: 
- Use React Native Firebase Firestore onSnapshot
- Implement proper cleanup in useEffect
- Handle offline/online transitions

### 5. State Synchronization
**Challenge**: Keeping mobile and web data in sync
**Solution**: 
- Use same Firebase backend
- Implement conflict resolution
- Add last-synced timestamps

## Performance Optimization

### 1. List Rendering
- Use FlatList instead of ScrollView for long lists
- Implement windowing for large datasets
- Add item separators and loading indicators

### 2. Image Optimization
- Use appropriate image sizes for mobile
- Implement lazy loading
- Cache images aggressively
- Use WebP format when possible

### 3. Memory Management
- Implement proper cleanup in useEffect
- Avoid memory leaks in event listeners
- Use React.memo for expensive components
- Implement pagination for large datasets

### 4. Network Optimization
- Implement request batching
- Use GraphQL if API becomes complex
- Add request deduplication
- Implement offline queue for failed requests

## Testing Strategy

### 1. Unit Testing
- Test business logic and utility functions
- Test state management
- Test API client functions
- Use Jest + React Native Testing Library

### 2. Integration Testing
- Test Firebase integration
- Test API communication
- Test navigation flows
- Use Detox for end-to-end testing

### 3. Performance Testing
- Test with large datasets
- Test image loading performance
- Test animation smoothness
- Use React Native Performance tools

## Deployment Strategy

### 1. Development
- Use Expo for rapid development
- Test on both iOS and Android
- Use Expo Dev Tools for debugging

### 2. Building
- EAS Build for cloud builds
- Separate builds for iOS and Android
- Configure app signing and certificates

### 3. Deployment
- Test Flight for iOS beta testing
- Google Play Internal Testing for Android
- Gradual rollout to production

### 4. Updates
- Over-the-air updates with Expo Updates
- App store updates for major versions
- Force update mechanism for critical changes

## Migration Timeline Estimate

### Phase 1 (4-6 weeks): Foundation
- Project setup and configuration
- Firebase integration
- Authentication flow
- Basic navigation structure

### Phase 2 (6-8 weeks): Core Features
- Browse screen implementation
- Collections basic functionality
- Maps integration
- Profile screen

### Phase 3 (4-6 weeks): Enhanced Features
- AI chatbot integration
- Shared collections
- Advanced filtering
- Performance optimization

### Phase 4 (2-4 weeks): Polish & Testing
- UI/UX refinements
- Testing and bug fixes
- Performance optimization
- Deployment preparation

**Total Estimated Time**: 16-24 weeks for full feature parity

## Success Metrics

### Technical Metrics
- API response time < 500ms
- App launch time < 3 seconds
- Image load time < 2 seconds
- Crash rate < 1%

### User Experience Metrics
- Feature parity with web app
- Smooth 60fps animations
- Intuitive navigation
- Offline functionality

### Business Metrics
- User adoption rate
- Session duration
- Feature usage patterns
- App store ratings

## Conclusion
This React Native architecture strategy enables building a fully-featured mobile version of LOKI without modifying the existing backend infrastructure. By leveraging Firebase React Native SDK, reusing business logic, and adapting the UI patterns for mobile, we can achieve feature parity while providing a native mobile experience. The phased approach allows for iterative development and testing, ensuring a stable and performant application.