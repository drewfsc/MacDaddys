import { NextRequest, NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { put, del } from '@vercel/blob';

export interface GalleryImage {
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

// GET - Fetch all gallery images
export async function GET() {
  try {
    const gallery = await getBlobData<GalleryData>('gallery');

    if (!gallery) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Sort by order, then by createdAt descending
    const sortedImages = [...(gallery.images || [])].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: sortedImages,
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

// POST - Upload new gallery image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const alt = formData.get('alt') as string || '';
    const category = formData.get('category') as string || 'interior';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Use JPEG, PNG, WebP, or AVIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for gallery)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate filename
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Get existing gallery data
    const gallery = await getBlobData<GalleryData>('gallery') || { images: [], lastUpdated: '' };

    // Calculate next order
    const maxOrder = gallery.images.reduce((max, img) => Math.max(max, img.order || 0), -1);

    // Create new image document
    const imageDoc: GalleryImage = {
      id: `gallery-${Date.now()}`,
      url: blob.url,
      alt: alt || 'Gallery image',
      category: category as GalleryImage['category'],
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };

    gallery.images.push(imageDoc);
    gallery.lastUpdated = new Date().toISOString();

    await setBlobData('gallery', gallery);

    return NextResponse.json({
      success: true,
      data: imageDoc,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// PUT - Update image metadata or reorder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, alt, category, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID required' },
        { status: 400 }
      );
    }

    const gallery = await getBlobData<GalleryData>('gallery');

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    const imageIndex = gallery.images.findIndex((img) => img.id === id);

    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    if (alt !== undefined) gallery.images[imageIndex].alt = alt;
    if (category !== undefined) gallery.images[imageIndex].category = category;
    if (order !== undefined) gallery.images[imageIndex].order = order;

    gallery.lastUpdated = new Date().toISOString();

    await setBlobData('gallery', gallery);

    return NextResponse.json({ success: true, data: gallery.images[imageIndex] });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE - Remove gallery image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID required' },
        { status: 400 }
      );
    }

    const gallery = await getBlobData<GalleryData>('gallery');

    if (!gallery) {
      return NextResponse.json(
        { success: false, error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Find image to delete from blob
    const image = gallery.images.find((img) => img.id === id);
    if (image?.url) {
      try {
        await del(image.url);
      } catch (e) {
        console.error('Error deleting from blob:', e);
      }
    }

    gallery.images = gallery.images.filter((img) => img.id !== id);
    gallery.lastUpdated = new Date().toISOString();

    await setBlobData('gallery', gallery);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
