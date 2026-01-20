import { put, list, del } from '@vercel/blob';

// Blob paths for different data types
const BLOB_PATHS = {
  menu: 'data/menu.json',
  gallery: 'data/gallery.json',
  feedback: 'data/feedback.json',
} as const;

type BlobDataType = keyof typeof BLOB_PATHS;

/**
 * Fetch JSON data from Vercel Blob
 * Returns null if the blob doesn't exist
 */
export async function getBlobData<T>(type: BlobDataType): Promise<T | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    
    if (blobs.length === 0) {
      return null;
    }

    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching ${type} from blob:`, error);
    return null;
  }
}

/**
 * Save JSON data to Vercel Blob
 * Overwrites existing data
 */
export async function setBlobData<T>(type: BlobDataType, data: T): Promise<boolean> {
  try {
    // Delete existing blob first (Vercel Blob doesn't overwrite by path alone)
    await deleteBlobData(type);

    // Upload new data
    await put(BLOB_PATHS[type], JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return true;
  } catch (error) {
    console.error(`Error saving ${type} to blob:`, error);
    return false;
  }
}

/**
 * Delete blob data
 */
export async function deleteBlobData(type: BlobDataType): Promise<boolean> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    
    for (const blob of blobs) {
      await del(blob.url);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting ${type} from blob:`, error);
    return false;
  }
}

/**
 * Check if blob data exists
 */
export async function blobDataExists(type: BlobDataType): Promise<boolean> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    return blobs.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the public URL for a blob type
 */
export async function getBlobUrl(type: BlobDataType): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    return blobs.length > 0 ? blobs[0].url : null;
  } catch {
    return null;
  }
}
