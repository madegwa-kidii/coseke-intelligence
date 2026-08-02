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

    if (!subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user and remove subscription
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove subscription by endpoint
    if (user.pushSubscriptions) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        (sub: any) => sub.endpoint !== subscription.endpoint
      );
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from push notifications',
    });
  } catch (error) {
    console.error('[push/unsubscribe] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to unsubscribe from push notifications',
      },
      { status: 500 }
    );
  }
}
