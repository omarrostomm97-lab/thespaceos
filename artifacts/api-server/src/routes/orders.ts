import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, usersTable, assetsTable, sessionsTable, inventoryItemsTable, inventoryMovementsTable, recipeItemsTable, orderAssignmentsTable, paymentsTable } from "@workspace/db";
import { eq, and, inArray, desc } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole, requireOpenShift } from "../lib/auth";
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
    status: orderItemsTable.status,
    returnReason: orderItemsTable.returnReason,
    returnQuantity: orderItemsTable.returnQuantity,
    returnedAt: orderItemsTable.returnedAt,
    returnedByUserId: orderItemsTable.returnedByUserId,
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

// GET /orders/return-requests — list all pending return requests (owner/manager)
// NOTE: must be registered BEFORE /orders/:orderId to avoid Express matching "return-requests" as orderId
const MGMT = requireRole("platform_owner", "owner", "manager");

router.get("/orders/return-requests", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const statusParam = (req.query.status as string) ?? "pending";
    const statusFilter =
      statusParam === "history" ? inArray(orderItemsTable.status, ["returned", "return_rejected"]) :
      statusParam === "all"     ? inArray(orderItemsTable.status, ["return_requested", "returned", "return_rejected"]) :
                                  eq(orderItemsTable.status, "return_requested");

    const pendingItems = await db.select({
      itemId: orderItemsTable.id,
      orderId: orderItemsTable.orderId,
      productId: orderItemsTable.productId,
      productName: productsTable.name,
      productNameAr: productsTable.nameAr,
      quantity: orderItemsTable.quantity,
      unitPrice: orderItemsTable.unitPrice,
      totalPrice: orderItemsTable.totalPrice,
      returnReason: orderItemsTable.returnReason,
      requestedByUserId: orderItemsTable.returnedByUserId,
      sessionId: ordersTable.sessionId,
      assetId: ordersTable.assetId,
      orderedAt: ordersTable.createdAt,
      itemStatus: orderItemsTable.status,
      returnedAt: orderItemsTable.returnedAt,
    }).from(orderItemsTable)
      .innerJoin(ordersTable, and(
        eq(orderItemsTable.orderId, ordersTable.id),
        eq(ordersTable.tenantId, req.user!.tenantId!)
      ))
      .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
      .where(statusFilter)
      .orderBy(desc(ordersTable.createdAt));

    const result = await Promise.all(pendingItems.map(async item => {
      let assetName = null, assetNameAr = null;
      if (item.assetId) {
        const [a] = await db.select({ name: assetsTable.name, nameAr: assetsTable.nameAr })
          .from(assetsTable).where(eq(assetsTable.id, item.assetId)).limit(1);
        assetName = a?.name ?? null; assetNameAr = a?.nameAr ?? null;
      }
      let requestedByName = null;
      if (item.requestedByUserId) {
        const [u] = await db.select({ name: usersTable.name })
          .from(usersTable).where(eq(usersTable.id, item.requestedByUserId)).limit(1);
        requestedByName = u?.name ?? null;
      }
      return {
        itemId: item.itemId,
        orderId: item.orderId,
        sessionId: item.sessionId,
        assetName, assetNameAr,
        productName: item.productName ?? "",
        productNameAr: item.productNameAr ?? null,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice as string),
        totalPrice: parseFloat(item.totalPrice as string),
        returnReason: item.returnReason ?? "",
        requestedByName,
        orderedAt: item.orderedAt,
        itemStatus: item.itemStatus,
        returnedAt: item.returnedAt ?? null,
      };
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list return requests" });
  }
});

// GET /orders/kds — tenant-scoped KDS feed: pending + preparing + ready orders
router.get("/orders/kds", requireAuth, requireTenant, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable)
      .where(and(
        eq(ordersTable.tenantId, req.user!.tenantId!),
        inArray(ordersTable.status, ["pending", "preparing", "ready"])
      ))
      .orderBy(ordersTable.createdAt);
    const formatted = await Promise.all(orders.map(o => buildOrderResponse(o)));
    res.json(formatted);
  } catch {
    res.status(500).json({ error: "Failed to list KDS orders" });
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

// POST /orders — POS order creation (cashier and above); also creates a payment record; requires open shift for cashiers
router.post("/orders", requireAuth, requireTenant, CASHIER_UP, requireOpenShift, async (req, res) => {
  try {
    const { sessionId, assetId, items, customerName, paymentMethod } = req.body;
    if (!items?.length) { res.status(400).json({ error: "items required" }); return; }

    // SECURITY: validate sessionId and assetId belong to this tenant before insert
    if (sessionId) {
      const [sess] = await db.select({ id: sessionsTable.id }).from(sessionsTable)
        .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.tenantId, req.user!.tenantId!)))
        .limit(1);
      if (!sess) { res.status(404).json({ error: "Session not found" }); return; }
    }
    if (assetId) {
      const [asset] = await db.select({ id: assetsTable.id }).from(assetsTable)
        .where(and(eq(assetsTable.id, assetId), eq(assetsTable.tenantId, req.user!.tenantId!)))
        .limit(1);
      if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
    }

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

// POST /orders/:orderId/items/:itemId/request-return — cashier submits return request
router.post("/orders/:orderId/items/:itemId/request-return", requireAuth, requireTenant, CASHIER_UP, requireOpenShift, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const itemId = parseInt(req.params.itemId);
    const { reason, quantity } = req.body;
    if (!reason?.trim()) { res.status(400).json({ error: "reason required" }); return; }

    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    if (order.status !== "delivered") { res.status(400).json({ error: "Can only request return for delivered orders" }); return; }

    const [item] = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.id, itemId), eq(orderItemsTable.orderId, orderId)))
      .limit(1);
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }
    if (item.status !== "active") { res.status(400).json({ error: "Item is not in active status" }); return; }

    const returnQty = quantity ? parseInt(String(quantity)) : item.quantity;
    if (returnQty < 1 || returnQty > item.quantity) {
      res.status(400).json({ error: `Return quantity must be between 1 and ${item.quantity}` }); return;
    }

    await db.update(orderItemsTable)
      .set({ status: "return_requested", returnReason: reason, returnedByUserId: req.user!.id, returnQuantity: returnQty })
      .where(eq(orderItemsTable.id, itemId));

    await writeAuditLog({ user: req.user, action: "request_item_return", entityType: "order", entityId: orderId, newValue: { itemId, reason } });
    res.json(await buildOrderResponse(order));
  } catch {
    res.status(500).json({ error: "Failed to request return" });
  }
});

// POST /orders/:orderId/items/:itemId/approve-return — owner/manager approves, restores inventory + updates total
router.post("/orders/:orderId/items/:itemId/approve-return", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const itemId = parseInt(req.params.itemId);

    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const [item] = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.id, itemId), eq(orderItemsTable.orderId, orderId)))
      .limit(1);
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }
    if (item.status !== "return_requested") { res.status(400).json({ error: "Item is not pending return" }); return; }

    await db.update(orderItemsTable)
      .set({ status: "returned", returnedAt: new Date() })
      .where(eq(orderItemsTable.id, itemId));

    // Deduct only the returned quantity (partial returns use returnQuantity × unitPrice)
    const returnQty = item.returnQuantity ?? item.quantity;
    const itemTotal = parseFloat(item.unitPrice as string) * returnQty;
    const newTotal = Math.max(0, parseFloat(order.totalAmount as string) - itemTotal);
    const [updated] = await db.update(ordersTable)
      .set({ totalAmount: String(Math.round(newTotal * 100) / 100) })
      .where(eq(ordersTable.id, orderId))
      .returning();

    // Restore inventory: reverse the recipe-based deduction
    const recipeItems = await db.select().from(recipeItemsTable)
      .where(and(
        eq(recipeItemsTable.productId, item.productId),
        eq(recipeItemsTable.tenantId, req.user!.tenantId!)
      ));
    const restoreItemQty = item.returnQuantity ?? item.quantity;
    for (const recipe of recipeItems) {
      const restoreQty = parseFloat(recipe.quantityUsed as string) * restoreItemQty;
      const [invItem] = await db.select().from(inventoryItemsTable)
        .where(and(
          eq(inventoryItemsTable.id, recipe.inventoryItemId),
          eq(inventoryItemsTable.tenantId, req.user!.tenantId!)
        )).limit(1);
      if (invItem) {
        const newStock = parseFloat(invItem.currentStock as string) + restoreQty;
        await db.update(inventoryItemsTable)
          .set({ currentStock: String(newStock) })
          .where(and(
            eq(inventoryItemsTable.id, recipe.inventoryItemId),
            eq(inventoryItemsTable.tenantId, req.user!.tenantId!)
          ));
        await db.insert(inventoryMovementsTable).values({
          tenantId: req.user!.tenantId!,
          inventoryItemId: recipe.inventoryItemId,
          type: "return",
          quantity: String(restoreQty),
          reason: `Return approved for order #${orderId}, item #${itemId}`,
          createdByUserId: req.user!.id,
        });
      }
    }

    await writeAuditLog({ user: req.user, action: "approve_item_return", entityType: "order", entityId: orderId, newValue: { itemId, newTotal } });
    res.json(await buildOrderResponse(updated));
  } catch {
    res.status(500).json({ error: "Failed to approve return" });
  }
});

// POST /orders/:orderId/items/:itemId/reject-return — owner/manager rejects
router.post("/orders/:orderId/items/:itemId/reject-return", requireAuth, requireTenant, MGMT, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const itemId = parseInt(req.params.itemId);

    const [order] = await db.select().from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.tenantId, req.user!.tenantId!)))
      .limit(1);
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    const [item] = await db.select().from(orderItemsTable)
      .where(and(eq(orderItemsTable.id, itemId), eq(orderItemsTable.orderId, orderId)))
      .limit(1);
    if (!item) { res.status(404).json({ error: "Item not found" }); return; }
    if (item.status !== "return_requested") { res.status(400).json({ error: "Item is not pending return" }); return; }

    await db.update(orderItemsTable)
      .set({ status: "return_rejected" })
      .where(eq(orderItemsTable.id, itemId));

    await writeAuditLog({ user: req.user, action: "reject_item_return", entityType: "order", entityId: orderId, newValue: { itemId } });
    res.json(await buildOrderResponse(order));
  } catch {
    res.status(500).json({ error: "Failed to reject return" });
  }
});

export default router;
