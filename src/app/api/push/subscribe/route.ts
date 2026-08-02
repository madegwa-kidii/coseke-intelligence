import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/user';
import { authOptions } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse subscription from request
    const subscription = await req.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user and add subscription
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if subscription already exists
    const exists = user.pushSubscriptions?.some(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (!exists) {
      if (!user.pushSubscriptions) {
        user.pushSubscriptions = [];
      }
      user.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: new Date(),
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to push notifications',
    });
  } catch (error) {
    console.error('[push/subscribe] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to subscribe to push notifications',
      },
      { status: 500 }
    );
  }
}
