# LOKI Web App - Frontend Architecture Analysis

## Overview
LOKI is a Next.js 16 application built with React 19, designed as a location discovery and collection management platform focused on Dubai spots and experiences. The frontend uses modern web technologies with a focus on performance, responsive design, and rich user interactions.

## Tech Stack

### Core Framework
- **Next.js 16.1.4** - React framework with App Router architecture
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework (browser runtime)
- **Radix UI** - Headless UI component library (extensive use of primitives)
- **Lucide React** - Icon library
- **Motion (Framer Motion)** - Animation library
- **Sonner** - Toast notifications

### State Management
- **Zustand 5.0.10** - Lightweight state management (primary store in `app/store.ts`)

### Maps & Location
- **MapLibre GL 5.16.0** - Map rendering engine (open-source fork of Mapbox)

### Data & Backend
- **Firebase 12.8.0** - Authentication, Firestore, Storage
- **Firebase Admin 13.7.0** - Server-side Firebase operations
- **Axios 1.13.5** - HTTP client

### AI & Chat
- **AI SDK 6.0.77** - Vercel AI SDK for chatbot functionality
- **@ai-sdk/openai 3.0.26** - OpenAI integration
- **@ai-sdk/react 3.0.79** - React hooks for AI

### Media & Animations
- **@hyperframes/player 0.6.114** - Video/animation player for rich media
- **@lottiefiles/dotlottie-react 0.17.13** - Lottie animation support
- **html-to-image 1.11.13** - Screenshot/capture functionality

### Other Key Libraries
- **React Hook Form 7.71.1** - Form management
- **Zod 4.3.6** - Schema validation
- **date-fns 4.1.0** - Date manipulation
- **Embla Carousel 8.6.0** - Carousel component
- **Recharts 2.15.4** - Charting
- **react-tweet 3.3.0** - Twitter embed integration

## Application Structure

### Page Routes
```
/app
├── /                          # Landing page (with variants)
├── /Authentication            # Login/signup page
├── /dashboard                 # Main authenticated area
│   ├── /browse               # Main discovery interface
│   ├── /maps                 # Map view of places
│   ├── /collections          # Collection management
│   ├── /profile              # User profile
│   ├── /plans                # Planning features
│   └── /landing-variation    # Alternative landing views
├── /admin                    # Admin dashboard
│   ├── /dashboard           # Admin management interface
│   ├── /agent               # AI agent management
│   └── /devin               # Devin integration
├── /collection/[token]       # Shared collection access
├── /about, /how-it-works     # Informational pages
└── /onboarding               # User onboarding flow
```

### Key Frontend Features

#### 1. Landing Page System
- **Dual Variant System**: Original and Editorial landing page designs
- **Dynamic Loading**: Client-side rendering for hero components
- **Image Preloading**: Strategic preloading of Dubai spot images for performance
- **Variant Toggle**: User-switchable landing page designs

#### 2. Dashboard Layout
- **Responsive Navigation**: 
  - Desktop: Sidebar navigation with collection list
  - Mobile: Floating bottom navigation bar
- **Guest Access**: Browse and Maps pages accessible without authentication
- **Authentication Gating**: Other dashboard pages require login
- **Collection Management**: Inline collection creation and management

#### 3. Browse/Discovery Interface
- **Personalized Greetings**: Time-based (morning/afternoon/evening) + user name
- **Global Search**: Full-text search across places
- **Vibe-Based Discovery**: Curated "albums" for different moods/categories
- **Explore Section**: Category-based filtering with sub-filters
- **AI Chatbot Integration**: "Ask Loki" conversational interface
- **Place Cards**: Rich place display with images, ratings, reviews
- **Quick Access**: Shortcuts to Map, Collections, and Quiz

#### 4. Collection System
- **Personal Collections**: User-created collections with gradient themes
- **Shared Collections**: Collaborative collections with:
  - Named collaborators (email-based)
  - Link collaborators (share link guests)
  - Permission levels (view/edit)
  - Real-time sync across users
- **Collection Features**:
  - Add/remove places via swipe interface
  - Collection voting/decision making
  - Map view of collection places
  - Share links with token-based access
  - Hyperframes video generation for collections

#### 5. Maps Integration
- **MapLibre GL**: Interactive map with place markers
- **Place Filtering**: Filter places by category, vibe, and custom criteria
- **Image Preloading**: Status tracking for place images
- **Touch-Optimized**: Mobile-first map interactions
- **Cluster Markers**: Efficient rendering of many places

#### 6. AI Chatbot ("Ask Loki")
- **Conversational Interface**: Sheet-based chat UI
- **Place Recommendations**: AI-powered suggestions based on user preferences
- **Tool Integration**: Uses custom tools for place data access
- **Context Awareness**: Understands user location, preferences, and constraints

#### 7. Admin Dashboard
- **Place Management**: CRUD operations for places
- **Category Management**: Dynamic category system
- **Pipeline Control**: Instagram/Telegram ingestion pipeline management
- **Feature Requests**: Internal feature/bug tracking
- **Analytics**: Usage and performance metrics

### Component Architecture

#### UI Component System
- **Radix UI Primitives**: Extensive use of accessible, unstyled components
- **Custom UI Components**: Located in `/components/ui/`
  - Dialogs, sheets, drawers for overlays
  - Form components (inputs, buttons, selects)
  - Data display (cards, badges, avatars)
  - Navigation components
- **Composite Components**: Higher-level business logic components
  - `ExpandableCard` - Collection place cards
  - `LokiChatSheet` - AI chatbot interface
  - `PlaceDetailsContent` - Place information display
  - `CollectionSelectorDrawer` - Place selection for collections

#### Animation System
- **Motion/Framer Motion**: Page transitions, micro-interactions
- **Hyperframes**: Rich video/animation compositions for:
  - Collection "flash" videos
  - User profile videos
  - Invitation videos
  - Recap videos
- **Lottie**: JSON-based animations for loading states and decorative elements

### State Management Architecture

#### Zustand Store (`app/store.ts`)
**Global State:**
- `userData`: User profile and collections
- `places`: Global place catalog
- `categories`: Dynamic category list
- `customSubfilters`: Custom explore filters
- Loading states for auth and data

**Key Actions:**
- `refreshUserData()`: Fetch user data from Firestore
- `fetchPlaces()`: Load all places from database
- `fetchCategories()`: Load dynamic categories
- `addCategory/removeCategory`: Manage category taxonomy
- Collection CRUD operations

#### Client-Side Data Flow
1. **Authentication**: Firebase Auth with Google provider
2. **Initial Load**: Store fetches user data and places on mount
3. **Real-time Updates**: Manual refresh triggers for data changes
4. **Optimistic UI**: Immediate UI updates with Firestore sync

### Responsive Design Strategy

#### Breakpoints
- **Mobile First**: Base styles for mobile devices
- **Tablet**: `sm:` and `md:` breakpoints
- **Desktop**: `lg:` and `xl:` breakpoints

#### Mobile Optimizations
- **Bottom Navigation**: Floating pill navigation on mobile
- **Touch Targets**: Large, tap-friendly interactive elements
- **Sheet/Drawer UI**: Bottom sheets for mobile interactions
- **Performance**: Lazy loading and code splitting

#### Desktop Features
- **Sidebar Navigation**: Traditional left sidebar
- **Hover States**: Desktop-specific hover interactions
- **Multi-column Layouts**: Grid layouts for content

### Performance Optimizations

#### Code Splitting
- **Dynamic Imports**: Route-based code splitting
- **Component Lazy Loading**: Heavy components loaded on demand
- **Firebase Lazy Loading**: Firestore loaded only when needed

#### Image Optimization
- **Next.js Image**: Optimized image loading with blur placeholders
- **Preloading**: Strategic preloading of critical images
- **Status Tracking**: Image load status for conditional rendering

#### Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Import Analysis**: Firebase modular imports
- **Browser Support**: Modern browser targeting (Chrome 111+, Safari 16.4+)

### Authentication Flow

#### Firebase Integration
- **Google Auth**: Primary authentication method
- **Local Persistence**: Survives browser restart
- **User Creation**: Automatic Firestore document creation on first login
- **Admin System**: Email-based admin verification

#### Auth State Management
- **Loading States**: Separate auth vs data loading states
- **Route Protection**: Middleware and component-level protection
- **Guest Access**: Limited access for non-authenticated users

### External Integrations

#### Google Services
- **Firebase**: Backend-as-a-Service
- **Google Maps**: Place data and geocoding
- **Google Auth**: User authentication

#### AI Services
- **OpenAI**: Chatbot and AI features
- **Custom AI Tools**: Place data access and filtering

#### Social Media
- **Instagram**: Place ingestion pipeline
- **Telegram**: Bot pipeline for place data
- **Twitter/X**: Tweet embedding

### Key Frontend Challenges & Solutions

#### 1. Real-time Collaboration
**Challenge**: Keeping shared collections in sync across users
**Solution**: Manual sync logic with Firestore listeners and optimistic updates

#### 2. Image Performance
**Challenge**: Loading many place images efficiently
**Solution**: Status tracking system with conditional rendering and preloading

#### 3. Mobile Map Experience
**Challenge**: Map interactions on mobile devices
**Solution**: Touch-optimized MapLibre integration with custom marker handling

#### 4. Complex State Management
**Challenge**: Managing user data, collections, and places
**Solution**: Zustand store with clear separation of concerns and async actions

#### 5. Animation Performance
**Challenge**: Rich animations without performance impact
**Solution**: Hyperframes for complex animations, CSS transitions for simple effects

## Development Patterns

### Component Patterns
- **Compound Components**: Complex UIs with composed parts
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable stateful logic
- **Higher-Order Components**: Cross-cutting concerns

### Data Patterns
- **Optimistic Updates**: Immediate UI updates with server sync
- **Error Boundaries**: Graceful error handling
- **Loading States**: Comprehensive loading management
- **Retry Logic**: Automatic retry for failed operations

### Styling Patterns
- **Utility-First**: Tailwind CSS for rapid development
- **Component Variants**: Consistent component variations
- **Theme System**: CSS variables for theming
- **Responsive Utilities**: Mobile-first responsive design

## Summary
The LOKI frontend is a modern, performance-optimized React application with sophisticated features for location discovery, collection management, and AI-powered recommendations. The architecture prioritizes user experience through responsive design, smooth animations, and intuitive interfaces while maintaining code quality through TypeScript, modular components, and clear state management patterns.