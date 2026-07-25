# Authentication System - Quick Start

## 🚀 Get Started in 5 Minutes

### Step 1: Copy Environment Template
```bash
cp .env.example .env.local
```

### Step 2: Add Your Credentials
Fill in `.env.local` with:
- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - Generated secret (see below)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `RESEND_API_KEY` - From Resend.com

### Step 3: Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and paste into `.env.local` as `NEXTAUTH_SECRET`

### Step 4: Start Dev Server
```bash
npm run dev
```

### Step 5: Test It!
- Login page: http://localhost:3000/auth/login
- Register page: http://localhost:3000/auth/register

---

## 📋 What You Get

### Pages
| URL | Purpose |
|-----|---------|
| `/auth/login` | Email/password and Google login |
| `/auth/register` | Create new account |
| `/verify-email` | Verify email address |
| `/auth/complete-profile` | Complete Google OAuth profile |

### APIs
| Endpoint | Method | What It Does |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/verify-email` | POST | Verify email token |
| `/api/auth/resend-verification` | POST | Resend verification email |
| `/api/auth/complete-profile` | PUT | Save OAuth profile |

---

## 🔐 Security Built-in

✅ Password hashing with bcrypt  
✅ Email verification tokens  
✅ JWT session management  
✅ CSRF protection  
✅ OAuth validation  
✅ Input validation  

---

## 🎯 Common Tasks

### Protect a Route
```typescript
'use client';
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Only logged-in users can see this</div>
    </ProtectedRoute>
  );
}
```

### Get Current User (Server)
```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  console.log(session?.user?.email);
}
```

### Get Current User (Client)
```typescript
'use client';
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  return <p>{session?.user?.name}</p>;
}
```

### Logout User
```typescript
'use client';
import { signOut } from "next-auth/react";

export default function Header() {
  return (
    <button onClick={() => signOut()}>
      Logout
    </button>
  );
}
```

---

## ❌ Troubleshooting

### Error: MONGODB_URI is not set
→ Add `MONGODB_URI` to `.env.local`

### Error: GOOGLE_CLIENT_ID is undefined
→ Add Google credentials to `.env.local`

### Google OAuth not working
→ Check redirect URIs in Google Cloud Console

### Email not sending
→ Verify `RESEND_API_KEY` and domain in Resend

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

---

## 📚 Documentation

For more details, see:
- `AUTHENTICATION.md` - Full API documentation
- `AUTH_SETUP_GUIDE.md` - Step-by-step guide
- `AUTHENTICATION_SUMMARY.md` - Complete overview

---

## 🎨 Design

All auth pages include:
- Professional dark theme
- Blue accents
- Smooth animations
- Error handling
- Loading states
- Form validation

---

## ✨ Features

### Email/Password
- Registration with verification
- Login with email/password
- Password hashing
- Email confirmation required

### Google OAuth
- Sign in with Google
- Auto-account creation
- Profile completion for new users
- Account linking for existing users

### Security
- CSRF protection
- Secure tokens
- Password hashing
- OAuth validation
- Session management

---

## 🚢 Deploy to Production

1. Add environment variables to Vercel project settings
2. Update NEXTAUTH_URL to production domain
3. Update Google OAuth redirect URIs
4. Verify email domain in Resend
5. Enable HTTPS
6. Deploy!

---

## 💡 Next Steps

- [ ] Set environment variables
- [ ] Start dev server
- [ ] Test login and registration flows
- [ ] Integrate with your dashboard
- [ ] Customize email templates (if needed)
- [ ] Deploy to production

Happy authenticating! 🎉
