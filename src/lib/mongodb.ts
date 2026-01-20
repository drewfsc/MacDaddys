/**
 * MongoDB connection utility
 *
 * Collections stored in MongoDB:
 * - users (NextAuth user accounts)
 * - accounts (OAuth accounts if any)
 * - sessions (if using database sessions)
 * - verification_tokens (magic link tokens)
 * - subscribers (mailing list)
 * - likes (user likes on menu items)
 * - gallery (gallery image metadata - images stored in Vercel Blob)
 */

import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
