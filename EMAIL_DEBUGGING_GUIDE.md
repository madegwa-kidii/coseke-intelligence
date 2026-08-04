# Email Sending Troubleshooting Guide

## Overview
This guide helps troubleshoot why emails are not reaching clients. I've added comprehensive logging throughout the email system to help diagnose issues.

---

## Issues Identified & Fixed

### 1. **Missing SMTP Configuration Logging**
- **Issue**: No visibility into whether SMTP credentials are properly configured
- **Fix**: Added startup checks in `/src/lib/emails.ts` that log:
  - SMTP_HOST presence
  - SMTP_PORT value
  - SMTP_USER presence
  - SMTP_PASS presence
- **Look for**: `[SMTP Config Check]` logs on server startup

### 2. **Port Configuration Bug**
- **Issue**: SMTP port was hardcoded to 587, but `secure` flag was always `false`
- **Fix**: Changed to: `secure: SMTP_PORT === 465` (465 uses SSL, others use TLS)
- **Impact**: Email might fail if your provider requires port 465

### 3. **No Email Sending Visibility**
- **Issue**: Emails sent silently - no logs to track success/failure
- **Fix**: Added detailed logging in `sendEmail()`:
  - Logs before attempting send
  - Logs success with messageId
  - Logs failure with error details
- **Look for**: `[Email]` logs in console

### 4. **Silent Verification Email Failures**
- **Issue**: Verification emails could fail without alerting the registration endpoint
- **Fix**: Added comprehensive logging in `/src/lib/email/sendVerificationEmail.ts`:
  - Logs NEXTAUTH_URL configuration
  - Logs generated verification URL
  - Logs send success/failure
  - Throws error if send fails (caught by register route)
- **Look for**: `[Verification Email]` logs

### 5. **Password Reset Email Logging**
- **Issue**: No visibility into password reset email sends
- **Fix**: Added logging to `/src/lib/email/sendPasswordResetEmail.ts`
- **Look for**: `[Password Reset Email]` logs

### 6. **Auth Routes Have No Logging**
- **Issue**: Can't track where registrations/verifications fail
- **Fix**: Added detailed logs to all auth routes:
  - `[Register]` - tracks user creation and email send
  - `[Resend Verification]` - tracks token generation and email send
  - `[Forgot Password]` - tracks user lookup and email send
  - `[Verify Email]` - tracks token validation and email verification
  - `[Email Send API]` - tracks admin email sending

---

## Environment Variables Required

```bash
# SMTP Configuration (add to your .env.local or Vercel environment)
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Next Auth Configuration
NEXTAUTH_URL=http://localhost:3000  # Use https in production

# Optional: Vercel deployment URL
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## How to Debug Email Issues

### 1. **Check SMTP Configuration on Startup**
Look for this log when server starts:
```
[SMTP Config Check] { 
  host: '✓', 
  port: 587, 
  user: '✓', 
  pass: '✓' 
}
```

If any show `✗ MISSING`, add the missing environment variable.

### 2. **Monitor Registration Emails**
Register a test user and check logs:
```
[Register] Request received
[Register] JSON parsed
[Register] Validating input schema
[Register] Connecting to database
[Register] Generating verification token
[Register] Creating user in database
[Register] ✓ User created
[Register] Sending verification email
[Verification Email] Preparing to send
[SMTP Config Check] - Verifying SMTP credentials
[Email] Attempting to send email
[Email] ✓ Email sent successfully (with messageId)
[Register] ✓ Verification email sent
[Register] ✓ Registration successful
```

### 3. **Monitor Password Reset Emails**
Trigger forgot-password and check logs:
```
[Forgot Password] Request received
[Forgot Password] Searching for user
[Forgot Password] User found
[Forgot Password] Generating reset token
[Forgot Password] ✓ Reset token saved to database
[Forgot Password] Sending password reset email
[Password Reset Email] Preparing to send
[Email] Attempting to send email
[Email] ✓ Email sent successfully
[Forgot Password] ✓ Password reset email sent
```

### 4. **Email Send API Logging**
Admin sending bulk/single emails:
```
[Email Send API] Request received
[Email Send API] Checking admin authorization
[Email Send API] ✓ User is admin
[Email Send API] Request payload
[Email Send API] Sending bulk emails to X recipients
[Email] Attempting to send email (for each recipient)
[Email] ✓ Email sent successfully (for each recipient)
[Email Send API] ✓ Bulk send complete
```

---

## Common Issues & Solutions

### Issue: SMTP credentials not set
**Solution**: 
```bash
# 1. Verify environment variables are set
echo $SMTP_HOST
echo $SMTP_USER

# 2. For Gmail, use App Password (not your actual password)
# 3. Check Vercel Settings > Environment Variables
```

### Issue: Emails fail with "secure: false"
**Solution**:
- Port 465 requires `secure: true` (SSL)
- Port 587 requires `secure: false` (TLS)
- The code now auto-detects this based on port

### Issue: NEXTAUTH_URL is missing
**Look for logs**:
```
[Verification Email] nextAuthUrl: '✗ MISSING'
```
**Solution**: Set `NEXTAUTH_URL` in environment:
```bash
NEXTAUTH_URL=http://localhost:3000  # development
NEXTAUTH_URL=https://yourdomain.com  # production
```

### Issue: Email send succeeds but user doesn't receive it
**Potential causes**:
1. Incorrect sender email (check SMTP_USER)
2. Verification URL is malformed (check NEXTAUTH_URL in logs)
3. Email marked as spam (check email provider's spam folder)
4. Email provider rate limiting (check error logs for details)

---

## Log Monitoring Commands

### View all email-related logs
```bash
# If using pm2
pm2 logs | grep "\[Email\]\|\[Register\]\|\[Verification\]"

# If using docker
docker logs -f container_name | grep "\[Email\]\|\[Register\]\|\[Verification\]"

# If running locally with npm
npm run dev 2>&1 | grep "\[Email\]\|\[Register\]\|\[Verification\]"
```

### View server logs on Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click on the deployment
5. Scroll to "Function Logs"
6. Search for `[Email]`, `[Register]`, etc.

---

## Email Testing Steps

1. **Test SMTP Connection**
```javascript
// Create a test script
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const info = await transporter.verify();
console.log('SMTP Connection valid:', info);
```

2. **Test Registration Flow**
- Create a test user account
- Check console logs for `[Register]` and `[Email]` entries
- Verify email arrives in inbox

3. **Test Password Reset**
- Click "Forgot Password"
- Check console logs for `[Forgot Password]` entries
- Verify reset email arrives

4. **Test Email API (Admin)**
- Send test email via admin panel
- Check `[Email Send API]` logs
- Verify email delivery

---

## Next Steps

1. **Check Vercel Function Logs** for email send errors
2. **Verify SMTP Provider** (Gmail, SendGrid, AWS SES, etc.)
3. **Test with Different Recipients** (multiple email providers)
4. **Check Email Provider's Dashboard** for bounces/rejections
5. **Review NEXTAUTH_URL** in verification email links (verify they're correct)

---

## Files Modified
- `/src/lib/emails.ts` - Core email service with SMTP logging
- `/src/lib/email/sendVerificationEmail.ts` - Registration email logging
- `/src/lib/email/sendPasswordResetEmail.ts` - Password reset email logging
- `/src/app/api/auth/register/route.ts` - Registration flow logging
- `/src/app/api/auth/resend-verification/route.ts` - Resend verification logging
- `/src/app/api/auth/forgot-password/route.ts` - Forgot password flow logging
- `/src/app/api/auth/verify-email/route.ts` - Email verification logging
- `/src/app/api/notifications/email/send/route.ts` - Admin email API logging
