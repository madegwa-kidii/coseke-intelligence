import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Media } from '@/models';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || 'coseke';
    const resourceType = searchParams.get('type') || 'image';
    const maxResults = parseInt(searchParams.get('maxResults') || '100');

    await connectToDatabase();

    // Build filter query
    const filter: any = {
      userId: session.user.id,
      folder: folder,
    };

    // If specific resource type is requested (not 'all')
    if (resourceType !== 'all' && resourceType !== 'image') {
      filter.resourceType = resourceType;
    } else if (resourceType !== 'all') {
      // For 'image' type, include all image-like resources
      filter.resourceType = 'image';
    }

    // Query database for user's media
    const resources = await Media.find(filter)
      .sort({ createdAt: -1 })
      .limit(maxResults)
      .lean();

    // Format response to match Cloudinary format for compatibility
    const formattedResources = resources.map((doc: any) => ({
      public_id: doc.publicId,
      url: doc.url,
      secure_url: doc.secureUrl,
      resource_type: doc.resourceType,
      format: doc.format,
      width: doc.width,
      height: doc.height,
      duration: doc.duration,
      bytes: doc.bytes,
      created_at: doc.createdAt,
    }));

    return NextResponse.json(
      { resources: formattedResources },
      { status: 200 }
    );
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    );
  }
}
