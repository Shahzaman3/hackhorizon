# Quick Start: Google OAuth Migration

## ✅ Backend Changes Complete

All backend files have been updated:
- ✅ `server/package.json` - Dependencies updated (passport, express-session)
- ✅ `server/models/User.js` - Schema updated for Google ID
- ✅ `server/controllers/authController.js` - Google OAuth logic
- ✅ `server/middleware/auth.js` - Session-based verification
- ✅ `server/routes/auth.js` - Google OAuth endpoints
- ✅ `server/index.js` - Passport & session configuration
- ✅ `server/config/passport.js` - New Passport strategy configuration
- ✅ `server/.env.example` - Updated environment variables
- ✅ `client/services/api.js` - Updated to use sessions

## 🔧 What You Need To Do

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create Google OAuth Credentials
1. Visit: https://console.cloud.google.com/
2. Create a Web Application OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Get your Client ID and Secret

### 3. Update Server .env
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=any_random_string_here
CLIENT_URL=http://localhost:5173
```

### 4. Start Server
```bash
npm run dev
```

### 5. Update Client (install Google OAuth library)
```bash
cd client
npm install @react-oauth/google
```

### 6. Implement Google Login Button
Use the login component from `GOOGLE_OAUTH_MIGRATION.md` → Client-Side Implementation

## 📋 New Auth Endpoints

```
GET    /api/auth/google              ← User clicks "Sign in with Google"
GET    /api/auth/google/callback     ← Google redirects here (automatic)
GET    /api/auth/me                  ← Check current user (protected)
POST   /api/auth/switch-role         ← Switch seller/buyer (protected)
PUT    /api/auth/gstin               ← Update GSTIN (protected)
POST   /api/auth/logout              ← Logout (protected)
```

## 🚫 Removed Endpoints

```
POST   /api/auth/register            ← No longer needed
POST   /api/auth/login               ← No longer needed
```

## 📚 Full Documentation
See `GOOGLE_OAUTH_MIGRATION.md` for complete setup and implementation guide.

## ⚠️ Important Notes

- **No JWT tokens** - Authentication uses HTTP-only session cookies
- **`withCredentials: true`** - Already set in your API client
- **Database** - Remove old user passwords if migrating
- **Frontend** - Must implement Google OAuth provider
