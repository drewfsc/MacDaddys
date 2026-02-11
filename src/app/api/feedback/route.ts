import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { Feedback } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface FeedbackData {
  items: (Feedback & { id: string })[];
  lastUpdated: string;
}

// GET - Fetch all feedback (admin)
export async function GET(request: Request) {
  try {
    const feedbackData = await getBlobData<FeedbackData>('feedback');
    const { searchParams } = new URL(request.url);

    if (!feedbackData) {
      return NextResponse.json({ success: true, data: [] });
    }

    let items = [...feedbackData.items];

    // Filter options
    const archived = searchParams.get('archived');
    const read = searchParams.get('read');
    const type = searchParams.get('type');

    if (archived !== null) {
      items = items.filter((f) => f.archived === (archived === 'true'));
    } else {
      // By default, don't show archived
      items = items.filter((f) => !f.archived);
    }

    if (read !== null) {
      items = items.filter((f) => f.read === (read === 'true'));
    }

    if (type) {
      items = items.filter((f) => f.type === type);
    }

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Map to include _id for compatibility
    const mappedItems = items.map((item) => ({
      ...item,
      _id: item.id,
    }));

    return NextResponse.json({ success: true, data: mappedItems });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST - Submit new feedback (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const feedbackData = await getBlobData<FeedbackData>('feedback') || { items: [], lastUpdated: '' };

    const newFeedback = {
      id: uuidv4(),
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      type: body.type || 'other',
      message: body.message,
      rating: body.rating || undefined,
      visitDate: body.visitDate || undefined,
      createdAt: new Date().toISOString(),
      read: false,
      replied: false,
      archived: false,
    };

    feedbackData.items.push(newFeedback);
    feedbackData.lastUpdated = new Date().toISOString();

    await setBlobData('feedback', feedbackData);

    return NextResponse.json({
      success: true,
      data: { id: newFeedback.id },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// PUT - Update feedback (mark read, reply, archive)
export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID required' },
        { status: 400 }
      );
    }

    const feedbackData = await getBlobData<FeedbackData>('feedback');

    if (!feedbackData) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    const itemIndex = feedbackData.items.findIndex((f) => f.id === id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Handle reply
    if (updates.replyMessage) {
      updates.replied = true;
      updates.repliedAt = new Date().toISOString();
    }

    feedbackData.items[itemIndex] = {
      ...feedbackData.items[itemIndex],
      ...updates,
    };
    feedbackData.lastUpdated = new Date().toISOString();

    await setBlobData('feedback', feedbackData);

    return NextResponse.json({ success: true, data: feedbackData.items[itemIndex] });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete feedback
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID required' },
        { status: 400 }
      );
    }

    const feedbackData = await getBlobData<FeedbackData>('feedback');

    if (!feedbackData) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    feedbackData.items = feedbackData.items.filter((f) => f.id !== id);
    feedbackData.lastUpdated = new Date().toISOString();

    await setBlobData('feedback', feedbackData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
