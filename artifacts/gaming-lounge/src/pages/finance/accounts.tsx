import { useState } from "react";
import {
  useListFinanceAccounts,
  useCreateFinanceAccount,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Landmark, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  cash: "💵", bank: "🏦", wallet: "📱", card: "💳", other: "🪙",
};

export default function FinanceAccounts() {
  const { t, lang } = useLang();
  const EGP = (n: number | string) => `${parseFloat(String(n)).toFixed(2)} ${t("egp_label")}`;
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState("cash");
  const [opening, setOpening] = useState("0");

  const { data, isLoading } = useListFinanceAccounts();
  const createAcc = useCreateFinanceAccount();

  const accounts = data ?? [];
  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.currentBalance), 0);

  const resetForm = () => { setName(""); setNameAr(""); setType("cash"); setOpening("0"); };

  const handleAdd = () => {
    if (!name.trim()) return;
    createAcc.mutate(
      { data: { name, nameAr: nameAr || null, type, openingBalance: opening, isActive: true, isDefault: accounts.length === 0 } },
      {
        onSuccess: () => { toast.success(t("finance_account_added_ok")); qc.invalidateQueries({ queryKey: ["listFinanceAccounts"] }); setOpen(false); resetForm(); },
        onError: () => toast.error(t("finance_expense_error")),
      }
    );
  };

  const typeLabels: Record<string, string> = {
    cash: t("finance_account_type_cash"),
    bank: t("finance_account_type_bank"),
    wallet: t("finance_account_type_wallet"),
    card: t("finance_account_type_card"),
    other: t("finance_account_type_other"),
  };

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
            <Landmark className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("finance_accounts_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("finance_account_add")}</span>
        </button>
      </div>

      <div className="card-base rounded-2xl p-4">
        <p className="text-xs text-muted-foreground mb-1">{t("finance_cash_available")}</p>
        <p className="text-2xl font-bold text-cyan-500 tabular">{EGP(totalBalance)}</p>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Landmark className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t("finance_account_empty")}</p>
        </div>
      ) : (
        <StaggerChildren className="grid gap-3 sm:grid-cols-2">
          {accounts.map(acc => {
            const bal = parseFloat(acc.currentBalance);
            return (
              <StaggerItem key={acc.id}>
                <div className="card-base rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ACCOUNT_TYPE_ICONS[acc.type] ?? "🪙"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{lang === "ar" ? acc.nameAr ?? acc.name : acc.name}</p>
                      <p className="text-xs text-muted-foreground">{typeLabels[acc.type] ?? acc.type}</p>
                    </div>
                    {!acc.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{lang === "ar" ? "معطل" : "Inactive"}</span>}
                    {acc.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{lang === "ar" ? "افتراضي" : "Default"}</span>}
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-0.5">{t("finance_account_balance")}</p>
                    <p className={cn("text-xl font-bold tabular", bal >= 0 ? "text-emerald-500" : "text-red-500")}>{EGP(bal)}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance_account_add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_account_name")} (EN)</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Cash Drawer" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_account_name")} (AR)</label>
              <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="درج الكاش" dir="rtl" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_account_type")}</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="cash">{t("finance_account_type_cash")}</option>
                <option value="bank">{t("finance_account_type_bank")}</option>
                <option value="wallet">{t("finance_account_type_wallet")}</option>
                <option value="card">{t("finance_account_type_card")}</option>
                <option value="other">{t("finance_account_type_other")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_account_opening")}</label>
              <input type="number" inputMode="decimal" placeholder="0.00" value={opening} onChange={e => setOpening(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button onClick={handleAdd} disabled={!name.trim() || createAcc.isPending} className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold disabled:opacity-50">
              {createAcc.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
