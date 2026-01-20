import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { DailySpecial, MenuData } from '@/lib/types';

// GET - Fetch all daily specials
export async function GET() {
  try {
    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ 
      success: true, 
      data: menu.specials?.daily || [] 
    });
  } catch (error) {
    console.error('Error fetching specials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch specials' },
      { status: 500 }
    );
  }
}

// POST - Add a new daily special
export async function POST(request: Request) {
  try {
    const special: DailySpecial = await request.json();

    // Validate required fields
    if (!special.day || !special.name || special.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: day, name, price' },
        { status: 400 }
      );
    }

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    // Check if special for this day already exists
    const existingSpecials = menu.specials?.daily || [];
    const existingIndex = existingSpecials.findIndex(
      (s) => s.day.toLowerCase() === special.day.toLowerCase()
    );

    if (existingIndex >= 0) {
      return NextResponse.json(
        { success: false, error: `A special for ${special.day} already exists` },
        { status: 400 }
      );
    }

    const newSpecial: DailySpecial = {
      day: special.day,
      name: special.name,
      description: special.description || '',
      price: Number(special.price),
      active: special.active !== false,
    };

    // Ensure specials structure exists
    if (!menu.specials) {
      menu.specials = { daily: [] };
    }
    if (!menu.specials.daily) {
      menu.specials.daily = [];
    }

    menu.specials.daily.push(newSpecial);
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: newSpecial });
  } catch (error) {
    console.error('Error adding special:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add special' },
      { status: 500 }
    );
  }
}

// PUT - Update a daily special
export async function PUT(request: Request) {
  try {
    const { day, updates } = await request.json();

    if (!day) {
      return NextResponse.json(
        { success: false, error: 'Day is required' },
        { status: 400 }
      );
    }

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    const specials = menu.specials?.daily || [];
    const specialIndex = specials.findIndex(
      (s) => s.day.toLowerCase() === day.toLowerCase()
    );

    if (specialIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Special not found' },
        { status: 404 }
      );
    }

    // Update the special
    if (updates.name !== undefined) {
      menu.specials!.daily[specialIndex].name = updates.name;
    }
    if (updates.description !== undefined) {
      menu.specials!.daily[specialIndex].description = updates.description;
    }
    if (updates.price !== undefined) {
      menu.specials!.daily[specialIndex].price = Number(updates.price);
    }
    if (updates.active !== undefined) {
      menu.specials!.daily[specialIndex].active = updates.active;
    }

    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: menu.specials!.daily[specialIndex] });
  } catch (error) {
    console.error('Error updating special:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update special' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a daily special
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');

    if (!day) {
      return NextResponse.json(
        { success: false, error: 'Day is required' },
        { status: 400 }
      );
    }

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    if (menu.specials?.daily) {
      menu.specials.daily = menu.specials.daily.filter(
        (s) => s.day.toLowerCase() !== day.toLowerCase()
      );
    }

    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting special:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete special' },
      { status: 500 }
    );
  }
}
