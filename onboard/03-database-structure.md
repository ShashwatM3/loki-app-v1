# LOKI Web App - Database Structure & Models

## Overview
LOKI uses Google Cloud Firestore as its primary database, a NoSQL document database that provides real-time synchronization and offline capabilities. The database schema is designed around a denormalized architecture optimized for read-heavy workloads and real-time collaboration.

## Database Technology
- **Database**: Google Cloud Firestore
- **Mode**: Production mode (Native mode)
- **Location**: Regional (based on Firebase project settings)
- **SDKs**: Firebase Client SDK (web) + Firebase Admin SDK (server)

## Collection Architecture

### High-Level Structure
```
Firestore Database
├── users/                    # User profiles and collections
├── places/                   # Global place catalog
├── sharedCollections/        # Collaborative collection storage
├── config/                   # Application configuration
└── features/                 # Internal feature/bug tracking
```

### Key Architectural Patterns
1. **Denormalized Data**: Collections stored in multiple locations for performance
2. **Document-Based**: Each entity is a document with nested fields
3. **Real-Time Sync**: Firestore listeners for live updates
4. **Embedded Arrays**: Related data stored as arrays within documents

## Detailed Schema

### 1. Users Collection (`users`)

**Document ID**: User email address (e.g., `john@example.com`)

**Purpose**: Store user profile information and personal collections

**Created By**: `POST /api/create-account` on first login

**Updated By**: Collections page, dashboard, collaborator manager, shared collection APIs

#### Document Structure
```typescript
{
  // Required Fields
  name: string;                    // Display name (falls back to email local part)
  email: string;                   // User email (duplicates document ID)
  photo: string;                   // Google profile photo URL (may be empty)
  collections: CollectionType[];   // User's personal and shared collections
  
  // Optional Fields
  sharedCollections?: CollectionType[];  // Legacy shared collection storage
  admin?: boolean;                 // Admin access flag
}
```

#### CollectionType (Embedded Object)
```typescript
{
  // Identification
  name: string;                    // Collection name (de-facto key)
  id?: string;                     // Rarely persisted (mostly mock data)
  
  // Type & Access
  type?: "personal" | "shared";    // Collection type
  access?: "view" | "edit";        // Permission level (for shared)
  
  // Shared Collection References
  sharedCollectionId?: string;     // Points to sharedCollections doc
  ownerEmail?: string;             // Collection owner email
  createdBy?: string;              // Creator email (usually = ownerEmail)
  
  // Content
  places: Place[];                 // Embedded place copies with metadata
  collaborators?: string[];        // Named collaborator emails
  linkCollaborators?: LinkCollaborator[];  // Guest editors via share links
  members?: SharedCollectionMember[];      // Runtime-only member resolution
  
  // Sharing
  shareToken?: string;             // Legacy random token for old share links
  gradient?: string;               // CSS gradient for card background
  
  // Runtime Fields (not persisted)
  isOwner?: boolean;               // Computed ownership flag
  votes?: Record<string, Record<string, "yes" | "no">>;  // Voting data
  participantLocations?: Record<string, ParticipantLocation>;  // Live locations
}
```

#### Place (Embedded in Collections)
```typescript
{
  id: string;                      // Document ID (typed as number but actually string)
  name: string;                    // Place name
  category: string;                // Place category
  lat: number;                     // Latitude
  lng: number;                     // Longitude
  
  // Collection-specific metadata
  addedBy?: string;                // Who added this place to collection
  addedAt?: string;                // When added (ISO timestamp)
}
```

#### Initial User Document Shape
```typescript
{
  name: "John Doe",
  email: "john@example.com",
  photo: "https://...",
  collections: [{
    name: "Favorites",
    type: "personal",
    gradient: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    places: [],
    createdBy: "john@example.com",
    ownerEmail: "john@example.com",
    access: "edit"
  }]
}
```

### 2. Places Collection (`places`)

**Document ID**: Auto-generated Firestore string ID

**Purpose**: Global catalog of spots, venues, events, and attractions

**Created By**: Instagram/Telegram ingestion pipeline with AI extraction

**Updated By**: Admin operations, AI editing, data enrichment

#### Document Structure
```typescript
{
  // Basic Information
  id: string;                      // Auto-generated document ID
  name: string;                    // Venue/event name
  label: string;                   // SPOT | EVENT | ATTRACTION | EXPERIENCE | VENUE | OTHER
  category: string;                // Primary category (matches config/categories.list)
  description: string;             // One-line description
  
  // Location
  lat: number;                     // Latitude (0 if unknown)
  lng: number;                     // Longitude (0 if unknown)
  location?: string;               // Neighborhood/area (used by chatbot)
  
  // Categorization & Filtering
  mainFilter?: string;             // Explore group ID (from admin CSV)
  subFilter?: string;              // Explore sub-filter label (from admin CSV)
  tags: string[];                  // Free-form tags
  vibes: string[];                 // Mood/feeling keywords
  
  // Venue Details
  hours: string;                   // Opening hours text
  age21Plus?: boolean;             // 21+ only venue flag
  budget: string;                  // "Low" | "Moderate" | "High" (or empty)
  
  // Rating & Reviews
  rating: number;                  // Rating value (0 if unknown)
  reviews: number;                 // Review count (can be number | string | array in legacy data)
  
  // Media
  image: string;                   // Image URL (may be empty)
  website?: string;                // Website URL (may be empty)
  gmaps?: string;                  // Google Maps URL (for deduplication)
  
  // Popup/Temporary Events
  popup: boolean;                  // True for limited-time pop-ups
  startDate?: string;              // YYYY-MM-DD (empty unless popup=true)
  endDate?: string;                // YYYY-MM-DD (empty unless popup=true)
}
```

#### Indexing Requirements
- **Composite Index**: Required for `features` collection queries on `submittedAt`
- **Single Field Indexes**: As needed for filtering performance

#### Data Quality Notes
- **Coordinates**: Default to `0,0` if unknown
- **Reviews**: Type inconsistency (number vs string vs array) - defensive handling required
- **Images**: May be empty strings - UI handles missing images
- **Popup Events**: Automatically filtered out when `endDate < current date`

### 3. Shared Collections Collection (`sharedCollections`)

**Document ID**: Deterministic `sc_<base36-hash>` based on `ownerEmail + collectionName`

**Purpose**: Canonical storage for collaborative collections

**Created By**: `POST /api/shared-collection/save` (lazy creation on first share)

**Updated By**: Shared collection mutation APIs, collaborator actions

#### Document Structure
```typescript
{
  // Identification
  id: string;                      // Same as document ID (sc_<hash>)
  name: string;                    // Collection name
  ownerEmail: string;              // Owner's email (reference to users collection)
  
  // Content
  places: Place[];                 // Embedded place copies (may include addedBy/addedAt)
  
  // Collaboration
  members: SharedCollectionMember[];  // Collection members with permissions
  collaborators?: string[];        // Named collaborator emails (mirrored from source)
  linkCollaborators?: LinkCollaborator[];  // Guest editors from share links
  
  // Metadata
  gradient?: string;               // Card background gradient
  sourceCollectionName?: string;   // Original name in owner's collections
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp (bumped on every mutation)
}
```

#### SharedCollectionMember
```typescript
{
  email: string;                   // Member email (reference to users)
  access: "view" | "edit";         // Permission level
  savedAt?: string;                // When member joined (ISO timestamp)
  name?: string;                   // Display name captured at join
  photo?: string;                  // Avatar URL captured at join
}
```

#### LinkCollaborator
```typescript
{
  name: string;                    // Display name chosen by guest
  lastActiveAt?: string;           // Last activity timestamp (ISO)
  avatar?: string;                 // Emoji avatar chosen by guest
}
```

#### Sync Behavior
When a shared collection is modified:
1. Update `sharedCollections/{id}` document
2. Update owner's `users/{ownerEmail}.collections[]` entry
3. Members resolve changes on next page load
4. `updatedAt` timestamp is bumped for cache invalidation

### 4. Config Collection (`config`)

**Document Path**: `config/categories` (fixed document ID)

**Purpose**: Application-wide configuration and taxonomy

**Created By**: Auto-created on first category fetch if missing

**Updated By**: Category management APIs

#### Document Structure
```typescript
{
  list: string[];                  // Category taxonomy
}
```

#### Default Categories
```typescript
[
  "Beach", "Art & Culture", "Entertainment", "Nature", "Food & Drink",
  "Adventure", "Leisure", "Tech & Future", "Hiking", "Chai", "Experience",
  "Ramadan", "Watch Sports", "World Cup", "Running Trails", "Coworking Spots"
]
```

#### Additional Config Documents
- `config/exploreSubfilters`: Custom sub-filter definitions for explore section

### 5. Features Collection (`features`)

**Document ID**: Auto-generated

**Purpose**: Internal feature/bug request backlog from admin panel

**Created By**: Admin "Features" page submissions

**Updated By**: Admin status updates

#### Document Structure
```typescript
{
  description: string;             // Fully formatted request text
  descriptionRaw: string;          // Verbatim text from admin
  descriptionRefined: string;      // Refined/formatted description
  imageUrls: string[];             // Firebase Storage URLs for attached images
  mode: "text" | "image_assisted"; // Submission mode
  submittedAt: Timestamp;          // Server timestamp (Firestore Timestamp object)
}
```

#### Legacy Fields (Read-Only)
- `details`: Older description field
- `description`: Older single description field

#### Storage Integration
- Images uploaded to Firebase Storage: `features/<timestamp>-<n>-<filename>`
- Only download URLs stored in Firestore

## Data Relationships

### Entity-Relationship Diagram
```
users (1) ──────< (N) collections
  │                    │
  │                    ├─< (N) places (embedded)
  │                    └─< (N) collaborators (emails)
  │
  ├─ (1) ──────> sharedCollections (N) [as owner]
  │                    │
  │                    ├─< (N) places (embedded)
  │                    ├─< (N) members
  │                    │         └─> users (N) [member emails]
  │                    └─< (N) linkCollaborators
  │
  └─ (N) ──────< sharedCollections [as member]

places (canonical) ──< (embedded copies in collections)

config/categories ──> places (category validation)
```

### Key Relationship Patterns

#### User to Collections
- **One-to-Many**: One user has many collections
- **Embedded**: Collections stored as array within user document
- **Denormalized**: Shared collections also exist as separate documents

#### Collection to Places
- **One-to-Many**: One collection contains many places
- **Embedded**: Places stored as array within collection
- **Copied**: Place data copied into collections (not referenced)

#### Shared Collections
- **Canonical Source**: `sharedCollections` documents are the source of truth
- **Owner Sync**: Owner's `users` document contains mirrored copy
- **Member Sync**: Members have references but not full copies
- **Real-Time**: Changes propagate through manual sync logic

## Data Access Patterns

### Read Patterns
1. **User Data**: Direct document read by email (user document ID)
2. **Places**: Collection scan (all places) with in-memory filtering
3. **Categories**: Single config document read
4. **Shared Collections**: Deterministic document ID lookup

### Write Patterns
1. **User Updates**: Direct document update (partial field updates)
2. **Collection Creation**: Array union operation on user document
3. **Shared Collection**: Multi-document transaction (shared doc + owner sync)
4. **Place Updates**: Direct document update (admin only)

### Cache Strategy
1. **Client-Side**: Zustand store with manual refresh
2. **In-Memory**: Place catalog cached in process
3. **Real-Time**: Firestore listeners for critical data
4. **Optimistic**: Immediate UI updates with server sync

## Data Consistency & Sync

### Denormalization Challenges
1. **Shared Collections**: Exist in 3 places (shared doc, owner's user doc, members' user docs)
2. **Manual Sync**: Application code handles consistency
3. **Conflict Resolution**: Last-write-wins with timestamp ordering

### Sync Flow
```
User Action → API Route → Update Shared Collection Doc
                              ↓
                    Update Owner's User Doc
                              ↓
                    Members Resolve on Next Load
```

### Data Integrity
1. **Validation**: Client-side + server-side validation
2. **Type Safety**: TypeScript interfaces + Zod schemas
3. **Error Handling**: Rollback on failed operations
4. **Backup**: Firebase automatic backups

## Security & Access Control

### Current Security Model
- **Firestore Rules**: Configured in Firebase console (not in repo)
- **Admin Verification**: Email-based admin checks in API routes
- **Client SDK**: Standard Firebase authentication
- **Public Read**: Some data accessible without authentication (places, categories)

### Access Patterns
1. **User Data**: Read/write by owner, read by collaborators
2. **Places**: Public read, admin write
3. **Shared Collections**: Read by members, write by editors
4. **Config**: Public read, admin write

## Performance Considerations

### Query Optimization
1. **Small Dataset**: Full collection scans acceptable for places
2. **Index Usage**: Composite indexes for complex queries
3. **Pagination**: Implemented for large result sets
4. **Selective Loading**: Load only needed fields

### Cost Optimization
1. **Read Operations**: Minimized through caching
2. **Document Size**: Embedded arrays vs separate documents
3. **Network**: Compression and efficient data structures
4. **Monitoring**: Firestore usage monitoring

## Migration & Evolution

### Schema Evolution
1. **Optional Fields**: New fields added as optional
2. **Backward Compatibility**: Legacy fields maintained
3. **Data Migration**: Manual migration scripts when needed
4. **Versioning**: Application-level schema versioning

### Known Technical Debt
1. **Type Inconsistencies**: `Place.id` typed as number but stored as string
2. **Legacy Fields**: Old share token system vs new encryption
3. **Denormalization**: Manual sync logic complexity
4. **Missing Indexes**: Some queries may need additional indexes

## Summary
The LOKI database architecture uses a denormalized Firestore schema optimized for read-heavy workloads and real-time collaboration. The design prioritizes performance through embedding related data and caching, while maintaining data consistency through manual sync logic. The schema supports the application's core features of user management, place discovery, and collaborative collections with appropriate security and access controls.