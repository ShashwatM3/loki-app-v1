# LOKI Web App - External APIs & Integrations

## Overview
LOKI integrates with multiple external services to provide place data, AI capabilities, authentication, and content ingestion. These integrations are critical for the application's core functionality and user experience.

## Integration Categories

### 1. Firebase Services (Primary Backend)

#### Firebase Authentication
**Purpose**: User authentication and session management
**Provider**: Google OAuth
**Configuration**:
- Provider: GoogleAuthProvider
- Persistence: browserLocalPersistence (survives browser restart)
- User Document Creation: Automatic on first login via `/api/create-account`

**Usage Patterns**:
```typescript
// Client-side authentication
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

**Data Stored**:
- User email (used as document ID)
- Display name
- Profile photo URL
- Authentication tokens

**Admin Features**:
- Email-based admin verification (`verifyAdminUserEmail`)
- Session management for admin dashboard
- Maintenance bypass tokens

#### Cloud Firestore
**Purpose**: NoSQL database for all application data
**Configuration**:
- `ignoreUndefinedProperties: true` - prevents errors on undefined field values
- Client SDK for web operations
- Admin SDK for privileged operations

**Key Collections**:
- `users` - User profiles and collections
- `places` - Global place catalog
- `sharedCollections` - Collaborative collections
- `config` - Application configuration
- `features` - Internal feature tracking

**Usage Patterns**:
- Real-time listeners for live updates
- Offline support (configured but not heavily used)
- Optimistic UI updates with server sync

#### Firebase Storage
**Purpose**: File storage for images and media
**Configuration**:
- Custom token generation for admin uploads
- Standard client SDK for user uploads
- Organized bucket structure

**Storage Paths**:
- `features/<timestamp>-<n>-<filename>` - Feature request images
- Place images (admin uploaded via custom tokens)

**Integration Points**:
- `/api/admin/upload-place-image` - Admin image uploads
- Feature request attachments in admin panel
- Profile pictures (via Google Auth URLs)

### 2. Google Services Integration

#### Google Places API
**Purpose**: Place data, details, and photos
**Endpoint**: `/api/google-places`
**Authentication**: Admin-only API route
**Features Used**:
- Place search and discovery
- Place details and information
- Place photos
- Reviews and ratings

**Usage Patterns**:
```typescript
// Via API route
const response = await fetch('/api/google-places', {
  method: 'POST',
  body: JSON.stringify({ query: 'restaurant in Dubai' })
});
```

**Data Integration**:
- Place enrichment for existing database
- Validation of place information
- Additional photos and details
- Review and rating data

#### Google Geocoding API
**Purpose**: Convert addresses to coordinates
**Endpoint**: `/api/geocode`
**Authentication**: Optional (public endpoint)
**Features Used**:
- Address to coordinate conversion
- Reverse geocoding (coordinates to address)
- Location validation

**Usage Patterns**:
```typescript
const response = await fetch('/api/geocode', {
  method: 'POST',
  body: JSON.stringify({ address: 'Dubai Marina, Dubai' })
});
const { lat, lng } = await response.json();
```

**Integration Points**:
- Place location validation during ingestion
- User location processing
- Map centering and bounds calculation

### 3. OpenAI Integration

#### GPT-4 & GPT-3.5
**Purpose**: AI-powered text processing and generation
**SDK**: Vercel AI SDK (`@ai-sdk/openai`)
**API Routes**:
- `/api/gpt` - Direct GPT access
- Integrated via AI SDK in chatbot

**Use Cases**:

1. **Place Extraction from Text** (`/api/admin/place-from-text`)
   - Extracts structured place data from unstructured text
   - Fields extracted: name, category, description, location, etc.
   - Validates and normalizes extracted information

2. **AI Chatbot ("Ask Loki")**
   - Conversational interface for place recommendations
   - Context-aware suggestions based on user preferences
   - Tool integration for database access

3. **Place Content Enhancement** (`/api/admin/places/[id]/ai-edit`)
   - Improves place descriptions
   - Generates better marketing copy
   - Enriches content with additional details

4. **Video Description** (`api/admin/describe-video`)
   - Analyzes video content
   - Generates descriptions for video media
   - Extracts place information from videos

**Configuration**:
- Model: GPT-4 for complex tasks, GPT-3.5 for chat
- Temperature: Varies by use case (lower for extraction, higher for creative)
- Max Tokens: Configured per task requirements
- System Prompts: Custom prompts for each use case

**Tool Integration**:
- Custom tools defined in `lib/lokiAgentTools.ts`
- Database access tools for place queries
- Filtering and recommendation tools

### 4. Social Media Integration

#### Instagram (via Apify)
**Purpose**: Automated place data ingestion from Instagram
**Endpoint**: `/api/admin/apify-instagram`
**Service**: Apify Instagram scraper
**Authentication**: Admin-only
**Data Flow**:
```
Instagram Posts → Apify Scraper → Raw Data → AI Processing → Place Database
```

**Features**:
- Scrapes place-related Instagram posts
- Extracts location tags, descriptions, and media
- Feeds data into AI processing pipeline
- Automated place discovery

**Usage Patterns**:
- Scheduled or manual triggering via admin panel
- Batch processing of multiple posts
- Duplicate detection before database insertion

#### Telegram Bot
**Purpose**: Community-driven place submission system
**Endpoints**:
- `/api/telegram/webhook` - Receives bot messages
- `/api/telegram/register-webhook` - Webhook registration

**Data Flow**:
```
User Message → Telegram Bot → Webhook → AI Processing → Place Database
```

**Features**:
- Natural language place submissions
- Image attachment processing
- Real-time submission acknowledgment
- Community engagement tool

**Bot Commands**:
- Text-based place descriptions
- Location sharing
- Photo attachments
- Submission status updates

**Processing Pipeline**:
- Message parsing and validation
- AI extraction of place information
- Duplicate checking
- Admin approval workflow (pending places)

### 5. AI SDK Integration

#### Vercel AI SDK
**Purpose**: Standardized AI integration framework
**Packages**:
- `@ai-sdk/openai` - OpenAI provider
- `@ai-sdk/react` - React hooks for AI
- `ai` - Core AI SDK

**Features Used**:
- Streaming chat responses
- Tool calling for database access
- State management for AI conversations
- Error handling and retries

**Implementation**:
```typescript
// Chatbot implementation
import { useChat } from '@ai-sdk/react';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/agent/sessions',
  tools: customTools
});
```

**Custom Tools**:
- Place search and filtering
- Category-based recommendations
- Location-based queries
- User preference integration

### 6. Map Services Integration

#### MapLibre GL
**Purpose**: Interactive map rendering
**Library**: maplibre-gl 5.16.0
**Features**:
- Open-source map rendering
- Custom marker styles
- Interactive place selection
- Touch-optimized mobile experience

**Integration Points**:
- `/dashboard/maps` - Main map interface
- Collection map views
- Place location visualization
- User location sharing

**Configuration**:
- Custom tile sources (OpenStreetMap or custom)
- Marker clustering for performance
- Custom popup styles
- Responsive design

### 7. Media & Animation Integration

#### Hyperframes
**Purpose**: Rich video/animation compositions
**Package**: @hyperframes/player 0.6.114
**Features**:
- Collection "flash" videos
- User profile videos
- Invitation videos
- Recap videos

**Integration Points**:
- Collection sharing moments
- User onboarding animations
- Achievement celebrations
- Social media content generation

**Usage Patterns**:
```typescript
const { play } = useHyperframes();
play({
  composition: 'loki-flash',
  data: buildCreatedFlash(collectionName)
});
```

#### Lottie Files
**Purpose**: JSON-based animations
**Package**: @lottiefiles/dotlottie-react 0.17.13
**Features**:
- Loading animations
- Decorative elements
- Micro-interactions
- Performance-optimized animations

**Usage**:
- Loading states
- Success animations
- UI feedback
- Illustrative elements

### 8. Analytics & Monitoring

#### Vercel Analytics
**Purpose**: Application performance monitoring
**Package**: @vercel/analytics 2.0.1
**Features**:
- Page view tracking
- Performance metrics
- User analytics
- Error tracking

**Integration**:
- Automatic page tracking
- Custom event tracking
- Real-time monitoring
- Performance insights

#### Custom Analytics
**Endpoint**: `/api/efficiency-analysis`
**Purpose**: Custom performance and usage analysis
**Features**:
- Response time tracking
- Error rate monitoring
- Usage pattern analysis
- System health checks

### 9. Communication & Notification

#### Twitter/X Integration
**Purpose**: Social media content embedding
**Package**: react-tweet 3.3.0
**Features**:
- Tweet embedding
- Real-time tweet display
- Social proof integration
- Content aggregation

**Usage**:
- Place-related tweets
- Social media mentions
- User-generated content
- Marketing content

### 10. Development & Testing Tools

#### Firebase Emulator
**Purpose**: Local development and testing
**Features**:
- Local Firestore emulation
- Authentication testing
- Storage emulation
- Offline development

#### Test Endpoints
- `/api/test` - General testing endpoint
- Development mode features
- Load testing capabilities
- Integration testing support

## Integration Architecture Patterns

### API Gateway Pattern
```
Client → Next.js API Routes → External Services
```
- All external calls go through API routes
- Centralized error handling
- Authentication/authorization checks
- Response formatting and caching

### Data Enrichment Pipeline
```
Raw Data → AI Processing → Validation → Database
```
- Multi-stage processing pipeline
- Quality checks at each stage
- Duplicate detection
- Admin approval workflow

### Real-Time Sync Pattern
```
Firebase Listeners → State Updates → UI Re-render
```
- Real-time data synchronization
- Optimistic UI updates
- Conflict resolution
- Offline support

## Security Considerations

### API Key Management
- Environment variables for sensitive keys
- Server-side only for admin operations
- Firebase security rules for data access
- Rate limiting via service quotas

### Data Privacy
- User data stored securely in Firebase
- Compliance with data protection regulations
- Minimal data collection
- User consent for data processing

### Third-Party Risks
- Dependency on external service availability
- API rate limits and quotas
- Cost management for paid services
- Service level agreements (SLAs)

## Cost Management

### Firebase Costs
- Firestore reads/writes
- Storage usage
- Authentication operations
- Hosting and bandwidth

### External API Costs
- OpenAI API usage (token-based)
- Google Places API (per-request)
- Apify subscription (if used)
- Map tile services

### Optimization Strategies
- Caching frequently accessed data
- Batch processing for bulk operations
- Efficient query patterns
- Monitoring and alerting

## Reliability & Error Handling

### Fallback Mechanisms
- Graceful degradation when services unavailable
- Cached data for offline scenarios
- Retry logic for failed requests
- User-friendly error messages

### Monitoring
- Service health checks
- Performance monitoring
- Error tracking and alerting
- Usage analytics

## Future Integration Opportunities

### Potential Additions
- Additional social media platforms
- Payment gateways for premium features
- Email services for notifications
- SMS services for verification
- Additional AI models for specialized tasks
- Enhanced analytics platforms

### Scalability Considerations
- Load balancing for API routes
- CDN integration for static assets
- Database sharding strategies
- Caching layer optimization

## Summary
LOKI's external integration architecture leverages Firebase as the primary backend while incorporating specialized services for AI, maps, social media, and media processing. The integration patterns prioritize security, performance, and reliability while providing rich functionality for place discovery, AI-powered recommendations, and collaborative features. The architecture is designed to be maintainable and scalable with clear separation of concerns and comprehensive error handling.