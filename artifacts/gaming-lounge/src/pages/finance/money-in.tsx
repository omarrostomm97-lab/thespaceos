import { useState } from "react";
import {
  useListFinanceTransactions,
  useListFinanceAccounts,
  useCreateFinanceTransaction,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Plus, Gamepad2, ShoppingCart, Utensils, Banknote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EGP = (n: number | string) => `${parseFloat(String(n)).toFixed(2)} ج.م`;

export default function FinanceMoneyIn() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<"today" | "week" | "month">("month");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accId, setAccId] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: txData, isLoading } = useListFinanceTransactions({ type: "income", period });
  const { data: accData } = useListFinanceAccounts();
  const createTx = useCreateFinanceTransaction();

  const transactions = txData ?? [];
  const accounts = accData ?? [];

  const autoIncome = transactions.filter(t => t.referenceType != null);
  const manualIncome = transactions.filter(t => t.referenceType == null);
  const autoTotal = autoIncome.reduce((s, t) => s + parseFloat(t.amount), 0);
  const manualTotal = manualIncome.reduce((s, t) => s + parseFloat(t.amount), 0);
  const total = autoTotal + manualTotal;

  const resetForm = () => { setAmount(""); setAccId(""); setPayMethod("cash"); setNotes(""); setTxDate(new Date().toISOString().slice(0, 10)); };

  const handleAdd = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    createTx.mutate(
      { data: { type: "income", amount: parseFloat(amount), accountId: accId ? parseInt(accId) : null, paymentMethod: payMethod, notes: notes || null, transactionDate: new Date(txDate).toISOString(), status: "verified" } },
      {
        onSuccess: () => { toast.success(t("save")); qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] }); setOpen(false); resetForm(); },
        onError: () => toast.error(t("finance_expense_error")),
      }
    );
  };

  const iconForRef = (ref: string | null | undefined) => {
    if (!ref) return <Banknote className="h-4 w-4 text-emerald-500" />;
    if (ref === "session") return <Gamepad2 className="h-4 w-4 text-emerald-500" />;
    if (ref === "room_order") return <ShoppingCart className="h-4 w-4 text-primary" />;
    if (ref === "order") return <Utensils className="h-4 w-4 text-orange-500" />;
    return <Banknote className="h-4 w-4 text-emerald-500" />;
  };

  const payMethodLabel: Record<string, string> = { cash: t("finance_payment_cash"), instapay: t("finance_payment_instapay"), visa: t("finance_payment_visa") };

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("finance_income_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("finance_income_add_manual")}</span>
        </button>
      </div>

      <div className="flex gap-2">
        {(["today", "week", "month"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition", period === p ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70")}>
            {t(p === "today" ? "period_today" : p === "week" ? "period_week" : "period_month")}
          </button>
        ))}
      </div>

      <div className="card-base rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "إجمالي الدخل" : "Total Income"}</p>
          <p className="text-2xl font-bold text-emerald-500 tabular">{EGP(total)}</p>
        </div>
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span>{lang === "ar" ? "تلقائي" : "Auto"}: <b className="text-foreground">{EGP(autoTotal)}</b></span>
          <span>{t("finance_income_manual")}: <b className="text-foreground">{EGP(manualTotal)}</b></span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t("finance_income_empty")}</p>
        </div>
      ) : (
        <StaggerChildren className="space-y-2">
          {transactions.map(tx => (
            <StaggerItem key={tx.id}>
              <div className="card-base rounded-2xl flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  {iconForRef(tx.referenceType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {tx.title ?? (lang === "ar" ? tx.categoryNameAr ?? tx.categoryName : tx.categoryName) ??
                      (tx.referenceType === "session" ? t("finance_income_from_sessions") :
                       tx.referenceType === "order" ? t("finance_income_from_buffet") :
                       tx.referenceType === "room_order" ? t("finance_income_from_orders") :
                       t("finance_income_manual"))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.transactionDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                    {tx.paymentMethod ? ` · ${payMethodLabel[tx.paymentMethod] ?? tx.paymentMethod}` : ""}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-500 tabular shrink-0">{EGP(tx.amount)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance_income_add_manual")}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">{t("finance_income_manual_hint")}</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_amount")}</label>
              <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_account")}</label>
              <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">—</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{lang === "ar" ? a.nameAr ?? a.name : a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{lang === "ar" ? "طريقة الدفع" : "Payment Method"}</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="cash">{t("finance_payment_cash")}</option>
                <option value="instapay">{t("finance_payment_instapay")}</option>
                <option value="visa">{t("finance_payment_visa")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_date")}</label>
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_expense_notes")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button onClick={handleAdd} disabled={!amount || createTx.isPending} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50">
              {createTx.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
