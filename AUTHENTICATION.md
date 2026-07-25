# Authentication System Documentation

## Overview

This project implements a comprehensive authentication system supporting:
- **Email/Password Registration** with email verification
- **Google OAuth 2.0** sign-in and registration
- **Profile Completion** flow for OAuth users
- **Email Verification** with secure tokens
- **Session Management** using NextAuth.js

## Architecture

### Core Components

#### 1. **User Model** (`src/models/user.ts`)
Extended MongoDB schema with OAuth support:
- `googleId` - OAuth provider ID
- `authProvider` - 'email' or 'google'
- `profileCompleted` - Profile completion status
- `emailVerified` - Email verification status
- Email verification token fields for secure verification

#### 2. **NextAuth Configuration** (`src/app/api/auth/[...nextauth]/route.ts`)
Configured with two providers:

**Credentials Provider (Email/Password)**
- Validates email and password
- Checks email verification status
- Updates last login timestamp
- Returns user data

**Google Provider**
- Auto-creates users on first sign-in
- Links existing accounts
- Sets `profileCompleted: false` for new Google users
- Auto-verifies email for Google OAuth

#### 3. **API Endpoints**

##### Register (`POST /api/auth/register`)
- Validates credentials (username, email, password)
- Creates user with hashed password
- Generates verification token
- Sends verification email via Resend
- Returns success with user data

##### Login Check (`POST /api/auth/login`)
- Checks user existence
- Returns verification status
- Used to determine next step in auth flow

##### Verify Email (`POST /api/auth/verify-email`)
- Validates token and expiration
- Sets `emailVerified: true`
- Clears verification token
- Allows login

##### Resend Verification (`POST /api/auth/resend-verification`)
- Generates new verification token
- Sends new verification email
- Validates user exists and not already verified

##### Complete Profile (`PUT /api/auth/complete-profile`)
- Protected endpoint (requires session)
- Updates username, phone, image
- Sets `profileCompleted: true`
- Used after Google OAuth registration

### Frontend Components

#### Authentication Pages

**Login Page** (`/auth/login`)
- Dual authentication options (Email & Google)
- Email/password form with validation
- Links to registration and forgot password
- Error handling and loading states

**Register Page** (`/auth/register`)
- Multi-step registration flow
- Google OAuth option
- Email registration form
- Email verification confirmation page

**Email Verification** (`/verify-email`)
- Automatic verification on load
- Resend verification email option
- Success/error states
- Link to login

**Profile Completion** (`/auth/complete-profile`)
- Protected route for OAuth users
- Username and phone collection
- Validates username uniqueness
- Redirects to dashboard on completion

#### Context & Hooks

**SessionProvider** (`src/components/SessionProvider.tsx`)
- Wraps app with NextAuth SessionProvider
- Enables `useSession()` hook globally

**AuthContext** (`src/lib/auth-context.tsx`)
- Custom context for auth state
- `useAuth()` hook for accessing user info
- Loading state management

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- Client component for route protection
- Redirects unauthenticated users to login
- Enforces profile completion if required
- Loading UI while checking session

### Security Features

✅ **Password Hashing**
- Bcrypt with 10 salt rounds
- Passwords never stored in plaintext
- `select: false` prevents accidental exposure

✅ **Email Verification**
- Secure token generation (32 bytes random)
- SHA256 hashing before database storage
- 24-hour expiration
- One-time use tokens

✅ **Session Security**
- JWT-based sessions (30-day expiration)
- CSRF protection via NextAuth
- Secure cookie settings in production

✅ **OAuth Security**
- Google provider validation
- Account linking for existing emails
- Email auto-verification for OAuth

✅ **Database Security**
- Input validation before DB queries
- Mongoose schema validation
- Unique indexes on sensitive fields

## User Flows

### Email Registration Flow
```
1. User enters credentials on /auth/register
2. Frontend validates form
3. POST /api/auth/register
4. Backend validates, creates user, sends email
5. User receives verification email
6. User clicks link → /verify-email?token=X&email=Y
7. Auto-verifies, shows success message
8. User redirected to /auth/login
9. Login with email/password
10. POST /api/auth/login checks verification status
11. Credentials provider verifies password
12. User redirected to /dashboard
```

### Google OAuth Flow
```
1. User clicks "Continue with Google" on /auth/login or /auth/register
2. Redirected to Google OAuth consent screen
3. Returns to app with authorization code
4. NextAuth exchanges code for token
5. If new user:
   - Creates user with googleId
   - Sets authProvider: 'google'
   - Sets profileCompleted: false
   - Redirects to /auth/complete-profile
6. If existing user:
   - Links googleId if not linked
   - Redirects to /dashboard
7. User fills in username and phone on /auth/complete-profile
8. PUT /api/auth/complete-profile updates profile
9. Redirects to /dashboard
```

### Email Verification Resend Flow
```
1. User didn't receive verification email
2. Clicks "Resend" on /verify-email
3. POST /api/auth/resend-verification with email
4. Backend generates new token
5. Sends new verification email
6. User receives email and clicks link
7. Email verified successfully
```

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
RESEND_API_KEY=your-resend-api-key

# Database
MONGODB_URI=your-mongodb-connection-string
```

### Generating NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install next-auth resend bcryptjs
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable OAuth 2.0 Credentials
4. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret

### 3. Resend Setup
1. Sign up at [Resend.com](https://resend.com)
2. Get API key from dashboard
3. Add verified domain for email sending

### 4. Environment Configuration
Add all required environment variables to `.env.local` or Vercel project settings

### 5. Database
Ensure MongoDB is connected via `MONGODB_URI`

## Usage Examples

### Accessing User Session in Server Components
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <div>{session?.user?.email}</div>;
}
```

### Accessing User Session in Client Components
```typescript
'use client';
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  return <div>{session?.user?.name}</div>;
}
```

### Using Auth Context
```typescript
'use client';
import { useAuth } from "@/lib/auth-context";

export default function Component() {
  const { isAuthenticated, user, isLoading } = useAuth();
  return <div>{user?.email}</div>;
}
```

### Protecting Routes
```typescript
'use client';
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute requiredProfileCompletion={true}>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## API Response Examples

### Register Success
```json
{
  "success": true,
  "message": "Registered successfully. Please check your email to verify your account.",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false
  }
}
```

### Login Check
```json
{
  "success": true,
  "data": {
    "emailVerified": true,
    "authProvider": "email",
    "profileCompleted": true
  }
}
```

### Complete Profile Success
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "username": "johndoe",
    "phone": "+1234567890"
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad request (validation errors)
- `401` - Unauthorized (missing session)
- `404` - Not found (user doesn't exist)
- `409` - Conflict (duplicate email/username)
- `500` - Server error

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] Email verification tokens secure
- [x] CSRF protection via NextAuth
- [x] Session expiration configured
- [x] Secure cookie settings
- [x] Input validation on all endpoints
- [x] Rate limiting recommended (add middleware)
- [x] HTTPS enforced in production
- [x] Sensitive fields excluded from responses
- [x] OAuth provider validation

## Troubleshooting

### "Email already exists"
- Ensure unique index on email in MongoDB
- Check for duplicate entries

### "Invalid verification token"
- Token may be expired (24-hour limit)
- Use resend verification endpoint

### "Google OAuth not working"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Check redirect URIs in Google Console
- Ensure NEXTAUTH_URL is correct

### "Email not sending"
- Verify RESEND_API_KEY is correct
- Check Resend domain is verified
- Look for errors in server logs

## Next Steps

1. Add forgot password functionality
2. Implement email change verification
3. Add two-factor authentication
4. Implement rate limiting
5. Add audit logging
6. Setup password strength meter
7. Add session management UI
