import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { authOptions } from '@/lib/auth-config';

console.log('[send-push] Route initialized');

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  console.log('[send-push] Configuring web-push...');
  webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:support@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
  );
  console.log('[send-push] web-push configured');
} else {
  console.warn('[send-push] VAPID keys missing during startup');
}

export async function POST(req: NextRequest) {
  console.log('\n====================');
  console.log('[send-push] POST request received');

  try {
    // Verify user is authenticated (admin check can be added here)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('[send-push] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[send-push] Parsing request body...');

    const body = await req.json();

    console.log('[send-push] Body:', JSON.stringify(body, null, 2));

    const {
      title,
      body: messageBody,
      icon,
      badge,
      userEmails,
    } = body;

    console.log('[send-push] Parsed values');
    console.log({
      title,
      messageBody,
      icon,
      badge,
      userEmailsCount: userEmails?.length || 0,
    });

    if (!title || !messageBody) {
      console.error('[send-push] Validation failed');
      console.error({
        hasTitle: !!title,
        hasBody: !!messageBody,
      });

      return NextResponse.json(
          {
            message: 'Missing required fields: title, body',
          },
          { status: 400 }
      );
    }

    console.log('[send-push] Validation passed');

    console.log('[send-push] Environment check');

    console.log({
      VAPID_PUBLIC_KEY_EXISTS: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY_EXISTS: !!process.env.VAPID_PRIVATE_KEY,
      VAPID_EMAIL: process.env.VAPID_EMAIL,
      PUBLIC_KEY_LENGTH: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length,
      PRIVATE_KEY_LENGTH: process.env.VAPID_PRIVATE_KEY?.length,
    });

    if (
        !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        !process.env.VAPID_PRIVATE_KEY
    ) {
      console.error('[send-push] Missing VAPID configuration');

      return NextResponse.json(
          {
            success: false,
            message: 'VAPID keys are missing',
          },
          { status: 500 }
      );
    }

    console.log('[send-push] Creating notification payload');

    const notificationPayload = {
      title,
      body: messageBody,
      icon: icon || '/android-chrome-192x192.png',
      badge: badge || '/android-chrome-192x192.png',
      tag: 'notification',
      requireInteraction: false,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
      },
    };

    console.log(
        '[send-push] Payload:',
        JSON.stringify(notificationPayload, null, 2)
    );

    // Connect to database and send notifications
    await connectToDatabase();

    // Build query - either send to specific users or all users
    let query: any = {};
    if (userEmails && userEmails.length > 0) {
      query.email = { $in: userEmails };
    }

    console.log('[send-push] Querying users with subscriptions...');
    const users = await User.find({
      ...query,
      pushSubscriptions: { $exists: true, $ne: [] },
    });

    console.log(`[send-push] Found ${users.length} users with subscriptions`);

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Send notification to each subscription
    for (const user of users) {
      if (!user.pushSubscriptions) continue;

      for (const subscription of user.pushSubscriptions) {
        try {
          console.log(`[send-push] Sending to ${user.email}...`);
          
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            JSON.stringify(notificationPayload)
          );
          successCount++;
        } catch (error: any) {
          failureCount++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[send-push] Failed to send to ${user.email}: ${errorMsg}`);
          
          // If 410 Gone, remove the subscription
          if (error.statusCode === 410) {
            console.log(`[send-push] Removing invalid subscription for ${user.email}`);
            user.pushSubscriptions = user.pushSubscriptions.filter(
              (sub: any) => sub.endpoint !== subscription.endpoint
            );
            await user.save();
          }
          
          errors.push(errorMsg);
        }
      }
    }

    console.log('[send-push] Sending complete');
    console.log({
      successCount,
      failureCount,
    });

    return NextResponse.json({
      success: true,
      message: 'Push notifications processed',
      stats: {
        sent: successCount,
        failed: failureCount,
        totalUsers: users.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('================================');
    console.error('[send-push] ERROR');
    console.error('Type:', error?.constructor?.name);

    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:\n', error.stack);
    } else {
      console.error(error);
    }

    return NextResponse.json(
        {
          success: false,
          message:
              error instanceof Error
                  ? error.message
                  : 'Unknown error',
        },
        { status: 500 }
    );
  } finally {
    console.log('[send-push] Request finished');
    console.log('====================\n');
  }
}
