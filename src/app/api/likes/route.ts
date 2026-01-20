import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET - Get likes for menu items (can be public or filtered by user)
export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');

    // Get like counts for all items or specific item
    const matchStage: Record<string, unknown> = {};
    if (itemId) {
      matchStage.itemId = itemId;
    }

    // Get aggregated counts
    const likeCounts = await db.collection('likes').aggregate([
      { $match: matchStage },
      { $group: { _id: '$itemId', count: { $sum: 1 } } },
    ]).toArray();

    // If user is specified, get their likes
    let userLikes: string[] = [];
    if (userId) {
      const likes = await db.collection('likes')
        .find({ userId })
        .toArray();
      userLikes = likes.map((like) => like.itemId);
    }

    // Format response
    const countsMap: Record<string, number> = {};
    likeCounts.forEach((item) => {
      countsMap[item._id] = item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: countsMap,
        userLikes,
      },
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

// POST - Toggle like (add or remove)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Must be logged in to like items' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const { itemId, categoryId } = await request.json();

    if (!itemId || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Item ID and Category ID required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userName = session.user.name || 'Anonymous';
    const userImage = session.user.image || null;

    // Check if already liked
    const existingLike = await db.collection('likes').findOne({
      userId,
      itemId,
    });

    if (existingLike) {
      // Unlike - remove the like
      await db.collection('likes').deleteOne({ _id: existingLike._id });

      return NextResponse.json({
        success: true,
        action: 'unliked',
        data: { itemId },
      });
    } else {
      // Like - add new like
      await db.collection('likes').insertOne({
        userId,
        userName,
        userImage,
        itemId,
        categoryId,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        action: 'liked',
        data: { itemId },
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET recent likers for an item (for social proof)
export async function PUT(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID required' },
        { status: 400 }
      );
    }

    // Get recent likers with their profile info
    const recentLikers = await db.collection('likes')
      .find({ itemId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      success: true,
      data: recentLikers.map((like) => ({
        name: like.userName,
        image: like.userImage,
      })),
    });
  } catch (error) {
    console.error('Error fetching likers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likers' },
      { status: 500 }
    );
  }
}
