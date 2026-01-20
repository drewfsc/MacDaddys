import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { put, del } from '@vercel/blob';
import { ObjectId } from 'mongodb';

export interface GalleryImage {
  _id: ObjectId;
  url: string;
  alt: string;
  category: 'food' | 'interior' | 'team' | 'exterior';
  order: number;
  createdAt: Date;
}

// Response format for frontend (with string id)
interface GalleryImageResponse {
  id: string;
  url: string;
  alt: string;
  category: 'food' | 'interior' | 'team' | 'exterior';
  order: number;
  createdAt: string;
}

function formatImageResponse(img: GalleryImage): GalleryImageResponse {
  return {
    id: img._id.toString(),
    url: img.url,
    alt: img.alt,
    category: img.category,
    order: img.order,
    createdAt: img.createdAt.toISOString(),
  };
}

// GET - Fetch all gallery images
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const images = await db.collection<GalleryImage>('gallery')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: images.map(formatImageResponse),
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

    const { db } = await connectToDatabase();

    // Get max order for new images
    const lastImage = await db.collection<GalleryImage>('gallery')
      .findOne({}, { sort: { order: -1 } });
    let maxOrder = lastImage?.order ?? -1;

    // Upload all files and collect results
    const uploadedImages: GalleryImageResponse[] = [];
    const uploadedBlobs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const alt = alts[i];

      try {
        // Generate unique filename
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `gallery/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false,
        });

        uploadedBlobs.push(blob.url);

        // Insert metadata to MongoDB
        maxOrder++;
        const imageDoc = {
          url: blob.url,
          alt: alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Gallery image',
          category: category as GalleryImage['category'],
          order: maxOrder,
          createdAt: new Date(),
        };

        const result = await db.collection('gallery').insertOne(imageDoc);

        uploadedImages.push({
          id: result.insertedId.toString(),
          url: imageDoc.url,
          alt: imageDoc.alt,
          category: imageDoc.category,
          order: imageDoc.order,
          createdAt: imageDoc.createdAt.toISOString(),
        });
      } catch (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'All uploads failed' },
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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (alt !== undefined) updateFields.alt = alt;
    if (category !== undefined) updateFields.category = category;
    if (order !== undefined) updateFields.order = order;

    const result = await db.collection<GalleryImage>('gallery').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatImageResponse(result),
    });
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

    // Validate all ObjectIds
    const validIds = idsToDelete.filter(id => ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid image IDs provided' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const objectIds = validIds.map(id => new ObjectId(id));

    // Find all images to delete (to get blob URLs)
    const imagesToDelete = await db.collection<GalleryImage>('gallery')
      .find({ _id: { $in: objectIds } })
      .toArray();

    // Delete from MongoDB
    const deleteResult = await db.collection('gallery').deleteMany({
      _id: { $in: objectIds }
    });

    // Delete blob files
    for (const image of imagesToDelete) {
      if (image?.url) {
        try {
          await del(image.url);
        } catch (e) {
          console.error('Error deleting from blob:', e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
