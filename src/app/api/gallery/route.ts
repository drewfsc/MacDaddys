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

// POST - Upload new gallery image(s) - supports batch upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get all files from the form data
    const files: File[] = [];
    const alts: string[] = [];

    // Support both single file ('file') and multiple files ('files')
    const singleFile = formData.get('file') as File | null;
    if (singleFile) {
      files.push(singleFile);
      alts.push(formData.get('alt') as string || '');
    }

    // Get all files with 'files' key (for batch upload)
    formData.getAll('files').forEach((f, index) => {
      if (f instanceof File) {
        files.push(f);
        // Get corresponding alt text
        const altTexts = formData.getAll('alts');
        alts.push((altTexts[index] as string) || '');
      }
    });

    const category = formData.get('category') as string || 'interior';

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate all files first
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const maxSize = 10 * 1024 * 1024;

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type for ${file.name}. Use JPEG, PNG, WebP, or AVIF.` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
    }

    // Get existing gallery data ONCE before uploading
    const gallery = await getBlobData<GalleryData>('gallery') || { images: [], lastUpdated: '' };
    let maxOrder = gallery.images.reduce((max, img) => Math.max(max, img.order || 0), -1);

    // Upload all files and collect results
    const uploadedImages: GalleryImage[] = [];
    const uploadedBlobs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const alt = alts[i];

      try {
        // Generate unique filename with index to ensure uniqueness in batch
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `gallery/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false,
        });

        uploadedBlobs.push(blob.url);

        // Create new image document
        maxOrder++;
        const imageDoc: GalleryImage = {
          id: `gallery-${Date.now()}-${i}`,
          url: blob.url,
          alt: alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Gallery image',
          category: category as GalleryImage['category'],
          order: maxOrder,
          createdAt: new Date().toISOString(),
        };

        uploadedImages.push(imageDoc);
      } catch (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        // Continue with other files
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All uploads failed' },
        { status: 500 }
      );
    }

    // Add all uploaded images to gallery and save ONCE
    gallery.images.push(...uploadedImages);
    gallery.lastUpdated = new Date().toISOString();

    const saved = await setBlobData('gallery', gallery);

    if (!saved) {
      // Try to clean up uploaded blobs
      for (const blobUrl of uploadedBlobs) {
        try {
          await del(blobUrl);
        } catch (e) {
          console.error('Failed to clean up blob after save failure:', e);
        }
      }
      return NextResponse.json(
        { success: false, error: 'Failed to save gallery data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages.length === 1 ? uploadedImages[0] : uploadedImages,
      count: uploadedImages.length,
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

// DELETE - Remove gallery image(s)
// Supports single id via query param or multiple ids via JSON body
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');

    let idsToDelete: string[] = [];

    // Check for single ID in query params
    if (singleId) {
      idsToDelete = [singleId];
    } else {
      // Check for multiple IDs in request body
      try {
        const body = await request.json();
        if (body.ids && Array.isArray(body.ids)) {
          idsToDelete = body.ids;
        }
      } catch {
        // No body or invalid JSON
      }
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image ID(s) required' },
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

    const idsSet = new Set(idsToDelete);

    // Find all images to delete from blob storage
    const imagesToDelete = gallery.images.filter((img) => idsSet.has(img.id));

    // Delete all image blobs
    for (const image of imagesToDelete) {
      if (image?.url) {
        try {
          await del(image.url);
        } catch (e) {
          console.error('Error deleting from blob:', e);
        }
      }
    }

    // Remove all deleted images from gallery data in one operation
    gallery.images = gallery.images.filter((img) => !idsSet.has(img.id));
    gallery.lastUpdated = new Date().toISOString();

    await setBlobData('gallery', gallery);

    return NextResponse.json({
      success: true,
      deletedCount: imagesToDelete.length
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
