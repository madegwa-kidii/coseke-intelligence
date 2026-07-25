# Authentication System Setup Guide

## Quick Start

Your authentication system is fully built and ready! Follow these steps to complete the setup:

## Environment Variables Required

Add these to your `.env.local` file or Vercel project settings:

```env
# MongoDB Database
MONGODB_URI=your-mongodb-connection-string

# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000    # or your production domain

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Step-by-Step Setup

### 1. Database Setup
- Create a MongoDB cluster (MongoDB Atlas or self-hosted)
- Get your connection string
- Set `MONGODB_URI` to your connection string

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable OAuth 2.0 Credentials
4. Create OAuth 2.0 Client (Web application)
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 3. Email Service Setup
1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key from the dashboard
4. Set `RESEND_API_KEY`

### 4. NextAuth Setup
1. Generate a secret: `openssl rand -base64 32`
2. Set `NEXTAUTH_SECRET` to the generated value
3. Set `NEXTAUTH_URL` to your app URL

## What's Been Built

### Pages
✅ `/auth/login` - Email/password and Google login
✅ `/auth/register` - Email/password and Google registration
✅ `/verify-email` - Email verification page
✅ `/auth/complete-profile` - Profile completion for Google OAuth users

### API Endpoints
✅ `POST /api/auth/register` - User registration
✅ `POST /api/auth/login` - Login check
✅ `POST /api/auth/verify-email` - Email verification
✅ `POST /api/auth/resend-verification` - Resend verification email
✅ `PUT /api/auth/complete-profile` - Complete OAuth profile
✅ NextAuth routes - Session management

### Database
✅ Extended User model with OAuth fields:
- `googleId` - OAuth provider ID
- `authProvider` - 'email' or 'google'
- `profileCompleted` - Profile completion status
- `emailVerified` - Email verification status

### Frontend Components
✅ `SessionProvider` - NextAuth session wrapper
✅ `AuthContext` & `useAuth()` hook - Custom auth state
✅ `ProtectedRoute` - Route protection wrapper

## User Flows Supported

### Email/Password Registration
1. User registers with email, password, username, name
2. Receives verification email
3. Clicks verification link
4. Email confirmed
5. Can login with credentials

### Google Sign In (New User)
1. User clicks "Continue with Google"
2. Google OAuth flow
3. New user created
4. Redirected to profile completion
5. User fills username and phone
6. Redirected to dashboard

### Google Sign In (Existing User)
1. User clicks "Continue with Google"
2. Google account linked to existing user
3. Redirected to dashboard

### Email Verification Resend
1. User didn't receive email
2. Clicks "Resend Verification Email"
3. New email sent
4. User verifies from new email

## Testing Checklist

- [ ] MONGODB_URI is set and MongoDB is running
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- [ ] RESEND_API_KEY is set
- [ ] NEXTAUTH_SECRET is generated and set
- [ ] NEXTAUTH_URL is set correctly
- [ ] Dev server starts without errors
- [ ] Navigate to http://localhost:3000/auth/login
- [ ] Login page loads with Google button and email form
- [ ] Navigate to http://localhost:3000/auth/register
- [ ] Register page shows registration options
- [ ] Click "Email Registration" - form appears
- [ ] Test email registration (will fail without RESEND_API_KEY but shows the flow)
- [ ] Test Google login (redirects to Google OAuth)

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── register/page.tsx       # Registration page
│   │   ├── complete-profile/page.tsx # OAuth profile completion
│   │   └── [...]nextauth]/route.ts  # NextAuth configuration
│   ├── verify-email/page.tsx       # Email verification page
│   └── layout.tsx                  # Updated with providers
├── api/auth/
│   ├── [...]nextauth]/route.ts     # NextAuth configuration
│   ├── register/route.ts           # Registration endpoint
│   ├── login/route.ts              # Login check endpoint
│   ├── verify-email/route.ts       # Email verification endpoint
│   ├── resend-verification/route.ts # Resend verification endpoint
│   └── complete-profile/route.ts   # Profile completion endpoint
├── lib/
│   ├── auth-context.tsx            # Auth context & useAuth hook
│   ├── email/
│   │   └── sendVerificationEmail.ts # Email sending (Resend)
│   └── cloudinary.ts               # Existing Cloudinary config
├── models/
│   └── user.ts                     # Updated User model
└── components/
    ├── SessionProvider.tsx         # NextAuth SessionProvider
    ├── ProtectedRoute.tsx          # Route protection
    └── ...other components
```

## Next Steps

1. Add all environment variables
2. Start the dev server: `npm run dev`
3. Test the authentication flows
4. Integrate with your dashboard
5. Deploy to production when ready

## Troubleshooting

### "MONGODB_URI is not set"
- Add `MONGODB_URI` to `.env.local` or Vercel environment variables
- Ensure MongoDB is running and connection string is correct

### "Google OAuth failed"
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify redirect URIs in Google Cloud Console
- Check NEXTAUTH_URL matches your domain

### "Verification email not sending"
- Check RESEND_API_KEY is correct
- Verify domain is setup in Resend
- Check for errors in server logs

### Port already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## Need Help?

Refer to the detailed documentation in:
- `AUTHENTICATION.md` - Full architecture & API docs
- Code comments in auth pages and endpoints

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] MongoDB is running on production
- [ ] Google OAuth redirect URIs updated to production domain
- [ ] NEXTAUTH_URL is set to production domain (with https://)
- [ ] Resend domain is verified
- [ ] HTTPS is enabled
- [ ] Email templates are customized
- [ ] Error pages are configured
- [ ] Rate limiting is implemented
- [ ] Security headers are set
