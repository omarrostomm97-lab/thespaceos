import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListFinanceTransactions,
  useListFinanceCategories,
  useListFinanceAccounts,
  useCreateFinanceTransaction,
  useUpdateFinanceTransaction,
  useDeleteFinanceTransaction,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingDown, Plus, Trash2, Check, ChevronDown, ChevronUp,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EGP = (n: number | string) =>
  `${parseFloat(String(n)).toFixed(2)} ج.م`;

export default function FinanceExpenses() {
  const { t, lang } = useLang();
  const qc = useQueryClient();

  const [period, setPeriod] = useState<"today" | "week" | "month">("month");
  const [open, setOpen] = useState(false);
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

  const { data: txData, isLoading } = useListFinanceTransactions({ type: "expense", period });
  const { data: catData } = useListFinanceCategories({ type: "expense" });
  const { data: accData } = useListFinanceAccounts();
  const createTx = useCreateFinanceTransaction();
  const updateTx = useUpdateFinanceTransaction();
  const deleteTx = useDeleteFinanceTransaction();

  const transactions = txData ?? [];
  const categories = catData ?? [];
  const accounts = accData ?? [];

  const totalPaid = transactions.filter(t => t.status === "paid").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalPending = transactions.filter(t => t.status === "pending").reduce((s, t) => s + parseFloat(t.amount), 0);

  const resetForm = () => {
    setAmount(""); setCatId(""); setAccId(""); setStatus("paid");
    setVendor(""); setNotes(""); setTitle(""); setShowMore(false);
    setTxDate(new Date().toISOString().slice(0, 10));
  };

  const handleAdd = () => {
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
        },
      },
      {
        onSuccess: () => {
          toast.success(t("finance_expense_added"));
          qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] });
          setOpen(false);
          resetForm();
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

  const handleDelete = (id: number) => {
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

  const statusColor: Record<string, string> = {
    paid: "text-emerald-500 bg-emerald-500/10",
    pending: "text-amber-500 bg-amber-500/10",
    partial: "text-blue-500 bg-blue-500/10",
    cancelled: "text-muted-foreground bg-muted",
  };
  const statusLabel: Record<string, string> = {
    paid: t("finance_status_paid"),
    pending: t("finance_status_pending"),
    partial: t("finance_status_partial"),
    cancelled: t("finance_status_cancelled"),
  };

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
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
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("finance_add_expense")}</span>
        </button>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {(["today", "week", "month"] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition",
              period === p ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}
          >
            {t(p === "today" ? "period_today" : p === "week" ? "period_week" : "period_month")}
          </button>
        ))}
      </div>

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
      </div>

      {/* List */}
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
                      <p className="text-sm font-semibold truncate">
                        {tx.title ?? (lang === "ar" ? tx.categoryNameAr ?? tx.categoryName : tx.categoryName) ?? t("finance_expenses")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.transactionDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                        {tx.vendorName ? ` · ${tx.vendorName}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-sm font-bold text-red-500 tabular">{EGP(tx.amount)}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusColor[tx.status] ?? "bg-muted text-muted-foreground")}>
                        {statusLabel[tx.status] ?? tx.status}
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
                              onClick={() => handleDelete(tx.id)}
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

      {/* Add Expense Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance_add_expense")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_amount")}</label>
              <input
                type="number" inputMode="decimal" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_category")}</label>
              <select value={catId} onChange={e => setCatId(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">—</option>
                {categories.map(c => <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr ?? c.name : c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_status")}</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="paid">{t("finance_status_paid")}</option>
                <option value="pending">{t("finance_status_pending")}</option>
                <option value="partial">{t("finance_status_partial")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_date")}</label>
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button onClick={() => setShowMore(v => !v)} className="flex items-center gap-1 text-xs text-primary font-medium">
              {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {t("finance_expense_more_details")}
            </button>
            <AnimatePresence>
              {showMore && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_title_label")}</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="..."
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_account")}</label>
                    <select value={accId} onChange={e => setAccId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="">—</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{lang === "ar" ? a.nameAr ?? a.name : a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_vendor")}</label>
                    <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="..."
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_notes")}</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                      className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button
              onClick={handleAdd}
              disabled={!amount || createTx.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
            >
              {createTx.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
