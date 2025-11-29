# 🎬 FlixPi - Netflix Clone

A full-stack streaming platform built with React, Express, Supabase, and Google Drive API.

## 🚀 Features

- **User Authentication** - Register, login, and manage multiple profiles
- **Video Streaming** - Stream movies from Google Drive with Video.js player
- **Watch Progress** - Auto-save and resume playback from where you left off
- **Subtitles Support** - VTT format subtitles
- **Admin Panel** - Add, edit, and delete movies
- **Search & Filter** - Find movies by title or genre
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Netflix-inspired interface with Tailwind CSS

## 📦 Tech Stack

### Frontend
- React 18+
- Vite
- React Router
- Tailwind CSS
- Video.js
- Axios

### Backend
- Node.js
- Express
- Supabase (PostgreSQL + Auth)
- Google Drive API
- JWT Authentication

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Platform account (for Drive API)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd FlixPi
```

### 2. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for both client and server.

### 3. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Run Database Migrations

1. Open your Supabase SQL Editor
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`

This will create:
- `profiles` table - User profiles
- `movies` table - Movie/series metadata
- `watch_progress` table - Watch history and progress
- Row Level Security (RLS) policies

#### Get Your Supabase Credentials

- Project URL: `https://your-project.supabase.co`
- Anon Key: Found in Project Settings > API
- Service Role Key: Found in Project Settings > API (keep this secret!)

### 4. Google Drive API Setup

#### Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials

#### Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Configure with your app details
3. Add test users if needed

#### Create OAuth 2.0 Client ID

1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
5. Save Client ID and Client Secret

#### Get Refresh Token

Run this to get your refresh token (one-time setup):

```bash
cd server
node src/scripts/getGoogleRefreshToken.js
```

Follow the instructions to authorize and get your refresh token.

### 5. Environment Variables

#### Server (.env)

Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Drive API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token

# CORS
CLIENT_URL=http://localhost:5173
```

#### Client (.env)

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Upload Movies to Google Drive

1. Create a folder in Google Drive for your movies
2. Upload video files (MP4 recommended)
3. Upload subtitle files (VTT format, optional)
4. For each file:
   - Right-click > Get link
   - Set to "Anyone with the link can view"
   - Extract the file ID from the URL: `https://drive.google.com/file/d/<FILE_ID>/view`

### 7. Run the Application

#### Development Mode (Recommended)

```bash
npm run dev
```

This runs both frontend (port 5173) and backend (port 5000) concurrently.

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

#### Testing Without Supabase (Using Test Data)

If you want to test the application without setting up Supabase or Google Drive:

```bash
npm run dev:test
```

This will start both frontend and backend with test data from `server/src/data/test-data.json` containing:
- 3 sample movies (Matrix, Inception, Pulp Fiction)
- 2 sample series with episodes (Breaking Bad, Game of Thrones)

**Or run only the test backend:**
```bash
cd server
npm run dev:test
```

See `TEST_DATA_README.md` for more details.

#### Or Run Separately

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run client:dev
```

### 8. Create Admin User

1. Register a new account at `http://localhost:5173/login`
2. Go to Supabase Dashboard > Authentication > Users
3. Find your user and click to edit
4. Add custom metadata:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save changes
6. Logout and login again

### 9. Add Movies (Admin Panel)

1. Login with your admin account
2. Navigate to `/admin`
3. Click "Add New Movie"
4. Fill in the form:
   - **Title**: Movie name
   - **Description**: Plot summary
   - **Year**: Release year
   - **Duration**: Runtime in minutes
   - **Poster URL**: Direct image URL
   - **Google Drive File ID**: Extract from Drive link
   - **Subtitle File ID**: Optional, extract from Drive link
   - **Genres**: Comma-separated (e.g., "Action, Thriller")
5. Click "Add Movie"

## 📁 Project Structure

```
FlixPi/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React Context providers
│   │   ├── services/      # API service functions
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── index.js      # Server entry point
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── migrations/       # Database migrations
│
├── package.json          # Root package.json
└── README.md
```

## 🎯 Usage

### For Users

1. **Register/Login**: Create an account or login
2. **Create Profile**: Set up multiple user profiles
3. **Browse Movies**: Search and filter by genre
4. **Watch Movies**: Click play to start streaming
5. **Resume Playback**: Progress is auto-saved every 10 seconds

### For Admins

1. **Login** as admin user
2. **Access Admin Panel**: Navigate to `/admin`
3. **Manage Movies**: Add, edit, or delete movies
4. **Monitor**: Check all movies in the system

## 🔒 Security Features

- JWT authentication with Supabase
- Row Level Security (RLS) policies
- Rate limiting on API endpoints
- Secure headers with Helmet.js
- Input validation
- CORS protection

## 🎨 Customization

### Change Theme Colors

Edit `client/tailwind.config.js`:

```js
colors: {
  'flix-black': '#141414',
  'flix-gray': '#2F2F2F',
  'flix-red': '#E50914',  // Change this
}
```

### Add New Genres

Update `client/src/components/GenreFilter.jsx`:

```js
const genres = [
  'Action',
  'Comedy',
  // Add your genres
];
```

## 🐛 Troubleshooting

### Video Won't Play

- Check Google Drive file is shared publicly
- Verify file ID is correct
- Check browser console for errors
- Ensure Google API credentials are valid

### Can't Login

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Clear browser cache and cookies

### Admin Panel Not Accessible

- Verify user metadata has `"role": "admin"`
- Logout and login again after setting role

### CORS Errors

- Check `CLIENT_URL` in server `.env` matches frontend URL
- Verify CORS middleware is configured correctly

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profiles` - Get user profiles
- `POST /api/auth/profiles` - Create profile

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/stream` - Get stream URL
- `GET /api/movies/:id/subtitles` - Get subtitles
- `POST /api/movies` - Create movie (admin)
- `PUT /api/movies/:id` - Update movie (admin)
- `DELETE /api/movies/:id` - Delete movie (admin)

### Progress
- `GET /api/progress/:movieId` - Get watch progress
- `PUT /api/progress/:movieId` - Update progress
- `GET /api/progress` - Get all progress for profile

## 🚀 Deployment

### Backend (Railway, Render, etc.)

1. Set environment variables
2. Deploy from GitHub
3. Update `CLIENT_URL` to production URL

### Frontend (Vercel, Netlify)

1. Build command: `cd client && npm run build`
2. Output directory: `client/dist`
3. Set `VITE_API_URL` to production backend URL

### Database

Supabase is already cloud-hosted, no additional setup needed!

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Support

If you found this helpful, please give it a star on GitHub!

---

Built with ❤️ using React, Express, Supabase & Google Drive

