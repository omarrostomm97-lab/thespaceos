import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, usersTable, assetsTable, inventoryItemsTable, inventoryMovementsTable, recipeItemsTable, orderAssignmentsTable, paymentsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const CASHIER_UP = requireRole("platform_owner", "owner", "manager", "cashier");
const STAFF = requireRole("platform_owner", "owner", "manager", "cashier", "buffet_worker");

async function buildOrderResponse(o: typeof ordersTable.$inferSelect) {
  const items = await db.select({
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
    .where(eq(orderItemsTable.orderId, o.id));

  let assetName = null, assetNameAr = null, createdByUserName = null, assignedToUserName = null;
  if (o.assetId) {
    const [a] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr }).from(assetsTable).where(eq(assetsTable.id, o.assetId)).limit(1);
    assetName = a?.name ?? null; assetNameAr = a?.nameAr ?? null;
  }
  if (o.createdByUserId) {
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, o.createdByUserId)).limit(1);
    createdByUserName = u?.name ?? null;
  }
  if (o.assignedToUserId) {
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, o.assignedToUserId)).limit(1);
    assignedToUserName = u?.name ?? null;
  }
  return {
    id: o.id, source: o.source, status: o.status,
    sessionId: o.sessionId, assetId: o.assetId, assetName, assetNameAr,
    createdByUserId: o.createdByUserId, createdByUserName,
    assignedToUserId: o.assignedToUserId, assignedToUserName,
    customerName: o.customerName, totalAmount: parseFloat(o.totalAmount as string),
    cancelReason: o.cancelReason,
    createdAt: o.createdAt, preparingAt: o.preparingAt, readyAt: o.readyAt, deliveredAt: o.deliveredAt,
    items: items.map(i => ({
      ...i,
      unitPrice: parseFloat(i.unitPrice as string),
      totalPrice: parseFloat(i.totalPrice as string),
    })),
  };
}

router.get("/orders", requireAuth, requireTenant, async (req, res) => {
  try {
    const { status, source, sessionId } = req.query;
    let orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.tenantId, req.user!.tenantId!))
      .orderBy(ordersTable.createdAt);
    if (status) orders = orders.filter(o => o.status === status);
    if (source) orders = orders.filter(o => o.source === source);
    if (sessionId) orders = orders.filter(o => o.sessionId === parseInt(sessionId as string));
    const formatted = await Promise.all(orders.slice(-200).reverse().map(o => buildOrderResponse(o)));
    res.json(formatted);
  } catch {
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.get("/orders/:orderId", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.orderId as string);
    const [o] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!o) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await buildOrderResponse(o));
  } catch {
    res.status(500).json({ error: "Failed to get order" });
  }
});

export async function createOrderWithItems(
  tenantId: number,
  data: { sessionId?: number; assetId?: number; source: string; createdByUserId?: number; items: { productId: number; quantity: number; notes?: string }[]; customerName?: string }
) {
  const products = await db.select().from(productsTable)
    .where(and(
      eq(productsTable.tenantId, tenantId),
      inArray(productsTable.id, data.items.map(i => i.productId))
    ));
  const productMap = new Map(products.map(p => [p.id, p]));

  let totalAmount = 0;
  const itemValues = data.items.map(item => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    const unitPrice = parseFloat(product.price as string);
    const totalPrice = unitPrice * item.quantity;
    totalAmount += totalPrice;
    return { productId: item.productId, quantity: item.quantity, unitPrice: String(unitPrice), totalPrice: String(totalPrice), notes: item.notes };
  });

  const [order] = await db.insert(ordersTable).values({
    tenantId,
    sessionId: data.sessionId ?? null,
    assetId: data.assetId ?? null,
    source: data.source,
    createdByUserId: data.createdByUserId ?? null,
    customerName: data.customerName ?? null,
    totalAmount: String(Math.round(totalAmount * 100) / 100),
    status: "pending",
  }).returning();

  await db.insert(orderItemsTable).values(itemValues.map(i => ({ ...i, orderId: order.id })));
  return order;
}

// POST /orders — POS order creation (cashier and above); also creates a payment record
router.post("/orders", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const { sessionId, assetId, items, customerName, paymentMethod } = req.body;
    if (!items?.length) { res.status(400).json({ error: "items required" }); return; }
    const order = await createOrderWithItems(req.user!.tenantId!, {
      sessionId, assetId, source: "pos",
      createdByUserId: req.user!.id, items, customerName,
    });

    // Create a payment record if paymentMethod is provided (POS always collects payment at the till)
    if (paymentMethod) {
      const totalAmount = parseFloat(order.totalAmount as string);
      const isCash = paymentMethod === "cash";
      const [payment] = await db.insert(paymentsTable).values({
        tenantId: req.user!.tenantId!,
        sessionId: sessionId ?? null,
        method: paymentMethod,
        amount: String(totalAmount),
        status: isCash ? "verified" : "pending",
        verifiedByUserId: isCash ? req.user!.id : null,
        verifiedAt: isCash ? new Date() : null,
      }).returning();
      await writeAuditLog({ user: req.user, action: "create_payment", entityType: "payment", entityId: payment.id, newValue: { method: paymentMethod, amount: totalAmount, orderId: order.id } });
    }

    await writeAuditLog({ user: req.user, action: "create_order", entityType: "order", entityId: order.id });
    res.status(201).json(await buildOrderResponse(order));
  } catch {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PATCH /orders/:orderId/status — all staff can update order status
router.patch("/orders/:orderId/status", requireAuth, requireTenant, STAFF, async (req, res) => {
  try {
    const id = parseInt(req.params.orderId as string);
    const { status } = req.body;
    if (!status) { res.status(400).json({ error: "status required" }); return; }

    // SECURITY: Load and tenant-authorize the order FIRST, before any side effects
    const [existing] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }

    const updates: Partial<typeof ordersTable.$inferInsert> = { status };
    if (status === "preparing") updates.preparingAt = new Date();
    if (status === "ready") updates.readyAt = new Date();
    if (status === "delivered") {
      updates.deliveredAt = new Date();
      // Recipe-based inventory auto-deduction — runs only after tenant ownership is confirmed
      const orderItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      for (const item of orderItems) {
        const recipeItems = await db.select().from(recipeItemsTable)
          .where(and(
            eq(recipeItemsTable.productId, item.productId),
            eq(recipeItemsTable.tenantId, req.user!.tenantId!)
          ));
        for (const recipe of recipeItems) {
          const deductQty = parseFloat(recipe.quantityUsed as string) * item.quantity;
          const [invItem] = await db.select().from(inventoryItemsTable)
            .where(and(
              eq(inventoryItemsTable.id, recipe.inventoryItemId),
              eq(inventoryItemsTable.tenantId, req.user!.tenantId!)
            )).limit(1);
          if (invItem) {
            const newStock = Math.max(0, parseFloat(invItem.currentStock as string) - deductQty);
            await db.update(inventoryItemsTable)
              .set({ currentStock: String(newStock) })
              .where(and(
                eq(inventoryItemsTable.id, recipe.inventoryItemId),
                eq(inventoryItemsTable.tenantId, req.user!.tenantId!)
              ));
            await db.insert(inventoryMovementsTable).values({
              tenantId: req.user!.tenantId!,
              inventoryItemId: recipe.inventoryItemId,
              type: "sale",
              quantity: String(deductQty),
              reason: `Auto-deducted from order #${id}`,
              createdByUserId: req.user!.id,
            });
          }
        }
      }
    }

    const [updated] = await db.update(ordersTable).set(updates)
      .where(eq(ordersTable.id, id))
      .returning();
    await writeAuditLog({ user: req.user, action: `order_status_${status}`, entityType: "order", entityId: id });
    res.json(await buildOrderResponse(updated));
  } catch {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.patch("/orders/:orderId/assign", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.orderId as string);
    const { userId } = req.body;
    const [updated] = await db.update(ordersTable).set({ assignedToUserId: userId })
      .where(and(eq(ordersTable.id, id), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await buildOrderResponse(updated));
  } catch {
    res.status(500).json({ error: "Failed to assign order" });
  }
});

router.post("/orders/:orderId/cancel", requireAuth, requireTenant, CASHIER_UP, async (req, res) => {
  try {
    const id = parseInt(req.params.orderId as string);
    const { reason } = req.body;
    if (!reason) { res.status(400).json({ error: "reason required" }); return; }
    const [updated] = await db.update(ordersTable).set({ status: "cancelled", cancelReason: reason })
      .where(and(eq(ordersTable.id, id), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    await writeAuditLog({ user: req.user, action: "cancel_order", entityType: "order", entityId: id, newValue: { reason } });
    res.json(await buildOrderResponse(updated));
  } catch {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
