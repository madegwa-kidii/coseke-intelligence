import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import cloudinary from '@/lib/cloudinary';
import { Media } from '@/models';
import { connectToDatabase } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicId, resourceType } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: 'No publicId provided' },
        { status: 400 }
      );
    }

    // Verify ownership - check if media belongs to the user
    await connectToDatabase();
    const mediaRecord = await Media.findOne({
      publicId: publicId,
      userId: session.user.id,
    });

    if (!mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || mediaRecord.resourceType,
    });

    // Delete from database
    await Media.deleteOne({ publicId: publicId, userId: session.user.id });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
