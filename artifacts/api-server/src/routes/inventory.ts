import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryItemsTable, inventoryMovementsTable, usersTable } from "@workspace/db";
import { eq, and, lte } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";
import { writeAuditLog } from "../lib/audit";

const router = Router();

const fmtItem = (i: typeof inventoryItemsTable.$inferSelect) => {
  const stock = parseFloat(i.currentStock as string);
  const min = i.minStockLevel ? parseFloat(i.minStockLevel as string) : null;
  return {
    id: i.id, name: i.name, nameAr: i.nameAr, unit: i.unit,
    currentStock: stock, minStockLevel: min,
    isLowStock: min !== null && stock <= min,
    createdAt: i.createdAt,
  };
};

router.get("/inventory", requireAuth, requireTenant, async (req, res) => {
  try {
    const items = await db.select().from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.tenantId, req.user!.tenantId!))
      .orderBy(inventoryItemsTable.name);
    res.json(items.map(fmtItem));
  } catch {
    res.status(500).json({ error: "Failed to list inventory" });
  }
});

router.post("/inventory", requireAuth, requireTenant, async (req, res) => {
  try {
    const { name, nameAr, unit, currentStock, minStockLevel } = req.body;
    if (!name || !unit) { res.status(400).json({ error: "name and unit required" }); return; }
    const [item] = await db.insert(inventoryItemsTable).values({
      tenantId: req.user!.tenantId!,
      name, nameAr, unit,
      currentStock: String(currentStock ?? 0),
      minStockLevel: minStockLevel ? String(minStockLevel) : null,
    }).returning();
    await writeAuditLog({ user: req.user, action: "create_inventory_item", entityType: "inventory_item", entityId: item.id });
    res.status(201).json(fmtItem(item));
  } catch {
    res.status(500).json({ error: "Failed to create inventory item" });
  }
});

router.patch("/inventory/:itemId", requireAuth, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.itemId);
    const { name, nameAr, unit, currentStock, minStockLevel } = req.body;
    const updates: Partial<typeof inventoryItemsTable.$inferInsert> = { name, nameAr, unit };
    if (currentStock !== undefined) updates.currentStock = String(currentStock);
    if (minStockLevel !== undefined) updates.minStockLevel = String(minStockLevel);
    const [item] = await db.update(inventoryItemsTable).set(updates)
      .where(and(eq(inventoryItemsTable.id, id), eq(inventoryItemsTable.tenantId, req.user!.tenantId!)))
      .returning();
    if (!item) { res.status(404).json({ error: "Not found" }); return; }
    res.json(fmtItem(item));
  } catch {
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

router.get("/inventory/movements", requireAuth, requireTenant, async (req, res) => {
  try {
    const { itemId, type } = req.query;
    let movements = await db.select().from(inventoryMovementsTable)
      .where(eq(inventoryMovementsTable.tenantId, req.user!.tenantId!))
      .orderBy(inventoryMovementsTable.createdAt);
    if (itemId) movements = movements.filter(m => m.inventoryItemId === parseInt(itemId as string));
    if (type) movements = movements.filter(m => m.type === type);
    const result = await Promise.all(movements.reverse().slice(0, 200).map(async m => {
      const [item] = await db.select({ name: inventoryItemsTable.name })
        .from(inventoryItemsTable).where(eq(inventoryItemsTable.id, m.inventoryItemId)).limit(1);
      let approvedByName = null;
      if (m.approvedByUserId) {
        const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, m.approvedByUserId)).limit(1);
        approvedByName = u?.name ?? null;
      }
      return {
        id: m.id, inventoryItemId: m.inventoryItemId, itemName: item?.name ?? null,
        type: m.type, quantity: parseFloat(m.quantity as string), reason: m.reason,
        approvedByUserId: m.approvedByUserId, approvedByUserName: approvedByName,
        createdByUserId: m.createdByUserId, createdAt: m.createdAt,
      };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to list movements" });
  }
});

router.post("/inventory/movements", requireAuth, requireTenant, async (req, res) => {
  try {
    const { inventoryItemId, type, quantity, reason } = req.body;
    if (!inventoryItemId || !type || quantity === undefined) {
      res.status(400).json({ error: "inventoryItemId, type, quantity required" }); return;
    }
    // Adjustments require manager+
    if (type === "adjustment" && !["platform_owner", "owner", "manager"].includes(req.user!.role)) {
      res.status(403).json({ error: "Manager approval required for adjustments" }); return;
    }
    const [movement] = await db.insert(inventoryMovementsTable).values({
      tenantId: req.user!.tenantId!,
      inventoryItemId, type, quantity: String(quantity), reason,
      createdByUserId: req.user!.id,
      approvedByUserId: ["adjustment", "purchase"].includes(type) ? req.user!.id : null,
    }).returning();
    // Update stock
    const [item] = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.id, inventoryItemId)).limit(1);
    if (item) {
      const current = parseFloat(item.currentStock as string);
      const delta = ["waste", "sale"].includes(type) ? -Math.abs(quantity) : Math.abs(quantity);
      await db.update(inventoryItemsTable).set({ currentStock: String(Math.max(0, current + delta)) })
        .where(eq(inventoryItemsTable.id, inventoryItemId));
    }
    await writeAuditLog({ user: req.user, action: `inventory_${type}`, entityType: "inventory_movement", entityId: movement.id, newValue: { inventoryItemId, quantity } });
    res.status(201).json({
      id: movement.id, inventoryItemId: movement.inventoryItemId, itemName: null,
      type: movement.type, quantity: parseFloat(movement.quantity as string), reason: movement.reason,
      approvedByUserId: movement.approvedByUserId, approvedByUserName: null,
      createdByUserId: movement.createdByUserId, createdAt: movement.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Failed to create movement" });
  }
});

router.get("/inventory/alerts", requireAuth, requireTenant, async (req, res) => {
  try {
    const items = await db.select().from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.tenantId, req.user!.tenantId!));
    const alerts = items
      .map(fmtItem)
      .filter(i => i.isLowStock);
    res.json(alerts);
  } catch {
    res.status(500).json({ error: "Failed to get alerts" });
  }
});

export default router;
