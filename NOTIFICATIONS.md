# Notifications System Documentation

This document describes the push notifications and email sending system implemented in Coseke Intelligence.

## Overview

The notifications system allows authenticated users to send two types of messages:

1. **Emails** - Sent via Resend email service
2. **Push Notifications** - Browser push notifications for subscribed users

## Features

### Email Notifications
- Send emails to any recipient
- Customizable subject lines and message content
- HTML-formatted email templates
- Email validation before sending
- Automatic formatting and branding

### Push Notifications
- Send push notifications to subscribed users
- Customizable title and body text
- Optional icon and badge URLs
- Haptic feedback support (vibration)
- Click interaction support

## Setup Instructions

### Prerequisites
- Node.js 16+
- Next.js 16+
- Environment variables configured

### Environment Variables

#### For Email Notifications
```env
RESEND_API_KEY=your_resend_api_key_here
```

Get your Resend API key from: https://resend.com/api-keys

#### For Push Notifications
```env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@example.com
```

Generate VAPID keys using:
```bash
npx web-push generate-vapid-keys
```

### Installation

1. Install dependencies (already included):
   - `resend` - for email sending
   - `web-push` - for push notifications
   - `sonner` - for toast notifications

2. Set up environment variables in `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_EMAIL=support@example.com
   ```

3. The page is accessible at `/notifications` (requires authentication)

## Usage

### Accessing the Notifications Page

Navigate to `/notifications` while logged in. The page has two tabs:

#### Email Tab
1. Enter recipient email address
2. Write the subject line
3. Write the email message
4. Click "Send Email"
5. Toast notification will show success/error

#### Push Notifications Tab
1. Enter notification title
2. Enter notification body/message
3. (Optional) Add icon URL
4. (Optional) Add badge URL
5. Click "Send Push Notification"
6. Toast notification will show success/error

## API Endpoints

### Send Email
**Endpoint:** `POST /api/notifications/send-email`

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Email body content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "email_id_from_resend"
}
```

### Send Push Notification
**Endpoint:** `POST /api/notifications/send-push`

**Request Body:**
```json
{
  "title": "Notification Title",
  "body": "Notification body text",
  "icon": "https://example.com/icon.png",
  "badge": "https://example.com/badge.png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push notification sent successfully",
  "payload": {
    "title": "Notification Title",
    "body": "Notification body text",
    "icon": "https://example.com/icon.png",
    "badge": "https://example.com/badge.png",
    "tag": "notification",
    "requireInteraction": false,
    "vibrate": [100, 50, 100],
    "data": {
      "dateOfArrival": 1690000000000
    }
  }
}
```

### Get VAPID Public Key
**Endpoint:** `GET /api/notifications/send-push`

Returns the VAPID public key needed for client-side push subscription registration.

**Response:**
```json
{
  "publicKey": "your_vapid_public_key"
}
```

## Implementation Details

### Email Service (Resend)
- Uses Resend's official SDK (`resend` package)
- Emails are sent from `onboarding@resend.dev` by default
- HTML templates include email branding
- Validation ensures proper email format
- Error handling provides user-friendly messages

### Push Notification Service (Web Push)
- Uses `web-push` library with VAPID keys
- Notifications include customizable:
  - Title and body text
  - App icon
  - Badge icon
  - Vibration patterns
  - Interaction requirements
- Requires user browser subscription (not implemented in base version)

### Frontend (React/Next.js)
- Tab-based interface for switching between notification types
- Form validation before submission
- Loading states with spinner animation
- Toast notifications for user feedback
- Dark mode support
- Responsive design

### Backend (Next.js API Routes)
- TypeScript with type safety
- Error handling and validation
- Async operations
- Environment variable validation

## Integration with Existing System

The notifications system is integrated with:

1. **Authentication** - ProtectedRoute component ensures only logged-in users can access
2. **UI/UX** - Uses existing Sonner toast notifications
3. **Styling** - Tailwind CSS with dark mode support
4. **Icons** - Lucide React icons

## Future Enhancements

### Recommended Next Steps

1. **Database Integration**
   - Store sent notification history
   - Track user preferences
   - Manage unsubscribe lists

2. **Push Subscription Management**
   - Persist user push subscriptions in database
   - Allow users to opt-in/out of push notifications
   - Send to all subscribed users instead of manual payload

3. **Scheduling**
   - Schedule notifications for future delivery
   - Recurring notification campaigns
   - Time zone handling

4. **Templates**
   - Pre-built email templates
   - Template variables for personalization
   - Preview functionality

5. **Analytics**
   - Track email delivery and opens
   - Monitor push notification engagement
   - User interaction metrics

6. **Admin Dashboard**
   - Bulk sending capabilities
   - Campaign management
   - Performance analytics
   - User segmentation

## Security Considerations

- VAPID keys should be stored securely in environment variables
- Email addresses should be validated
- Rate limiting should be implemented for production
- API endpoints should validate request sources
- Consider IP whitelisting for admin access

## Troubleshooting

### Email Not Sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify recipient email address is valid
3. Check Resend dashboard for delivery status
4. Review browser console for errors

### Push Notifications Not Working
1. Ensure VAPID keys are properly set
2. Verify browser supports push notifications
3. Check browser permissions
4. Test with `GET /api/notifications/send-push` to retrieve public key

### Missing Environment Variables
Add required variables to `.env.local` and restart dev server:
```bash
npm run dev
```

## API Rate Limiting (Not Implemented)

For production, implement rate limiting:
- Per-user limits (e.g., 10 emails/hour)
- Per-IP limits
- Global limits during peak hours

## Testing

### Manual Testing
1. Navigate to `/notifications` while logged in
2. Test Email tab:
   - Send to valid email
   - Try invalid email format
   - Check email delivery
3. Test Push Notifications tab:
   - Verify payload structure
   - Check console for errors

### Test Email Addresses
Use Resend test email: `test@resend.dev`

## Support

For issues or questions:
1. Check the Resend documentation: https://resend.com/docs
2. Review Web Push documentation: https://web.dev/notifications/
3. Check browser console for detailed error messages

## License

This notifications system is part of Coseke Intelligence.
