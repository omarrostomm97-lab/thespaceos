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
import { Wallet, Plus, Info } from "lucide-react";
import { toast } from "sonner";

const EGP = (n: number | string) => `${parseFloat(String(n)).toFixed(2)} ج.م`;

export default function FinanceWithdrawals() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accId, setAccId] = useState("");
  const [owner, setOwner] = useState("");
  const [notes, setNotes] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));

  const now = new Date();
  const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const { data: txData, isLoading } = useListFinanceTransactions({ type: "owner_withdrawal", from: monthFrom });
  const { data: accData } = useListFinanceAccounts();
  const createTx = useCreateFinanceTransaction();

  const transactions = txData ?? [];
  const accounts = accData ?? [];
  const total = transactions.reduce((s, t) => s + parseFloat(t.amount), 0);

  const resetForm = () => { setAmount(""); setAccId(""); setOwner(""); setNotes(""); setTxDate(new Date().toISOString().slice(0, 10)); };

  const handleAdd = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    createTx.mutate(
      { data: { type: "owner_withdrawal", amount: parseFloat(amount), accountId: accId ? parseInt(accId) : null, vendorName: owner || null, notes: notes || null, transactionDate: new Date(txDate).toISOString(), status: "verified" } },
      {
        onSuccess: () => { toast.success(t("finance_withdrawal_added_ok")); qc.invalidateQueries({ queryKey: ["listFinanceTransactions"] }); setOpen(false); resetForm(); },
        onError: () => toast.error(t("finance_expense_error")),
      }
    );
  };

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("finance_withdrawals_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-600 transition">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("finance_withdrawal_add")}</span>
        </button>
      </div>

      <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
        <Info className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">{t("finance_withdrawal_hint")}</p>
      </div>

      <div className="card-base rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-1">{t("finance_withdrawals_this_month")}</p>
        <p className="text-2xl font-bold text-purple-500 tabular">{EGP(total)}</p>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Wallet className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t("finance_withdrawal_empty")}</p>
        </div>
      ) : (
        <StaggerChildren className="space-y-2">
          {transactions.map(tx => (
            <StaggerItem key={tx.id}>
              <div className="card-base rounded-2xl flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Wallet className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{tx.vendorName ?? (lang === "ar" ? "سحب المالك" : "Owner Withdrawal")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.transactionDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                    {tx.accountName ? ` · ${lang === "ar" ? tx.accountNameAr ?? tx.accountName : tx.accountName}` : ""}
                  </p>
                  {tx.notes && <p className="text-xs text-muted-foreground mt-0.5">{tx.notes}</p>}
                </div>
                <p className="text-sm font-bold text-purple-500 tabular shrink-0">{EGP(tx.amount)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance_withdrawal_add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_withdrawal_amount")}</label>
              <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_withdrawal_owner")}</label>
              <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="..." className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_withdrawal_account")}</label>
              <select value={accId} onChange={e => setAccId(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="">—</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{lang === "ar" ? a.nameAr ?? a.name : a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_withdrawal_date")}</label>
              <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_withdrawal_notes")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button onClick={handleAdd} disabled={!amount || createTx.isPending} className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold disabled:opacity-50">
              {createTx.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
