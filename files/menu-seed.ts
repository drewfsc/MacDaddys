// menu-seed.ts
// Run with: npx tsx menu-seed.ts
// Requires: MONGODB_URI in .env

import { MongoClient } from "mongodb";

// --- TYPES ---
interface PriceVariant {
  label: string;
  price: number;
}

interface MenuItem {
  name: string;
  description: string;
  price: number | null; // null when using variants
  priceVariants?: PriceVariant[];
  category: string;
  tags?: string[];
}

interface MenuCategory {
  name: string;
  slug: string;
  displayOrder: number;
  description?: string;
}

// --- CATEGORIES ---
const categories: MenuCategory[] = [
  { name: "Classic Breakfast Combos", slug: "breakfast-combos", displayOrder: 1 },
  { name: "Chef's Omelettes", slug: "omelettes", displayOrder: 2 },
  { name: "Pancakes & Waffles", slug: "pancakes-waffles", displayOrder: 3 },
  { name: "Benedicts", slug: "benedicts", displayOrder: 4 },
  { name: "Lunch Time", slug: "lunch", displayOrder: 5 },
  { name: "Young at Heart", slug: "kids", displayOrder: 6, description: "Kids Menu" },
  { name: "Sides", slug: "sides", displayOrder: 7 },
  { name: "All Day Beverages", slug: "beverages", displayOrder: 8 },
];

// --- MENU ITEMS ---
const menuItems: MenuItem[] = [
  // ========== BREAKFAST COMBOS ==========
  {
    name: "Route 28",
    description:
      "A hearty classic featuring two fresh eggs, your choice of bacon, sausage, or ham, and a generous portion of crisp home fries. Served with toast and a stack of fluffy buttermilk pancakes.",
    price: 15,
    category: "breakfast-combos",
    tags: ["popular", "hearty"],
  },
  {
    name: "Route 6",
    description:
      "Two fresh eggs prepared any style, served with your choice of savory bacon, sausage, or ham. Accompanied by crisp home fries and toast.",
    price: 13,
    category: "breakfast-combos",
  },
  {
    name: "Pit Stop",
    description:
      "A perfect sampler featuring two fluffy buttermilk pancakes, two slices of golden French toast, and two crisp mini waffles. Served sweet with a topping of fresh whipped cream and a dusting of powdered sugar.",
    price: 15,
    category: "breakfast-combos",
    tags: ["sampler", "sweet"],
  },
  {
    name: "Speed Bumps",
    description:
      "Two savory pork sausage links cleverly tucked beneath two fluffy buttermilk pancakes. A quick and delicious breakfast fix.",
    price: 9,
    category: "breakfast-combos",
    tags: ["quick"],
  },
  {
    name: "Breakfast Sandwich",
    description:
      "One egg over medium, topped with cheddar cheese, creamy avocado mash, and your choice of bacon, sausage, or ham. Served hot on a toasted brioche bun.",
    price: 12,
    category: "breakfast-combos",
  },
  {
    name: "Steak & Eggs",
    description:
      "A classic favorite featuring a grilled steak, two fresh eggs prepared to your liking, and a generous portion of crisp home fries. Served with toast.",
    price: 24,
    category: "breakfast-combos",
    tags: ["premium"],
  },

  // ========== OMELETTES ==========
  {
    name: "Western Omelette",
    description:
      "Ham, onion, bell pepper, and cheddar omelette, accompanied by crisp home fries and toast.",
    price: 14,
    category: "omelettes",
  },
  {
    name: "Veggie Omelette",
    description:
      "Onion, bell pepper, mushroom, spinach, tomato, and cheddar omelette, accompanied by crisp home fries and toast.",
    price: 14,
    category: "omelettes",
    tags: ["vegetarian"],
  },
  {
    name: "Three Cheese Omelette",
    description:
      "Cheddar, American, and Swiss omelette, accompanied by crisp home fries and toast.",
    price: 12,
    category: "omelettes",
    tags: ["vegetarian"],
  },

  // ========== PANCAKES & WAFFLES ==========
  {
    name: "Classic Pancakes",
    description:
      "A generous three-stack of our light and fluffy house-made buttermilk pancakes, served golden brown.",
    price: 10,
    category: "pancakes-waffles",
  },
  {
    name: "Waffle",
    description:
      "A light and crispy house waffle, served with your choice of classic butter and syrup or fresh strawberries and whipped cream.",
    price: 13,
    category: "pancakes-waffles",
  },
  {
    name: "Choco Chip Pancakes",
    description:
      "Rich chocolate chips melted into every bite of our three-stack classic pancakes.",
    price: 13,
    category: "pancakes-waffles",
    tags: ["sweet"],
  },
  {
    name: "French Toast",
    description:
      "Three golden slices of our house-made French toast, dusted with powdered sugar and topped with a swirl of fresh whipped cream.",
    price: 13,
    category: "pancakes-waffles",
  },

  // ========== BENEDICTS ==========
  {
    name: "Classic Eggs Benedict",
    description:
      "Two poached eggs and savory Canadian ham on a grilled English muffin and topped with creamy Hollandaise sauce. Served with home fries.",
    price: 14,
    category: "benedicts",
  },
  {
    name: "Irish Benedict",
    description:
      "Two poached eggs and corned beef on a grilled English muffin and topped with creamy Hollandaise sauce. Served with home fries.",
    price: 15,
    category: "benedicts",
  },
  {
    name: "Florentine Benedict",
    description:
      "Two poached eggs and sautéed spinach on a grilled English muffin and topped with creamy Hollandaise sauce. Served with home fries.",
    price: 13,
    category: "benedicts",
    tags: ["vegetarian"],
  },
  {
    name: "Smoked Salmon Benedict",
    description:
      "Two poached eggs and cold-smoked salmon on a grilled English muffin and topped with creamy Hollandaise sauce. Served with home fries.",
    price: 16,
    category: "benedicts",
    tags: ["premium", "seafood"],
  },

  // ========== LUNCH ==========
  {
    name: "Mac Daddy's Burger",
    description:
      "8oz seasoned beef patty on a toasted brioche bun, topped with crisp bacon, melted cheddar cheese, fresh lettuce, and tomato. Served with a side of chips and a pickle.",
    price: 17,
    category: "lunch",
    tags: ["popular"],
  },
  {
    name: "Smoked Salmon Sandwich",
    description:
      "Cold-smoked salmon, creamy tartar sauce, and cream cheese, served on classic marbled rye bread with fresh lettuce and ripe tomato. Accompanied by chips and a pickle.",
    price: 16,
    category: "lunch",
    tags: ["seafood"],
  },
  {
    name: "BLT",
    description:
      "Crisp bacon, crunchy iceberg lettuce, and juicy tomatoes, elevated with a house-made aioli. Served on Texas Toast with a side of chips and a pickle.",
    price: 14,
    category: "lunch",
  },
  {
    name: "Grill Daddy",
    description:
      "Our signature grilled cheese blend, featuring classic American and sharp cheddar cheese, melted to perfection on golden-brown Texas Toast. Served with a side of chips and a pickle.",
    price: 12,
    category: "lunch",
    tags: ["vegetarian"],
  },
  {
    name: "Classic Patty Melt",
    description:
      "A juicy 8oz beef patty topped with grilled onions, Swiss cheese and mayo. Served on marbled rye. Comes with chips and a pickle.",
    price: 17,
    category: "lunch",
  },

  // ========== KIDS ==========
  {
    name: "Eggs & Toast",
    description:
      "Two fresh eggs prepared any style, served with two slices of golden toast and a side of crispy home fries.",
    price: 8,
    category: "kids",
  },
  {
    name: "Mini Pancakes",
    description:
      "Eight fluffy mini pancakes, topped with fresh butter and a dusting of powdered sugar. Served alongside a generous portion of crisp home fries.",
    price: 8,
    category: "kids",
  },
  {
    name: "Mini Waffles",
    description:
      "Three crisp mini waffles, topped with a swirl of fresh whipped cream and served with a side of golden home fries.",
    price: 8,
    category: "kids",
  },

  // ========== SIDES ==========
  { name: "Bacon", description: "Crispy bacon strips.", price: 5, category: "sides" },
  { name: "Sausage", description: "Savory pork sausage links.", price: 4, category: "sides" },
  { name: "Ham", description: "Sliced ham.", price: 4, category: "sides" },
  { name: "Home Fries", description: "Crisp seasoned home fries.", price: 4, category: "sides" },
  { name: "Extra Egg", description: "One egg prepared any style.", price: 2, category: "sides" },
  { name: "Toast", description: "Two slices of toast.", price: 2, category: "sides" },
  { name: "English Muffin", description: "Grilled English muffin.", price: 2, category: "sides" },
  {
    name: "Corned Beef Hash",
    description: "House-made corned beef hash.",
    price: 8,
    category: "sides",
  },
  {
    name: "Hollandaise",
    description: "Side of creamy Hollandaise sauce.",
    price: 3,
    category: "sides",
  },

  // ========== BEVERAGES ==========
  { name: "Brewed Coffee", description: "Fresh brewed coffee.", price: 2, category: "beverages" },
  { name: "Tea", description: "Hot tea.", price: 2, category: "beverages" },
  { name: "Hot Chocolate", description: "Rich hot chocolate.", price: 3, category: "beverages" },
  {
    name: "Juice",
    description: "Fresh juice.",
    price: null,
    category: "beverages",
    priceVariants: [
      { label: "Small", price: 3 },
      { label: "Large", price: 4 },
    ],
  },
  {
    name: "Milk",
    description: "Cold milk.",
    price: null,
    category: "beverages",
    priceVariants: [
      { label: "Small", price: 3 },
      { label: "Large", price: 4 },
    ],
  },
  {
    name: "Chocolate Milk",
    description: "Cold chocolate milk.",
    price: null,
    category: "beverages",
    priceVariants: [
      { label: "Small", price: 4 },
      { label: "Large", price: 5 },
    ],
  },
  { name: "Canned Soda", description: "Assorted canned sodas.", price: 2, category: "beverages" },
];

// --- SEED FUNCTION ---
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); // uses db from connection string

    // Clear existing data
    await db.collection("menuCategories").deleteMany({});
    await db.collection("menuItems").deleteMany({});

    // Insert categories
    const catResult = await db.collection("menuCategories").insertMany(categories);
    console.log(`✓ Inserted ${catResult.insertedCount} categories`);

    // Insert items with timestamps
    const itemsWithMeta = menuItems.map((item) => ({
      ...item,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const itemResult = await db.collection("menuItems").insertMany(itemsWithMeta);
    console.log(`✓ Inserted ${itemResult.insertedCount} menu items`);

    // Create indexes for common queries
    await db.collection("menuItems").createIndex({ category: 1 });
    await db.collection("menuItems").createIndex({ tags: 1 });
    await db.collection("menuItems").createIndex({ isAvailable: 1 });
    console.log("✓ Created indexes");

    console.log("\n🍳 Menu seed complete!");
  } finally {
    await client.close();
  }
}

seed().catch(console.error);
