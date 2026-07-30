import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

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
    console.log('[send-push] Parsing request body...');

    const body = await req.json();

    console.log('[send-push] Body:', JSON.stringify(body, null, 2));

    const {
      title,
      body: messageBody,
      icon,
      badge,
    } = body;

    console.log('[send-push] Parsed values');
    console.log({
      title,
      messageBody,
      icon,
      badge,
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
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
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

    console.log('[send-push] Returning success');

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
      payload: notificationPayload,
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