# JWT to Google OAuth Migration Guide

## Backend Setup Complete ✓

Your backend has been successfully migrated from JWT authentication to Google OAuth. Here's what changed:

### What Was Changed:

1. **Package Dependencies**
   - ❌ Removed: `bcryptjs`, `jsonwebtoken`
   - ✅ Added: `passport`, `passport-google-oauth20`, `express-session`

2. **User Model** (`server/models/User.js`)
   - ❌ Removed: `password` field and password hashing logic
   - ✅ Added: `googleId`, `profilePicture`
   - Changed: `role` now defaults to "buyer"

3. **Auth Controller** (`server/controllers/authController.js`)
   - ❌ Removed: `register()`, `login()` methods
   - ✅ Added: `googleCallback()`, `getCurrentUser()`, `updateGstin()`, `logout()`
   - Updated: `switchRole()` to work with sessions

4. **Auth Middleware** (`server/middleware/auth.js`)
   - ❌ Removed: JWT token verification
   - ✅ Added: Passport session verification

5. **Auth Routes** (`server/routes/auth.js`)
   - ❌ Removed: `/register`, `/login` endpoints
   - ✅ Added: Google OAuth endpoints (`/google`, `/google/callback`)
   - Updated: Protected routes use session-based auth

6. **Server Configuration** (`server/index.js`)
   - ✅ Added: `express-session` middleware
   - ✅ Added: Passport initialization and session support
   - ✅ Added: CORS with credentials enabled

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials (Web Application type)
5. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
6. Copy your Client ID and Client Secret

### Step 3: Update Environment Variables

Create or update `.env` file in the `server` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/invoicesync

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_from_google_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_console
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session
SESSION_SECRET=your_random_secret_key_here

# Client URL
CLIENT_URL=http://localhost:5173

# Server
PORT=5000
NODE_ENV=development
```

### Step 4: Start the Server

```bash
npm run dev
```

---

## Client-Side Implementation

### Step 1: Install Google OAuth Package

```bash
cd client
npm install @react-oauth/google
```

### Step 2: Update App.jsx with Google OAuth

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import API from './services/api';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            // User has logged in successfully
            window.location.href = 'http://localhost:5000/api/auth/google?code=' + credentialResponse.credential;
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
```

### Step 3: Check Authentication Status

Create a hook to check if user is authenticated:

```jsx
import { useEffect, useState } from 'react';
import API from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get('/auth/me');
        setUser(response.data.data.user);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
}
```

### Step 4: Logout Implementation

```jsx
import API from '../services/api';

async function handleLogout() {
  try {
    await API.post('/auth/logout');
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

### Step 5: Switch Role

```jsx
async function switchRole() {
  try {
    const response = await API.post('/auth/switch-role');
    console.log('New role:', response.data.data.newRole);
    // Refresh user data or update state
  } catch (error) {
    console.error('Failed to switch role:', error);
  }
}
```

### Step 6: Update GSTIN

```jsx
async function updateGstin(gstin) {
  try {
    const response = await API.put('/auth/gstin', { gstin });
    console.log('GSTIN updated:', response.data.data.user.gstin);
  } catch (error) {
    console.error('Failed to update GSTIN:', error);
  }
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/me` | Get current user (requires auth) |
| POST | `/api/auth/switch-role` | Switch between seller/buyer (requires auth) |
| PUT | `/api/auth/gstin` | Update user GSTIN (requires auth) |
| POST | `/api/auth/logout` | Logout user (requires auth) |

### Response Format

**Success (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mongo_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "buyer",
      "gstin": "GSTIN123",
      "profilePicture": "url_to_profile_pic"
    }
  }
}
```

**Error (401/404/500)**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Key Changes for Frontend

1. **Remove Token Storage**: No more `localStorage.getItem('token')`
2. **Use Sessions**: Authentication is now handled via HTTP-only cookies
3. **Credentials in Requests**: The API client already includes `withCredentials: true`
4. **Google Login Button**: Must implement Google OAuth provider for login
5. **Session Checking**: Use `/api/auth/me` to check if user is authenticated

---

## Database Migration

If you have existing users with passwords, you have two options:

### Option 1: Fresh Start (Recommended)
Delete all existing user documents and start fresh with Google OAuth.

### Option 2: Manual Migration
Manually migrate users or create a migration script that links Google IDs to existing email addresses.

---

## Testing

1. **Test Login Flow**
   ```
   1. Navigate to http://localhost:5173
   2. Click "Sign in with Google"
   3. Complete Google OAuth flow
   4. Should redirect to dashboard with session
   ```

2. **Test Protected Routes**
   ```
   curl -b cookies.txt http://localhost:5000/api/auth/me
   ```

3. **Test Logout**
   ```
   curl -b cookies.txt -X POST http://localhost:5000/api/auth/logout
   ```

---

## Common Issues & Solutions

### Issue: "Google credentials not found"
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`

### Issue: "Not authenticated" on protected routes
- Ensure `withCredentials: true` is set in axios
- Check that cookies are being sent with requests
- Verify session cookie settings in `index.js`

### Issue: CORS errors
- Update `CLIENT_URL` in `.env`
- Verify CORS origin in `server/index.js`

### Issue: Session not persisting
- Ensure `httpOnly` cookies are supported by your browser
- Check that `NODE_ENV` is set correctly
- Verify session secret is set in `.env`

---

## Next Steps

1. ✅ Backend migration complete
2. 📋 Update client components with Google OAuth login
3. 📋 Test the complete authentication flow
4. 📋 Deploy with production Google OAuth credentials
5. 📋 Delete old authentication code if migrating existing users

---

For detailed implementation examples, refer to your updated files:
- Backend: `server/config/passport.js`, `server/routes/auth.js`
- API: `client/services/api.js`
