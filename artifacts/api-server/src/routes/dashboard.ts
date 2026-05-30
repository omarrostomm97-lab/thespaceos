import { Router } from "express";
import { db } from "@workspace/db";
import { sessionsTable, ordersTable, paymentsTable, assetsTable, shiftsTable, inventoryItemsTable, usersTable } from "@workspace/db";
import { eq, and, inArray, gte, sql } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeSessions, allAssets, pendingOrders, preparingOrders, inventoryItems, openShift, shifts] = await Promise.all([
      db.select().from(sessionsTable).where(and(eq(sessionsTable.tenantId, tenantId), inArray(sessionsTable.status, ["active", "paused"]))),
      db.select().from(assetsTable).where(eq(assetsTable.tenantId, tenantId)),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "pending"))),
      db.select().from(ordersTable).where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.status, "preparing"))),
      db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.tenantId, tenantId)),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "open"))).limit(1),
      db.select().from(shiftsTable).where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "closed"), gte(shiftsTable.closedAt, today))),
    ]);

    // Revenue today from verified payments
    const todayPayments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.tenantId, tenantId), eq(paymentsTable.status, "verified"), gte(paymentsTable.createdAt, today)));
    const revenueToday = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

    const lowStockAlerts = inventoryItems.filter(i => {
      const stock = parseFloat(i.currentStock as string);
      const min = i.minStockLevel ? parseFloat(i.minStockLevel as string) : null;
      return min !== null && stock <= min;
    }).length;

    const cashDiscrepancyCount = shifts.filter(s => {
      const diff = s.difference ? parseFloat(s.difference as string) : 0;
      return Math.abs(diff) > 0;
    }).length;

    res.json({
      activeSessions: activeSessions.length,
      occupiedAssets: allAssets.filter(a => a.status === "busy").length,
      totalAssets: allAssets.length,
      revenueToday: Math.round(revenueToday * 100) / 100,
      pendingOrders: pendingOrders.length,
      preparingOrders: preparingOrders.length,
      lowStockAlerts,
      openShift: openShift.length > 0,
      cashDiscrepancyCount,
      buffetWorkload: pendingOrders.length + preparingOrders.length,
    });
  } catch {
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/dashboard/revenue", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today" } = req.query;
    const now = new Date();
    let from: Date;
    if (period === "today") { from = new Date(); from.setHours(0,0,0,0); }
    else if (period === "week") { from = new Date(now.getTime() - 7 * 24 * 3600000); }
    else { from = new Date(now.getTime() - 30 * 24 * 3600000); }

    const payments = await db.select().from(paymentsTable)
      .where(and(eq(paymentsTable.tenantId, tenantId), eq(paymentsTable.status, "verified"), gte(paymentsTable.createdAt, from)));

    let cash = 0, instapay = 0, visa = 0;
    payments.forEach(p => {
      const amt = parseFloat(p.amount as string);
      if (p.method === "cash") cash += amt;
      else if (p.method === "instapay") instapay += amt;
      else if (p.method === "visa") visa += amt;
    });

    res.json({
      total: Math.round((cash + instapay + visa) * 100) / 100,
      sessionRevenue: Math.round((cash + instapay + visa) * 100) / 100,
      orderRevenue: 0,
      period: period as string,
      paymentMethodBreakdown: { cash: Math.round(cash*100)/100, instapay: Math.round(instapay*100)/100, visa: Math.round(visa*100)/100 },
    });
  } catch {
    res.status(500).json({ error: "Failed to get revenue stats" });
  }
});

router.get("/dashboard/employee-performance", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const users = await db.select().from(usersTable).where(and(eq(usersTable.tenantId, tenantId), eq(usersTable.isActive, true)));
    const result = await Promise.all(users.map(async u => {
      const orders = await db.select().from(ordersTable)
        .where(and(eq(ordersTable.tenantId, tenantId), eq(ordersTable.createdByUserId, u.id)));
      const sessions = await db.select().from(sessionsTable)
        .where(and(eq(sessionsTable.tenantId, tenantId), eq(sessionsTable.userId, u.id)));
      const revenue = sessions.reduce((sum, s) => sum + (s.totalCost ? parseFloat(s.totalCost as string) : 0), 0);
      return {
        userId: u.id, userName: u.name, role: u.role,
        ordersHandled: orders.length,
        sessionsStarted: sessions.length,
        revenue: Math.round(revenue * 100) / 100,
      };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to get employee performance" });
  }
});

export default router;
