# ANALIZA MIGRACJI: StreamAppUI → FlixPi Client

## ⚠️ WAŻNA DEKLARACJA PROJEKTU

StreamAppUI to **DEMO/PROTOTYP** a nie pełny streaming app. Brakuje kluczowych funkcjonalności.

---

## ETAP 1: ANALIZA STRUKTURY

### 1.1 STARE UI (/client)

**Stack technologiczny:**
- Framework: React 18.3.1 + JavaScript (JSX)
- Routing: React Router DOM v6
- State Management: React Context API (AuthContext, MovieContext)
- Styling: Tailwind CSS
- Build tool: Vite 5
- HTTP Client: Axios
- Video Player: Video.js (CDN)
- Query Manager: @tanstack/react-query
- UI Components: shadcn/ui (Radix UI)

**Struktura folderów:**
```
client/
├── src/
│   ├── components/       # Komponenty UI + VideoPlayer
│   ├── contexts/         # AuthContext, MovieContext
│   ├── pages/            # Login, Home, Player, Admin, etc.
│   ├── services/         # api.js, movieService, authService, progressService
│   ├── hooks/            # use-toast
│   ├── lib/              # queryClient, utils
│   ├── App.jsx           # Main routing
│   └── main.jsx          # Entry point
├── package.json
└── vite.config.js
```

**Komunikacja z backendem:**
- Base URL: `http://localhost:5000/api` (lub VITE_API_URL env)
- Authentication: Bearer Token (JWT w localStorage)
- Headers: `Authorization: Bearer ${token}`
- Interceptors: automatyczne dodawanie tokenu, obsługa 401

**Endpointy API używane:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/profiles
POST   /api/auth/profiles
PUT    /api/auth/profiles/:id
GET    /api/movies
GET    /api/movies/:id
GET    /api/movies/:id/stream
GET    /api/movies/:id/subtitles
GET    /api/movies/:id/stream-video (no auth)
GET    /api/movies/:id/stream-subtitles (no auth)
GET    /api/content
GET    /api/content/series
GET    /api/episodes/:id
GET    /api/seasons
POST   /api/progress
GET    /api/progress/:movieId/:profileId
PUT    /api/progress/:movieId/:profileId
GET    /api/sync
POST   /api/sync (admin only)
```

**Funkcjonalności:**
✅ Login/Register
✅ System profili (profile selector)
✅ Lista filmów i seriali
✅ Szczegóły filmu/serialu
✅ Video player (Video.js z napisami)
✅ Ζapisywanie postępu oglądania per profil
✅ Wyszukiwanie i filtrowanie po gatunku
✅ Panel admina (CRUD filmów)
✅ Synchronizacja z Google Drive
✅ Responsywność
✅ Napisy (subtitles)

---

### 1.2 NOWE UI (StreamAppUI)

**Stack technodyczny:**
- Framework: React 18.3.1 + TypeScript (.tsx)
- Routing: Wouter (lightweight router)
- State Management: React Context API (brak AuthContext)
- Styling: Tailwind CSS
- Build tool: Vite 5
- HTTP Client: Fetch API
- Video Player: **BRAK** (tylko modal z placeholder)
- Query Manager: @tanstack/react-query
- UI Components: shadcn/ui (47 komponentów)

**Struktura folderów:**
```
StreamAppUI/StreamAppUI/
├── client/
│   ├── src/
│   │   ├── components/   # HeroBanner, MovieCard, MovieCarousel, Navigation
│   │   ├── pages/        # HomePage, SearchPage, ProfilePage, WatchlistPage
│   │   ├── hooks/        # use-toast, use-mobile
│   │   ├── lib/          # queryClient, utils
│   │   └── App.tsx
├── server/
│   ├── index.ts          # WŁASNY backend (Express + session auth)
│   ├── routes.ts         # Endpointy różne od /server
│   └── storage.ts
├── shared/
│   └── schema.ts         # Drizzle schema
└── package.json
```

**Komunikacja z backendem:**
- Uses własny backend `server/index.ts`
- Authentication: **Session-based** (cookies, `credentials: "include"`)
- **BRAK** Bearer tokens
- **BRAK** integration z /server backend FlixPi

**Endpointy API oczekiwane:**
```
GET    /api/movies
GET    /api/movies/:id
GET    /api/categories
GET    /api/watchlist
POST   /api/watchlist
DELETE /api/watchlist/:movieId
GET    /api/viewing-history
POST   /api/viewing-history
PATCH  /api/viewing-history/:movieId/progress
```

**Funkcjonalności:**
✅ Homepage z hero banner
✅ Lista filmów (carousel)
✅ Modal ze szczegółami filmu
✅ Watchlist (bookmark)
✅ Viewing history (historia oglądania)
⚠️ **BRAK** video playera
⚠️ **BRAK** systemu profili
⚠️ **BRAK** logowania/rejestracji (mockup)
⚠️ **BRAK** panelu admina
⚠️ **BRAK** napisów (subtitles)
⚠️ **BRAK** persu profile progress

---

## ETAP 2: PORÓWNANIE RÓŻNICE

### 2.1 RÓŻNICE W KOMUNIKACJI API

| Aspekt | Stare UI | Nowe UI | Konflikt |
|--------|----------|---------|----------|
| Backend | `/server` (istniejący) | Własny `server/index.ts` | ⚠️ TAK |
| Authentication | Bearer Token (JWT) | Session (cookies) | ⚠️ TAK |
| API Base URL | `/api/*` | `/api/*` (inna struktura) | ⚠️ TAK |
| Watchlist endpoint | Brak | `/api/watchlist` | ⚠️ TAK |
| History endpoint | `/api/progress` | `/api/viewing-history` | ⚠️ TAK |
| Profiles endpoint | `/api/auth/profiles` | Brak | ⚠️ TAK |
| Stream endpoint | `/api/movies/:id/stream` | Brak | ⚠️ TAK |
| Subtitles endpoint | `/api/movies/:id/subtitles` | Brak | ⚠️ TAK |

### 2.2 RÓŻNICE W STRUKTURZE DANYCH

**Stare UI (FlixPi backend):**
```javascript
{
  id: "uuid",
  title: "string",
  description: "string",
  poster_url: "string",
  backdrop_url: "string",
  rating: float,
  year: integer,
  duration: integer,
  genres: ["Action", "Drama"],
  cast: ["Actor 1", "Actor 2"],
  category: "string",
  content_type: "movie" | "series",
  google_drive_id: "string",
  series_data: { seasons: [...] }
}
```

**Nowe UI (StreamAppUI schema):**
```typescript
{
  id: "string",
  title: "text",
  description: "text",
  poster_url: "text",
  backdrop_url: "text",
  rating: "real",
  year: "integer",
  duration: "integer",
  genres: "text[]",
  cast: "text[]",
  category: "text",
  is_featured: "integer",
  type: "movie" | "series",
  number_of_seasons: "integer",
  seasons: "jsonb"
}
```

**Różnice:**
- Nowe UI używa `is_featured` zamiast `isTrending`
- Nowe UI używa `type` zamiast `content_type`
- Nowe UI używa `posterUrl` zamiast `poster_url` (camelCase vs snake_case)

### 2.3 RÓŻNICE W ROUTING

**Stare UI:**
- `/login`
- `/profiles`
- `/` (Home)
- `/browse`
- `/movie/:id`
- `/series/:id`
- `/watch/:id`
- `/watch/episode/:episodeId`
- `/admin`

**Nowe UI:**
- `/` (HomePage)
- `/search` (SearchPage)
- `/watchlist` (WatchlistPage)
- `/profile` (ProfilePage - nie to samo co Profiles!)
- Brak: /login, /profiles, /watch, /admin

### 2.4 RÓŻNICE W AUTHENTICATION

**Stare UI:**
- JWT token w localStorage
- `localStorage.getItem('access_token')`
- Interceptor dodaje `Authorization: Bearer ${token}`
- Session per user (nie per profile!)

**Nowe UI:**
- Session cookies
- `credentials: "include"` w fetch
- Brak tokenów w localStorage
- Brak profile system

---

## ETAP 3: PROBLEMY I WYMAGANIA

### 3.1 GŁÓWNE PROBLEMY

1. **Backend Incompatibility**
   - StreamAppUI ma własny backend z innymi endpointami
   - Nie ma autentykacji
   - Nie ma video playera
   - Nie ma systemu profili

2. **Brakujące funkcjonalności w StreamAppUI:**
   - ❌ Video player (Video.js)
   - ❌ Napisy (subtitles)
   - ❌ System profili
   - ❌ Logowanie/rejestracja
   - ❌ Panel admina
   - ❌ Synchronizacja z Google Drive
   - ❌ Progress tracking per profile
   - ❌ Odtwarzanie seriali (episodes)

3. **Różne struktury danych:**
   - Snake_case vs camelCase
   - Różne nazwy pól
   - Różne endpointy

### 3.2 CO WARTO ZACHOWAĆ Z NOWEGO UI?

✅ **Design/Bootstrap:**
- Lepsze UI/UX (HeroBanner, MovieCarousel)
- Więcej komponentów shadcn/ui
- Womananysz JavaScript (TypeScript)

✅ **Komponenty:**
- `HeroBanner.tsx` - banner hero z filmem na górze
- `MovieCarousel.tsx` - carousel z kategoriami
- `MovieDetailModal.tsx` - modal ze szczegółami
- Navigation - lepsza nawigacja

✅ **TypeScript:**
- Lepsze type safety
- Schema validation z Drizzle

### 3.3 CO WARTO ZACHOWAĆ ZE STAREGO UI?

✅ **Komunikacja z backendem:**
- `services/api.js` - axios setup z interceptorami
- `services/movieService.js` - wrapper na API
- `services/authService.js` - authentication
- `services/progressService.js` - progress tracking

✅ **Funcjonalności core:**
- `VideoPlayer.jsx` - pełny video player z Video.js
- `contexts/AuthContext.jsx` - profile management
- `pages/Player.jsx` - video playback page
- `pages/EpisodePlayer.jsx` - episode playback
- `pages/Admin.jsx` - panel admina
- `pages/Login.jsx` - logowanie
- `pages/Profiles.jsx` - profile selector

---

## ETAP 4: REKOMENDOWANA STRATEGIA

### ❌ OPCJA A: PEŁNA ZAMIANA (NIE POLECAM)
Zastąpienie całego `/client` przez StreamAppUI nie jest możliwe, bo:
- StreamAppUI nie ma video playera
- StreamAppUI nie ma systemu profili
- StreamAppUI nie ma integracji z backend FlixPi
- Wymagałoby przepisania 80% kodu

### ❌ OPCJA B: STOPNIOWA MIGRACJA (NIE KONIECZNE)
Po prostu nie ma sensu - to 2 różne projekty.

### ✅ OPCJA C: HYBRID APPROACH (REKOMENDOWANA)
**Zmerguj najlepsze elementy z obu:**

**Z StreamAppUI:**
1. Skopiuj komponenty UI:
   - `HeroBanner.tsx`
   - `MovieCarousel.tsx`
   - `MovieDetailModal.tsx`
   - Lepsze komponenty z shadcn/ui

2. Przekonwertuj na JavaScript (jeśli potrzeba)

3. Zintegruj z istniejącym kodem

**Ze starego UI:**
1. Zachowaj całą komunikację z backendem
2. Zachowaj video player
3. Zachowaj system profili
4. Zachowaj wszystkie funkcjonalności

**Plan działania:**
1. Backup `/client`
2. Skopiuj komponenty z StreamAppUI do `/client/src/components`
3. Zaktualizuj `Home.jsx` aby używał HeroBanner i MovieCarousel
4. Zaktualizuj `MovieDetail.jsx` aby używał MovieDetailModal
5. Testuj każdą stronę
6. Usuń StreamAppUI po udanych testach

---

## ETAP 5: ROLLBACK PLAN

Jeśli coś pójdzie nie tak:
1. Zatrzymaj aplikację
2. Usuń `/client`
3. Rozpakuj backup: `cp -r client_backup client`
4. Restart aplikacji

---

## PODSUMOWANIE

**StreamAppUI to demo/prototyp**, nie pełny streaming app.
**Nie można** po prostu zastąpić starego UI nowym.

**Najlepsza strategia:** Hybrid approach - włącz najlepsze komponenty wizualne z StreamAppUI do istniejącego działającego UI.

**Szacowany czas:** 2-4 godziny
**Ryzyko:** Niskie (jeśli zrobi backup)
**Korzyści:** Lepszy UI bez tracenia funkcjonalności

