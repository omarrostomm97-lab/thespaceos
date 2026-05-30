import { db } from "@workspace/db";
import {
  tenantsTable, usersTable, assetsTable, productCategoriesTable, productsTable, inventoryItemsTable
} from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Create tenant
  const [tenant] = await db.insert(tenantsTable).values({
    name: "Gaming Lounge Cairo",
    nameAr: "جيمينج لاونج القاهرة",
    slug: "gaming-lounge-cairo",
    language: "ar",
    isActive: true,
  }).onConflictDoNothing().returning();

  const tenantId = tenant?.id ?? (await db.select().from(tenantsTable).limit(1))[0].id;
  console.log("Tenant ID:", tenantId);

  // Create platform owner
  const ownerHash = await bcrypt.hash("admin123", 10);
  await db.insert(usersTable).values({
    email: "platform@gaming-lounge.com",
    passwordHash: ownerHash,
    name: "Platform Admin",
    nameAr: "مدير المنصة",
    role: "platform_owner",
    tenantId: null,
    isActive: true,
  }).onConflictDoNothing();

  // Create tenant owner
  const tenantOwnerHash = await bcrypt.hash("owner123", 10);
  await db.insert(usersTable).values({
    email: "owner@gaming-lounge.com",
    passwordHash: tenantOwnerHash,
    name: "Ahmed Owner",
    nameAr: "أحمد المالك",
    role: "owner",
    tenantId,
    isActive: true,
  }).onConflictDoNothing();

  // Create manager
  const managerHash = await bcrypt.hash("manager123", 10);
  await db.insert(usersTable).values({
    email: "manager@gaming-lounge.com",
    passwordHash: managerHash,
    name: "Mohamed Manager",
    nameAr: "محمد المدير",
    role: "manager",
    tenantId,
    isActive: true,
  }).onConflictDoNothing();

  // Create cashier
  const cashierHash = await bcrypt.hash("cashier123", 10);
  await db.insert(usersTable).values({
    email: "cashier@gaming-lounge.com",
    passwordHash: cashierHash,
    name: "Ali Cashier",
    nameAr: "علي الكاشير",
    role: "cashier",
    tenantId,
    isActive: true,
  }).onConflictDoNothing();

  // Create buffet worker
  const buffetHash = await bcrypt.hash("buffet123", 10);
  await db.insert(usersTable).values({
    email: "buffet@gaming-lounge.com",
    passwordHash: buffetHash,
    name: "Omar Buffet",
    nameAr: "عمر البوفيه",
    role: "buffet_worker",
    tenantId,
    isActive: true,
  }).onConflictDoNothing();

  console.log("Users created");

  // Create gaming assets
  const assets = [
    { name: "PS5 Room 1", nameAr: "بلايستيشن 5 - غرفة 1", type: "ps", pricePerHour: "30" },
    { name: "PS5 Room 2", nameAr: "بلايستيشن 5 - غرفة 2", type: "ps", pricePerHour: "30" },
    { name: "PS5 Room 3", nameAr: "بلايستيشن 5 - غرفة 3", type: "ps", pricePerHour: "30" },
    { name: "PS5 VIP", nameAr: "بلايستيشن 5 - VIP", type: "ps", pricePerHour: "50" },
    { name: "Billiard Table 1", nameAr: "طاولة بلياردو 1", type: "billiard", pricePerHour: "25" },
    { name: "Billiard Table 2", nameAr: "طاولة بلياردو 2", type: "billiard", pricePerHour: "25" },
    { name: "Air Hockey", nameAr: "هوكي الهواء", type: "air_hockey", pricePerHour: "20" },
    { name: "Babyfoot", nameAr: "كرة القدم الصغيرة", type: "babyfoot", pricePerHour: "15" },
  ];

  for (const a of assets) {
    await db.insert(assetsTable).values({ tenantId, ...a, status: "available" }).onConflictDoNothing();
  }
  console.log("Assets created");

  // Create product categories
  const cats = [
    { name: "Drinks", nameAr: "مشروبات", sortOrder: 1 },
    { name: "Food", nameAr: "أكل", sortOrder: 2 },
    { name: "Snacks", nameAr: "سناكس", sortOrder: 3 },
  ];
  for (const c of cats) {
    await db.insert(productCategoriesTable).values({ tenantId, ...c }).onConflictDoNothing();
  }

  const [drinksCat, foodCat, snacksCat] = await db.select().from(productCategoriesTable)
    .where(eq(productCategoriesTable.tenantId, tenantId));

  // Products
  const products = [
    { categoryId: drinksCat?.id, name: "Pepsi", nameAr: "بيبسي", price: "10" },
    { categoryId: drinksCat?.id, name: "Water", nameAr: "مياه", price: "5" },
    { categoryId: drinksCat?.id, name: "Energy Drink", nameAr: "مشروب طاقة", price: "20" },
    { categoryId: drinksCat?.id, name: "Coffee", nameAr: "قهوة", price: "15" },
    { categoryId: drinksCat?.id, name: "Tea", nameAr: "شاي", price: "10" },
    { categoryId: foodCat?.id, name: "Hot Dog", nameAr: "هوت دوج", price: "25" },
    { categoryId: foodCat?.id, name: "Sandwich", nameAr: "ساندويتش", price: "30" },
    { categoryId: foodCat?.id, name: "Pizza Slice", nameAr: "شريحة بيتزا", price: "35" },
    { categoryId: snacksCat?.id, name: "Chips", nameAr: "شيبس", price: "8" },
    { categoryId: snacksCat?.id, name: "Chocolate", nameAr: "شوكولاتة", price: "10" },
    { categoryId: snacksCat?.id, name: "Popcorn", nameAr: "فشار", price: "12" },
  ];

  for (const p of products) {
    if (p.categoryId) {
      await db.insert(productsTable).values({ tenantId, ...p, isAvailable: true }).onConflictDoNothing();
    }
  }
  console.log("Products created");

  // Inventory items
  const inventory = [
    { name: "Pepsi Cans", nameAr: "علب بيبسي", unit: "can", currentStock: "48", minStockLevel: "10" },
    { name: "Water Bottles", nameAr: "زجاجات مياه", unit: "bottle", currentStock: "60", minStockLevel: "12" },
    { name: "Energy Drinks", nameAr: "مشروبات طاقة", unit: "can", currentStock: "20", minStockLevel: "6" },
    { name: "Chips Bags", nameAr: "أكياس شيبس", unit: "bag", currentStock: "30", minStockLevel: "8" },
    { name: "Chocolate Bars", nameAr: "ألواح شوكولاتة", unit: "bar", currentStock: "25", minStockLevel: "5" },
    { name: "Hot Dog Buns", nameAr: "خبز هوت دوج", unit: "pcs", currentStock: "4", minStockLevel: "10" },
  ];

  for (const item of inventory) {
    await db.insert(inventoryItemsTable).values({ tenantId, ...item }).onConflictDoNothing();
  }
  console.log("Inventory seeded");

  console.log("\n✅ Seed complete!\n");
  console.log("Demo accounts:");
  console.log("  Platform Owner: platform@gaming-lounge.com / admin123");
  console.log("  Owner:          owner@gaming-lounge.com / owner123");
  console.log("  Manager:        manager@gaming-lounge.com / manager123");
  console.log("  Cashier:        cashier@gaming-lounge.com / cashier123");
  console.log("  Buffet Worker:  buffet@gaming-lounge.com / buffet123");
}

seed().catch(console.error).finally(() => process.exit(0));
