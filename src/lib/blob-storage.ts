import { put, list, del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

// Blob paths for different data types
// Note: Gallery metadata is now stored in MongoDB, not blob storage
const BLOB_PATHS = {
  menu: 'data/menu.json',
  specials: 'data/specials.json',
  feedback: 'data/feedback.json',
} as const;

type BlobDataType = keyof typeof BLOB_PATHS;

// Check if we're in local dev without blob token
const isLocalDev = !process.env.BLOB_READ_WRITE_TOKEN;

// Local file paths for development fallback
const LOCAL_DATA_DIR = path.join(process.cwd(), 'src', 'data');
const LOCAL_PATHS: Record<BlobDataType, string> = {
  menu: path.join(LOCAL_DATA_DIR, 'menu.json'),
  specials: path.join(LOCAL_DATA_DIR, 'specials.json'),
  feedback: path.join(LOCAL_DATA_DIR, 'feedback.json'),
};

/**
 * Fetch JSON data from Vercel Blob (or local file in dev)
 * Returns null if the blob doesn't exist
 */
export async function getBlobData<T>(type: BlobDataType): Promise<T | null> {
  // Local dev fallback - read from local JSON files
  if (isLocalDev) {
    try {
      const filePath = LOCAL_PATHS[type];
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      // File doesn't exist, return null
      console.log(`[Local Dev] No local ${type} data found`);
      return null;
    }
  }

  // Production: use Vercel Blob
  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    
    if (blobs.length === 0) {
      return null;
    }

    // Add cache-busting to prevent stale data
    const urlWithCacheBust = `${blobs[0].url}?t=${Date.now()}`;
    const response = await fetch(urlWithCacheBust, {
      cache: 'no-store',
    });
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
 * Save JSON data to Vercel Blob (or local file in dev)
 * Overwrites existing data
 */
export async function setBlobData<T>(type: BlobDataType, data: T): Promise<boolean> {
  // Local dev fallback - write to local JSON files
  if (isLocalDev) {
    try {
      const filePath = LOCAL_PATHS[type];
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`[Local Dev] Saved ${type} data to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`[Local Dev] Error saving ${type}:`, error);
      return false;
    }
  }

  // Production: use Vercel Blob
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
  // Local dev fallback - can't really "delete" but we can return empty
  if (isLocalDev) {
    console.log(`[Local Dev] Delete operation for ${type} (no-op in local dev)`);
    return true;
  }

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
  if (isLocalDev) {
    try {
      await fs.access(LOCAL_PATHS[type]);
      return true;
    } catch {
      return false;
    }
  }

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
  if (isLocalDev) {
    // Return a local URL for dev
    return `/api/${type}`;
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATHS[type] });
    return blobs.length > 0 ? blobs[0].url : null;
  } catch {
    return null;
  }
}
