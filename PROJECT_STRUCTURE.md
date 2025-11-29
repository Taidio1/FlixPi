# 📂 Project Structure

Complete file structure of FlixPi application.

```
FlixPi/
│
├── 📁 client/                          # React Frontend Application
│   ├── 📁 public/
│   │   └── flix-icon.svg              # App favicon/logo
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/             # Reusable UI Components
│   │   │   ├── AdminMovieForm.jsx     # Form for adding/editing movies
│   │   │   ├── GenreFilter.jsx        # Genre filtering component
│   │   │   ├── MovieCard.jsx          # Movie thumbnail card
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── ProfileSelector.jsx    # Profile selection UI
│   │   │   ├── SearchBar.jsx          # Search input component
│   │   │   └── VideoPlayer.jsx        # Video.js player wrapper
│   │   │
│   │   ├── 📁 contexts/               # React Context Providers
│   │   │   ├── AuthContext.jsx        # Authentication & profiles state
│   │   │   └── MovieContext.jsx       # Movies & filtering state
│   │   │
│   │   ├── 📁 pages/                  # Page Components (Routes)
│   │   │   ├── Admin.jsx              # Admin panel for movie management
│   │   │   ├── Home.jsx               # Home page with movie grid
│   │   │   ├── Login.jsx              # Login/Register page
│   │   │   ├── MovieDetail.jsx        # Movie details & info
│   │   │   ├── Player.jsx             # Video player page
│   │   │   └── Profiles.jsx           # Profile selection page
│   │   │
│   │   ├── 📁 services/               # API Communication Layer
│   │   │   ├── api.js                 # Axios instance & interceptors
│   │   │   ├── authService.js         # Auth API calls
│   │   │   ├── movieService.js        # Movie API calls
│   │   │   └── progressService.js     # Watch progress API calls
│   │   │
│   │   ├── App.jsx                    # Main app component with routing
│   │   ├── main.jsx                   # React app entry point
│   │   └── index.css                  # Global styles & Tailwind
│   │
│   ├── .gitignore                     # Git ignore rules
│   ├── index.html                     # HTML template
│   ├── package.json                   # Dependencies & scripts
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   └── vite.config.js                 # Vite build configuration
│
├── 📁 server/                          # Express Backend API
│   ├── 📁 src/
│   │   ├── 📁 config/                 # Configuration Files
│   │   │   ├── googleDrive.js         # Google Drive API setup
│   │   │   └── supabase.js            # Supabase client setup
│   │   │
│   │   ├── 📁 controllers/            # Route Controllers
│   │   │   ├── authController.js      # Auth endpoints logic
│   │   │   ├── movieController.js     # Movie endpoints logic
│   │   │   └── progressController.js  # Progress endpoints logic
│   │   │
│   │   ├── 📁 middleware/             # Express Middleware
│   │   │   ├── auth.js                # JWT authentication
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   └── rateLimiter.js         # Rate limiting
│   │   │
│   │   ├── 📁 routes/                 # API Routes
│   │   │   ├── auth.js                # /api/auth routes
│   │   │   ├── movies.js              # /api/movies routes
│   │   │   └── progress.js            # /api/progress routes
│   │   │
│   │   ├── 📁 services/               # Business Logic Layer
│   │   │   ├── googleDriveService.js  # Google Drive operations
│   │   │   ├── movieService.js        # Movie database operations
│   │   │   ├── profileService.js      # Profile database operations
│   │   │   └── progressService.js     # Progress database operations
│   │   │
│   │   ├── 📁 scripts/                # Utility Scripts
│   │   │   └── getGoogleRefreshToken.js # Helper to get OAuth token
│   │   │
│   │   └── index.js                   # Server entry point
│   │
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Git ignore rules
│   └── package.json                   # Dependencies & scripts
│
├── 📁 supabase/                        # Database Migrations
│   ├── 📁 migrations/
│   │   └── 001_initial_schema.sql     # Database schema & RLS policies
│   │
│   └── seed_data.sql                  # Sample data for testing
│
├── 📄 Documentation Files
├── .gitignore                         # Root git ignore
├── ARCHITECTURE.md                    # System architecture overview
├── CONTRIBUTING.md                    # Contribution guidelines
├── DEPLOYMENT.md                      # Production deployment guide
├── FAQ.md                             # Frequently asked questions
├── LICENSE                            # MIT License
├── package.json                       # Root package.json (monorepo)
├── PROJECT_STRUCTURE.md               # This file
├── QUICK_START.md                     # Quick setup guide
└── README.md                          # Main documentation

```

## File Counts

- **Frontend Files**: ~20 files
- **Backend Files**: ~15 files
- **Documentation**: 8 files
- **Configuration**: 5 files
- **Total**: ~50+ files

## Key Technologies by Directory

### Client (`client/`)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Router**: React Router v6
- **Video**: Video.js
- **HTTP**: Axios
- **State**: Context API

### Server (`server/`)
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT
- **Storage**: Google Drive API
- **Security**: Helmet, CORS, Rate Limiting

### Database (`supabase/`)
- **Type**: PostgreSQL
- **ORM**: Supabase Client
- **Security**: Row Level Security (RLS)
- **Auth**: Supabase Auth

## Component Dependency Graph

```
App
 ├─ AuthProvider (provides user, profiles)
 │   └─ MovieProvider (provides movies, filters)
 │       └─ Router
 │           ├─ Login
 │           ├─ Profiles
 │           │   └─ ProfileSelector
 │           ├─ Home
 │           │   ├─ Navbar
 │           │   ├─ SearchBar
 │           │   ├─ GenreFilter
 │           │   └─ MovieCard[]
 │           ├─ MovieDetail
 │           │   └─ Navbar
 │           ├─ Player
 │           │   └─ VideoPlayer
 │           └─ Admin
 │               ├─ Navbar
 │               └─ AdminMovieForm
```

## API Route Structure

```
/api
 ├─ /auth
 │   ├─ POST   /register
 │   ├─ POST   /login
 │   ├─ POST   /logout
 │   ├─ GET    /profiles
 │   ├─ POST   /profiles
 │   └─ PUT    /profiles/:id
 │
 ├─ /movies
 │   ├─ GET    /                    (all movies)
 │   ├─ GET    /:id                 (movie details)
 │   ├─ POST   /                    (create - admin)
 │   ├─ PUT    /:id                 (update - admin)
 │   ├─ DELETE /:id                 (delete - admin)
 │   ├─ GET    /:id/stream          (stream URL)
 │   ├─ GET    /:id/stream-video    (direct stream)
 │   └─ GET    /:id/subtitles       (subtitle URL)
 │
 └─ /progress
     ├─ GET    /                    (all progress for profile)
     ├─ GET    /:movieId            (specific movie progress)
     ├─ PUT    /:movieId            (update progress)
     └─ DELETE /:movieId            (delete progress)
```

## Database Schema

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  auth.users │      │   profiles  │      │   movies    │
├─────────────┤      ├─────────────┤      ├─────────────┤
│ id (PK)     │◄─────┤ user_id(FK) │      │ id (PK)     │
│ email       │      │ id (PK)     │◄─┐   │ title       │
│ password    │      │ name        │  │   │ description │
└─────────────┘      │ avatar_color│  │   │ year        │
                     └─────────────┘  │   │ duration    │
                                      │   │ poster_url  │
                                      │   │ drive_id    │
                                      │   │ genres[]    │
                                      │   └─────────────┘
                                      │
                     ┌─────────────┐  │
                     │watch_progress│  │
                     ├─────────────┤  │
                     │ id (PK)     │  │
                     │ profile_id ─┼──┘
                     │ movie_id ───┼──┘
                     │ progress_s  │
                     │ total_dur   │
                     │ updated_at  │
                     └─────────────┘
```

## Environment Variables

### Client (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

### Server (`.env`)
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
GOOGLE_REFRESH_TOKEN=...
CLIENT_URL=http://localhost:5173
```

## Build & Development Commands

### Root
```bash
npm run dev           # Run both client & server
npm run client        # Run only frontend
npm run server        # Run only backend
npm run install:all   # Install all dependencies
```

### Client
```bash
cd client
npm run dev          # Development server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Server
```bash
cd server
npm run dev          # Development with nodemon
npm start            # Production server
```

## Port Usage

- **Frontend Dev**: `5173` (Vite default)
- **Backend Dev**: `5000` (configured in .env)
- **Database**: Managed by Supabase (cloud)

## Data Flow

```
User Action
    ↓
React Component
    ↓
Context/Service
    ↓
API Call (Axios)
    ↓
Express Route
    ↓
Controller
    ↓
Service Layer
    ↓
Supabase/Google Drive
    ↓
Response
    ↓
Update UI
```

---

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md)

