import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListFinanceTransactions,
  useListFinanceCategories,
  useListFinanceAccounts,
  useCreateFinanceTransaction,
  useUpdateFinanceTransaction,
  useDeleteFinanceTransaction,
  useListExpenseTemplates,
  useCreateExpenseTemplate,
  useUpdateExpenseTemplate,
  useDeleteExpenseTemplate,
  useApplyExpenseTemplate,
  useGetCurrentShift,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingDown, Plus, Trash2, Check, ChevronDown, ChevronUp,
  Receipt, RefreshCw, Pencil, Repeat, Play, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActiveTab = "expenses" | "recurring";
type Period = "today" | "week" | "month" | "custom";

function computeNextDue(frequency: string, applyDay: number | null | undefined, lastAppliedAt: string | null | undefined): string | null {
  const now = new Date();
  if (frequency === "daily") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }
  if (frequency === "monthly") {
    const day = applyDay ?? (lastAppliedAt ? new Date(lastAppliedAt).getDate() : 1);
    const next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) next.setMonth(next.getMonth() + 1);
    return next.toISOString();
  }
  return null;
}

export default function FinanceExpenses() {
  const { t, lang } = useLang();
  const EGP = (n: number | string) => `${parseFloat(String(n)).toFixed(2)} ${t("egp_label")}`;
  const qc = useQueryClient();

  /* ── tab state ── */
  const [tab, setTab] = useState<ActiveTab>("expenses");

  /* ── expenses tab state ── */
  const [period, setPeriod] = useState<Period>("month");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expOpen, setExpOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [catId, setCatId] = useState("");
  const [accId, setAccId] = useState("");
  const [status, setStatus] = useState("paid");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showMore, setShowMore] = useState(false);
  const [deductShift, setDeductShift] = useState(false);

  /* ── recurring tab state ── */
  const [tmplOpen, setTmplOpen] = useState(false);
  const [editingTmpl, setEditingTmpl] = useState<number | null>(null);
  const [tmplTitle, setTmplTitle] = useState("");
  const [tmplTitleAr, setTmplTitleAr] = useState("");
  const [tmplAmount, setTmplAmount] = useState("");
  const [tmplCatId, setTmplCatId] = useState("");
  const [tmplAccId, setTmplAccId] = useState("");
  const [tmplPayMethod, setTmplPayMethod] = useState("cash");
  const [tmplFreq, setTmplFreq] = useState<"daily" | "monthly">("daily");
  const [tmplApplyDay, setTmplApplyDay] = useState("");
  const [tmplAutoApply, setTmplAutoApply] = useState(false);
  const [tmplDeductShift, setTmplDeductShift] = useState(true);
  const [tmplIsActive, setTmplIsActive] = useState(true);
  const [tmplNotes, setTmplNotes] = useState("");

  /* ── data hooks ── */
  const txParams = useMemo(() => ({
    type: "expense" as const,
    period,
    ...(period === "custom" ? { from: fromDate, to: toDate } : {}),
  }), [period, fromDate, toDate]);
  const { data: txData, isLoading } = useListFinanceTransactions(txParams as any);
  const { data: catData } = useListFinanceCategories({ type: "expense" });
  const { data: accData } = useListFinanceAccounts();
  const { data: tmplData, isLoading: tmplLoading } = useListExpenseTemplates();
  const { data: currentShift } = useGetCurrentShift();
  const createTx = useCreateFinanceTransaction();
  const updateTx = useUpdateFinanceTransaction();
  const deleteTx = useDeleteFinanceTransaction();
  const createTmpl = useCreateExpenseTemplate();
  const updateTmpl = useUpdateExpenseTemplate();
  const deleteTmpl = useDeleteExpenseTemplate();
  const applyTmpl = useApplyExpenseTemplate();

  const transactions = txData ?? [];
  const categories = catData ?? [];
  const accounts = accData ?? [];
  const templates = tmplData ?? [];

  const hasOpenShift = !!currentShift;

  const totalPaid = transactions.filter(tx => tx.status === "paid").reduce((s, tx) => s + parseFloat(tx.amount), 0);
  const totalPending = transactions.filter(tx => tx.status === "pending").reduce((s, tx) => s + parseFloat(tx.amount), 0);
  /* shift-deducted expenses in the current period */
  const shiftDeductTotal = transactions.filter(tx => tx.deductFromShift && tx.status === "paid").reduce((s, tx) => s + parseFloat(tx.amount), 0);

  /* ── expense form helpers ── */
  const resetExpForm = () => {
    setAmount(""); setCatId(""); setAccId(""); setStatus("paid");
    setVendor(""); setNotes(""); setTitle(""); setShowMore(false); setDeductShift(false);
    setTxDate(new Date().toISOString().slice(0, 10));
  };

  const handleAddExpense = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    createTx.mutate(
      {
        data: {
          type: "expense",
          amount: parseFloat(amount),
          categoryId: catId ? parseInt(catId) : null,
          accountId: accId ? parseInt(accId) : null,
          status,
          vendorName: vendor || null,
          notes: notes || null,
          title: title || null,
          transactionDate: new Date(txDate).toISOString(),
          deductFromShift: deductShift && hasOpenShift,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("finance_expense_added"));
          qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] });
          qc.invalidateQueries({ queryKey: ["getCurrentShift"] });
          setExpOpen(false);
          resetExpForm();
        },
        onError: () => toast.error(t("finance_expense_error")),
      }
    );
  };

  const markPaid = (id: number) => {
    updateTx.mutate(
      { transactionId: id, data: { status: "paid" } as any },
      { onSuccess: () => qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] }) }
    );
  };

  const handleDeleteTx = (id: number) => {
    deleteTx.mutate(
      { transactionId: id },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] });
          toast.success(t("finance_delete_expense"));
        },
      }
    );
  };

  /* ── template form helpers ── */
  const resetTmplForm = () => {
    setTmplTitle(""); setTmplTitleAr(""); setTmplAmount("");
    setTmplCatId(""); setTmplAccId(""); setTmplPayMethod("cash"); setTmplFreq("daily");
    setTmplApplyDay(""); setTmplAutoApply(false); setTmplDeductShift(true); setTmplIsActive(true); setTmplNotes("");
    setEditingTmpl(null);
  };

  const openAddTmpl = () => { resetTmplForm(); setTmplOpen(true); };

  const openEditTmpl = (tmpl: NonNullable<typeof tmplData>[number]) => {
    setEditingTmpl(tmpl.id);
    setTmplTitle(tmpl.title);
    setTmplTitleAr(tmpl.titleAr ?? "");
    setTmplAmount(tmpl.amount);
    setTmplCatId(tmpl.categoryId ? String(tmpl.categoryId) : "");
    setTmplAccId(tmpl.accountId ? String(tmpl.accountId) : "");
    setTmplPayMethod(tmpl.paymentMethod ?? "cash");
    const freq = tmpl.frequency === "monthly" ? "monthly" : "daily";
    setTmplFreq(freq);
    setTmplApplyDay(tmpl.applyDay ? String(tmpl.applyDay) : "");
    setTmplAutoApply(tmpl.autoApply);
    setTmplDeductShift(tmpl.deductFromShift);
    setTmplIsActive(tmpl.isActive);
    setTmplNotes(tmpl.notes ?? "");
    setTmplOpen(true);
  };

  const handleSaveTmpl = () => {
    if (!tmplTitle || !tmplAmount || isNaN(parseFloat(tmplAmount))) return;
    const applyDayInt = tmplFreq === "monthly" && tmplApplyDay ? Math.min(28, Math.max(1, parseInt(tmplApplyDay))) : null;
    const payload = {
      title: tmplTitle,
      titleAr: tmplTitleAr || null,
      amount: parseFloat(tmplAmount),
      categoryId: tmplCatId ? parseInt(tmplCatId) : null,
      accountId: tmplAccId ? parseInt(tmplAccId) : null,
      paymentMethod: tmplPayMethod,
      frequency: tmplFreq,
      applyDay: applyDayInt,
      autoApply: tmplAutoApply,
      deductFromShift: tmplDeductShift,
      isActive: tmplIsActive,
      notes: tmplNotes || null,
    };
    if (editingTmpl) {
      updateTmpl.mutate(
        { templateId: editingTmpl, data: payload },
        {
          onSuccess: () => {
            toast.success(t("tmpl_updated_ok"));
            qc.invalidateQueries({ queryKey: ["listExpenseTemplates"] });
            setTmplOpen(false); resetTmplForm();
          },
          onError: () => toast.error(t("tmpl_error")),
        }
      );
    } else {
      createTmpl.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success(t("tmpl_added_ok"));
            qc.invalidateQueries({ queryKey: ["listExpenseTemplates"] });
            setTmplOpen(false); resetTmplForm();
          },
          onError: () => toast.error(t("tmpl_error")),
        }
      );
    }
  };

  const handleDeleteTmpl = (id: number) => {
    deleteTmpl.mutate(
      { templateId: id },
      {
        onSuccess: () => {
          toast.success(t("tmpl_deleted_ok"));
          qc.invalidateQueries({ queryKey: ["listExpenseTemplates"] });
        },
        onError: () => toast.error(t("tmpl_error")),
      }
    );
  };

  const handleApplyNow = (id: number) => {
    applyTmpl.mutate(
      { templateId: id },
      {
        onSuccess: () => {
          toast.success(t("tmpl_apply_now_ok"));
          qc.invalidateQueries({ queryKey: ["listExpenseTemplates"] });
          qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] });
          qc.invalidateQueries({ queryKey: ["getCurrentShift"] });
        },
        onError: () => toast.error(t("tmpl_error")),
      }
    );
  };

  /* ── display helpers ── */
  const statusColor: Record<string, string> = {
    paid: "text-emerald-500 bg-emerald-500/10",
    pending: "text-amber-500 bg-amber-500/10",
    partial: "text-blue-500 bg-blue-500/10",
    cancelled: "text-muted-foreground bg-muted",
  };
  const getStatusLabel = () => ({
    paid: t("finance_status_paid"),
    pending: t("finance_status_pending"),
    partial: t("finance_status_partial"),
    cancelled: t("finance_status_cancelled"),
  });
  const getFreqLabel = () => ({
    daily: t("tmpl_freq_daily"),
    monthly: t("tmpl_freq_monthly"),
  });

  const inputCls = "w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("finance_expenses")}</h1>
            <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
          </div>
        </div>
        {tab === "expenses" ? (
          <button
            onClick={() => setExpOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("finance_add_expense")}</span>
          </button>
        ) : (
          <button
            onClick={openAddTmpl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("tmpl_add_btn")}</span>
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit">
        {(["expenses", "recurring"] as ActiveTab[]).map(tb => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition",
              tab === tb ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tb === "expenses" ? <Receipt className="h-3.5 w-3.5" /> : <Repeat className="h-3.5 w-3.5" />}
            {tb === "expenses" ? t("tab_expenses") : t("tab_recurring")}
          </button>
        ))}
      </div>

      {/* ══════════════════ EXPENSES TAB ══════════════════ */}
      {tab === "expenses" && (
        <>
          {/* Period filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {(["today", "week", "month", "custom"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition",
                  period === p ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                )}
              >
                {p === "custom" && <Calendar className="h-3 w-3" />}
                {p === "today" ? t("period_today") : p === "week" ? t("period_week") : p === "month" ? t("period_month") : t("period_custom")}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {period === "custom" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 items-center">
                  <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={cn(inputCls, "flex-1")} />
                  <span className="text-muted-foreground text-sm">→</span>
                  <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={cn(inputCls, "flex-1")} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-base rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("finance_total_paid")}</p>
              <p className="text-2xl font-bold text-emerald-500 tabular">{EGP(totalPaid)}</p>
            </div>
            <div className="card-base rounded-2xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{t("finance_total_pending")}</p>
              <p className="text-2xl font-bold text-amber-500 tabular">{EGP(totalPending)}</p>
            </div>
            {shiftDeductTotal > 0 && (
              <div className="card-base rounded-2xl p-4 col-span-2 border border-orange-500/20">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                  {t("shift_deduct_total")}
                </p>
                <p className="text-xl font-bold text-orange-500 tabular">{EGP(shiftDeductTotal)}</p>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">{t("loading")}</div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Receipt className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">{t("finance_expense_empty")}</p>
              <p className="text-xs text-muted-foreground/60">{t("finance_expense_empty_hint")}</p>
            </div>
          ) : (
            <StaggerChildren className="space-y-2">
              {transactions.map(tx => {
                const isExpanded = expandedId === tx.id;
                const slabs = getStatusLabel();
                return (
                  <StaggerItem key={tx.id}>
                    <div className="card-base rounded-2xl overflow-hidden">
                      <button
                        className="w-full flex items-center gap-3 p-4 text-start"
                        onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ background: tx.categoryColor ? `${tx.categoryColor}25` : "var(--secondary)", color: tx.categoryColor ?? "var(--muted-foreground)" }}
                        >
                          {tx.categoryIcon ?? "💸"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold truncate">
                              {tx.title ?? (lang === "ar" ? tx.categoryNameAr ?? tx.categoryName : tx.categoryName) ?? t("finance_expenses")}
                            </p>
                            {tx.templateId && (
                              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-0.5">
                                <RefreshCw className="h-2.5 w-2.5" />{t("tab_recurring")}
                              </span>
                            )}
                            {tx.deductFromShift && (
                              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-semibold">
                                {t("expense_deduct_shift")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.transactionDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                            {tx.vendorName ? ` · ${tx.vendorName}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p className="text-sm font-bold text-red-500 tabular">{EGP(tx.amount)}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusColor[tx.status] ?? "bg-muted text-muted-foreground")}>
                            {slabs[tx.status as keyof typeof slabs] ?? tx.status}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="px-4 py-3 space-y-2">
                              {tx.accountName && (
                                <p className="text-xs text-muted-foreground">{t("finance_expense_account")}: <span className="text-foreground font-medium">{lang === "ar" ? tx.accountNameAr ?? tx.accountName : tx.accountName}</span></p>
                              )}
                              {tx.notes && <p className="text-xs text-muted-foreground">{t("finance_expense_notes")}: <span className="text-foreground">{tx.notes}</span></p>}
                              <div className="flex gap-2 pt-1">
                                {tx.status === "pending" && (
                                  <button
                                    onClick={() => markPaid(tx.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/25 transition"
                                  >
                                    <Check className="h-3 w-3" /> {t("finance_mark_paid")}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteTx(tx.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition"
                                >
                                  <Trash2 className="h-3 w-3" /> {t("finance_delete_expense")}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          )}
        </>
      )}

      {/* ══════════════════ RECURRING TAB ══════════════════ */}
      {tab === "recurring" && (
        <>
          {tmplLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">{t("loading")}</div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Repeat className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">{t("tmpl_empty")}</p>
              <p className="text-xs text-muted-foreground/60">{t("tmpl_empty_hint")}</p>
            </div>
          ) : (
            <StaggerChildren className="space-y-2">
              {templates.map(tmpl => {
                const freqs = getFreqLabel();
                const displayTitle = lang === "ar" ? (tmpl.titleAr || tmpl.title) : tmpl.title;
                const nextDue = computeNextDue(tmpl.frequency, tmpl.applyDay, tmpl.lastAppliedAt);
                return (
                  <StaggerItem key={tmpl.id}>
                    <div className="card-base rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm"
                          style={{ background: tmpl.categoryColor ? `${tmpl.categoryColor}25` : "var(--secondary)", color: tmpl.categoryColor ?? "var(--muted-foreground)" }}
                        >
                          {tmpl.categoryIcon ?? "💸"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-semibold truncate">{displayTitle}</p>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                              tmpl.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                            )}>
                              {tmpl.isActive ? t("tmpl_active_badge") : t("tmpl_inactive_badge")}
                            </span>
                            {tmpl.autoApply && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-0.5">
                                <RefreshCw className="h-2.5 w-2.5" />{t("tmpl_auto_badge")}
                              </span>
                            )}
                            {tmpl.deductFromShift && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-semibold">
                                {t("expense_deduct_shift")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {freqs[tmpl.frequency as keyof typeof freqs] ?? tmpl.frequency}
                            {tmpl.frequency === "monthly" && tmpl.applyDay ? ` · ${t("tmpl_apply_day_label")}: ${tmpl.applyDay}` : ""}
                            {tmpl.categoryName ? ` · ${lang === "ar" ? tmpl.categoryNameAr ?? tmpl.categoryName : tmpl.categoryName}` : ""}
                          </p>
                          <div className="flex gap-3 mt-0.5">
                            {tmpl.lastAppliedAt && (
                              <p className="text-[10px] text-muted-foreground/60">
                                {t("tmpl_last_applied")}: {new Date(tmpl.lastAppliedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                              </p>
                            )}
                            {nextDue && (
                              <p className="text-[10px] text-muted-foreground/60">
                                {t("tmpl_next_due")}: {new Date(nextDue).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-sm font-bold text-red-500 tabular">{EGP(tmpl.amount)}</p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApplyNow(tmpl.id)}
                              disabled={applyTmpl.isPending}
                              title={t("tmpl_apply_now")}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition text-emerald-600 disabled:opacity-50"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditTmpl(tmpl)}
                              className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/70 transition text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTmpl(tmpl.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          )}
        </>
      )}

      {/* ══════════════════ ADD EXPENSE DIALOG ══════════════════ */}
      <Dialog open={expOpen} onOpenChange={v => { setExpOpen(v); if (!v) resetExpForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance_add_expense")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_amount")}</label>
              <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_category")}</label>
              <select value={catId} onChange={e => setCatId(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr ?? c.name : c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_status")}</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                <option value="paid">{t("finance_status_paid")}</option>
                <option value="pending">{t("finance_status_pending")}</option>
                <option value="partial">{t("finance_status_partial")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_date")}</label>
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className={inputCls} />
            </div>
            <label className={cn("flex items-start gap-2.5", hasOpenShift ? "cursor-pointer" : "cursor-not-allowed opacity-60")}>
              <input
                type="checkbox"
                checked={deductShift && hasOpenShift}
                onChange={e => hasOpenShift && setDeductShift(e.target.checked)}
                disabled={!hasOpenShift}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">{t("expense_deduct_shift")}</p>
                <p className="text-xs text-muted-foreground">
                  {hasOpenShift ? t("expense_deduct_shift_hint") : t("expense_deduct_no_shift")}
                </p>
              </div>
            </label>
            <button onClick={() => setShowMore(v => !v)} className="flex items-center gap-1 text-xs text-primary font-medium">
              {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {t("finance_expense_more_details")}
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_title_label")}</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="..." className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_account")}</label>
                    <select value={accId} onChange={e => setAccId(e.target.value)} className={inputCls}>
                      <option value="">—</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{lang === "ar" ? a.nameAr ?? a.name : a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_vendor")}</label>
                    <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="..." className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_notes")}</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setExpOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button
              onClick={handleAddExpense}
              disabled={!amount || createTx.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              {createTx.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════ ADD / EDIT TEMPLATE DIALOG ══════════════════ */}
      <Dialog open={tmplOpen} onOpenChange={v => { setTmplOpen(v); if (!v) resetTmplForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTmpl ? t("tmpl_edit_title") : t("tmpl_add_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_title_label")}</label>
              <input value={tmplTitle} onChange={e => setTmplTitle(e.target.value)} placeholder="e.g. Electricity" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_title_ar_label")}</label>
              <input value={tmplTitleAr} onChange={e => setTmplTitleAr(e.target.value)} placeholder="مثال: كهرباء" dir="rtl" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_amount_label")}</label>
              <input type="number" inputMode="decimal" placeholder="0.00" value={tmplAmount} onChange={e => setTmplAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_category_label")}</label>
              <select value={tmplCatId} onChange={e => setTmplCatId(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr ?? c.name : c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_account_label")}</label>
              <select value={tmplAccId} onChange={e => setTmplAccId(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{lang === "ar" ? a.nameAr ?? a.name : a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_freq_label")}</label>
              <select value={tmplFreq} onChange={e => setTmplFreq(e.target.value as any)} className={inputCls}>
                <option value="daily">{t("tmpl_freq_daily")}</option>
                <option value="monthly">{t("tmpl_freq_monthly")}</option>
              </select>
            </div>
            <AnimatePresence>
              {tmplFreq === "monthly" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_apply_day_label")}</label>
                  <input
                    type="number" inputMode="numeric" min={1} max={28}
                    value={tmplApplyDay} onChange={e => setTmplApplyDay(e.target.value)}
                    placeholder="1-28" className={inputCls}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_payment_method_label")}</label>
              <select value={tmplPayMethod} onChange={e => setTmplPayMethod(e.target.value)} className={inputCls}>
                <option value="cash">{t("finance_payment_cash")}</option>
                <option value="instapay">{t("finance_payment_instapay")}</option>
                <option value="visa">{t("finance_payment_visa")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("tmpl_notes_label")}</label>
              <textarea value={tmplNotes} onChange={e => setTmplNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={tmplAutoApply} onChange={e => setTmplAutoApply(e.target.checked)} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-medium">{t("tmpl_auto_apply_label")}</p>
                <p className="text-xs text-muted-foreground">{t("tmpl_auto_apply_hint")}</p>
              </div>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={tmplDeductShift} onChange={e => setTmplDeductShift(e.target.checked)} className="mt-0.5 accent-primary" />
              <div>
                <p className="text-sm font-medium">{t("expense_deduct_shift")}</p>
                <p className="text-xs text-muted-foreground">{t("expense_deduct_shift_hint")}</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={tmplIsActive} onChange={e => setTmplIsActive(e.target.checked)} className="accent-primary" />
              <p className="text-sm font-medium">{t("tmpl_isactive_label")}</p>
            </label>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setTmplOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button
              onClick={handleSaveTmpl}
              disabled={!tmplTitle || !tmplAmount || createTmpl.isPending || updateTmpl.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              {(createTmpl.isPending || updateTmpl.isPending) ? t("loading") : t("tmpl_save_btn")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
