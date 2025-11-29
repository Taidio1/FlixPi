# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
├─────────────────────────────────────────────────────────────┤
│  React App (Vite)                                            │
│  ├── Components (UI)                                         │
│  ├── Pages (Routes)                                          │
│  ├── Contexts (State Management)                             │
│  │   ├── AuthContext (User & Profiles)                       │
│  │   └── MovieContext (Movies & Filters)                     │
│  └── Services (API Communication)                            │
│      ├── authService.js                                      │
│      ├── movieService.js                                     │
│      └── progressService.js                                  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         SERVER TIER                          │
├─────────────────────────────────────────────────────────────┤
│  Express.js API                                              │
│  ├── Routes                                                  │
│  │   ├── /api/auth (Authentication)                          │
│  │   ├── /api/movies (Movie Management)                      │
│  │   └── /api/progress (Watch Progress)                      │
│  ├── Controllers (Business Logic)                            │
│  ├── Middleware                                              │
│  │   ├── Authentication (JWT)                                │
│  │   ├── Authorization (Admin Check)                         │
│  │   ├── Rate Limiting                                       │
│  │   └── Error Handling                                      │
│  └── Services                                                │
│      ├── Supabase Client                                     │
│      └── Google Drive API                                    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────────┐    ┌──────────────────────┐
│   SUPABASE (BaaS)    │    │   GOOGLE DRIVE API   │
├──────────────────────┤    ├──────────────────────┤
│ - PostgreSQL DB      │    │ - Video Files        │
│ - Authentication     │    │ - Subtitle Files     │
│ - Row Level Security │    │ - Streaming URLs     │
│ - Real-time (future) │    │ - OAuth 2.0          │
└──────────────────────┘    └──────────────────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User → Login Form → POST /api/auth/login
                         ↓
                    Supabase Auth
                         ↓
                    JWT Token
                         ↓
                    Store in localStorage
                         ↓
                    Redirect to Profiles
```

### 2. Video Streaming Flow

```
User clicks Play → Navigate to /watch/:id
                         ↓
                    GET /api/movies/:id/stream
                         ↓
                    Fetch Google Drive File ID
                         ↓
                    Generate Stream URL
                         ↓
                    Video.js Player Loads
                         ↓
                    Stream from Google Drive
                         ↓
                    Save Progress (every 10s)
```

### 3. Watch Progress Flow

```
Video Playing → Every 10 seconds
                         ↓
                    PUT /api/progress/:movieId
                         ↓
                    Upsert to watch_progress table
                         ↓
                    Return updated progress
                         ↓
                    Continue playing
```

## Database Schema

### Tables

**profiles**
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT)
- avatar_color (TEXT)
- created_at (TIMESTAMP)

**movies**
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- year (INTEGER)
- duration_minutes (INTEGER)
- poster_url (TEXT)
- google_drive_file_id (TEXT)
- subtitle_file_id (TEXT)
- genres (TEXT[])
- created_at, updated_at (TIMESTAMP)

**watch_progress**
- id (UUID, PK)
- profile_id (UUID, FK → profiles)
- movie_id (UUID, FK → movies)
- progress_seconds (INTEGER)
- total_duration (INTEGER)
- updated_at (TIMESTAMP)
- UNIQUE(profile_id, movie_id)

### Row Level Security (RLS)

**profiles**
- Users can CRUD their own profiles only

**movies**
- All authenticated users can READ
- Admin users can CRUD (via service role)

**watch_progress**
- Users can CRUD progress for their own profiles

## Authentication & Authorization

### Authentication Flow

1. User registers/login via Supabase Auth
2. Supabase returns JWT access token
3. Frontend stores token in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Backend middleware verifies token with Supabase

### Authorization Levels

**Regular User**
- View movies
- Create profiles (max 5)
- Track watch progress
- Stream content

**Admin User**
- All regular user permissions
- Access admin panel
- CRUD movies
- View all data

Admin status determined by `user_metadata.role === 'admin'`

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── MovieProvider
│       └── Router
│           ├── Login
│           ├── Profiles
│           ├── Home
│           │   ├── Navbar
│           │   ├── SearchBar
│           │   ├── GenreFilter
│           │   └── MovieCard (multiple)
│           ├── MovieDetail
│           │   └── Navbar
│           ├── Player
│           │   └── VideoPlayer
│           └── Admin
│               ├── Navbar
│               └── AdminMovieForm
```

### State Management

**Global State (Context API)**
- AuthContext: user, profiles, auth methods
- MovieContext: movies list, filters, search

**Local State (useState)**
- Component-specific UI state
- Form inputs
- Loading states

**Persistent State (localStorage)**
- Access token
- Current user
- Selected profile

## Backend Architecture

### Layered Architecture

```
Routes Layer
    ↓ (delegates to)
Controllers Layer
    ↓ (uses)
Services Layer
    ↓ (interacts with)
Data Layer (Supabase, Google Drive)
```

### Middleware Chain

```
Request → CORS → Helmet → Rate Limiter → Auth → Route Handler → Response
                                                    ↓
                                                Error Handler
```

## Security Measures

### Frontend
- No sensitive credentials in code
- JWT token in httpOnly would be better (future improvement)
- Input validation before API calls
- Protected routes for authenticated users

### Backend
- Environment variables for secrets
- Helmet.js for security headers
- Rate limiting (100 req/15min general, 5 req/15min auth)
- CORS whitelist
- JWT verification on protected routes
- Admin check middleware
- Input validation

### Database
- Row Level Security (RLS) policies
- Prepared statements (Supabase handles)
- Foreign key constraints
- Unique constraints where needed

### API
- Google OAuth 2.0 with refresh tokens
- Service account for server operations
- Public file access (read-only)

## Performance Optimizations

### Frontend
- Lazy loading for routes (future)
- Image lazy loading on movie cards
- React.memo for expensive components (future)
- Debounced search input
- Virtual scrolling for large lists (future)

### Backend
- Database indexes on frequently queried fields
- Caching movie metadata (future with Redis)
- Streaming responses for video
- Connection pooling (Supabase handles)

### Video Streaming
- Range requests support for seeking
- Progressive loading with Video.js
- Adaptive quality (future with HLS/DASH)

## Scalability Considerations

### Current Limits
- Supabase free tier: 500MB DB, 2GB bandwidth
- Google Drive: 15GB free storage
- No CDN for video delivery

### Future Improvements
- CDN for static assets (Cloudflare)
- Video transcoding service (Mux, Cloudflare Stream)
- Database sharding for massive scale
- Microservices architecture
- Caching layer (Redis)
- Message queue for async tasks
- Load balancer for multiple server instances

## Technology Choices

### Why React?
- Component reusability
- Large ecosystem
- Virtual DOM performance
- Easy state management

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Optimized builds
- Native ES modules
- Better DX than CRA

### Why Express?
- Minimal and flexible
- Large middleware ecosystem
- Easy to learn
- Good documentation

### Why Supabase?
- PostgreSQL (powerful, relational)
- Built-in authentication
- Row Level Security
- Real-time capabilities
- Free tier generous
- Easy to use

### Why Google Drive?
- Free storage (15GB)
- Reliable CDN
- Familiar for users
- Easy file sharing
- No video hosting costs

### Why Video.js?
- Open source
- Extensive plugin ecosystem
- Supports HLS/DASH
- Customizable
- Good browser support

## Future Enhancements

### Features
- [ ] Continue watching section
- [ ] Watchlist/favorites
- [ ] Ratings and reviews
- [ ] Recommendations algorithm
- [ ] Multiple language support
- [ ] Download for offline viewing
- [ ] Parental controls
- [ ] Watch together (real-time sync)

### Technical
- [ ] Server-side rendering (Next.js)
- [ ] Progressive Web App (PWA)
- [ ] WebSocket for real-time features
- [ ] GraphQL API (optional)
- [ ] TypeScript migration
- [ ] Unit & integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes orchestration

### Performance
- [ ] Redis caching
- [ ] CDN integration
- [ ] Video transcoding
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size optimization

---

This architecture is designed to be:
- **Scalable**: Can grow with user base
- **Maintainable**: Clear separation of concerns
- **Secure**: Multiple layers of security
- **Performant**: Optimized for speed
- **Cost-effective**: Uses free/cheap services

