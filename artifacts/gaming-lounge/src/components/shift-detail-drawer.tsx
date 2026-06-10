import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Banknote, CreditCard, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/use-language";

/* ─── Types ─────────────────────────────────────────── */
export type ShiftDrawerTab = "gaming" | "roomOrders" | "pos" | "orders" | "withdrawals";

export interface ShiftMeta {
  id: number;
  userName: string | null;
  openedAt: string;
  closedAt: string | null;
  status: string;
  totalRevenue: number;
  durationMinutes: number;
  gamingRevenue: number;
  roomOrderRevenue: number;
  posRevenue: number;
  sessionCount: number;
  orderCount: number;
  expectedCash?: number | null;
  actualCash?: number | null;
  difference?: number | null;
  withdrawalTotal?: number;
}

interface SessionItem {
  id: number; assetId: number; assetName: string | null; assetNameAr: string | null;
  status: string; startedAt: string; endedAt: string | null;
  totalMinutes: number | null; totalCost: number | null;
  payments: Array<{ method: string; amount: number }>;
}

interface OrderItem {
  id: number; source: string; sessionId: number | null; assetId: number | null;
  assetName: string | null; assetNameAr: string | null;
  totalAmount: number; createdAt: string;
  items: Array<{ productName: string; productNameAr: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
}

interface WithdrawalItem {
  id: number;
  amount: number;
  title: string | null;
  createdAt: string;
}

interface ShiftSummaryData {
  sessions: SessionItem[];
  roomOrders: OrderItem[];
  posOrders: OrderItem[];
  withdrawals?: {
    total: number;
    items: WithdrawalItem[];
  };
}

/* ─── Fetch helper ──────────────────────────────────── */
async function fetchShiftSummary(shiftId: number): Promise<ShiftSummaryData> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("gl_token") : null;
  const res = await fetch(`/api/shifts/${shiftId}/summary`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json();
}

/* ─── Helpers ───────────────────────────────────────── */
function fmtTime(iso: string, lang: string) {
  return new Date(iso).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const TAB_COLOR: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25",
  blue:    "bg-primary/15 text-primary border border-primary/25",
  orange:  "bg-orange-500/15 text-orange-500 border border-orange-500/25",
  slate:   "bg-muted text-foreground border border-border",
  red:     "bg-destructive/15 text-destructive border border-destructive/25",
};

/* ─── Sessions list ─────────────────────────────────── */
function SessionsList({ items, lang, egp, noLabel }: { items: SessionItem[]; lang: string; egp: string; noLabel: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground">
        <div className="text-3xl mb-2">🎮</div>
        <p className="text-sm">{noLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((s) => {
        const name = lang === "ar" ? (s.assetNameAr || s.assetName) : (s.assetName || s.assetNameAr);
        const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
        const cost = s.totalCost ?? totalPaid;
        const isLive = s.status === "active" || s.status === "paused";
        return (
          <Link href={`/sessions/${s.id}`} key={s.id} className="block">
            <div className="bg-card border border-card-border rounded-2xl p-4 hover:opacity-90 transition-opacity active:scale-[0.99] transition-transform">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    🎮
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold">{name || "—"}</p>
                      {isLive && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {fmtTime(s.startedAt, lang)}
                      {" → "}
                      {s.endedAt ? fmtTime(s.endedAt, lang) : (lang === "ar" ? "الآن" : "Now")}
                      {s.totalMinutes != null && (
                        <span className="ms-2 text-primary/70 font-medium">{fmtDuration(s.totalMinutes)}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-base font-bold text-emerald-500 tabular-nums">
                    {cost.toFixed(2)}
                    <span className="text-[10px] font-normal text-muted-foreground ms-1">{egp}</span>
                  </p>
                  <span className={cn(
                    "inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5",
                    isLive ? "bg-emerald-500/10 text-emerald-500" :
                    s.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {s.status}
                  </span>
                </div>
              </div>

              {s.payments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
                  {s.payments.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg">
                      {p.method === "cash" ? <Banknote className="h-3 w-3" /> :
                       p.method === "visa" ? <CreditCard className="h-3 w-3" /> :
                       <Smartphone className="h-3 w-3" />}
                      <span className="tabular-nums">{p.amount.toFixed(2)} {egp}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Single order card ─────────────────────────────── */
function OrderCard({ o, lang, egp }: { o: OrderItem; lang: string; egp: string }) {
  const assetLabel = lang === "ar" ? (o.assetNameAr || o.assetName) : (o.assetName || o.assetNameAr);
  const isRoom = o.sessionId !== null;
  return (
    <div className="bg-card border border-card-border rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isRoom ? "🎯" : "🛒"}</span>
          <div>
            <p className="text-xs font-bold leading-tight">
              {isRoom
                ? (assetLabel || (lang === "ar" ? "غرفة" : "Room"))
                : (lang === "ar" ? "بوفيه / POS" : "POS / Buffet")}
            </p>
            <p className="text-[10px] text-muted-foreground">{fmtTime(o.createdAt, lang)}</p>
          </div>
        </div>
        <p className="text-base font-bold text-primary tabular-nums shrink-0">
          {o.totalAmount.toFixed(2)}
          <span className="text-[10px] font-normal text-muted-foreground ms-1">{egp}</span>
        </p>
      </div>
      <div className="space-y-1.5 pt-2 border-t border-border/40">
        {o.items.map((item, i) => {
          const itemName = lang === "ar" ? (item.productNameAr || item.productName) : item.productName;
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary/80">{item.quantity}×</span>{" "}
                <span className="text-foreground">{itemName}</span>
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                {item.totalPrice.toFixed(2)} {egp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Orders list (with optional AM/PM grouping) ─────── */
function OrdersList({ items, lang, egp, groupByAmPm = false, noLabel }: {
  items: OrderItem[]; lang: string; egp: string; groupByAmPm?: boolean; noLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground">
        <div className="text-3xl mb-2">📦</div>
        <p className="text-sm">{noLabel}</p>
      </div>
    );
  }

  if (!groupByAmPm) {
    return <div className="space-y-3">{items.map(o => <OrderCard key={o.id} o={o} lang={lang} egp={egp} />)}</div>;
  }

  const amOrders = items.filter(o => new Date(o.createdAt).getHours() < 12);
  const pmOrders = items.filter(o => new Date(o.createdAt).getHours() >= 12);
  const amTotal  = amOrders.reduce((s, o) => s + o.totalAmount, 0);
  const pmTotal  = pmOrders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {amOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🌅</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {lang === "ar" ? "صباحاً — AM" : "Morning — AM"}
            </p>
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[11px] font-bold tabular-nums text-orange-500">
              {amTotal.toFixed(2)} {egp}
            </span>
          </div>
          <div className="space-y-3">{amOrders.map(o => <OrderCard key={o.id} o={o} lang={lang} egp={egp} />)}</div>
        </div>
      )}
      {pmOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🌆</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {lang === "ar" ? "مساءً — PM" : "Afternoon / Evening — PM"}
            </p>
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[11px] font-bold tabular-nums text-primary">
              {pmTotal.toFixed(2)} {egp}
            </span>
          </div>
          <div className="space-y-3">{pmOrders.map(o => <OrderCard key={o.id} o={o} lang={lang} egp={egp} />)}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Withdrawals list ──────────────────────────────── */
function WithdrawalsList({ items, total, lang, egp, noLabel }: {
  items: WithdrawalItem[]; total: number; lang: string; egp: string; noLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground">
        <div className="text-3xl mb-2">💸</div>
        <p className="text-sm">{noLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {/* Total banner */}
      <div className="flex items-center justify-between bg-destructive/8 border border-destructive/20 rounded-2xl px-4 py-3">
        <p className="text-sm font-bold text-destructive">
          {lang === "ar" ? "إجمالي السحوبات" : "Total Withdrawals"}
        </p>
        <p className="text-base font-bold text-destructive tabular-nums">
          {total.toFixed(2)}
          <span className="text-[10px] font-normal ms-1">{egp}</span>
        </p>
      </div>
      {items.map((w) => (
        <div key={w.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-lg shrink-0">
              💸
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{w.title || (lang === "ar" ? "سحب" : "Withdrawal")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(w.createdAt).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
                  hour: "2-digit", minute: "2-digit", hour12: true,
                })}
              </p>
            </div>
          </div>
          <p className="text-base font-bold text-destructive tabular-nums shrink-0">
            -{w.amount.toFixed(2)}
            <span className="text-[10px] font-normal text-muted-foreground ms-1">{egp}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Drawer Component ─────────────────────────── */
export default function ShiftDetailDrawer({
  shiftId,
  initialTab,
  shiftMeta,
  onClose,
}: {
  shiftId: number | null;
  initialTab: ShiftDrawerTab;
  shiftMeta: ShiftMeta | null;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<ShiftDrawerTab>(initialTab);
  const egp = lang === "ar" ? "ج.م" : "EGP";

  useEffect(() => {
    if (shiftId !== null) setActiveTab(initialTab);
  }, [shiftId, initialTab]);

  const { data, isLoading } = useQuery({
    queryKey: ["shift-summary", shiftId],
    enabled: shiftId !== null,
    queryFn: () => fetchShiftSummary(shiftId!),
    staleTime: 30_000,
  });

  const TABS: Array<{ id: ShiftDrawerTab; label: string; icon: string; color: string; count: () => number }> = [
    { id: "gaming",      label: t("shift_tab_gaming"),      icon: "🎮", color: "emerald",  count: () => data?.sessions.length ?? 0 },
    { id: "roomOrders",  label: t("shift_tab_room_orders"), icon: "🎯", color: "blue",     count: () => data?.roomOrders.length ?? 0 },
    { id: "pos",         label: t("shift_tab_pos"),         icon: "🛒", color: "orange",   count: () => data?.posOrders.length ?? 0 },
    { id: "orders",      label: t("shift_tab_all_orders"),  icon: "📦", color: "slate",    count: () => allOrders.length },
    { id: "withdrawals", label: t("shift_tab_withdrawals"), icon: "💸", color: "red",      count: () => data?.withdrawals?.items.length ?? 0 },
  ];

  const allOrders = data
    ? [...data.roomOrders, ...data.posOrders].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : [];

  const isClosed = shiftMeta?.status === "closed";
  const hasDifference = isClosed && shiftMeta?.difference != null;

  return createPortal(
    <AnimatePresence>
      {shiftId !== null && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/65 z-[60] backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 inset-x-0 z-[61] rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92dvh", background: "hsl(var(--card))" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Shift meta header */}
            {shiftMeta && (
              <div className="px-5 pb-4 border-b border-border/50 shrink-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[15px] truncate">
                      {shiftMeta.userName || t("shift_cashier_default")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(shiftMeta.openedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                        day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      })}
                      {shiftMeta.closedAt && (
                        <>
                          {" → "}
                          {new Date(shiftMeta.closedAt).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
                            hour: "2-digit", minute: "2-digit", hour12: true,
                          })}
                        </>
                      )}
                      {shiftMeta.status === "open" && (
                        <span className="ms-2 text-emerald-500 font-semibold">{t("shift_live_badge")}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-end">
                      <p className="text-lg font-bold text-emerald-500 tabular-nums leading-none">
                        {shiftMeta.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{egp}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Revenue breakdown row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-500/8 rounded-xl px-3 py-2 text-center">
                    <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wide mb-0.5">
                      {t("shift_gaming_label")}
                    </p>
                    <p className="text-sm font-bold text-emerald-500 tabular-nums">
                      {shiftMeta.gamingRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-primary/8 rounded-xl px-3 py-2 text-center">
                    <p className="text-[9px] text-primary font-semibold uppercase tracking-wide mb-0.5">
                      {t("shift_rooms_label")}
                    </p>
                    <p className="text-sm font-bold text-primary tabular-nums">
                      {shiftMeta.roomOrderRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-500/8 rounded-xl px-3 py-2 text-center">
                    <p className="text-[9px] text-orange-500 font-semibold uppercase tracking-wide mb-0.5">
                      POS
                    </p>
                    <p className="text-sm font-bold text-orange-500 tabular-nums">
                      {shiftMeta.posRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Withdrawals deduction row */}
                {((data?.withdrawals?.total ?? 0) > 0 || (shiftMeta.withdrawalTotal ?? 0) > 0) && (
                  <div className="mt-2 flex items-center justify-between bg-destructive/8 border border-destructive/20 rounded-xl px-3 py-2">
                    <p className="text-[11px] font-semibold text-destructive">
                      💸 {t("shift_owner_withdrawals")}
                    </p>
                    <p className="text-sm font-bold text-destructive tabular-nums">
                      -{(data?.withdrawals?.total ?? shiftMeta.withdrawalTotal ?? 0).toFixed(2)}
                      <span className="text-[9px] font-normal ms-1">{egp}</span>
                    </p>
                  </div>
                )}

                {/* Reconciliation strip — only for closed shifts */}
                {hasDifference && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="bg-muted/60 rounded-xl px-3 py-2 text-center">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                        {t("shift_recon_expected")}
                      </p>
                      <p className="text-sm font-bold tabular-nums">
                        {(shiftMeta.expectedCash ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-muted/60 rounded-xl px-3 py-2 text-center">
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                        {t("shift_recon_actual")}
                      </p>
                      <p className="text-sm font-bold tabular-nums">
                        {(shiftMeta.actualCash ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className={cn(
                      "rounded-xl px-3 py-2 text-center",
                      (shiftMeta.difference ?? 0) < 0 ? "bg-destructive/8" :
                      (shiftMeta.difference ?? 0) > 0 ? "bg-emerald-500/8" : "bg-muted/60"
                    )}>
                      <p className={cn(
                        "text-[9px] font-semibold uppercase tracking-wide mb-0.5",
                        (shiftMeta.difference ?? 0) < 0 ? "text-destructive" :
                        (shiftMeta.difference ?? 0) > 0 ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {t("shift_recon_diff")}
                      </p>
                      <p className={cn(
                        "text-sm font-bold tabular-nums",
                        (shiftMeta.difference ?? 0) < 0 ? "text-destructive" :
                        (shiftMeta.difference ?? 0) > 0 ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {(shiftMeta.difference ?? 0) > 0 ? "+" : ""}
                        {(shiftMeta.difference ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab bar */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                        active ? TAB_COLOR[tab.color] : "text-muted-foreground bg-muted/40 border border-transparent"
                      )}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      {tab.label}
                      {data && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full ms-0.5",
                          active ? "bg-black/10" : "bg-muted text-muted-foreground"
                        )}>
                          {tab.count()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content area */}
            <div
              className="flex-1 overflow-y-auto px-4"
              style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
            >
              {isLoading ? (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="pt-2">
                  {activeTab === "gaming" && (
                    <SessionsList items={data?.sessions ?? []} lang={lang} egp={egp} noLabel={t("shift_no_sessions")} />
                  )}
                  {activeTab === "roomOrders" && (
                    <OrdersList items={data?.roomOrders ?? []} lang={lang} egp={egp} noLabel={t("shift_no_orders")} />
                  )}
                  {activeTab === "pos" && (
                    <OrdersList items={data?.posOrders ?? []} lang={lang} egp={egp} groupByAmPm noLabel={t("shift_no_orders")} />
                  )}
                  {activeTab === "orders" && (
                    <OrdersList items={allOrders} lang={lang} egp={egp} noLabel={t("shift_no_orders")} />
                  )}
                  {activeTab === "withdrawals" && (
                    <WithdrawalsList
                      items={data?.withdrawals?.items ?? []}
                      total={data?.withdrawals?.total ?? 0}
                      lang={lang} egp={egp}
                      noLabel={t("shift_no_withdrawals")}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
