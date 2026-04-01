# NexusAI Authentication System

Complete authentication system with user authentication, session management, and guest sessions.

## Features

- **User Authentication**: JWT-based login/register with refresh tokens
- **Session Management**: MongoDB-backed sessions with automatic expiry
- **Guest Sessions**: Anonymous users get guest sessions that persist across page refreshes
- **Token Auto-Refresh**: Automatic token refresh before expiration
- **Route Protection**: Middleware protection for authenticated routes
- **Multiple Sessions**: Users can be logged in on multiple devices
- **Session Tracking**: IP, user-agent, and last active tracking

## Backend API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | No | Create new account |
| `/auth/login` | POST | No | Login with credentials |
| `/auth/guest-session` | POST | No | Create guest session |
| `/auth/refresh` | POST | No | Refresh tokens |
| `/auth/logout` | POST | Yes | Logout current session |
| `/auth/logout-all` | POST | Yes | Logout all devices |
| `/auth/me` | GET | Yes | Get current user info |
| `/auth/sessions` | GET | Yes | List user sessions |
| `/auth/sessions/:id` | DELETE | Yes | Revoke specific session |

## Frontend Usage

### 1. Authentication Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.firstName}!</div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### 2. Login

```typescript
const { login, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  const result = await login({ email, password });
  if (result.type === 'auth/login/fulfilled') {
    // Login successful
    router.push('/');
  }
};
```

### 3. Register

```typescript
const { register } = useAuth();

const handleRegister = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const result = await register(data);
  if (result.type === 'auth/register/fulfilled') {
    // Registration successful
    router.push('/');
  }
};
```

### 4. Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Creates new guest session automatically
};
```

### 5. Protected Routes

Middleware automatically protects routes. Add routes to `middleware.ts`:

```typescript
const protectedRoutes = ['/profile', '/settings', '/dashboard'];
```

## File Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts      # API endpoints
│   │   ├── auth.service.ts         # Business logic
│   │   ├── auth.module.ts          # Module config
│   │   ├── schemas/
│   │   │   └── session.schema.ts   # Session model
│   │   ├── dto/
│   │   │   ├── auth-request.dto.ts # Request DTOs
│   │   │   └── auth-response.dto.ts# Response DTOs
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts   # JWT guard
│   │   │   ├── authenticated.guard.ts # Auth check
│   │   │   └── roles.guard.ts      # Role-based access
│   │   └── strategies/
│   │       └── jwt.strategy.ts     # Passport JWT
│   └── users/
│       └── schemas/
│           └── user.schema.ts       # User model

frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── register/
│   │   │   └── page.tsx            # Register page
│   │   └── middleware.ts            # Route protection
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthProvider.tsx    # Auth context
│   │   └── Header.tsx              # User menu
│   ├── hooks/
│   │   └── useAuth.ts              # Auth hook
│   ├── services/
│   │   └── auth.service.ts         # API calls
│   ├── store/
│   │   ├── index.ts                # Redux store
│   │   └── slices/
│   │       └── authSlice.ts        # Auth state
│   ├── types/
│   │   └── auth.types.ts           # TypeScript types
│   └── lib/
│       └── api.ts                  # API config
```

## Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nexusai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NexusAI
```

## Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days (authenticated) / 30 days (guest)
- **Session**: Auto-expires after token expiration

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Session revocation support
- CORS protection
- Input validation with class-validator
- Refresh token rotation

## Guest Session Flow

1. User visits site without authentication
2. Frontend creates guest session automatically
3. Guest gets access token (no user data)
4. On login/register, guest session converts to authenticated
5. User data is preserved in session

## Troubleshooting

### 401 Errors
- Token may have expired - auto-refresh handles this
- User may have been deactivated
- Session may have been revoked

### CORS Issues
- Check FRONTEND_URL in backend .env matches frontend URL
- Ensure credentials: true is set in frontend axios config

### MongoDB Connection
- Ensure MongoDB is running locally or MONGODB_URI is correct
- Check network connectivity to MongoDB server

## Running the Application

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Access

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
