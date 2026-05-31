import { db } from "@workspace/db";
import {
  tenantsTable, usersTable, assetsTable, productCategoriesTable, productsTable, inventoryItemsTable
} from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seedBanana() {
  console.log("Seeding Banana tenant...");

  const [tenant] = await db.insert(tenantsTable).values({
    name: "Banana Gaming Center",
    nameAr: "بنانا جيمينج سنتر",
    slug: "banana",
    language: "ar",
    isActive: true,
  }).onConflictDoNothing().returning();

  const existing = await db.select().from(tenantsTable).where(eq(tenantsTable.slug, "banana")).limit(1);
  const tenantId = tenant?.id ?? existing[0]?.id;
  if (!tenantId) { console.error("Failed to get tenant ID"); process.exit(1); }
  console.log("Banana tenant ID:", tenantId);

  const ownerHash = await bcrypt.hash("banana123", 10);
  await db.insert(usersTable).values({ email: "owner@banana.com", passwordHash: ownerHash, name: "Banana Owner", nameAr: "مالك بنانا", role: "owner", tenantId, isActive: true }).onConflictDoNothing();

  const managerHash = await bcrypt.hash("manager123", 10);
  await db.insert(usersTable).values({ email: "manager@banana.com", passwordHash: managerHash, name: "Banana Manager", nameAr: "مدير بنانا", role: "manager", tenantId, isActive: true }).onConflictDoNothing();

  const cashierHash = await bcrypt.hash("cashier123", 10);
  await db.insert(usersTable).values({ email: "cashier@banana.com", passwordHash: cashierHash, name: "Banana Cashier", nameAr: "كاشير بنانا", role: "cashier", tenantId, isActive: true }).onConflictDoNothing();

  const buffetHash = await bcrypt.hash("buffet123", 10);
  await db.insert(usersTable).values({ email: "buffet@banana.com", passwordHash: buffetHash, name: "Banana Buffet", nameAr: "بوفيه بنانا", role: "buffet_worker", tenantId, isActive: true }).onConflictDoNothing();

  console.log("Users created");

  // 11 Assets: 5 regular PS rooms + 1 VIP PS + 2 Billiard + 1 Air Hockey + 1 Babyfoot + 1 Ping Pong
  const assets = [
    { name: "PS Room 1", nameAr: "غرفة بلايستيشن 1", type: "ps", pricePerHour: "60" },
    { name: "PS Room 2", nameAr: "غرفة بلايستيشن 2", type: "ps", pricePerHour: "60" },
    { name: "PS Room 3", nameAr: "غرفة بلايستيشن 3", type: "ps", pricePerHour: "60" },
    { name: "PS Room 4", nameAr: "غرفة بلايستيشن 4", type: "ps", pricePerHour: "60" },
    { name: "PS Room 5", nameAr: "غرفة بلايستيشن 5", type: "ps", pricePerHour: "60" },
    { name: "PS VIP Room", nameAr: "غرفة VIP بلايستيشن", type: "ps", pricePerHour: "100" },
    { name: "Billiard Table 1", nameAr: "طاولة بلياردو 1", type: "billiard", pricePerHour: "50" },
    { name: "Billiard Table 2", nameAr: "طاولة بلياردو 2", type: "billiard", pricePerHour: "50" },
    { name: "Air Hockey", nameAr: "هوكي الهواء", type: "air_hockey", pricePerHour: "40" },
    { name: "Babyfoot", nameAr: "كرة القدم المصغرة", type: "babyfoot", pricePerHour: "40" },
    { name: "Ping Pong", nameAr: "بينج بونج", type: "other", pricePerHour: "40" },
  ];
  for (const a of assets) {
    await db.insert(assetsTable).values({ tenantId, ...a, status: "available" }).onConflictDoNothing();
  }
  console.log("Assets created (11 total)");

  // Product categories
  const catDefs = [
    { name: "Hot Drinks", nameAr: "مشروبات ساخنة", sortOrder: 1 },
    { name: "Cold Drinks & Frappe", nameAr: "مشروبات باردة وفراب", sortOrder: 2 },
    { name: "Mojito & Smoothies", nameAr: "موهيتو وسموذي", sortOrder: 3 },
    { name: "Fresh Juices", nameAr: "عصائر طازجة", sortOrder: 4 },
    { name: "Munchies", nameAr: "مأكولات وسناكس", sortOrder: 5 },
  ];
  for (const c of catDefs) {
    await db.insert(productCategoriesTable).values({ tenantId, ...c }).onConflictDoNothing();
  }
  const cats = await db.select().from(productCategoriesTable)
    .where(eq(productCategoriesTable.tenantId, tenantId))
    .orderBy(productCategoriesTable.sortOrder);

  const catMap: Record<string, number> = {};
  for (const c of cats) catMap[c.name] = c.id;

  const hotId = catMap["Hot Drinks"];
  const coldId = catMap["Cold Drinks & Frappe"];
  const mojitoId = catMap["Mojito & Smoothies"];
  const juiceId = catMap["Fresh Juices"];
  const munchiesId = catMap["Munchies"];

  if (!hotId || !coldId || !mojitoId || !juiceId || !munchiesId) {
    console.error("Category IDs not found", catMap); process.exit(1);
  }

  // All products from menu images
  const products: Array<{ categoryId: number; name: string; nameAr: string; price: string }> = [
    // Hot Drinks
    { categoryId: hotId, name: "Espresso Single", nameAr: "إسبريسو سينجل", price: "40" },
    { categoryId: hotId, name: "Espresso Double", nameAr: "إسبريسو دبل", price: "80" },
    { categoryId: hotId, name: "Latte", nameAr: "لاتيه", price: "80" },
    { categoryId: hotId, name: "Spanish Latte", nameAr: "سبانش لاتيه", price: "80" },
    { categoryId: hotId, name: "Spanish Latte Coconut", nameAr: "سبانش لاتيه جوز الهند", price: "90" },
    { categoryId: hotId, name: "Cappuccino", nameAr: "كابتشينو", price: "100" },
    { categoryId: hotId, name: "Dark Mocha", nameAr: "دارك موكا", price: "110" },
    { categoryId: hotId, name: "White Mocha", nameAr: "وايت موكا", price: "110" },
    { categoryId: hotId, name: "Caramel Macchiato", nameAr: "كراميل ماكياتو", price: "100" },
    { categoryId: hotId, name: "Nescafe", nameAr: "نسكافيه", price: "40" },
    { categoryId: hotId, name: "Nescafe Black", nameAr: "نسكافيه بلاك", price: "25" },
    { categoryId: hotId, name: "Turkish Coffee Double", nameAr: "قهوة تركي دبل", price: "50" },
    { categoryId: hotId, name: "French Coffee", nameAr: "قهوة فرنساوي", price: "40" },
    { categoryId: hotId, name: "Hot Cider", nameAr: "هوت سيدر", price: "50" },
    { categoryId: hotId, name: "Tea with Milk", nameAr: "شاي باللبن", price: "40" },
    { categoryId: hotId, name: "Tea", nameAr: "شاي", price: "20" },
    { categoryId: hotId, name: "Green Tea", nameAr: "شاي أخضر", price: "20" },
    { categoryId: hotId, name: "Anise", nameAr: "ينسون", price: "20" },
    { categoryId: hotId, name: "Roselle", nameAr: "كركديه", price: "20" },
    { categoryId: hotId, name: "Mint", nameAr: "نعناع", price: "20" },
    { categoryId: hotId, name: "Hazelnut Coffee", nameAr: "قهوة بالبندق", price: "40" },
    // Cold Drinks
    { categoryId: coldId, name: "Ice Latte", nameAr: "آيس لاتيه", price: "60" },
    { categoryId: coldId, name: "Ice Spanish Latte", nameAr: "آيس سبانش لاتيه", price: "80" },
    { categoryId: coldId, name: "Ice White Mocha", nameAr: "آيس وايت موكا", price: "120" },
    { categoryId: coldId, name: "Ice Dark Mocha", nameAr: "آيس دارك موكا", price: "120" },
    // Frappe
    { categoryId: coldId, name: "Coffee Frappe", nameAr: "فراب قهوة", price: "120" },
    { categoryId: coldId, name: "Caramel Frappe", nameAr: "فراب كراميل", price: "120" },
    { categoryId: coldId, name: "Spanish Frappe", nameAr: "فراب سبانش", price: "120" },
    { categoryId: coldId, name: "White Mocha Frappe", nameAr: "فراب وايت موكا", price: "130" },
    { categoryId: coldId, name: "Dark Mocha Frappe", nameAr: "فراب دارك موكا", price: "130" },
    // Mojito's
    { categoryId: mojitoId, name: "Blueberry Mojito", nameAr: "موهيتو توت أزرق", price: "80" },
    { categoryId: mojitoId, name: "Strawberry Mojito", nameAr: "موهيتو فراولة", price: "80" },
    { categoryId: mojitoId, name: "Peach Mojito", nameAr: "موهيتو خوخ", price: "80" },
    { categoryId: mojitoId, name: "Passion Fruit Mojito", nameAr: "موهيتو باشن فروت", price: "80" },
    { categoryId: mojitoId, name: "Mango Mojito", nameAr: "موهيتو مانجو", price: "80" },
    // Smoothies
    { categoryId: mojitoId, name: "Blueberry Smoothie", nameAr: "سموذي توت أزرق", price: "50" },
    { categoryId: mojitoId, name: "Strawberry Smoothie", nameAr: "سموذي فراولة", price: "50" },
    { categoryId: mojitoId, name: "Peach Smoothie", nameAr: "سموذي خوخ", price: "50" },
    { categoryId: mojitoId, name: "Passion Fruit Smoothie", nameAr: "سموذي باشن فروت", price: "50" },
    { categoryId: mojitoId, name: "Mango Smoothie", nameAr: "سموذي مانجو", price: "50" },
    { categoryId: mojitoId, name: "Watermelon Smoothie", nameAr: "سموذي بطيخ", price: "50" },
    { categoryId: mojitoId, name: "Lemon Mint Smoothie", nameAr: "سموذي ليمون بالنعناع", price: "50" },
    // Fresh Juices
    { categoryId: juiceId, name: "Strawberry Juice", nameAr: "عصير فراولة", price: "40" },
    { categoryId: juiceId, name: "Watermelon Juice", nameAr: "عصير بطيخ", price: "40" },
    { categoryId: juiceId, name: "Banana Milk", nameAr: "موز باللبن", price: "50" },
    { categoryId: juiceId, name: "Mango Juice", nameAr: "عصير مانجو", price: "50" },
    { categoryId: juiceId, name: "Lemon Juice", nameAr: "عصير ليمون", price: "40" },
    { categoryId: juiceId, name: "Lemon Mint Juice", nameAr: "عصير ليمون بالنعناع", price: "40" },
    { categoryId: juiceId, name: "Orange Juice", nameAr: "عصير برتقال", price: "40" },
    { categoryId: juiceId, name: "Guava Juice", nameAr: "عصير جوافة", price: "40" },
    { categoryId: juiceId, name: "Milky Avocado", nameAr: "أفوكادو باللبن", price: "90" },
    { categoryId: juiceId, name: "Extra Sauces", nameAr: "صوص إضافي", price: "30" },
    // Munchies
    { categoryId: munchiesId, name: "Pepsi / Seven / Mirinda", nameAr: "بيبسي / سفن أب / ميرندا", price: "30" },
    { categoryId: munchiesId, name: "V (Cola / Seven)", nameAr: "V (كولا / سفن أب)", price: "30" },
    { categoryId: munchiesId, name: "Redbull", nameAr: "ريد بول", price: "100" },
    { categoryId: munchiesId, name: "Fury", nameAr: "فيوري", price: "30" },
    { categoryId: munchiesId, name: "Snack", nameAr: "سناك", price: "30" },
    { categoryId: munchiesId, name: "Hohos", nameAr: "هوهوز", price: "20" },
    { categoryId: munchiesId, name: "Twinkies", nameAr: "تونكيز", price: "20" },
    { categoryId: munchiesId, name: "Galaxy", nameAr: "جالاكسي", price: "45" },
    { categoryId: munchiesId, name: "Moro", nameAr: "مورو", price: "40" },
    { categoryId: munchiesId, name: "Galaxy Flutes", nameAr: "جالاكسي فلوتس", price: "30" },
    { categoryId: munchiesId, name: "Snickers Flutes", nameAr: "سنيكرز فلوتس", price: "30" },
    { categoryId: munchiesId, name: "Todo", nameAr: "تودو", price: "25" },
    { categoryId: munchiesId, name: "Oreo", nameAr: "أوريو", price: "25" },
    { categoryId: munchiesId, name: "Ulker", nameAr: "أولكر", price: "15" },
    { categoryId: munchiesId, name: "Doro", nameAr: "دورو", price: "20" },
    { categoryId: munchiesId, name: "Water", nameAr: "مياه", price: "15" },
    { categoryId: munchiesId, name: "Crisps Chips", nameAr: "كريسبس شيبس", price: "15" },
  ];

  for (const p of products) {
    await db.insert(productsTable).values({ tenantId, ...p, isAvailable: true }).onConflictDoNothing();
  }
  console.log(`Products created (${products.length} total)`);

  // Seed inventory item for each product
  for (const p of products) {
    await db.insert(inventoryItemsTable).values({
      tenantId,
      name: p.name,
      nameAr: p.nameAr,
      unit: "pcs",
      currentStock: "50",
      minStockLevel: "10",
    }).onConflictDoNothing();
  }
  console.log("Inventory seeded");

  console.log("\n✅ Banana seed complete!\n");
  console.log("Banana accounts:");
  console.log("  Owner:   owner@banana.com / banana123");
  console.log("  Manager: manager@banana.com / manager123");
  console.log("  Cashier: cashier@banana.com / cashier123");
  console.log("  Buffet:  buffet@banana.com / buffet123");
}

seedBanana().catch(console.error).finally(() => process.exit(0));
