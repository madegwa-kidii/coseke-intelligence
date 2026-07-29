# Notifications System - Usage Examples

## Quick Start

### 1. Access the Notifications Page

Navigate to the notifications page in your browser:
```
http://localhost:3000/notifications
```

Make sure you're logged in first. If not, you'll be redirected to the login page.

## Email Examples

### Example 1: Welcome Email

**Form Inputs:**
- **To:** user@example.com
- **Subject:** Welcome to Coseke Intelligence
- **Message:** 
```
Hello! Welcome to Coseke Intelligence.

We're excited to have you on board. If you have any questions or need assistance, 
please don't hesitate to reach out to our support team.

Best regards,
The Coseke Team
```

**API Call:**
```javascript
const response = await fetch('/api/notifications/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome to Coseke Intelligence',
    message: 'Hello! Welcome to Coseke Intelligence...'
  })
});
const result = await response.json();
console.log(result);
```

### Example 2: Password Reset Email

**Form Inputs:**
- **To:** reset@example.com
- **Subject:** Reset Your Coseke Password
- **Message:**
```
Click here to reset your password: https://coseke.app/reset-password?token=abc123

This link will expire in 24 hours.

If you didn't request this, please ignore this email.
```

### Example 3: Daily Report Email

**Form Inputs:**
- **To:** manager@example.com
- **Subject:** Daily Report - July 29, 2026
- **Message:**
```
Daily Report Summary

Team Performance:
- Tasks Completed: 45
- Active Users: 28
- Total Check-ins: 156

Key Metrics:
- Average Response Time: 2.3s
- System Uptime: 99.98%
- Error Rate: 0.02%

See attached dashboard for details.
```

## Push Notification Examples

### Example 1: New Message Alert

**Form Inputs:**
- **Title:** New Message
- **Body:** John sent you a message
- **Icon:** https://api.example.com/icons/chat.png
- **Badge:** https://api.example.com/badges/message.png

**API Call:**
```javascript
const response = await fetch('/api/notifications/send-push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Message',
    body: 'John sent you a message',
    icon: 'https://api.example.com/icons/chat.png',
    badge: 'https://api.example.com/badges/message.png'
  })
});
const result = await response.json();
console.log(result);
```

### Example 2: Task Assignment Alert

**Form Inputs:**
- **Title:** New Task Assigned
- **Body:** You have been assigned "Complete Q3 Report" by Sarah
- **Icon:** https://api.example.com/icons/task.png
- **Badge:** https://api.example.com/badges/task.png

### Example 3: System Alert

**Form Inputs:**
- **Title:** System Maintenance
- **Body:** Scheduled maintenance tomorrow at 2:00 AM UTC
- **Icon:** https://api.example.com/icons/system.png
- **Badge:** https://api.example.com/badges/alert.png

### Example 4: Reminder Notification

**Form Inputs:**
- **Title:** Reminder
- **Body:** Don't forget to check out at 5:00 PM
- **Icon:** https://api.example.com/icons/clock.png
- **Badge:** https://api.example.com/badges/reminder.png

## JavaScript Integration Examples

### Send Email Programmatically

```javascript
async function sendWelcomeEmail(userEmail, userName) {
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        subject: `Welcome, ${userName}!`,
        message: `Hello ${userName},\n\nWelcome to our platform!\n\nBest regards,\nThe Team`
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Email sent successfully:', data.messageId);
      return true;
    } else {
      console.error('Failed to send email:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Usage
await sendWelcomeEmail('john@example.com', 'John');
```

### Send Push Notification Programmatically

```javascript
async function sendPushNotification(title, message, icon = null, badge = null) {
  try {
    const response = await fetch('/api/notifications/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        body: message,
        icon: icon || '/icon-192x192.png',
        badge: badge || '/badge-72x72.png'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Push notification sent successfully');
      return true;
    } else {
      console.error('Failed to send push:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Usage
await sendPushNotification('New Order', 'Your order #12345 has been confirmed');
```

### Batch Email Sending

```javascript
async function sendBatchEmails(recipients) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.email,
          subject: `Hello ${recipient.name}`,
          message: recipient.customMessage
        })
      });
      
      const data = await response.json();
      results.push({
        email: recipient.email,
        success: data.success,
        messageId: data.messageId
      });
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Usage
const recipients = [
  { email: 'user1@example.com', name: 'User 1', customMessage: 'Hello User 1!' },
  { email: 'user2@example.com', name: 'User 2', customMessage: 'Hello User 2!' }
];
const results = await sendBatchEmails(recipients);
console.log('Batch send results:', results);
```

## React Hook Examples

### useEmail Hook

```javascript
import { useState } from 'react';
import { toast } from 'sonner';

function useEmail() {
  const [loading, setLoading] = useState(false);
  
  const sendEmail = async (to, subject, message) => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Email sent successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to send email');
        return false;
      }
    } catch (error) {
      toast.error('Error sending email');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return { sendEmail, loading };
}

// Usage
export function ContactForm() {
  const { sendEmail, loading } = useEmail();
  const [email, setEmail] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendEmail(email, 'Contact', 'User contacted us');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={loading}>Send</button>
    </form>
  );
}
```

### usePush Hook

```javascript
import { useState } from 'react';
import { toast } from 'sonner';

function usePush() {
  const [loading, setLoading] = useState(false);
  
  const sendPush = async (title, body, icon = null, badge = null) => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, icon, badge })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Push notification sent!');
        return true;
      } else {
        toast.error(data.message || 'Failed to send notification');
        return false;
      }
    } catch (error) {
      toast.error('Error sending notification');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return { sendPush, loading };
}

// Usage
export function NotificationButton() {
  const { sendPush, loading } = usePush();
  
  const handleClick = async () => {
    await sendPush('Hello!', 'This is a test notification');
  };
  
  return (
    <button onClick={handleClick} disabled={loading}>
      Send Notification
    </button>
  );
}
```

## Async/Await Pattern

```javascript
async function processUserSignup(userEmail, userName) {
  try {
    // Send welcome email
    const emailResponse = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        subject: 'Welcome to Coseke!',
        message: `Welcome ${userName}! Your account has been created.`
      })
    });
    
    const emailData = await emailResponse.json();
    if (!emailData.success) {
      throw new Error('Email send failed');
    }
    
    // Send push notification
    const pushResponse = await fetch('/api/notifications/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Welcome!',
        body: `Account created for ${userName}`
      })
    });
    
    const pushData = await pushResponse.json();
    if (!pushData.success) {
      throw new Error('Push notification failed');
    }
    
    console.log('User signup notifications completed');
    return { success: true };
  } catch (error) {
    console.error('Error processing signup:', error);
    return { success: false, error: error.message };
  }
}
```

## Error Handling Examples

```javascript
async function sendEmailWithErrorHandling(to, subject, message) {
  try {
    // Validate input
    if (!to || !subject || !message) {
      throw new Error('Missing required fields');
    }
    
    if (!to.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // Send email
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, message })
    });
    
    // Check HTTP status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check API response
    if (!data.success) {
      throw new Error(data.message || 'Unknown error');
    }
    
    return { success: true, messageId: data.messageId };
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
      return { success: false, error: 'Network error - please try again' };
    } else if (error instanceof SyntaxError) {
      console.error('Parse error:', error);
      return { success: false, error: 'Server error - please try again' };
    } else {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

## Testing Examples

```javascript
// Test email sending
async function testEmailSending() {
  const testCases = [
    {
      name: 'Valid email',
      data: { to: 'test@example.com', subject: 'Test', message: 'Test message' }
    },
    {
      name: 'Invalid email',
      data: { to: 'invalid-email', subject: 'Test', message: 'Test message' }
    },
    {
      name: 'Missing fields',
      data: { to: 'test@example.com', subject: '', message: '' }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      });
      
      const result = await response.json();
      console.log(`${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`${testCase.name}: ERROR`, error);
    }
  }
}

// Run tests
testEmailSending();
```

---

These examples demonstrate various ways to integrate and use the notifications system in your application. Choose the pattern that best fits your needs!
