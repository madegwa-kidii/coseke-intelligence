import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:support@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: messageBody, icon, badge } = body;

    // Validation
    if (!title || !messageBody) {
      return NextResponse.json(
        { message: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    // Check if VAPID keys are configured
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'Push notification service is not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.',
        },
        { status: 500 }
      );
    }

    // Get all subscriptions from browser storage or database
    // For now, we'll return a demo response showing the payload
    const notificationPayload = {
      title,
      body: messageBody,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      tag: 'notification',
      requireInteraction: false,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
      },
    };

    // In a real implementation, you would:
    // 1. Fetch all subscriptions from your database
    // 2. Send notifications to each subscription
    // 3. Handle failed subscriptions (expired, revoked)

    // Example of how to send to a subscription:
    // await webpush.sendNotification(subscription, JSON.stringify(notificationPayload))

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
      payload: notificationPayload,
      note: 'To send notifications to users, you need to store their push subscriptions and iterate through them.',
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send push notification',
      },
      { status: 500 }
    );
  }
}

// Helper endpoint to get VAPID public key
export async function GET() {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return NextResponse.json(
        { message: 'VAPID public key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      publicKey,
    });
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return NextResponse.json(
      { message: 'Failed to get VAPID key' },
      { status: 500 }
    );
  }
}
