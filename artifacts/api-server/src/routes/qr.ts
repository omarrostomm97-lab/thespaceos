import { Router } from "express";
import { db } from "@workspace/db";
import { assetsTable, productsTable, productCategoriesTable, sessionsTable, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { createOrderWithItems } from "./orders";

const router = Router();

router.get("/qr/:token/menu", async (req, res) => {
  try {
    const { token } = req.params;
    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.qrToken, token)).limit(1);
    if (!asset) { res.status(404).json({ error: "QR code not found" }); return; }

    const products = await db.select().from(productsTable)
      .where(and(eq(productsTable.tenantId, asset.tenantId), eq(productsTable.isAvailable, true)));
    const categories = await db.select().from(productCategoriesTable)
      .where(eq(productCategoriesTable.tenantId, asset.tenantId))
      .orderBy(productCategoriesTable.sortOrder);

    // Find active session for this asset
    const [activeSession] = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.assetId, asset.id),
        inArray(sessionsTable.status, ["active", "paused"])
      )).limit(1);

    res.json({
      asset: { ...asset, pricePerHour: parseFloat(asset.pricePerHour as string) },
      categories,
      products: products.map(p => ({
        id: p.id, name: p.name, nameAr: p.nameAr,
        categoryId: p.categoryId, price: parseFloat(p.price as string),
        isAvailable: p.isAvailable, description: p.description, descriptionAr: p.descriptionAr,
        createdAt: p.createdAt,
        categoryName: null, categoryNameAr: null,
      })),
      activeSession: activeSession ? {
        id: activeSession.id, assetId: activeSession.assetId,
        assetName: asset.name, assetNameAr: asset.nameAr,
        userId: activeSession.userId, userName: null,
        status: activeSession.status, startedAt: activeSession.startedAt,
        pausedAt: activeSession.pausedAt, endedAt: activeSession.endedAt,
        totalMinutes: null, totalCost: null, cancelReason: null, notes: null,
      } : null,
    });
  } catch {
    res.status(500).json({ error: "Failed to get menu" });
  }
});

router.post("/qr/:token/order", async (req, res) => {
  try {
    const { token } = req.params;
    const { items, customerName } = req.body;
    if (!items?.length) { res.status(400).json({ error: "items required" }); return; }

    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.qrToken, token)).limit(1);
    if (!asset) { res.status(404).json({ error: "QR code not found" }); return; }

    const [activeSession] = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.assetId, asset.id),
        inArray(sessionsTable.status, ["active", "paused"])
      )).limit(1);

    const order = await createOrderWithItems(asset.tenantId, {
      sessionId: activeSession?.id,
      assetId: asset.id,
      source: "qr",
      customerName,
      items,
    });

    // Build response inline
    const orderItems = await db.select({
      id: orderItemsTable.id,
      productId: orderItemsTable.productId,
      productName: productsTable.name,
      productNameAr: productsTable.nameAr,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      totalPrice: orderItemsTable.totalPrice,
      notes: orderItemsTable.notes,
    }).from(orderItemsTable)
      .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .where(eq(orderItemsTable.orderId, order.id));

    res.status(201).json({
      id: order.id, source: order.source, status: order.status,
      sessionId: order.sessionId, assetId: order.assetId,
      assetName: asset.name, assetNameAr: asset.nameAr,
      createdByUserId: null, createdByUserName: null,
      assignedToUserId: null, assignedToUserName: null,
      customerName: order.customerName, totalAmount: parseFloat(order.totalAmount as string),
      cancelReason: null, createdAt: order.createdAt,
      preparingAt: null, readyAt: null, deliveredAt: null,
      items: orderItems.map(i => ({
        ...i,
        unitPrice: parseFloat(i.unitPrice as string),
        totalPrice: parseFloat(i.totalPrice as string),
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;
