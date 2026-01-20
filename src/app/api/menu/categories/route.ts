import { NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { MenuCategory, MenuData } from '@/lib/types';

// POST - Add new category
export async function POST(request: Request) {
  try {
    const category: MenuCategory = await request.json();

    // Generate ID if not provided
    if (!category.id) {
      category.id = category.name.toLowerCase().replace(/\s+/g, '-');
    }

    const menu = await getBlobData<MenuData>('menu');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }

    const newOrder = menu.categories?.length || 0;
    const newCategory = {
      ...category,
      order: newOrder,
      items: category.items || [],
    };

    menu.categories = [...(menu.categories || []), newCategory];
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: Request) {
  try {
    const { categoryId, updates } = await request.json();

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

    menu.categories[categoryIndex] = { ...menu.categories[categoryIndex], ...updates };
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true, data: menu.categories[categoryIndex] });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Remove category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID required' },
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

    menu.categories = menu.categories?.filter(
      (c) => c.id !== categoryId
    ) || [];
    menu.lastUpdated = new Date().toISOString();

    await setBlobData('menu', menu);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
