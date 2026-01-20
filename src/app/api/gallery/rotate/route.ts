import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { put, del } from '@vercel/blob';
import { ObjectId } from 'mongodb';

interface GalleryImage {
  _id: ObjectId;
  url: string;
  alt: string;
  category: 'food' | 'interior' | 'team' | 'exterior';
  order: number;
  createdAt: Date;
}

// POST - Replace image with rotated version
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const imageId = formData.get('imageId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(imageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image ID format' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find the image to update
    const existingImage = await db.collection<GalleryImage>('gallery').findOne({
      _id: new ObjectId(imageId)
    });

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const oldUrl = existingImage.url;

    // Generate new filename for rotated image
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `gallery/${Date.now()}-rotated-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload new rotated image to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update MongoDB with new URL
    const result = await db.collection<GalleryImage>('gallery').findOneAndUpdate(
      { _id: new ObjectId(imageId) },
      { $set: { url: blob.url } },
      { returnDocument: 'after' }
    );

    if (!result) {
      // Clean up the newly uploaded blob
      try {
        await del(blob.url);
      } catch (e) {
        console.error('Failed to clean up new blob after update failure:', e);
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update image' },
        { status: 500 }
      );
    }

    // Delete old image blob after successful update
    try {
      await del(oldUrl);
    } catch (e) {
      console.error('Failed to delete old image blob:', e);
      // Don't fail the request - the rotation succeeded
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result._id.toString(),
        url: result.url,
        alt: result.alt,
        category: result.category,
        order: result.order,
        createdAt: result.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Rotate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rotate image' },
      { status: 500 }
    );
  }
}
