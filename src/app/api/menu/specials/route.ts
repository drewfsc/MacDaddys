import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { DailySpecial, SpecialsData, MenuData } from '@/lib/types';

// Helper to get specials data with migration from menu blob
async function getSpecialsData(): Promise<SpecialsData | null> {
  // First try the dedicated specials blob
  let specials = await getBlobData<SpecialsData>('specials');

  if (specials) {
    return specials;
  }

  // Fall back to menu.specials for backwards compatibility
  const menu = await getBlobData<MenuData>('menu');
  if (menu?.specials?.daily) {
    // Migrate data to dedicated specials blob
    const migratedData: SpecialsData = {
      lastUpdated: new Date().toISOString(),
      daily: menu.specials.daily,
    };
    await setBlobData('specials', migratedData);
    return migratedData;
  }

  // No specials data found, return empty structure
  return {
    lastUpdated: new Date().toISOString(),
    daily: [],
  };
}

// GET - Fetch all daily specials
export async function GET() {
  try {
    const specials = await getSpecialsData();

    return NextResponse.json({
      success: true,
      data: specials?.daily || []
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

    const specials = await getSpecialsData();

    if (!specials) {
      return NextResponse.json(
        { success: false, error: 'Failed to load specials data' },
        { status: 500 }
      );
    }

    // Check if special for this day already exists
    const existingIndex = specials.daily.findIndex(
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

    specials.daily.push(newSpecial);
    specials.lastUpdated = new Date().toISOString();

    const saved = await setBlobData('specials', specials);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save special' },
        { status: 500 }
      );
    }

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

    const specials = await getSpecialsData();

    if (!specials) {
      return NextResponse.json(
        { success: false, error: 'Failed to load specials data' },
        { status: 500 }
      );
    }

    const specialIndex = specials.daily.findIndex(
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
      specials.daily[specialIndex].name = updates.name;
    }
    if (updates.description !== undefined) {
      specials.daily[specialIndex].description = updates.description;
    }
    if (updates.price !== undefined) {
      specials.daily[specialIndex].price = Number(updates.price);
    }
    if (updates.active !== undefined) {
      specials.daily[specialIndex].active = updates.active;
    }

    specials.lastUpdated = new Date().toISOString();

    const saved = await setBlobData('specials', specials);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save changes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: specials.daily[specialIndex] });
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

    const specials = await getSpecialsData();

    if (!specials) {
      return NextResponse.json(
        { success: false, error: 'Failed to load specials data' },
        { status: 500 }
      );
    }

    specials.daily = specials.daily.filter(
      (s) => s.day.toLowerCase() !== day.toLowerCase()
    );

    specials.lastUpdated = new Date().toISOString();

    const saved = await setBlobData('specials', specials);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save changes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting special:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete special' },
      { status: 500 }
    );
  }
}
