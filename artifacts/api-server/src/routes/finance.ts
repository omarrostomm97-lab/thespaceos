import { Router } from "express";
import { db } from "@workspace/db";
import {
  financeCategoriesTable,
  financeAccountsTable,
  financeTransactionsTable,
  financeAssetsTable,
  financeAssetMaintenanceTable,
  expenseTemplatesTable,
  paymentsTable,
  shiftsTable,
} from "@workspace/db";
import { eq, and, gte, lte, inArray, desc, sql, isNull } from "drizzle-orm";
import { requireAuth, requireTenant, requireRole } from "../lib/auth";

const MGMT_UP = requireRole("platform_owner", "owner", "manager");

const router = Router();

function r2(n: number) { return Math.round(n * 100) / 100; }

function parseDateRange(period: string, now: Date): { from: Date; to: Date } {
  const to = new Date(now);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  if (period === "today") return { from, to };
  if (period === "week") { from.setDate(from.getDate() - 6); return { from, to }; }
  if (period === "month") { from.setDate(from.getDate() - 29); return { from, to }; }
  if (period === "quarter") { from.setDate(from.getDate() - 89); return { from, to }; }
  return { from, to };
}

/* ─── Default seed ──────────────────────────────────────────── */
router.post("/finance/seed-defaults", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;

    // Check if already seeded
    const existing = await db.select().from(financeCategoriesTable)
      .where(and(eq(financeCategoriesTable.tenantId, tenantId), eq(financeCategoriesTable.isSystem, true)))
      .limit(1);
    if (existing.length > 0) {
      res.json({ message: "Already seeded" }); return;
    }

    // Default expense categories
    const expenseCategories = [
      { name: "Electricity", nameAr: "الكهرباء", color: "#f59e0b", icon: "⚡" },
      { name: "Internet", nameAr: "الإنترنت", color: "#3b82f6", icon: "🌐" },
      { name: "Rent", nameAr: "الإيجار", color: "#8b5cf6", icon: "🏠" },
      { name: "Salaries", nameAr: "الرواتب", color: "#10b981", icon: "💼" },
      { name: "Maintenance", nameAr: "الصيانة", color: "#f97316", icon: "🔧" },
      { name: "Device Repair", nameAr: "إصلاح الأجهزة", color: "#ef4444", icon: "🛠️" },
      { name: "Stock Purchase", nameAr: "شراء المخزون", color: "#06b6d4", icon: "📦" },
      { name: "Cleaning", nameAr: "التنظيف", color: "#84cc16", icon: "🧹" },
      { name: "Marketing", nameAr: "التسويق", color: "#ec4899", icon: "📣" },
      { name: "Software", nameAr: "البرمجيات", color: "#6366f1", icon: "💻" },
      { name: "Taxes", nameAr: "الضرائب", color: "#64748b", icon: "📋" },
      { name: "Other", nameAr: "أخرى", color: "#94a3b8", icon: "📌" },
    ];
    for (const c of expenseCategories) {
      await db.insert(financeCategoriesTable).values({ tenantId, ...c, type: "expense", isSystem: true });
    }

    // Default income categories
    const incomeCategories = [
      { name: "Gaming Sessions", nameAr: "جلسات الألعاب", color: "#3b82f6", icon: "🎮" },
      { name: "Cafe Orders", nameAr: "طلبات الكافيه", color: "#f97316", icon: "☕" },
      { name: "Room Orders", nameAr: "طلبات الغرف", color: "#8b5cf6", icon: "🍔" },
      { name: "Private Bookings", nameAr: "الحجوزات الخاصة", color: "#10b981", icon: "📅" },
      { name: "Manual Income", nameAr: "دخل يدوي", color: "#06b6d4", icon: "💵" },
      { name: "Other Income", nameAr: "دخل أخرى", color: "#94a3b8", icon: "📌" },
    ];
    for (const c of incomeCategories) {
      await db.insert(financeCategoriesTable).values({ tenantId, ...c, type: "income", isSystem: true });
    }

    // Default capital categories
    await db.insert(financeCategoriesTable).values([
      { tenantId, name: "Owner Capital", nameAr: "رأس مال المالك", type: "capital", color: "#10b981", icon: "💰", isSystem: true },
      { tenantId, name: "Partner Contribution", nameAr: "مساهمة شريك", type: "capital", color: "#6366f1", icon: "🤝", isSystem: true },
    ]);

    // Default withdrawal categories
    await db.insert(financeCategoriesTable).values([
      { tenantId, name: "Owner Withdrawal", nameAr: "سحب المالك", type: "withdrawal", color: "#ef4444", icon: "💸", isSystem: true },
      { tenantId, name: "Partner Withdrawal", nameAr: "سحب الشريك", type: "withdrawal", color: "#f59e0b", icon: "💸", isSystem: true },
    ]);

    // Default accounts
    await db.insert(financeAccountsTable).values([
      { tenantId, name: "Cash", nameAr: "كاش", type: "cash", isDefault: true, openingBalance: "0", currentBalance: "0" },
      { tenantId, name: "Bank", nameAr: "بنك", type: "bank", openingBalance: "0", currentBalance: "0" },
      { tenantId, name: "InstaPay / Wallet", nameAr: "انستاباي / محفظة", type: "wallet", openingBalance: "0", currentBalance: "0" },
      { tenantId, name: "Card Machine", nameAr: "ماكينة كارت", type: "card_processor", openingBalance: "0", currentBalance: "0" },
    ]);

    res.json({ message: "Seeded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to seed defaults" });
  }
});

/* ─── Overview ──────────────────────────────────────────────── */
router.get("/finance/overview", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "today" } = req.query as Record<string, string>;
    const now = new Date();
    const { from, to } = parseDateRange(period, now);

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now); monthStart.setDate(monthStart.getDate() - 29); monthStart.setHours(0, 0, 0, 0);

    // Verified income from existing payments (today)
    const todayPayments = await db.select({ amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, tenantId),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, todayStart),
      ));
    const incomeToday = r2(todayPayments.reduce((s, p) => s + parseFloat(p.amount as string), 0));

    // Verified income this month
    const monthPayments = await db.select({ amount: paymentsTable.amount })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, tenantId),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, monthStart),
      ));
    const incomeMonth = r2(monthPayments.reduce((s, p) => s + parseFloat(p.amount as string), 0));

    // Finance transactions
    const allTx = await db.select().from(financeTransactionsTable)
      .where(eq(financeTransactionsTable.tenantId, tenantId));

    const todayTx = allTx.filter(t => new Date(t.transactionDate) >= todayStart);
    const monthTx = allTx.filter(t => new Date(t.transactionDate) >= monthStart);

    const expensesToday = r2(todayTx.filter(t => t.type === "expense" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const expensesMonth = r2(monthTx.filter(t => t.type === "expense" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const pendingBills = r2(allTx.filter(t => t.type === "expense" && t.status === "pending").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const pendingBillsCount = allTx.filter(t => t.type === "expense" && t.status === "pending").length;
    const capitalMonth = r2(monthTx.filter(t => t.type === "capital_injection" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const withdrawalsMonth = r2(monthTx.filter(t => t.type === "owner_withdrawal" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));

    const profitToday = r2(incomeToday - expensesToday);
    const profitMonth = r2(incomeMonth - expensesMonth);

    // Cash available from accounts
    const accounts = await db.select().from(financeAccountsTable)
      .where(and(eq(financeAccountsTable.tenantId, tenantId), eq(financeAccountsTable.isActive, true)));
    const cashAvailable = r2(accounts.reduce((s, a) => s + parseFloat(a.currentBalance as string), 0));

    // Cash discrepancies from shifts today
    const todayShifts = await db.select().from(shiftsTable)
      .where(and(
        eq(shiftsTable.tenantId, tenantId),
        eq(shiftsTable.status, "closed"),
        gte(shiftsTable.closedAt, todayStart),
      ));
    const cashDiscrepancyCount = todayShifts.filter(s => {
      const diff = s.difference ? parseFloat(s.difference as string) : 0;
      return Math.abs(diff) > 0;
    }).length;

    // Biggest expense category this month
    const categoryTotals: Record<number, number> = {};
    for (const t of monthTx.filter(tx => tx.type === "expense" && tx.status === "paid" && tx.categoryId)) {
      categoryTotals[t.categoryId!] = (categoryTotals[t.categoryId!] ?? 0) + parseFloat(t.amount as string);
    }
    let biggestCategoryName: string | null = null;
    let biggestCategoryNameAr: string | null = null;
    const catEntries = Object.entries(categoryTotals);
    if (catEntries.length > 0) {
      const topId = parseInt(catEntries.sort((a, b) => b[1] - a[1])[0][0]);
      const cat = await db.select().from(financeCategoriesTable).where(eq(financeCategoriesTable.id, topId)).limit(1);
      if (cat[0]) { biggestCategoryName = cat[0].name; biggestCategoryNameAr = cat[0].nameAr ?? null; }
    }

    res.json({
      incomeToday,
      incomeMonth,
      expensesToday,
      expensesMonth,
      profitToday,
      profitMonth,
      cashAvailable,
      pendingBills,
      pendingBillsCount,
      capitalMonth,
      withdrawalsMonth,
      cashDiscrepancyCount,
      biggestCategoryName,
      biggestCategoryNameAr,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get finance overview" });
  }
});

/* ─── Categories ─────────────────────────────────────────────── */
router.get("/finance/categories", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { type } = req.query as Record<string, string>;

    // Lazy seed: if tenant has no system categories yet, seed defaults now
    const existing = await db.select({ id: financeCategoriesTable.id }).from(financeCategoriesTable)
      .where(and(eq(financeCategoriesTable.tenantId, tenantId), eq(financeCategoriesTable.isSystem, true)))
      .limit(1);
    if (existing.length === 0) {
      const expenseCategories = [
        { name: "Electricity", nameAr: "الكهرباء", color: "#f59e0b", icon: "⚡" },
        { name: "Internet", nameAr: "الإنترنت", color: "#3b82f6", icon: "🌐" },
        { name: "Rent", nameAr: "الإيجار", color: "#8b5cf6", icon: "🏠" },
        { name: "Salaries", nameAr: "الرواتب", color: "#10b981", icon: "💼" },
        { name: "Maintenance", nameAr: "الصيانة", color: "#f97316", icon: "🔧" },
        { name: "Device Repair", nameAr: "إصلاح الأجهزة", color: "#ef4444", icon: "🛠️" },
        { name: "Stock Purchase", nameAr: "شراء المخزون", color: "#06b6d4", icon: "📦" },
        { name: "Cleaning", nameAr: "التنظيف", color: "#84cc16", icon: "🧹" },
        { name: "Marketing", nameAr: "التسويق", color: "#ec4899", icon: "📣" },
        { name: "Software", nameAr: "البرمجيات", color: "#6366f1", icon: "💻" },
        { name: "Taxes", nameAr: "الضرائب", color: "#64748b", icon: "📋" },
        { name: "Other", nameAr: "أخرى", color: "#94a3b8", icon: "📌" },
      ];
      for (const c of expenseCategories) {
        await db.insert(financeCategoriesTable).values({ tenantId, ...c, type: "expense", isSystem: true });
      }
      const incomeCategories = [
        { name: "Gaming Sessions", nameAr: "جلسات الألعاب", color: "#3b82f6", icon: "🎮" },
        { name: "Cafe Orders", nameAr: "طلبات الكافيه", color: "#f97316", icon: "☕" },
        { name: "Room Orders", nameAr: "طلبات الغرف", color: "#8b5cf6", icon: "🍔" },
        { name: "Private Bookings", nameAr: "الحجوزات الخاصة", color: "#10b981", icon: "📅" },
        { name: "Manual Income", nameAr: "دخل يدوي", color: "#06b6d4", icon: "💵" },
        { name: "Other Income", nameAr: "دخل أخرى", color: "#94a3b8", icon: "📌" },
      ];
      for (const c of incomeCategories) {
        await db.insert(financeCategoriesTable).values({ tenantId, ...c, type: "income", isSystem: true });
      }
      await db.insert(financeCategoriesTable).values([
        { tenantId, name: "Owner Capital", nameAr: "رأس مال المالك", type: "capital", color: "#10b981", icon: "💰", isSystem: true },
        { tenantId, name: "Partner Contribution", nameAr: "مساهمة شريك", type: "capital", color: "#6366f1", icon: "🤝", isSystem: true },
        { tenantId, name: "Owner Withdrawal", nameAr: "سحب المالك", type: "withdrawal", color: "#ef4444", icon: "💸", isSystem: true },
        { tenantId, name: "Partner Withdrawal", nameAr: "سحب الشريك", type: "withdrawal", color: "#f59e0b", icon: "💸", isSystem: true },
      ]);
      // Also seed default accounts if none exist
      const existingAccounts = await db.select({ id: financeAccountsTable.id }).from(financeAccountsTable)
        .where(eq(financeAccountsTable.tenantId, tenantId)).limit(1);
      if (existingAccounts.length === 0) {
        await db.insert(financeAccountsTable).values([
          { tenantId, name: "Cash", nameAr: "كاش", type: "cash", isDefault: true, openingBalance: "0", currentBalance: "0" },
          { tenantId, name: "Bank", nameAr: "بنك", type: "bank", openingBalance: "0", currentBalance: "0" },
          { tenantId, name: "InstaPay / Wallet", nameAr: "انستاباي / محفظة", type: "wallet", openingBalance: "0", currentBalance: "0" },
          { tenantId, name: "Card Machine", nameAr: "ماكينة كارت", type: "card_processor", openingBalance: "0", currentBalance: "0" },
        ]);
      }
    }

    const rows = await db.select().from(financeCategoriesTable)
      .where(and(
        eq(financeCategoriesTable.tenantId, tenantId),
        ...(type ? [eq(financeCategoriesTable.type, type)] : []),
      ));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.post("/finance/categories", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { name, nameAr, type, color, icon } = req.body;
    if (!name || !type) { res.status(400).json({ error: "name and type are required" }); return; }
    const [row] = await db.insert(financeCategoriesTable)
      .values({ tenantId, name, nameAr, type, color, icon, isSystem: false })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/finance/categories/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    const { name, nameAr, color, icon } = req.body;
    const [row] = await db.update(financeCategoriesTable)
      .set({ name, nameAr, color, icon, updatedAt: new Date() })
      .where(and(eq(financeCategoriesTable.id, id), eq(financeCategoriesTable.tenantId, tenantId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/finance/categories/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    await db.delete(financeCategoriesTable)
      .where(and(
        eq(financeCategoriesTable.id, id),
        eq(financeCategoriesTable.tenantId, tenantId),
        eq(financeCategoriesTable.isSystem, false),
      ));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

/* ─── Accounts ───────────────────────────────────────────────── */
router.get("/finance/accounts", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const rows = await db.select().from(financeAccountsTable)
      .where(eq(financeAccountsTable.tenantId, tenantId))
      .orderBy(financeAccountsTable.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get accounts" });
  }
});

router.post("/finance/accounts", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { name, nameAr, type, openingBalance } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const bal = openingBalance ?? "0";
    const [row] = await db.insert(financeAccountsTable)
      .values({ tenantId, name, nameAr, type: type ?? "cash", openingBalance: bal, currentBalance: bal })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.put("/finance/accounts/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    const { name, nameAr, currentBalance, isActive, isDefault } = req.body;
    const [row] = await db.update(financeAccountsTable)
      .set({ ...(name !== undefined && { name }), ...(nameAr !== undefined && { nameAr }), ...(currentBalance !== undefined && { currentBalance }), ...(isActive !== undefined && { isActive }), ...(isDefault !== undefined && { isDefault }), updatedAt: new Date() })
      .where(and(eq(financeAccountsTable.id, id), eq(financeAccountsTable.tenantId, tenantId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update account" });
  }
});

/* ─── Transactions ───────────────────────────────────────────── */
router.get("/finance/transactions", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "month", type, status, categoryId, accountId, from: fromParam, to: toParam } = req.query as Record<string, string>;
    const now = new Date();

    let from: Date;
    if (period === "custom" && fromParam) {
      from = new Date(fromParam); from.setHours(0, 0, 0, 0);
    } else if (period === "today") { from = new Date(now); from.setHours(0, 0, 0, 0); }
    else if (period === "week") { from = new Date(now); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0); }
    else { from = new Date(now); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0); }

    const to: Date | null = period === "custom" && toParam ? new Date(new Date(toParam).setHours(23, 59, 59, 999)) : null;

    const conditions: any[] = [
      eq(financeTransactionsTable.tenantId, tenantId),
      gte(financeTransactionsTable.transactionDate, from),
    ];
    if (to) conditions.push(lte(financeTransactionsTable.transactionDate, to));
    if (type) conditions.push(eq(financeTransactionsTable.type, type));
    if (status) conditions.push(eq(financeTransactionsTable.status, status));
    if (categoryId) conditions.push(eq(financeTransactionsTable.categoryId, parseInt(categoryId)));
    if (accountId) conditions.push(eq(financeTransactionsTable.accountId, parseInt(accountId)));

    const rows = await db.select({
      transaction: financeTransactionsTable,
      categoryName: financeCategoriesTable.name,
      categoryNameAr: financeCategoriesTable.nameAr,
      categoryColor: financeCategoriesTable.color,
      categoryIcon: financeCategoriesTable.icon,
      accountName: financeAccountsTable.name,
      accountNameAr: financeAccountsTable.nameAr,
    })
      .from(financeTransactionsTable)
      .leftJoin(financeCategoriesTable, eq(financeTransactionsTable.categoryId, financeCategoriesTable.id))
      .leftJoin(financeAccountsTable, eq(financeTransactionsTable.accountId, financeAccountsTable.id))
      .where(and(...conditions))
      .orderBy(desc(financeTransactionsTable.transactionDate));

    res.json(rows.map(r => ({
      ...r.transaction,
      categoryName: r.categoryName,
      categoryNameAr: r.categoryNameAr,
      categoryColor: r.categoryColor,
      categoryIcon: r.categoryIcon,
      accountName: r.accountName,
      accountNameAr: r.accountNameAr,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get transactions" });
  }
});

router.post("/finance/transactions", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const userId = req.user!.id;
    const { type, categoryId, accountId, title, description, amount, transactionDate, paymentMethod, status, referenceType, referenceId, vendorName, notes, templateId, deductFromShift, shiftId } = req.body;
    if (!type || !amount) { res.status(400).json({ error: "type and amount are required" }); return; }

    // Auto-generate title if missing
    let finalTitle = title;
    if (!finalTitle && categoryId) {
      const cat = await db.select().from(financeCategoriesTable).where(eq(financeCategoriesTable.id, categoryId)).limit(1);
      if (cat[0]) {
        const now = new Date();
        finalTitle = `${cat[0].name} - ${now.toLocaleString("en", { month: "long", year: "numeric" })}`;
      }
    }

    // Auto-link the open shift when deductFromShift is true and no shiftId provided
    let linkedShiftId: number | null = shiftId ?? null;
    if (deductFromShift === true && !linkedShiftId) {
      const [openShift] = await db.select({ id: shiftsTable.id })
        .from(shiftsTable)
        .where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "open")))
        .limit(1);
      linkedShiftId = openShift?.id ?? null;
    }

    const [row] = await db.insert(financeTransactionsTable)
      .values({
        tenantId, type,
        categoryId: categoryId ?? null,
        accountId: accountId ?? null,
        title: finalTitle ?? null,
        description: description ?? null,
        amount: String(amount),
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        paymentMethod: paymentMethod ?? null,
        status: status ?? "paid",
        referenceType: referenceType ?? "manual",
        referenceId: referenceId ? String(referenceId) : null,
        vendorName: vendorName ?? null,
        notes: notes ?? null,
        templateId: templateId ?? null,
        deductFromShift: deductFromShift === true,
        shiftId: linkedShiftId,
        createdByUserId: userId,
      })
      .returning();

    // Update account balance
    if (accountId && status === "paid") {
      const account = await db.select().from(financeAccountsTable)
        .where(and(eq(financeAccountsTable.id, accountId), eq(financeAccountsTable.tenantId, tenantId)))
        .limit(1);
      if (account[0]) {
        const current = parseFloat(account[0].currentBalance as string);
        let newBalance = current;
        if (type === "income" || type === "capital_injection") newBalance += parseFloat(String(amount));
        else if (type === "expense" || type === "owner_withdrawal") newBalance -= parseFloat(String(amount));
        await db.update(financeAccountsTable)
          .set({ currentBalance: String(r2(newBalance)), updatedAt: new Date() })
          .where(eq(financeAccountsTable.id, accountId));
      }
    }

    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.put("/finance/transactions/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    const { title, description, status, vendorName, notes, categoryId, accountId } = req.body;
    const [row] = await db.update(financeTransactionsTable)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(vendorName !== undefined && { vendorName }),
        ...(notes !== undefined && { notes }),
        ...(categoryId !== undefined && { categoryId }),
        ...(accountId !== undefined && { accountId }),
        updatedAt: new Date(),
      })
      .where(and(eq(financeTransactionsTable.id, id), eq(financeTransactionsTable.tenantId, tenantId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

router.delete("/finance/transactions/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    await db.delete(financeTransactionsTable)
      .where(and(eq(financeTransactionsTable.id, id), eq(financeTransactionsTable.tenantId, tenantId)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

/* ─── Finance Assets ─────────────────────────────────────────── */
router.get("/finance/assets", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const rows = await db.select().from(financeAssetsTable)
      .where(eq(financeAssetsTable.tenantId, tenantId))
      .orderBy(desc(financeAssetsTable.createdAt));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get assets" });
  }
});

router.post("/finance/assets", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { name, nameAr, category, purchaseCost, purchaseDate, assignedRoomId, condition, warrantyEndDate, notes } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const [row] = await db.insert(financeAssetsTable)
      .values({
        tenantId, name, nameAr: nameAr ?? null,
        category: category ?? null,
        purchaseCost: purchaseCost ? String(purchaseCost) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        assignedRoomId: assignedRoomId ?? null,
        condition: condition ?? "good",
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        notes: notes ?? null,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create asset" });
  }
});

router.put("/finance/assets/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    const { name, nameAr, category, condition, notes, warrantyEndDate } = req.body;
    const [row] = await db.update(financeAssetsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(nameAr !== undefined && { nameAr }),
        ...(category !== undefined && { category }),
        ...(condition !== undefined && { condition }),
        ...(notes !== undefined && { notes }),
        ...(warrantyEndDate !== undefined && { warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null }),
        updatedAt: new Date(),
      })
      .where(and(eq(financeAssetsTable.id, id), eq(financeAssetsTable.tenantId, tenantId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update asset" });
  }
});

router.delete("/finance/assets/:id", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const id = parseInt(req.params.id as string);
    await db.delete(financeAssetsTable)
      .where(and(eq(financeAssetsTable.id, id), eq(financeAssetsTable.tenantId, tenantId)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

router.post("/finance/assets/:id/maintenance", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const userId = req.user!.id;
    const assetId = parseInt(req.params.id as string);
    const { title, description, maintenanceCost, maintenanceDate, vendorName, accountId } = req.body;
    if (!title) { res.status(400).json({ error: "title is required" }); return; }

    let txId: number | null = null;

    // Create expense transaction if cost provided
    if (maintenanceCost && parseFloat(String(maintenanceCost)) > 0) {
      const [tx] = await db.insert(financeTransactionsTable)
        .values({
          tenantId, type: "expense",
          title: title ?? `Maintenance - Asset #${assetId}`,
          amount: String(maintenanceCost),
          transactionDate: maintenanceDate ? new Date(maintenanceDate) : new Date(),
          status: "paid",
          referenceType: "maintenance",
          referenceId: String(assetId),
          vendorName: vendorName ?? null,
          accountId: accountId ?? null,
          createdByUserId: userId,
        })
        .returning();
      txId = tx.id;

      // Update account balance
      if (accountId) {
        const account = await db.select().from(financeAccountsTable)
          .where(and(eq(financeAccountsTable.id, accountId), eq(financeAccountsTable.tenantId, tenantId)))
          .limit(1);
        if (account[0]) {
          const newBal = r2(parseFloat(account[0].currentBalance as string) - parseFloat(String(maintenanceCost)));
          await db.update(financeAccountsTable)
            .set({ currentBalance: String(newBal), updatedAt: new Date() })
            .where(eq(financeAccountsTable.id, accountId));
        }
      }
    }

    const [log] = await db.insert(financeAssetMaintenanceTable)
      .values({
        tenantId, assetId, title, description: description ?? null,
        maintenanceCost: maintenanceCost ? String(maintenanceCost) : null,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : new Date(),
        vendorName: vendorName ?? null,
        financeTransactionId: txId,
      })
      .returning();

    // Update asset condition if needed
    await db.update(financeAssetsTable)
      .set({ condition: "good", updatedAt: new Date() })
      .where(and(eq(financeAssetsTable.id, assetId), eq(financeAssetsTable.tenantId, tenantId)));

    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add maintenance log" });
  }
});

router.get("/finance/assets/:id/maintenance", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const assetId = parseInt(req.params.id as string);
    const rows = await db.select().from(financeAssetMaintenanceTable)
      .where(and(
        eq(financeAssetMaintenanceTable.tenantId, tenantId),
        eq(financeAssetMaintenanceTable.assetId, assetId),
      ))
      .orderBy(desc(financeAssetMaintenanceTable.maintenanceDate));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get maintenance logs" });
  }
});

/* ─── Reports ────────────────────────────────────────────────── */

// Daily Summary
router.get("/finance/reports/daily-summary", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const from = new Date(date); from.setHours(0, 0, 0, 0);
    const to = new Date(date); to.setHours(23, 59, 59, 999);

    const payments = await db.select().from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, tenantId),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, from),
        lte(paymentsTable.createdAt, to),
      ));
    const verifiedIncome = r2(payments.reduce((s, p) => s + parseFloat(p.amount as string), 0));

    const txToday = await db.select().from(financeTransactionsTable)
      .where(and(
        eq(financeTransactionsTable.tenantId, tenantId),
        gte(financeTransactionsTable.transactionDate, from),
        lte(financeTransactionsTable.transactionDate, to),
      ));
    const expensesPaid = r2(txToday.filter(t => t.type === "expense" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const capitalAdded = r2(txToday.filter(t => t.type === "capital_injection" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));
    const withdrawals = r2(txToday.filter(t => t.type === "owner_withdrawal" && t.status === "paid").reduce((s, t) => s + parseFloat(t.amount as string), 0));

    const shifts = await db.select().from(shiftsTable)
      .where(and(
        eq(shiftsTable.tenantId, tenantId),
        eq(shiftsTable.status, "closed"),
        gte(shiftsTable.closedAt, from),
        lte(shiftsTable.closedAt, to),
      ));
    const actualCashCounted = r2(shifts.reduce((s, sh) => s + (sh.actualCash ? parseFloat(sh.actualCash as string) : 0), 0));
    const expectedCash = r2(shifts.reduce((s, sh) => s + (sh.expectedCash ? parseFloat(sh.expectedCash as string) : 0), 0));
    const cashDifference = r2(actualCashCounted - expectedCash);

    res.json({
      date: from.toISOString().slice(0, 10),
      verifiedIncome,
      expensesPaid,
      capitalAdded,
      withdrawals,
      netProfit: r2(verifiedIncome - expensesPaid),
      actualCashCounted,
      expectedCash,
      cashDifference,
      shiftsCount: shifts.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get daily summary" });
  }
});

// Profit & Loss
router.get("/finance/reports/profit-loss", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "month" } = req.query as Record<string, string>;
    const now = new Date();
    const { from } = parseDateRange(period, now);

    const payments = await db.select().from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, tenantId),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, from),
      ));
    const totalIncome = r2(payments.reduce((s, p) => s + parseFloat(p.amount as string), 0));

    const txList = await db.select({
      tx: financeTransactionsTable,
      catName: financeCategoriesTable.name,
      catNameAr: financeCategoriesTable.nameAr,
    })
      .from(financeTransactionsTable)
      .leftJoin(financeCategoriesTable, eq(financeTransactionsTable.categoryId, financeCategoriesTable.id))
      .where(and(
        eq(financeTransactionsTable.tenantId, tenantId),
        gte(financeTransactionsTable.transactionDate, from),
      ));

    const paidExpenses = txList.filter(r => r.tx.type === "expense" && r.tx.status === "paid");
    const totalExpenses = r2(paidExpenses.reduce((s, r) => s + parseFloat(r.tx.amount as string), 0));

    // Group by category
    const byCategory: Record<string, { name: string; nameAr: string | null; total: number }> = {};
    for (const r of paidExpenses) {
      const key = r.catName ?? "Other";
      if (!byCategory[key]) byCategory[key] = { name: key, nameAr: r.catNameAr ?? null, total: 0 };
      byCategory[key].total = r2(byCategory[key].total + parseFloat(r.tx.amount as string));
    }

    res.json({
      period,
      totalIncome,
      totalExpenses,
      netProfit: r2(totalIncome - totalExpenses),
      expensesByCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get profit/loss report" });
  }
});

// Expense Breakdown
router.get("/finance/reports/expenses", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "month" } = req.query as Record<string, string>;
    const now = new Date();
    const { from } = parseDateRange(period, now);

    const rows = await db.select({
      tx: financeTransactionsTable,
      catName: financeCategoriesTable.name,
      catNameAr: financeCategoriesTable.nameAr,
      catColor: financeCategoriesTable.color,
      catIcon: financeCategoriesTable.icon,
    })
      .from(financeTransactionsTable)
      .leftJoin(financeCategoriesTable, eq(financeTransactionsTable.categoryId, financeCategoriesTable.id))
      .where(and(
        eq(financeTransactionsTable.tenantId, tenantId),
        eq(financeTransactionsTable.type, "expense"),
        gte(financeTransactionsTable.transactionDate, from),
      ))
      .orderBy(desc(financeTransactionsTable.transactionDate));

    const total = r2(rows.filter(r => r.tx.status === "paid").reduce((s, r) => s + parseFloat(r.tx.amount as string), 0));
    const pending = r2(rows.filter(r => r.tx.status === "pending").reduce((s, r) => s + parseFloat(r.tx.amount as string), 0));

    res.json({
      period, total, pending,
      transactions: rows.map(r => ({
        ...r.tx,
        categoryName: r.catName,
        categoryNameAr: r.catNameAr,
        categoryColor: r.catColor,
        categoryIcon: r.catIcon,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get expense report" });
  }
});

// Shift Differences (cash discrepancy report)
router.get("/finance/reports/shift-differences", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "month" } = req.query as Record<string, string>;
    const now = new Date();
    const { from } = parseDateRange(period, now);

    const shifts = await db.select().from(shiftsTable)
      .where(and(
        eq(shiftsTable.tenantId, tenantId),
        eq(shiftsTable.status, "closed"),
        gte(shiftsTable.closedAt, from),
      ))
      .orderBy(desc(shiftsTable.closedAt));

    res.json(shifts.map(s => ({
      id: s.id,
      openedAt: s.openedAt,
      closedAt: s.closedAt,
      openingCash: s.openingCash,
      expectedCash: s.expectedCash,
      actualCash: s.actualCash,
      difference: s.difference,
      differenceExplanation: s.differenceExplanation,
      status: Math.abs(parseFloat(s.difference as string ?? "0")) > 0 ? "discrepancy" : "balanced",
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to get shift differences report" });
  }
});

// Cash Flow
router.get("/finance/reports/cash-flow", requireAuth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { period = "month" } = req.query as Record<string, string>;
    const now = new Date();
    const { from, to } = parseDateRange(period, now);
    const days = period === "today" ? 1 : period === "week" ? 7 : 30;

    const payments = await db.select().from(paymentsTable)
      .where(and(
        eq(paymentsTable.tenantId, tenantId),
        eq(paymentsTable.status, "verified"),
        gte(paymentsTable.createdAt, from),
      ));

    const txList = await db.select().from(financeTransactionsTable)
      .where(and(
        eq(financeTransactionsTable.tenantId, tenantId),
        gte(financeTransactionsTable.transactionDate, from),
      ));

    // Build daily map
    const dailyMap: Record<string, { date: string; income: number; expenses: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: key, income: 0, expenses: 0 };
    }
    payments.forEach(p => {
      const key = new Date(p.createdAt!).toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key].income = r2(dailyMap[key].income + parseFloat(p.amount as string));
    });
    txList.filter(t => t.type === "expense" && t.status === "paid").forEach(t => {
      const key = new Date(t.transactionDate).toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key].expenses = r2(dailyMap[key].expenses + parseFloat(t.amount as string));
    });

    res.json({
      period,
      dailyFlow: Object.values(dailyMap).map(d => ({ ...d, net: r2(d.income - d.expenses) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get cash flow report" });
  }
});

/* ─── Expense Templates ───────────────────────────────────────── */

function fmtTemplate(t: typeof expenseTemplatesTable.$inferSelect & { categoryName?: string | null; categoryNameAr?: string | null; categoryColor?: string | null; categoryIcon?: string | null }) {
  return {
    ...t,
    amount: t.amount,
    categoryName: t.categoryName ?? null,
    categoryNameAr: t.categoryNameAr ?? null,
    categoryColor: t.categoryColor ?? null,
    categoryIcon: t.categoryIcon ?? null,
  };
}

router.get("/finance/expense-templates", requireAuth, requireTenant, MGMT_UP, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const rows = await db
      .select({
        id: expenseTemplatesTable.id,
        tenantId: expenseTemplatesTable.tenantId,
        title: expenseTemplatesTable.title,
        titleAr: expenseTemplatesTable.titleAr,
        amount: expenseTemplatesTable.amount,
        categoryId: expenseTemplatesTable.categoryId,
        accountId: expenseTemplatesTable.accountId,
        paymentMethod: expenseTemplatesTable.paymentMethod,
        frequency: expenseTemplatesTable.frequency,
        applyDay: expenseTemplatesTable.applyDay,
        autoApply: expenseTemplatesTable.autoApply,
        deductFromShift: expenseTemplatesTable.deductFromShift,
        isActive: expenseTemplatesTable.isActive,
        notes: expenseTemplatesTable.notes,
        createdAt: expenseTemplatesTable.createdAt,
        updatedAt: expenseTemplatesTable.updatedAt,
        categoryName: financeCategoriesTable.name,
        categoryNameAr: financeCategoriesTable.nameAr,
        categoryColor: financeCategoriesTable.color,
        categoryIcon: financeCategoriesTable.icon,
      })
      .from(expenseTemplatesTable)
      .leftJoin(financeCategoriesTable, eq(expenseTemplatesTable.categoryId, financeCategoriesTable.id))
      .where(eq(expenseTemplatesTable.tenantId, tenantId))
      .orderBy(desc(expenseTemplatesTable.createdAt));

    // Attach lastAppliedAt per template via one batch query
    const tmplIds = rows.map(r => r.id);
    let lastAppliedMap: Record<number, string | null> = {};
    if (tmplIds.length > 0) {
      const lastApplied = await db
        .select({
          templateId: financeTransactionsTable.templateId,
          lastAppliedAt: sql<string>`max(${financeTransactionsTable.transactionDate})`,
        })
        .from(financeTransactionsTable)
        .where(and(
          eq(financeTransactionsTable.tenantId, tenantId),
          inArray(financeTransactionsTable.templateId, tmplIds),
        ))
        .groupBy(financeTransactionsTable.templateId);
      for (const r of lastApplied) {
        if (r.templateId) lastAppliedMap[r.templateId] = r.lastAppliedAt;
      }
    }

    res.json(rows.map(r => ({ ...r, lastAppliedAt: lastAppliedMap[r.id] ?? null })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list expense templates" });
  }
});

router.post("/finance/expense-templates", requireAuth, requireTenant, MGMT_UP, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const { title, titleAr, amount, categoryId, accountId, paymentMethod, frequency, applyDay, autoApply, deductFromShift, isActive, notes } = req.body;
    if (!title || amount === undefined) {
      res.status(400).json({ error: "title and amount are required" }); return;
    }
    const [row] = await db.insert(expenseTemplatesTable).values({
      tenantId,
      title,
      titleAr: titleAr ?? null,
      amount: String(parseFloat(amount)),
      categoryId: categoryId ?? null,
      accountId: accountId ?? null,
      paymentMethod: paymentMethod ?? "cash",
      frequency: frequency ?? "daily",
      applyDay: applyDay ?? null,
      autoApply: autoApply ?? false,
      deductFromShift: deductFromShift !== false,
      isActive: isActive !== undefined ? isActive : true,
      notes: notes ?? null,
    }).returning();
    res.status(201).json({ ...row, lastAppliedAt: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create expense template" });
  }
});

router.patch("/finance/expense-templates/:templateId", requireAuth, requireTenant, MGMT_UP, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const templateId = parseInt(req.params.templateId as string);
    const [existing] = await db.select().from(expenseTemplatesTable)
      .where(and(eq(expenseTemplatesTable.id, templateId), eq(expenseTemplatesTable.tenantId, tenantId)))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Template not found" }); return; }
    const { title, titleAr, amount, categoryId, accountId, paymentMethod, frequency, applyDay, autoApply, deductFromShift, isActive, notes } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (titleAr !== undefined) updates.titleAr = titleAr;
    if (amount !== undefined) updates.amount = String(parseFloat(amount));
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (accountId !== undefined) updates.accountId = accountId;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (frequency !== undefined) updates.frequency = frequency;
    if (applyDay !== undefined) updates.applyDay = applyDay;
    if (autoApply !== undefined) updates.autoApply = autoApply;
    if (deductFromShift !== undefined) updates.deductFromShift = deductFromShift;
    if (isActive !== undefined) updates.isActive = isActive;
    if (notes !== undefined) updates.notes = notes;
    const [updated] = await db.update(expenseTemplatesTable).set(updates as any)
      .where(eq(expenseTemplatesTable.id, templateId)).returning();
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update expense template" });
  }
});

router.post("/finance/expense-templates/:templateId/apply", requireAuth, requireTenant, MGMT_UP, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const userId = req.user!.id;
    const templateId = parseInt(req.params.templateId as string);
    const [tmpl] = await db.select().from(expenseTemplatesTable)
      .where(and(eq(expenseTemplatesTable.id, templateId), eq(expenseTemplatesTable.tenantId, tenantId)))
      .limit(1);
    if (!tmpl) { res.status(404).json({ error: "Template not found" }); return; }

    // Find the open shift if deductFromShift
    let linkedShiftId: number | null = null;
    if (tmpl.deductFromShift) {
      const [openShift] = await db.select({ id: shiftsTable.id })
        .from(shiftsTable)
        .where(and(eq(shiftsTable.tenantId, tenantId), eq(shiftsTable.status, "open")))
        .limit(1);
      linkedShiftId = openShift?.id ?? null;
    }

    const [tx] = await db.insert(financeTransactionsTable).values({
      tenantId,
      type: "expense",
      title: tmpl.title,
      amount: String(tmpl.amount),
      categoryId: tmpl.categoryId ?? null,
      accountId: tmpl.accountId ?? null,
      paymentMethod: tmpl.paymentMethod ?? null,
      status: "paid",
      transactionDate: new Date(),
      referenceType: "template",
      templateId: tmpl.id,
      deductFromShift: tmpl.deductFromShift,
      shiftId: linkedShiftId,
      notes: tmpl.notes ?? null,
      createdByUserId: userId,
    }).returning();

    res.status(201).json(tx);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to apply template" });
  }
});

router.delete("/finance/expense-templates/:templateId", requireAuth, requireTenant, MGMT_UP, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const templateId = parseInt(req.params.templateId as string);
    const [existing] = await db.select().from(expenseTemplatesTable)
      .where(and(eq(expenseTemplatesTable.id, templateId), eq(expenseTemplatesTable.tenantId, tenantId)))
      .limit(1);
    if (!existing) { res.status(404).json({ error: "Template not found" }); return; }
    await db.delete(expenseTemplatesTable).where(eq(expenseTemplatesTable.id, templateId));
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete expense template" });
  }
});

export default router;
