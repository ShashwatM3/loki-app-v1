# LOKI Web App - Backend API Architecture

## Overview
LOKI uses a Next.js API Routes architecture with Firebase as the primary backend service. The API layer handles authentication, data persistence, external integrations, and business logic while maintaining a clean separation between client and server operations.

## API Architecture

### Framework & Runtime
- **Next.js API Routes**: Serverless endpoints in `/app/api/`
- **Node.js Runtime**: Server-side JavaScript execution
- **Firebase Admin SDK**: Privileged server operations
- **Vercel Hosting**: Serverless deployment platform

### API Route Structure
```
/app/api
├── /authentication
│   ├── /create-account        # User account creation
│   └── /maintenance-bypass    # Maintenance mode bypass
├── /shared-collection
│   ├── /save                  # Save shared collection
│   ├── /mutate                # Modify shared collection
│   ├── /vote                  # Voting on shared collections
│   └── /search-places         # Search places in collections
├── /admin
│   /places/[id]
│   │   ├── /route.ts          # CRUD for places
│   │   └── /ai-edit           # AI-powered place editing
│   /upload-place-image        # Image upload for places
│   /pipeline                  # Ingestion pipeline control
│   /apify-instagram           # Instagram data ingestion
│   /cleanup-expired-places    # Maintenance: remove expired places
│   /pending-places/[id]       # Pending place approval
│   /transcript                # Audio transcription
│   /place-from-text           # AI place extraction from text
│   /weekend-events            # Weekend events generation
│   /describe-video            # Video analysis
│   └── /session               # Admin session management
├── /agent
│   └── /sessions/[id]         # AI agent session management
├── /telegram
│   /webhook                   # Telegram bot webhook
│   └── /register-webhook      # Webhook registration
├── /encrypt                   # Encryption for share links
├── /decrypt                   # Decryption for share links
├── /google-places             # Google Places API integration
├── /geocode                   # Geocoding service
├── /gpt                       # OpenAI GPT integration
├── /efficiency-analysis       # Performance analysis
└── /test                      # Testing endpoint
```

## Core API Categories

### 1. Authentication & User Management

#### POST `/api/create-account`
**Purpose**: Create new user account on first login
**Method**: POST
**Authentication**: None (creates initial user document)
**Request Body**:
```typescript
{
  email: string;
  name: string;
  photo: string;
}
```
**Response**: Success/error status
**Firestore Operation**: Creates user document in `users` collection with default "Favorites" collection

#### GET `/api/maintenance-bypass`
**Purpose**: Bypass maintenance mode for authorized access
**Method**: GET
**Authentication**: Token-based verification
**Use Case**: Admin access during maintenance periods

### 2. Shared Collection APIs

#### POST `/api/shared-collection/save`
**Purpose**: Save or resolve a shared collection
**Method**: POST
**Authentication**: Required
**Request Body**:
```typescript
{
  token: string;           // Encrypted share token
  userEmail: string;
  userName?: string;
  userPhoto?: string;
}
```
**Response**: Shared collection data with member information
**Firestore Operations**:
- Decrypts token to extract collection info
- Creates/updates `sharedCollections/{id}` document
- Adds user to members list with appropriate permissions
- Returns collection data with place information

#### POST `/api/shared-collection/mutate`
**Purpose**: Modify shared collection (add/remove places)
**Method**: POST
**Authentication**: Required
**Request Body**:
```typescript
{
  sharedCollectionId: string;
  userEmail: string;
  userName?: string;
  action: 'add' | 'remove';
  place: Place;
}
```
**Response**: Updated collection data
**Firestore Operations**:
- Updates `sharedCollections/{id}` document
- Syncs changes to owner's `users` document
- Updates link collaborator information
- Bumps `updatedAt` timestamp

#### POST `/api/shared-collection/vote`
**Purpose**: Vote on places in shared collections
**Method**: POST
**Authentication**: Required
**Request Body**:
```typescript
{
  sharedCollectionId: string;
  userEmail: string;
  placeId: string;
  vote: 'yes' | 'no';
}
```
**Response**: Success status
**Firestore Operations**: Updates vote data in collection

#### POST `/api/shared-collection/search-places`
**Purpose**: Search places within a shared collection
**Method**: POST
**Authentication**: Optional
**Request Body**:
```typescript
{
  sharedCollectionId: string;
  searchQuery: string;
}
```
**Response**: Filtered place list
**Use Case**: Quick search within shared collections

### 3. Admin APIs

#### Place Management
**GET/DELETE `/api/admin/places/[id]/route.ts`**
- **GET**: Retrieve place details
- **DELETE**: Remove place from database (admin only)
- **Authentication**: Admin verification required

**POST `/api/admin/places/[id]/ai-edit`**
- **Purpose**: AI-powered place content editing
- **Authentication**: Admin required
- **Uses**: OpenAI GPT for content improvement

#### Content Ingestion
**POST `/api/admin/pipeline`**
- **Purpose**: Trigger place ingestion pipeline
- **Sources**: Instagram, Telegram
- **Process**: AI extraction → duplicate check → database insertion

**POST `/api/admin/apify-instagram`**
- **Purpose**: Instagram data scraping via Apify
- **Authentication**: Admin required
- **Output**: Raw place data for processing

**POST `/api/admin/place-from-text`**
- **Purpose**: Extract place information from text descriptions
- **AI Processing**: Uses GPT-4 for structured extraction
- **Request**: Text content about a place
- **Response**: Structured place data

#### Pending Places System
**GET `/api/admin/pending-places`**
- **Purpose**: Retrieve pending place submissions
- **Authentication**: Admin required
- **Use Case**: Review user-submitted places

**POST `/api/admin/pending-places/[id]/approve`**
- **Purpose**: Approve pending place
- **Authentication**: Admin required
- **Action**: Moves place from pending to main collection

#### Image Management
**POST `/api/admin/upload-place-image`**
- **Purpose**: Upload place images to Firebase Storage
- **Authentication**: Admin required
- **Process**: File upload → Storage → URL generation

#### Maintenance Operations
**POST `/api/admin/cleanup-expired-places`**
- **Purpose**: Remove expired popup places
- **Authentication**: Admin required
- **Logic**: Filters places where `popup=true` and `endDate < now`

**POST `/api/admin/weekend-events`**
- **Purpose**: Generate weekend event recommendations
- **Authentication**: Admin required
- **AI Processing**: Curates events for upcoming weekend

#### Session Management
**POST `/api/admin/session`**
- **Purpose**: Create/admin admin sessions
- **Authentication**: Admin verification
- **Use Case**: Extended admin sessions for dashboard access

### 4. AI & Agent APIs

#### POST `/api/agent/sessions`
**Purpose**: Create AI agent session
**Method**: POST
**Authentication**: Required
**Response**: Session ID for chat interactions

#### POST `/api/agent/sessions/[id]`
**Purpose**: Interact with AI agent session
**Method**: POST
**Authentication**: Required
**Request**: Chat messages and context
**Response**: AI responses with tool calls

#### POST `/api/gpt`
**Purpose**: Direct OpenAI GPT access
**Method**: POST
**Authentication**: Required
**Uses**: General AI processing, text generation

### 5. External Service Integrations

#### POST `/api/google-places`
**Purpose**: Google Places API integration
**Method**: POST
**Authentication**: Admin required
**Uses**: Place search, details, photos
**Request**: Place queries or place IDs
**Response**: Google Places data

#### POST `/api/geocode`
**Purpose**: Geocoding addresses to coordinates
**Method**: POST
**Authentication**: Optional
**Request**: Address string
**Response**: Latitude/longitude coordinates

#### Telegram Integration
**POST `/api/telegram/webhook`**
- **Purpose**: Receive Telegram bot messages
- **Method**: POST
- **Authentication**: Webhook verification
- **Process**: Extracts place data from messages → AI processing → database insertion

**POST `/api/telegram/register-webhook`**
- **Purpose**: Register Telegram webhook
- **Method**: POST
- **Authentication**: Admin required

### 6. Security & Encryption

#### POST `/api/encrypt`
**Purpose**: Encrypt data for secure sharing
**Method**: POST
**Authentication**: Required
**Uses**: Encrypt share tokens for collections
**Algorithm**: AES encryption

#### POST `/api/decrypt`
**Purpose**: Decrypt encrypted share tokens
**Method**: POST
**Authentication**: Required
**Uses**: Decrypt collection share links
**Response**: Decrypted collection information

### 7. Analytics & Monitoring

#### POST `/api/efficiency-analysis`
**Purpose**: Analyze system performance and usage
**Method**: POST
**Authentication**: Admin required
**Metrics**: Response times, error rates, usage patterns

#### GET `/api/test`
**Purpose**: Testing endpoint for development
**Method**: GET
**Authentication**: None
**Use Case**: API health checks and development testing

## Firebase Integration Patterns

### Client SDK Usage
**Location**: `firebase.ts` and client-side components
**Services**:
- Authentication: Google auth, user sessions
- Firestore: User data, collections, places
- Storage: Image uploads and serving

### Admin SDK Usage
**Location**: `lib/firebaseAdmin.ts` and API routes
**Privileged Operations**:
- Admin verification
- Place CRUD operations
- Storage management with custom tokens
- Bulk data operations
- User impersonation (if needed)

### Firestore Operations Pattern
```typescript
// Standard pattern used across API routes
import { db } from '@/lib/firebaseAdmin';
import { doc, getDoc, updateDoc, setDoc } from 'firebase-admin/firestore';

// Read operation
const docRef = doc(db, 'collection', 'docId');
const docSnap = await getDoc(docRef);

// Write operation
await updateDoc(docRef, { field: value });

// Create operation
await setDoc(docRef, newData);
```

## Error Handling Patterns

### Standard Error Response
```typescript
{
  error: string;
  message: string;
  details?: any;
}
```

### Common Error Scenarios
1. **Authentication Failures**: 401 responses with auth details
2. **Permission Errors**: 403 for admin-only operations
3. **Validation Errors**: 400 with field-specific error messages
4. **Not Found**: 404 for missing resources
5. **Server Errors**: 500 with logging for debugging

## Rate Limiting & Security

### Current Implementation
- **Admin Verification**: Email-based admin checks
- **Token Validation**: Share token encryption/decryption
- **Firebase Rules**: Server-side security rules (configured in Firebase console)

### Security Considerations
- **No API Rate Limiting**: Relies on Firebase quotas
- **Admin Verification**: Simple email check (could be enhanced)
- **Share Links**: Token-based encryption for collection sharing
- **Maintenance Mode**: Bypass mechanism for authorized access

## Performance Optimizations

### Database Query Patterns
- **Composite Queries**: Where possible for efficient filtering
- **Pagination**: For large result sets (places collection)
- **Indexing**: Firestore indexes for complex queries
- **Caching**: In-memory caching for frequently accessed data

### API Response Optimization
- **Selective Field Projection**: Only return needed fields
- **Compression**: Built-in Vercel compression
- **CDN**: Static asset delivery via Vercel CDN
- **Edge Computing**: Vercel Edge Network for global distribution

## External API Dependencies

### Google Services
- **Google Places API**: Place data and details
- **Google Geocoding API**: Address to coordinates
- **Firebase Auth**: User authentication
- **Firestore**: Database operations
- **Firebase Storage**: File storage

### OpenAI Services
- **GPT-4**: Text processing and place extraction
- **GPT-3.5**: Chatbot interactions
- **Embeddings**: Vector search capabilities (if implemented)

### Third-Party Services
- **Apify**: Instagram scraping
- **Telegram**: Bot API for messaging
- **Vercel**: Hosting and serverless functions

## Development Patterns

### API Route Structure
```typescript
// Standard API route pattern
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const adminEmail = await verifyAdminUser(request);
    
    // Parse request body
    const body = await request.json();
    
    // Business logic
    const result = await processRequest(body);
    
    // Return response
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Operation failed', message: error.message },
      { status: 500 }
    );
  }
}
```

### Middleware Usage
- **Authentication**: Route-level auth checks
- **Logging**: Request/response logging
- **Error Handling**: Centralized error processing
- **CORS**: Cross-origin request handling

## Monitoring & Debugging

### Logging Strategy
- **Console Logging**: Development debugging
- **Error Tracking**: Vercel error logging
- **Firebase Console**: Database operation monitoring
- **Custom Analytics**: Usage tracking via efficiency-analysis API

### Debugging Tools
- **Vercel Logs**: Serverless function logs
- **Firebase Console**: Real-time database monitoring
- **Network Tab**: Client-side API debugging
- **Test Endpoints**: Dedicated `/api/test` for development

## Summary
The LOKI backend API architecture provides a comprehensive set of endpoints for user management, place discovery, collection collaboration, AI interactions, and administrative functions. The design leverages Firebase for backend services while using Next.js API routes for custom business logic and external integrations. The architecture supports both authenticated and guest access patterns with appropriate security measures and performance optimizations.