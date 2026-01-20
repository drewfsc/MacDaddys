import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

type UnsubscribeType = 'all' | 'dailySpecials' | 'eventsAnnouncements' | 'feedbackReplies';

// GET - Handle unsubscribe via link click (redirects to unsubscribe page)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = (searchParams.get('type') as UnsubscribeType) || 'all';

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=invalid', request.url));
  }

  try {
    const { db } = await connectToDatabase();

    // Find user or subscriber by unsubscribe token
    const user = await db.collection('users').findOne({ unsubscribeToken: token });
    const subscriber = await db.collection('subscribers').findOne({ unsubscribeToken: token });

    if (!user && !subscriber) {
      return NextResponse.redirect(new URL('/unsubscribe?error=invalid', request.url));
    }

    // Determine what preferences to update
    let preferencesUpdate: Record<string, boolean>;
    if (type === 'all') {
      preferencesUpdate = {
        dailySpecials: false,
        eventsAnnouncements: false,
        feedbackReplies: false,
      };
    } else {
      preferencesUpdate = { [type]: false };
    }

    // Update user preferences if user exists
    if (user) {
      await db.collection('users').updateOne(
        { unsubscribeToken: token },
        {
          $set: {
            [`notificationPreferences.${type === 'all' ? 'dailySpecials' : type}`]: false,
            ...(type === 'all' && {
              'notificationPreferences.eventsAnnouncements': false,
              'notificationPreferences.feedbackReplies': false,
            }),
            updatedAt: new Date(),
          },
        }
      );
    }

    // Update subscriber preferences if subscriber exists
    if (subscriber) {
      await db.collection('subscribers').updateOne(
        { unsubscribeToken: token },
        {
          $set: {
            [`preferences.${type === 'all' ? 'dailySpecials' : type}`]: false,
            ...(type === 'all' && {
              'preferences.eventsAnnouncements': false,
              'preferences.feedbackReplies': false,
            }),
            unsubscribedAt: new Date(),
          },
        }
      );
    }

    // Redirect to success page
    const successUrl = new URL('/unsubscribe', request.url);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('type', type);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.redirect(new URL('/unsubscribe?error=server', request.url));
  }
}

// POST - Handle unsubscribe via form submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, type = 'all' } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find user or subscriber by unsubscribe token
    const user = await db.collection('users').findOne({ unsubscribeToken: token });
    const subscriber = await db.collection('subscribers').findOne({ unsubscribeToken: token });

    if (!user && !subscriber) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 404 }
      );
    }

    // Update user preferences if user exists
    if (user) {
      const updates: Record<string, boolean | Date> = { updatedAt: new Date() };
      if (type === 'all') {
        updates['notificationPreferences.dailySpecials'] = false;
        updates['notificationPreferences.eventsAnnouncements'] = false;
        updates['notificationPreferences.feedbackReplies'] = false;
      } else {
        updates[`notificationPreferences.${type}`] = false;
      }

      await db.collection('users').updateOne(
        { unsubscribeToken: token },
        { $set: updates }
      );
    }

    // Update subscriber preferences if subscriber exists
    if (subscriber) {
      const updates: Record<string, boolean | Date> = { unsubscribedAt: new Date() };
      if (type === 'all') {
        updates['preferences.dailySpecials'] = false;
        updates['preferences.eventsAnnouncements'] = false;
        updates['preferences.feedbackReplies'] = false;
      } else {
        updates[`preferences.${type}`] = false;
      }

      await db.collection('subscribers').updateOne(
        { unsubscribeToken: token },
        { $set: updates }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
