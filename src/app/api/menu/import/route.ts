import { NextRequest, NextResponse } from 'next/server';
import { getBlobData, setBlobData } from '@/lib/blob-storage';
import { MenuCategory, MenuItem, MenuData } from '@/lib/types';

interface ImportedItem {
  id?: string;
  name: string;
  description?: string;
  price: number | string;
  popular?: boolean | string;
  featured?: boolean | string;
  available?: boolean | string;
  image?: string;
  category?: string; // For CSV flat format
}

interface ImportedCategory {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  items?: ImportedItem[];
}

interface ImportData {
  categories?: ImportedCategory[];
  items?: ImportedItem[]; // For flat CSV format
}

// Parse CSV string to array of objects
function parseCSV(csvString: string): ImportedItem[] {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const items: ImportedItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = values[index]?.trim() || '';
    });

    // Map common header variations
    const mappedItem: ImportedItem = {
      name: item.name || item.item_name || item['item name'] || '',
      description: item.description || item.desc || '',
      price: item.price || '0',
      category: item.category || item.category_name || item['category name'] || '',
      popular: item.popular || item.is_popular || 'false',
      featured: item.featured || item.is_featured || item.signature || 'false',
      available: item.available || item.is_available || 'true',
      image: item.image || item.image_url || item['image url'] || '',
    };

    if (mappedItem.name) {
      items.push(mappedItem);
    }
  }

  return items;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Convert string to boolean
function toBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return false;
}

// Generate ID from name
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert flat items to categorized structure
function itemsToCategories(items: ImportedItem[]): MenuCategory[] {
  const categoryMap = new Map<string, MenuCategory>();

  items.forEach((item) => {
    const categoryName = item.category || 'Uncategorized';
    const categoryId = generateId(categoryName);

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        description: '',
        icon: 'utensils',
        order: categoryMap.size,
        items: [],
      });
    }

    const category = categoryMap.get(categoryId)!;
    const menuItem: MenuItem = {
      id: item.id || generateId(item.name),
      name: item.name,
      description: item.description,
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price,
      popular: toBoolean(item.popular),
      featured: toBoolean(item.featured),
      available: toBoolean(item.available ?? true),
      image: item.image || undefined,
    };

    category.items.push(menuItem);
  });

  return Array.from(categoryMap.values());
}

// Process imported categories
function processCategories(categories: ImportedCategory[]): MenuCategory[] {
  return categories.map((cat, index) => ({
    id: cat.id || generateId(cat.name),
    name: cat.name,
    description: cat.description || '',
    icon: cat.icon || 'utensils',
    order: index,
    items: (cat.items || []).map((item) => ({
      id: item.id || generateId(item.name),
      name: item.name,
      description: item.description,
      price: typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price,
      popular: toBoolean(item.popular),
      featured: toBoolean(item.featured),
      available: toBoolean(item.available ?? true),
      image: item.image || undefined,
    })),
  }));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as string || 'merge'; // 'merge' or 'replace'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const content = await file.text();

    let importedCategories: MenuCategory[] = [];

    // Parse based on file type
    if (fileName.endsWith('.json')) {
      try {
        const data: ImportData = JSON.parse(content);

        if (data.categories && Array.isArray(data.categories)) {
          // Hierarchical JSON format
          importedCategories = processCategories(data.categories);
        } else if (data.items && Array.isArray(data.items)) {
          // Flat JSON format with items array
          importedCategories = itemsToCategories(data.items);
        } else if (Array.isArray(data)) {
          // Direct array - could be categories or items
          const firstItem = data[0];
          if (firstItem && 'items' in firstItem) {
            // Array of categories
            importedCategories = processCategories(data as ImportedCategory[]);
          } else {
            // Array of items
            importedCategories = itemsToCategories(data as ImportedItem[]);
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid JSON structure. Expected { categories: [...] } or { items: [...] }' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON format' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.csv')) {
      const items = parseCSV(content);
      if (items.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid items found in CSV' },
          { status: 400 }
        );
      }
      importedCategories = itemsToCategories(items);
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Use .json or .csv' },
        { status: 400 }
      );
    }

    if (importedCategories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No categories or items found in file' },
        { status: 400 }
      );
    }

    // Get existing menu from blob
    const existingMenu = await getBlobData<MenuData>('menu');

    let finalCategories: MenuCategory[];

    if (mode === 'replace') {
      // Replace all categories
      finalCategories = importedCategories;
    } else {
      // Merge with existing
      const existingCategories = existingMenu?.categories || [];
      const categoryMap = new Map<string, MenuCategory>();

      // Add existing categories first
      existingCategories.forEach((cat: MenuCategory) => {
        categoryMap.set(cat.id, { ...cat });
      });

      // Merge imported categories
      importedCategories.forEach((cat) => {
        if (categoryMap.has(cat.id)) {
          // Merge items into existing category
          const existing = categoryMap.get(cat.id)!;
          const existingItemIds = new Set(existing.items.map((i) => i.id));

          cat.items.forEach((item) => {
            if (existingItemIds.has(item.id)) {
              // Update existing item
              const index = existing.items.findIndex((i) => i.id === item.id);
              existing.items[index] = { ...existing.items[index], ...item };
            } else {
              // Add new item
              existing.items.push(item);
            }
          });

          // Update category metadata if provided
          if (cat.description) existing.description = cat.description;
          if (cat.icon) existing.icon = cat.icon;
        } else {
          // Add new category
          categoryMap.set(cat.id, cat);
        }
      });

      finalCategories = Array.from(categoryMap.values());
    }

    // Build updated menu
    const updatedMenu: MenuData = {
      ...existingMenu,
      categories: finalCategories,
      specials: existingMenu?.specials || { daily: [] },
      notices: existingMenu?.notices || [],
      lastUpdated: new Date().toISOString(),
    };

    // Save to blob
    await setBlobData('menu', updatedMenu);

    // Count stats
    const totalItems = finalCategories.reduce((sum, cat) => sum + cat.items.length, 0);
    const importedItems = importedCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    return NextResponse.json({
      success: true,
      data: {
        categoriesImported: importedCategories.length,
        itemsImported: importedItems,
        totalCategories: finalCategories.length,
        totalItems: totalItems,
        mode,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import menu' },
      { status: 500 }
    );
  }
}

// GET endpoint to download templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  if (format === 'csv') {
    const csvTemplate = `category,name,description,price,popular,featured,available,image
Breakfast,Two Eggs Any Style,Two farm-fresh eggs cooked your way with home fries and toast,8.99,true,false,true,
Breakfast,Buttermilk Pancakes,Stack of three fluffy buttermilk pancakes with butter and maple syrup,9.99,false,false,true,
Burgers,Classic Cheeseburger,1/2 lb beef patty with American cheese lettuce tomato onion & pickles,12.99,true,false,true,
Burgers,The Mac Daddy,Double patty bacon cheddar caramelized onions special sauce,16.99,true,true,true,`;

    return new NextResponse(csvTemplate, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="menu-template.csv"',
      },
    });
  }

  const jsonTemplate = {
    categories: [
      {
        name: 'Breakfast',
        description: 'Served all day - just like the good ol\' days',
        icon: 'sunrise',
        items: [
          {
            name: 'Two Eggs Any Style',
            description: 'Two farm-fresh eggs cooked your way, served with home fries and toast',
            price: 8.99,
            popular: true,
            featured: false,
            available: true,
          },
          {
            name: 'Buttermilk Pancakes',
            description: 'Stack of three fluffy buttermilk pancakes with butter and maple syrup',
            price: 9.99,
            popular: false,
            featured: false,
            available: true,
          },
        ],
      },
      {
        name: 'Burgers & Sandwiches',
        description: 'Hand-pattied fresh daily, never frozen',
        icon: 'burger',
        items: [
          {
            name: 'Classic Cheeseburger',
            description: '1/2 lb beef patty with American cheese, lettuce, tomato, onion & pickles',
            price: 12.99,
            popular: true,
            featured: false,
            available: true,
          },
          {
            name: 'The Mac Daddy',
            description: 'Double patty, bacon, cheddar, caramelized onions, special sauce. Our signature!',
            price: 16.99,
            popular: true,
            featured: true,
            available: true,
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(jsonTemplate, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="menu-template.json"',
    },
  });
}
