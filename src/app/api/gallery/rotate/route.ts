import { NextRequest, NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { put, del } from '@vercel/blob';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: 'food' | 'interior' | 'team' | 'exterior';
  order: number;
  createdAt: string;
}

interface GalleryData {
  images: GalleryImage[];
  lastUpdated: string;
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Get existing gallery data
    const gallery = await getBlobData<GalleryData>('gallery');

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Find the image to update
    const imageIndex = gallery.images.findIndex((img) => img.id === imageId);

    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const oldImage = gallery.images[imageIndex];
    const oldUrl = oldImage.url;

    // Generate new filename for rotated image
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `gallery/${Date.now()}-rotated-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload new rotated image to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update gallery data with new URL
    gallery.images[imageIndex] = {
      ...oldImage,
      url: blob.url,
    };
    gallery.lastUpdated = new Date().toISOString();

    const saved = await setBlobData('gallery', gallery);

    if (!saved) {
      // Clean up the newly uploaded blob
      try {
        await del(blob.url);
      } catch (e) {
        console.error('Failed to clean up new blob after save failure:', e);
      }
      return NextResponse.json(
        { success: false, error: 'Failed to save gallery data' },
        { status: 500 }
      );
    }

    // Delete old image blob after successful save
    try {
      await del(oldUrl);
    } catch (e) {
      console.error('Failed to delete old image blob:', e);
      // Don't fail the request - the rotation succeeded
    }

    return NextResponse.json({
      success: true,
      data: gallery.images[imageIndex],
    });
  } catch (error) {
    console.error('Rotate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rotate image' },
      { status: 500 }
    );
  }
}
