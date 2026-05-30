import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth, requireTenant } from "../lib/auth";

const router = Router();

router.get("/audit-logs", requireAuth, requireTenant, async (req, res) => {
  try {
    const { userId, action, from, to, page = "1", limit: limitStr = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limit = Math.min(parseInt(limitStr as string), 100);
    const offset = (pageNum - 1) * limit;

    let logs = await db.select().from(auditLogsTable)
      .where(eq(auditLogsTable.tenantId, req.user!.tenantId!))
      .orderBy(auditLogsTable.createdAt);

    if (userId) logs = logs.filter(l => l.userId === parseInt(userId as string));
    if (action) logs = logs.filter(l => l.action.includes(action as string));
    if (from) logs = logs.filter(l => l.createdAt >= new Date(from as string));
    if (to) logs = logs.filter(l => l.createdAt <= new Date(to as string));

    const total = logs.length;
    const paged = logs.reverse().slice(offset, offset + limit);

    const result = await Promise.all(paged.map(async l => {
      let userName = null;
      if (l.userId) {
        const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, l.userId)).limit(1);
        userName = u?.name ?? null;
      }
      return { ...l, userName };
    }));

    res.json({ data: result, total, page: pageNum, limit });
  } catch {
    res.status(500).json({ error: "Failed to list audit logs" });
  }
});

export default router;
