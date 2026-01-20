import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { NotificationPreferences } from '@/lib/types';

// GET - Fetch user's notification preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Default preferences if not set
    const defaultPreferences: NotificationPreferences = {
      dailySpecials: true,
      eventsAnnouncements: true,
      feedbackReplies: true,
    };

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        preferences: user.notificationPreferences || defaultPreferences,
      },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update user's notification preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences required' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    const validKeys = ['dailySpecials', 'eventsAnnouncements', 'feedbackReplies'];
    const sanitizedPreferences: Partial<NotificationPreferences> = {};

    for (const key of validKeys) {
      if (key in preferences && typeof preferences[key] === 'boolean') {
        sanitizedPreferences[key as keyof NotificationPreferences] = preferences[key];
      }
    }

    const { db } = await connectToDatabase();

    // Update user preferences
    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          notificationPreferences: sanitizedPreferences,
          updatedAt: new Date(),
        },
      }
    );

    // Also update subscribers collection to keep in sync
    await db.collection('subscribers').updateOne(
      { email: session.user.email },
      {
        $set: {
          preferences: sanitizedPreferences,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
