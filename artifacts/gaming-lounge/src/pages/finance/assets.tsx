import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListFinanceAssets,
  useCreateFinanceAsset,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Boxes, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const CONDITION_COLORS: Record<string, string> = {
  new: "text-emerald-500 bg-emerald-500/10",
  good: "text-blue-500 bg-blue-500/10",
  needs_maintenance: "text-amber-500 bg-amber-500/10",
  damaged: "text-red-500 bg-red-500/10",
  retired: "text-muted-foreground bg-muted",
};

export default function FinanceAssets() {
  const { t, lang } = useLang();
  const EGP = (n: number | string | null | undefined) =>
    n != null ? `${parseFloat(String(n)).toFixed(2)} ${t("egp_label")}` : "—";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("");
  const [cost, setCost] = useState("");
  const [condition, setCondition] = useState("good");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [warrantyEnd, setWarrantyEnd] = useState("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useListFinanceAssets();
  const createAsset = useCreateFinanceAsset();
  const assets = data ?? [];

  const resetForm = () => { setName(""); setNameAr(""); setCategory(""); setCost(""); setCondition("good"); setPurchaseDate(new Date().toISOString().slice(0, 10)); setWarrantyEnd(""); setNotes(""); };

  const handleAdd = () => {
    if (!name.trim()) return;
    createAsset.mutate(
      {
        data: {
          name, nameAr: nameAr || null, category: category || null,
          purchaseCost: cost ? parseFloat(cost) : null,
          condition, notes: notes || null,
          purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : null,
          warrantyEndDate: warrantyEnd ? new Date(warrantyEnd).toISOString() : null,
        },
      },
      {
        onSuccess: () => { toast.success(t("finance_asset_added_ok")); qc.invalidateQueries({ queryKey: ["listFinanceAssets"] }); setOpen(false); resetForm(); },
        onError: () => toast.error(t("finance_expense_error")),
      }
    );
  };

  const conditionLabel: Record<string, string> = {
    new: t("finance_asset_condition_new"),
    good: t("finance_asset_condition_good"),
    needs_maintenance: t("finance_asset_condition_needs_maintenance"),
    damaged: t("finance_asset_condition_damaged"),
    retired: t("finance_asset_condition_retired"),
  };

  const totalCost = assets.reduce((s, a) => s + (a.purchaseCost ? parseFloat(a.purchaseCost) : 0), 0);

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
            <Boxes className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t("finance_assets_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("finance_asset_add")}</span>
        </button>
      </div>

      {assets.length > 0 && (
        <div className="card-base rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "إجمالي تكلفة الأصول" : "Total Assets Cost"}</p>
          <p className="text-lg font-bold text-orange-500 tabular">{EGP(totalCost)}</p>
        </div>
      )}

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Boxes className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">{t("finance_asset_empty")}</p>
          <p className="text-xs text-muted-foreground/60">{t("finance_asset_empty_hint")}</p>
        </div>
      ) : (
        <StaggerChildren className="space-y-2">
          {assets.map(asset => {
            const isExpanded = expandedId === asset.id;
            return (
              <StaggerItem key={asset.id}>
                <div className="card-base rounded-2xl overflow-hidden">
                  <button className="w-full flex items-center gap-3 p-4 text-start" onClick={() => setExpandedId(isExpanded ? null : asset.id)}>
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Boxes className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{lang === "ar" ? asset.nameAr ?? asset.name : asset.name}</p>
                      <p className="text-xs text-muted-foreground">{asset.category ?? (lang === "ar" ? "معدات" : "Equipment")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {asset.purchaseCost && <p className="text-sm font-bold tabular">{EGP(asset.purchaseCost)}</p>}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", CONDITION_COLORS[asset.condition] ?? "bg-muted text-muted-foreground")}>
                        {conditionLabel[asset.condition] ?? asset.condition}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden border-t border-border">
                        <div className="px-4 py-3 space-y-1.5">
                          {asset.purchaseDate && <p className="text-xs text-muted-foreground">{t("finance_asset_date")}: <span className="text-foreground">{new Date(asset.purchaseDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span></p>}
                          {asset.warrantyEndDate && <p className="text-xs text-muted-foreground">{t("finance_asset_warranty")}: <span className="text-foreground">{new Date(asset.warrantyEndDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span></p>}
                          {asset.notes && <p className="text-xs text-muted-foreground">{t("finance_asset_notes")}: <span className="text-foreground">{asset.notes}</span></p>}
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

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t("finance_asset_add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_name")} (EN)</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="PlayStation 5" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_name")} (AR)</label>
              <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="بلايستيشن 5" dir="rtl" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_category")}</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Gaming Console" className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_cost")}</label>
                <input type="number" inputMode="decimal" placeholder="0.00" value={cost} onChange={e => setCost(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_condition")}</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="new">{t("finance_asset_condition_new")}</option>
                  <option value="good">{t("finance_asset_condition_good")}</option>
                  <option value="needs_maintenance">{t("finance_asset_condition_needs_maintenance")}</option>
                  <option value="damaged">{t("finance_asset_condition_damaged")}</option>
                  <option value="retired">{t("finance_asset_condition_retired")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_date")}</label>
                <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_warranty")}</label>
                <input type="date" value={warrantyEnd} onChange={e => setWarrantyEnd(e.target.value)} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("finance_asset_notes")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1 mt-4">
            <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold">{t("cancel")}</button>
            <button onClick={handleAdd} disabled={!name.trim() || createAsset.isPending} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50">
              {createAsset.isPending ? t("loading") : t("save")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
