import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import menuDataJson from '@/data/menu.json';
import { MenuData, SpecialsData } from '@/lib/types';

// GET - Fetch entire menu
export async function GET() {
  try {
    // Try to get menu from Vercel Blob
    let menu = await getBlobData<MenuData>('menu');

    // If no menu in blob, seed it from the JSON file
    if (!menu) {
      const seedData: MenuData = {
        lastUpdated: new Date().toISOString(),
        categories: menuDataJson.categories.map((cat, index) => ({
          ...cat,
          order: index,
          items: cat.items.map(item => ({
            ...item,
            available: true,
          })),
        })),
        specials: {
          daily: menuDataJson.specials.daily.map(special => ({
            ...special,
            active: true,
          })),
        },
        notices: menuDataJson.notices,
      };

      await setBlobData('menu', seedData);
      menu = seedData;
    }

    // Get specials from dedicated specials blob (takes precedence over menu.specials)
    const specialsData = await getBlobData<SpecialsData>('specials');
    if (specialsData?.daily) {
      menu = {
        ...menu,
        specials: {
          daily: specialsData.daily,
        },
      };
    }

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// PUT - Update entire menu (mainly for reordering categories)
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const menuData = {
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    const success = await setBlobData('menu', menuData);

    if (!success) {
      throw new Error('Failed to save menu');
    }

    return NextResponse.json({ success: true, data: menuData });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}
