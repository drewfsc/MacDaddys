import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { MenuItem, MenuData } from '@/lib/types';

// POST - Add new item to category
export async function POST(request: Request) {
  try {
    const { categoryId, item }: { categoryId: string; item: MenuItem } = await request.json();

    // Generate ID if not provided
    if (!item.id) {
      item.id = item.name.toLowerCase().replace(/\s+/g, '-');
    }

    // Set default availability
    if (item.available === undefined) {
      item.available = true;
    }

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    const categoryIndex = menu.categories?.findIndex(
      (c) => c.id === categoryId
    );

    if (categoryIndex === -1 || categoryIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (!menu.categories[categoryIndex].items) {
      menu.categories[categoryIndex].items = [];
    }

    menu.categories[categoryIndex].items.push(item);
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item' },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(request: Request) {
  try {
    const { categoryId, itemId, updates } = await request.json();

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    const categoryIndex = menu.categories?.findIndex(
      (c) => c.id === categoryId
    );

    if (categoryIndex === -1 || categoryIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const itemIndex = menu.categories[categoryIndex].items?.findIndex(
      (i) => i.id === itemId
    );

    if (itemIndex === -1 || itemIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Update the item
    menu.categories[categoryIndex].items[itemIndex] = {
      ...menu.categories[categoryIndex].items[itemIndex],
      ...updates,
    };
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: menu.categories[categoryIndex].items[itemIndex] });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const itemId = searchParams.get('itemId');

    if (!categoryId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Category ID and Item ID required' },
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

    const categoryIndex = menu.categories?.findIndex(
      (c) => c.id === categoryId
    );

    if (categoryIndex === -1 || categoryIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    menu.categories[categoryIndex].items = menu.categories[categoryIndex].items?.filter(
      (i) => i.id !== itemId
    ) || [];
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
