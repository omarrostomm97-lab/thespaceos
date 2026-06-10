import { useState, useRef, useEffect } from "react";
import ShiftDetailDrawer, { type ShiftDrawerTab, type ShiftMeta } from "@/components/shift-detail-drawer";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetDashboardSummary,
  useListActiveSessions,
  useGetRevenueStats,
  useGetDashboardBreakdown,
  useGetDashboardRooms,
  useGetDashboardShifts,
  useGetFinanceOverview,
  useListOrders,
  getGetDashboardSummaryQueryKey,
  getListActiveSessionsQueryKey,
} from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import {
  Gamepad2, Receipt, AlertTriangle, Clock, ShoppingCart,
  Activity, Monitor, TrendingUp, Utensils, Bell, Plus,
  LayoutDashboard, ChefHat, Download, Banknote,
  Smartphone, CreditCard, Filter, X, Check, Users,
  BarChart2, List, TrendingDown, DollarSign, Wallet, PiggyBank, ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem, HoverCard } from "@/components/motion";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Types ──────────────────────────────────────────── */
type Period  = "today" | "week" | "month";
type Source  = "all" | "gaming" | "buffet";
type PayMethod = "all" | "cash" | "instapay" | "visa";
type Tab = "overview" | "sales" | "details" | "shifts";

/* ─── Count-up hook ──────────────────────────────────── */
function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (target === 0) { setCurrent(0); return; }
    const t0 = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setCurrent((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return current;
}

/* ─── Mobile viewport detection ─────────────────────── */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

/* ─── Helpers ────────────────────────────────────────── */
const DAY_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const DAY_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const DAY_KEYS = ["dash_day_sun","dash_day_mon","dash_day_tue","dash_day_wed","dash_day_thu","dash_day_fri","dash_day_sat"] as const;

function dayLabel(dateStr: string, t: (k: any) => string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0)  return t("dash_today");
  if (diff === -1) return t("dash_yesterday");
  return t(DAY_KEYS[d.getDay()]);
}

const ASSET_ICON: Record<string, string> = {
  ps:"🎮", billiard:"🎱", air_hockey:"🏒", babyfoot:"⚽", other:"🕹️",
};

/* ─── Tooltip ────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  const { t } = useLang();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-3.5 py-2.5 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: item.color || "#006FEE" }}>
          {typeof item.value === "number" ? item.value.toFixed(2) : item.value} {t("egp_label")}
        </p>
      ))}
    </div>
  );
}

/* ─── Quick-view Popover ─────────────────────────────── */
function QuickPopover({ children, content, className }: {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lpTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(hideTimer.current);
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };
  const hide = (delay = 140) => {
    clearTimeout(showTimer.current);
    clearTimeout(lpTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), delay);
  };

  const popStyle: React.CSSProperties = rect ? {
    position: "fixed",
    left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
    top: rect.top - 10,
    transform: "translateY(-100%)",
    zIndex: 9999,
    width: 264,
  } : { position: "fixed", opacity: 0 };

  return (
    <div
      ref={triggerRef}
      className={className}
      onMouseEnter={() => { clearTimeout(hideTimer.current); showTimer.current = setTimeout(show, 180); }}
      onMouseLeave={() => { clearTimeout(showTimer.current); hide(); }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") {
          lpTimer.current = setTimeout(show, 520);
        }
      }}
      onPointerUp={() => clearTimeout(lpTimer.current)}
      onPointerCancel={() => { clearTimeout(lpTimer.current); hide(0); }}
      onContextMenu={(e) => { if (open) e.preventDefault(); }}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {open && rect && (
            <motion.div
              key="qv-pop"
              style={popStyle}
              initial={{ opacity: 0, y: "calc(-100% + 8px)", scale: 0.96 }}
              animate={{ opacity: 1, y: "-100%", scale: 1 }}
              exit={{ opacity: 0, y: "calc(-100% + 8px)", scale: 0.96 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              onMouseEnter={() => clearTimeout(hideTimer.current)}
              onMouseLeave={() => hide()}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ─── Session Popover Content ────────────────────────── */
function SessionPopoverContent({ session, t, lang, egp }: {
  session: { id: number; assetName?: string | null; assetNameAr?: string | null; status: string; currentMinutes: number; currentCost: number };
  t: (k: any) => string;
  lang: string;
  egp: string;
}) {
  const name = lang === "ar"
    ? (session.assetNameAr || session.assetName)
    : (session.assetName || session.assetNameAr);
  const h = Math.floor(session.currentMinutes / 60);
  const m = session.currentMinutes % 60;
  return (
    <div className="bg-popover border border-border rounded-2xl shadow-2xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-bold truncate">{name}</p>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          session.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
        }`}>
          {session.status === "active" ? t("dash_session_active") : t("dash_session_paused")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{t("elapsed_time")}</p>
          <p className="text-sm font-semibold tabular-nums">
            {h}{t("dash_hour_short")} {m}{t("dash_minute_short")}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{t("current_cost")}</p>
          <p className="text-sm font-semibold text-emerald-500 tabular-nums">
            {session.currentCost.toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">{egp}</span>
          </p>
        </div>
      </div>
      <Link href={`/sessions/${session.id}`}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        {t("qv_open_link")} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ─── Pending Orders Popover Content ─────────────────── */
function PendingOrdersPopoverContent({ orders, t, lang, egp }: {
  orders: Order[];
  t: (k: any) => string;
  lang: string;
  egp: string;
}) {
  const top3 = orders.slice(0, 3);
  return (
    <div className="bg-popover border border-border rounded-2xl shadow-2xl p-4">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
        {t("qv_top_pending")}
      </p>
      {top3.length === 0 ? (
        <p className="text-sm text-muted-foreground py-1">{t("qv_no_pending")}</p>
      ) : (
        <div className="space-y-2.5 mb-3">
          {top3.map((order) => {
            const assetLabel = lang === "ar"
              ? (order.assetNameAr || order.assetName)
              : (order.assetName || order.assetNameAr);
            return (
              <div key={order.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {t("qv_order_label")} #{order.id}
                    {assetLabel ? <span className="text-muted-foreground font-normal"> — {assetLabel}</span> : null}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {order.items.length} {t("qv_items_suffix")}
                  </p>
                </div>
                <p className="text-xs font-bold text-amber-500 shrink-0 tabular-nums">
                  {order.totalAmount.toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">{egp}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
      <Link href="/orders"
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        {t("qv_open_link")} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────── */
interface KpiCardProps {
  label: string; value: number; subtitle?: string;
  icon: React.ElementType; iconClass: string;
  isLive?: boolean; isFloat?: boolean; compact?: boolean;
  href?: string;
}
function KpiCard({ label, value, subtitle, icon: Icon, iconClass, isLive, isFloat, compact, href }: KpiCardProps) {
  const { t } = useLang();
  const animated = useCountUp(value);
  const display = isFloat ? animated.toFixed(2) : Math.round(animated).toLocaleString();
  const inner = (
    <div className={`bg-card border border-card-border rounded-2xl h-full ${compact ? "p-4" : "p-5"} ${href ? "cursor-pointer ring-0 hover:ring-2 hover:ring-red-500/40 transition-all" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`uppercase tracking-wide text-muted-foreground/70 font-medium leading-tight ${compact ? "text-[10px]" : "text-[11px]"}`}>{label}</span>
        {isLive && (
          <span className="relative flex h-2 w-2 mt-0.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 live-dot" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-bold leading-none tabular ${compact ? "text-2xl" : "text-[40px]"}`}
             style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            {display}
          </p>
          {isFloat && <span className={`text-muted-foreground block ${compact ? "text-[11px] mt-0.5" : "text-sm mt-1"}`}>{t("egp_label")}</span>}
          {subtitle && <p className={`text-muted-foreground mt-1.5 leading-relaxed ${compact ? "text-[10px]" : "text-xs"}`}>{subtitle}</p>}
        </div>
        <div className={`rounded-xl flex items-center justify-center shrink-0 ${iconClass} ${compact ? "w-9 h-9" : "w-10 h-10"}`}>
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
      </div>
    </div>
  );
  return (
    <HoverCard>
      {href ? <Link href={href} className="block h-full">{inner}</Link> : inner}
    </HoverCard>
  );
}

/* ─── Pill group ─────────────────────────────────────── */
function PillGroup<T extends string>({
  options, value, onChange, label, size = "sm",
}: {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T; onChange: (v: T) => void; label?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>}
      <div className="flex items-center gap-0.5 bg-muted/40 border border-border rounded-lg p-0.5">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className={`relative flex items-center gap-1 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none ${
              size === "md" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
            } ${value === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {value === opt.id && (
              <motion.div layoutId={`pill-${label}`}
                className="absolute inset-0 bg-card border border-border rounded-md shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 35 }} />
            )}
            {opt.icon && <span className="relative z-10 text-[12px]">{opt.icon}</span>}
            <span className="relative z-10">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Mobile Filter Sheet ────────────────────────────── */
function FilterSheet({
  open, onClose, source, setSource, method, setMethod, t,
  sourceOptions, methodOptions,
}: {
  open: boolean; onClose: () => void;
  source: Source; setSource: (v: Source) => void;
  method: PayMethod; setMethod: (v: PayMethod) => void;
  t: (key: any) => string;
  sourceOptions: { id: Source; label: string; icon?: React.ReactNode }[];
  methodOptions: { id: PayMethod; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-2xl overflow-hidden md:hidden"
            style={{ maxHeight: "85dvh" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-base font-bold">{t("filter_sheet_title")}</p>
              <div className="flex items-center gap-2">
                {(source !== "all" || method !== "all") && (
                  <button onClick={() => { setSource("all"); setMethod("all"); }}
                    className="text-xs text-primary font-medium hover:underline">
                    {t("filter_clear_all")}
                  </button>
                )}
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-8 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(85dvh - 80px)", paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
              {/* Source */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                  {t("filter_source")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {sourceOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setSource(opt.id)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-150 ${
                        source === opt.id
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}>
                      <span className="text-2xl">{opt.icon || "🔘"}</span>
                      <span className="text-xs font-semibold">{opt.label}</span>
                      {source === opt.id && (
                        <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                  {t("filter_payment_method")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {methodOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setMethod(opt.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-150 ${
                        method === opt.id
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}>
                      <span className="text-xl">{opt.icon || "💳"}</span>
                      <span className="text-sm font-semibold">{opt.label}</span>
                      {method === opt.id && (
                        <span className="ms-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Done */}
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm">
                {t("filter_apply")}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile Bottom Nav ──────────────────────────────── */
function MobileBottomNav({ tab, setTab, t, pendingOrders }: {
  tab: Tab; setTab: (t: Tab) => void; t: (key: any) => string; pendingOrders: number;
}) {
  const tabs = [
    { id: "overview" as Tab, labelKey: "mob_nav_home", Icon: LayoutDashboard },
    { id: "sales"    as Tab, labelKey: "tab_sales",    Icon: BarChart2 },
    { id: "details"  as Tab, labelKey: "tab_details",  Icon: List },
    { id: "shifts"   as Tab, labelKey: "tab_shifts",   Icon: Clock },
  ];
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card border-t border-border"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around pt-1 pb-2">
        {tabs.map(({ id, labelKey, Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 focus-visible:outline-none">
              <div className={`relative p-2 rounded-xl transition-all duration-200 ${
                active ? "bg-primary/12" : ""
              }`}>
                <Icon className={`h-5 w-5 transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`} />
                {id === "overview" && pendingOrders > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}>
                {t(labelKey)}
              </span>
              {active && (
                <motion.div layoutId="bottom-nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mobile Hero Revenue Card ───────────────────────── */
function MobileHeroCard({
  total, gamingRevenue, roomOrderRevenue, buffetRevenue, source, openShift, t, periodLabel,
}: {
  total: number; gamingRevenue: number; roomOrderRevenue: number; buffetRevenue: number;
  source: Source; openShift: boolean; t: (key: any) => string; periodLabel: string;
}) {
  const animated = useCountUp(total, 1000);
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 shadow-xl"
         style={{ background: "linear-gradient(135deg, hsl(211, 100%, 47%) 0%, hsl(211, 100%, 38%) 55%, #1d4ed8 100%)", boxShadow: "0 20px 40px -8px rgba(0, 108, 224, 0.35)" }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 live-dot" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-white/90">
              {t("dash_live")}
            </span>
          </div>
          <Receipt className="h-4 w-4 text-white/50" />
        </div>

        <p className="text-[11px] text-white/65 uppercase tracking-wider font-medium mb-1">
          {source === "gaming" ? t("dash_gaming_revenue")
           : source === "buffet" ? t("dash_buffet_revenue")
           : `${t("dash_total_revenue")} · ${periodLabel}`}
        </p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-[44px] font-bold text-white leading-none tabular"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            {animated.toFixed(2)}
          </span>
          <span className="text-white/60 text-lg mb-1.5">{t("egp_label")}</span>
        </div>

        {/* 3-bucket split (only when source=all) */}
        {source === "all" && (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.10)" }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🎮</span>
                <span className="text-[9px] text-white/60 font-medium leading-tight">{t("dash_time_short")}</span>
              </div>
              <p className="text-xs font-bold text-white tabular">{gamingRevenue.toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.10)" }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🛒</span>
                <span className="text-[9px] text-white/60 font-medium leading-tight">{t("dash_orders_short")}</span>
              </div>
              <p className="text-xs font-bold text-white tabular">{roomOrderRevenue.toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-xl px-2.5 py-2" style={{ background: "rgba(255,255,255,0.10)" }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🍽️</span>
                <span className="text-[9px] text-white/60 font-medium leading-tight">{t("dash_pos_short")}</span>
              </div>
              <p className="text-xs font-bold text-white tabular">{buffetRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-pulse" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="space-y-2 hidden md:block">
        <div className="h-8 w-72 rounded-xl bg-muted" />
        <div className="h-4 w-48 rounded-lg bg-muted" />
      </div>
      <div className="h-40 md:hidden rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 md:h-36 rounded-2xl bg-muted" />)}
      </div>
      <div className="grid gap-3 md:gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-56 md:h-72 rounded-2xl bg-muted" />
        <div className="h-56 md:h-72 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────── */
export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("today");
  const [source, setSource] = useState<Source>("all");
  const [method, setMethod] = useState<PayMethod>("all");
  const [tab, setTab]       = useState<Tab>("overview");
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerShift, setDrawerShift] = useState<{ shiftId: number; meta: ShiftMeta; tab: ShiftDrawerTab } | null>(null);

  const openDrawer = (shift: ShiftMeta, tab: ShiftDrawerTab) => {
    setDrawerShift({ shiftId: shift.id, meta: shift, tab });
  };
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const egp = t("egp_label");

  const revenueParams   = { period, source, method } as any;
  const breakdownParams = { period, source } as any;

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 },
  });
  const { data: activeSessions, isLoading: isLoadingSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 },
  });
  const { data: revenueStats, isLoading: isLoadingRevenue } = useGetRevenueStats(revenueParams, {
    query: { queryKey: ["/api/dashboard/revenue", period, source, method] },
  });
  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetDashboardBreakdown(breakdownParams);
  const { data: roomsData } = useGetDashboardRooms({ period } as any);
  const { data: shiftsData, isLoading: isLoadingShifts } = useGetDashboardShifts({ period } as any);

  const { data: pendingOrdersList } = useListOrders(
    { status: "pending" as any },
    { query: { queryKey: ["/api/orders", "pending"], refetchInterval: 15000 } as any },
  );

  const canSeeFinance = ["platform_owner", "owner", "manager"].includes(user?.role ?? "");
  const { data: financeOverview } = useGetFinanceOverview(
    undefined,
    { query: { enabled: canSeeFinance } as any },
  );

  if (isLoadingSummary || isLoadingSessions) return <DashboardSkeleton />;

  const revenueKey = t("kpi_revenue_today");
  const dailyChartData = (revenueStats?.dailyBreakdown ?? []).map(d => ({
    day: dayLabel(d.date, t),
    [revenueKey]: d.total,
  }));

  const paymentBreakdown = revenueStats?.paymentMethodBreakdown;
  const totalPayments = (paymentBreakdown?.cash ?? 0) + (paymentBreakdown?.instapay ?? 0) + (paymentBreakdown?.visa ?? 0);
  const noBreakdownData = !breakdown || breakdown.grandTotal === 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("greeting_morning") : hour < 18 ? t("greeting_afternoon") : t("greeting_evening");
  const userName = user?.nameAr || user?.name || "";

  const PERIOD_LABELS: Record<Period, string> = {
    today: t("period_today"),
    week:  t("period_week"),
    month: t("period_month"),
  };

  const SOURCE_OPTIONS = [
    { id: "all"    as Source, label: t("filter_all"),           icon: "🔘" },
    { id: "gaming" as Source, label: t("filter_source_gaming"), icon: "🎮" },
    { id: "buffet" as Source, label: t("filter_source_buffet"), icon: "🍽️" },
  ];

  const METHOD_OPTIONS = [
    { id: "all"      as PayMethod, label: t("filter_all"),           icon: "💰" },
    { id: "cash"     as PayMethod, label: t("filter_method_cash"),     icon: "💵" },
    { id: "instapay" as PayMethod, label: t("filter_method_instapay"), icon: "📱" },
    { id: "visa"     as PayMethod, label: t("filter_method_visa"),     icon: "💳" },
  ];

  const hasFilters = source !== "all" || method !== "all";

  const heroRevenue = source === "gaming"
    ? ((summary as any)?.gamingRevenueToday ?? 0)
    : source === "buffet"
    ? ((summary as any)?.buffetRevenueToday ?? 0)
    : (summary?.revenueToday ?? 0);

  /* ─── Mobile header ─────────────────────────────────── */
  const MobileTopBar = (
    <div className="md:hidden sticky top-0 z-20 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">
              {greeting}{userName ? `، ${userName}` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("dashboard_subtitle")}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filter button with badge */}
          <button onClick={() => setFilterOpen(true)}
            className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              hasFilters ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>
            <Filter className="h-4 w-4" />
            {hasFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
          {/* Bell */}
          <button className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
            <Bell className="h-4 w-4" />
            {(summary?.pendingOrders ?? 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Period pills + shift status on mobile */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-0.5 bg-muted/50 border border-border rounded-xl p-0.5">
          {(["today","week","month"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`relative px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                period === p ? "text-foreground" : "text-muted-foreground"
              }`}>
              {period === p && (
                <motion.div layoutId="mob-period"
                  className="absolute inset-0 bg-card border border-border rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }} />
              )}
              <span className="relative z-10">{PERIOD_LABELS[p]}</span>
            </button>
          ))}
        </div>

        {summary?.openShift ? (
          <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("shift_open")}
          </div>
        ) : (
          <Link href="/shifts">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Plus className="h-3 w-3" />
              {t("open_shift")}
            </span>
          </Link>
        )}
      </div>
    </div>
  );

  /* ─── Desktop header ─────────────────────────────────── */
  const DesktopHeader = (
    <div className="hidden md:block sticky top-0 z-30"
      style={{
        background: "hsl(var(--background))",
        borderBottom: "1px solid hsl(var(--border))",
        boxShadow: "0 4px 32px rgba(0,0,0,0.22), 0 1px 0 hsl(var(--border))",
      }}>
      {/* Premium accent line at very top */}
      <div className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, #006FEE 40%, #338ef7 60%, transparent 100%)" }} />

      <div className="px-8 pt-5 pb-0">
        {/* Row 1: Greeting + live badges + actions */}
        <div className="flex items-center justify-between mb-4">
          <FadeIn>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,111,238,0.2) 0%, rgba(51,142,247,0.12) 100%)",
                  border: "1px solid rgba(0,111,238,0.25)",
                  boxShadow: "0 0 20px rgba(0,111,238,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}>
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">
                  {greeting}{userName ? `، ${userName}` : ""}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{t("dashboard_subtitle")}</p>
                  {summary?.openShift && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(23,201,100,0.1)", color: "#17c964", border: "1px solid rgba(23,201,100,0.2)" }}>
                      <span className="w-1 h-1 rounded-full bg-emerald-500 live-dot" />
                      {summary.activeSessions ?? 0} {t("dash_active_sessions_badge")}
                    </span>
                  )}
                  {(summary?.pendingOrders ?? 0) > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(245,165,36,0.1)", color: "#f5a524", border: "1px solid rgba(245,165,36,0.2)" }}>
                      {summary!.pendingOrders} {t("dash_pending_badge")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex items-center gap-2">
              {/* Live revenue badge — only when shift open */}
              {summary?.openShift && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,111,238,0.08) 0%, rgba(0,111,238,0.04) 100%)",
                    border: "1px solid rgba(0,111,238,0.18)",
                  }}>
                  <Receipt className="h-3.5 w-3.5 text-primary opacity-70" />
                  <span className="text-sm font-bold text-primary tabular"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                    {heroRevenue.toFixed(2)}
                  </span>
                  <span className="text-xs text-primary/50 font-medium">{egp}</span>
                </div>
              )}
              <button className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors" aria-label="notifications">
                <Bell className="h-4 w-4" />
                {(summary?.pendingOrders ?? 0) > 0 && <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
              <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors" aria-label="export">
                <Download className="h-4 w-4" />
              </button>
              {!summary?.openShift ? (
                <Link href="/shifts">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                      boxShadow: "0 0 20px rgba(0,111,238,0.4), 0 2px 8px rgba(0,0,0,0.2)",
                    }}>
                    <Plus className="h-4 w-4" />{t("open_shift")}
                  </motion.div>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium px-4 py-2 rounded-xl"
                  style={{ background: "rgba(23,201,100,0.08)", border: "1px solid rgba(23,201,100,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{t("shift_open")}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Shift warning */}
        {!summary?.openShift && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-4 text-sm"
            style={{ background: "rgba(245,165,36,0.08)", border: "1px solid rgba(245,165,36,0.2)", color: "#f5a524" }}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t("no_shift_warning")}</span>
          </div>
        )}

        {/* Row 2: Tabs + Period */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {(["overview","sales","details","shifts"] as Tab[]).map(id => (
              <button key={id} onClick={() => setTab(id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab === id && (
                  <motion.div layoutId="desk-tab" className="absolute inset-0 bg-secondary rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
                <span className="relative z-10">
                  {id === "overview" ? t("tab_overview")
                   : id === "sales"  ? t("tab_sales")
                   : id === "details"? t("tab_details")
                   : t("tab_shifts")}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(var(--border))" }}>
            {(["today","week","month"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {period === p && (
                  <motion.div layoutId="desk-period" className="absolute inset-0 bg-card border border-border rounded-md shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
                <span className="relative z-10">{PERIOD_LABELS[p]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Filters */}
        <div className="flex items-center gap-4 py-3 mt-2 flex-wrap"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">{t("filter_label")}</span>
          </div>
          <PillGroup options={SOURCE_OPTIONS} value={source} onChange={v => setSource(v as Source)}
            label={t("filter_source")} />
          <PillGroup options={METHOD_OPTIONS} value={method} onChange={v => setMethod(v as PayMethod)}
            label={t("filter_payment_short")} />
          {hasFilters && (
            <button onClick={() => { setSource("all"); setMethod("all"); }}
              className="text-xs text-primary hover:underline">
              {t("filter_clear")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ─── Overview tab ───────────────────────────────────── */
  const OverviewContent = (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile hero card */}
      <div className="md:hidden">
        <MobileHeroCard
          total={revenueStats?.total ?? 0}
          gamingRevenue={revenueStats?.sessionRevenue ?? 0}
          roomOrderRevenue={revenueStats?.roomOrderRevenue ?? 0}
          buffetRevenue={revenueStats?.orderRevenue ?? 0}
          source={source}
          openShift={summary?.openShift ?? false}
          t={t}
          periodLabel={PERIOD_LABELS[period]}
        />
      </div>

      {/* KPI grid: 2×2 mobile, 4-col desktop */}
      <StaggerChildren className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label={t("kpi_active_sessions")} value={summary?.activeSessions ?? 0}
            subtitle={`${summary?.occupiedAssets ?? 0}/${summary?.totalAssets ?? 0} ${t("dash_devices_suffix")}`}
            icon={Gamepad2} iconClass="bg-primary/15 text-primary" isLive compact={isMobile} href="/sessions" />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={
              source === "gaming" ? t("dash_gaming_rev")
              : source === "buffet" ? t("dash_buffet_rev")
              : t("kpi_revenue_today")
            }
            value={revenueStats?.total ?? 0}
            isFloat
            subtitle={PERIOD_LABELS[period]}
            icon={Receipt} iconClass="bg-emerald-500/15 text-emerald-500"
            compact={isMobile} href="/payments" />
        </StaggerItem>
        <StaggerItem>
          <QuickPopover
            className="h-full"
            content={
              <PendingOrdersPopoverContent
                orders={pendingOrdersList ?? []}
                t={t}
                lang={lang}
                egp={egp}
              />
            }
          >
            <KpiCard label={t("kpi_pending_orders")} value={summary?.pendingOrders ?? 0}
              subtitle={t("dash_need_action")}
              icon={ShoppingCart} iconClass="bg-amber-500/15 text-amber-500"
              compact={isMobile} href="/orders" />
          </QuickPopover>
        </StaggerItem>
        <StaggerItem>
          <KpiCard label={t("kpi_low_stock")} value={summary?.lowStockAlerts ?? 0}
            subtitle={t("dash_stock_alerts")}
            icon={AlertTriangle} iconClass="bg-red-500/15 text-red-500"
            compact={isMobile}
            href="/inventory?low=1" />
        </StaggerItem>
      </StaggerChildren>

      {/* Desktop 3-bucket split — period-aware */}
      {source === "all" && revenueStats !== undefined && (
        <div className="hidden md:grid gap-4 md:grid-cols-3">
          <HoverCard>
            <Link href="/sessions" className="block">
              <div className="bg-card border border-emerald-500/15 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Gamepad2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{`${t("dash_gaming_time")} — ${PERIOD_LABELS[period]}`}</p>
                  <p className="text-2xl font-bold text-emerald-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                    {(revenueStats.sessionRevenue ?? 0).toFixed(2)} <span className="text-base opacity-60">{egp}</span>
                  </p>
                </div>
              </div>
            </Link>
          </HoverCard>
          <HoverCard>
            <Link href="/orders" className="block">
              <div className="bg-card border border-primary/15 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{`${t("dash_room_orders")} — ${PERIOD_LABELS[period]}`}</p>
                  <p className="text-2xl font-bold text-primary tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                    {(revenueStats.roomOrderRevenue ?? 0).toFixed(2)} <span className="text-base opacity-60">{egp}</span>
                  </p>
                </div>
              </div>
            </Link>
          </HoverCard>
          <HoverCard>
            <Link href="/orders" className="block">
              <div className="bg-card border border-orange-500/15 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Utensils className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{`${t("dash_buffet_pos")} — ${PERIOD_LABELS[period]}`}</p>
                  <p className="text-2xl font-bold text-orange-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                    {(revenueStats.orderRevenue ?? 0).toFixed(2)} <span className="text-base opacity-60">{egp}</span>
                  </p>
                </div>
              </div>
            </Link>
          </HoverCard>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-3">
        {/* Revenue bar chart */}
        <HoverCard className="md:col-span-2">
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-5">
              <div>
                <h3 className="text-sm md:text-base font-semibold">{t("sales_performance")}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {PERIOD_LABELS[period]}
                  {source !== "all" && <span className="ms-2 text-primary">{SOURCE_OPTIONS.find(s => s.id === source)?.label}</span>}
                </p>
              </div>
              <div className="text-end">
                <p className="text-[10px] text-muted-foreground">{t("total")}</p>
                <p className="text-base md:text-lg font-bold text-primary">{(revenueStats?.total ?? 0).toFixed(2)} {egp}</p>
              </div>
            </div>
            {isLoadingRevenue ? (
              <div className="h-[160px] md:h-[200px] flex items-end gap-2">
                {Array.from({length:7}).map((_,i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-muted" style={{ height:`${40+(i%3)*25}%` }} />
                ))}
              </div>
            ) : dailyChartData.length === 0 ? (
              <div className="h-[160px] md:h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <TrendingUp className="h-7 w-7 opacity-20" /><p className="text-sm">{t("no_data")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <BarChart data={dailyChartData} margin={{ top:4, right:0, left:-18, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill:"hsl(var(--muted-foreground))", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"hsl(var(--muted-foreground))", fontSize:10 }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill:"hsl(var(--muted))", radius:5 } as any} />
                  <Bar dataKey={revenueKey} fill="#006FEE" radius={[5,5,0,0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </HoverCard>

        {/* Payment methods + session/order split */}
        <HoverCard>
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              <h3 className="text-sm md:text-base font-semibold">{t("payment_sources")}</h3>
            </div>

            {/* Area chart */}
            <div className="flex-1 min-h-0">
              {isLoadingRevenue ? (
                <div className="h-[120px] rounded-lg bg-muted" />
              ) : dailyChartData.length === 0 ? (
                <div className="h-[120px] flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-6 w-6 opacity-20" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={dailyChartData} margin={{ top:4, right:0, left:-22, bottom:0 }}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006FEE" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill:"hsl(var(--muted-foreground))", fontSize:9 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey={revenueKey} stroke="#006FEE" strokeWidth={2} fill="url(#ag)" dot={false} animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue 3-bucket split */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">{t("dash_gaming_time")}</span>
                </div>
                <span className="text-xs font-bold text-emerald-500 tabular">{(revenueStats?.sessionRevenue ?? 0).toFixed(2)} {egp}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("dash_room_orders")}</span>
                </div>
                <span className="text-xs font-bold text-primary tabular">{(revenueStats?.roomOrderRevenue ?? 0).toFixed(2)} {egp}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs text-muted-foreground">{t("dash_buffet_pos")}</span>
                </div>
                <span className="text-xs font-bold text-orange-500 tabular">{(revenueStats?.orderRevenue ?? 0).toFixed(2)} {egp}</span>
              </div>
            </div>
          </div>
        </HoverCard>
      </div>

      {/* Active sessions + Quick actions */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-7">
        {/* Sessions */}
        <HoverCard className="md:col-span-4">
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm md:text-base font-semibold">{t("current_sessions")}</h3>
                {(activeSessions?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                    {activeSessions?.length}
                  </span>
                )}
              </div>
              {(activeSessions?.length ?? 0) > 0 && (
                <Link href="/sessions">
                  <span className="text-xs text-primary hover:underline cursor-pointer">{t("view_all")}</span>
                </Link>
              )}
            </div>

            {activeSessions?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Gamepad2 className="h-7 w-7 mx-auto mb-2 opacity-20" />
                <p className="text-sm">{t("no_active_sessions")}</p>
              </div>
            ) : (
              /* Mobile: horizontal scroll; Desktop: vertical list */
              <>
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 md:hidden scrollbar-hide snap-x snap-mandatory">
                  {activeSessions?.map((session, i) => (
                    <QuickPopover
                      key={session.id}
                      className="shrink-0 w-[calc(50%-6px)] min-w-[148px] snap-start"
                      content={<SessionPopoverContent session={session} t={t} lang={lang} egp={egp} />}
                    >
                      <Link href={`/sessions/${session.id}`} className="block">
                        <motion.div
                          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-secondary/60 rounded-2xl p-3.5 border border-border/60 cursor-pointer hover:bg-secondary/80 transition-colors h-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              session.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                            }`}>
                              {session.status === "active" ? t("dash_session_active") : t("dash_session_paused")}
                            </span>
                          </div>
                          <p className="text-sm font-bold leading-tight truncate mb-1">
                            {lang === "ar" ? (session.assetNameAr || session.assetName) : (session.assetName || session.assetNameAr)}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2.5">
                            <Clock className="h-3 w-3" />
                            <span>
                              {Math.floor(session.currentMinutes / 60)}{t("dash_hour_short")} {session.currentMinutes % 60}{t("dash_minute_short")}
                            </span>
                          </div>
                          <p className="text-base font-bold text-emerald-500">{session.currentCost.toFixed(2)} {egp}</p>
                        </motion.div>
                      </Link>
                    </QuickPopover>
                  ))}
                </div>

                <div className="hidden md:block space-y-0">
                  {activeSessions?.slice(0,5).map((session, i) => (
                    <QuickPopover
                      key={session.id}
                      content={<SessionPopoverContent session={session} t={t} lang={lang} egp={egp} />}
                    >
                      <Link href={`/sessions/${session.id}`} className="block">
                        <motion.div
                          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0 cursor-pointer hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center shrink-0">
                              <Gamepad2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{lang === "ar" ? (session.assetNameAr || session.assetName) : (session.assetName || session.assetNameAr)}</p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Clock className="h-3 w-3" />
                                <span>{Math.floor(session.currentMinutes/60)}{t("dash_hour_short")} {session.currentMinutes%60}{t("dash_minute_short")}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-emerald-500">{session.currentCost.toFixed(2)} {egp}</p>
                        </motion.div>
                      </Link>
                    </QuickPopover>
                  ))}
                </div>
              </>
            )}
          </div>
        </HoverCard>

        {/* Quick actions */}
        <div className="md:col-span-3">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">{t("quick_actions")}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href:"/pos",    Icon:Monitor,      label: t("dash_qa_pos"),    cls:"bg-primary/10 border-primary/25 text-primary hover:bg-primary/15" },
              { href:"/assets", Icon:Gamepad2,     label: t("qa_devices"),     cls:"bg-secondary border-border hover:bg-secondary/70" },
              { href:"/kds",    Icon:ChefHat,      label: t("dash_qa_kitchen"),cls:"bg-secondary border-border hover:bg-secondary/70" },
              { href:"/orders", Icon:ShoppingCart, label: t("qa_orders"),      cls:"bg-secondary border-border hover:bg-secondary/70" },
            ].map(({ href, Icon, label, cls }) => (
              <Link key={href} href={href}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  transition={{ type:"spring", stiffness:500, damping:30 }}
                  className={`flex flex-col items-center justify-center gap-1.5 h-[90px] md:h-24 rounded-2xl border cursor-pointer transition-colors ${cls}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs md:text-sm font-semibold">{label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Owner Finance Snapshot ─────────────────────── */}
      {canSeeFinance && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("dash_finance_snapshot")}
            </p>
            <Link href="/finance">
              <span className="flex items-center gap-1 text-xs font-semibold text-[#17c964] hover:opacity-80 transition cursor-pointer">
                {t("dash_finance_details")}
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          {financeOverview ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                {
                  label: t("dash_month_income"),
                  value: financeOverview.incomeMonth ?? 0,
                  icon: TrendingUp,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                  href: "/finance/money-in",
                },
                {
                  label: t("dash_month_expenses"),
                  value: financeOverview.expensesMonth ?? 0,
                  icon: TrendingDown,
                  color: "text-red-500",
                  bg: "bg-red-500/10",
                  href: "/finance/expenses",
                },
                {
                  label: t("dash_net_profit"),
                  value: financeOverview.profitMonth ?? 0,
                  icon: DollarSign,
                  color: (financeOverview.profitMonth ?? 0) >= 0 ? "text-[#17c964]" : "text-red-500",
                  bg: (financeOverview.profitMonth ?? 0) >= 0 ? "bg-[#17c964]/10" : "bg-red-500/10",
                  href: "/finance/reports",
                },
                {
                  label: t("dash_cash_balance"),
                  value: financeOverview.cashAvailable ?? 0,
                  icon: Wallet,
                  color: "text-cyan-500",
                  bg: "bg-cyan-500/10",
                  href: "/finance/accounts",
                },
              ].map(({ label, value, icon: Icon, color, bg, href }) => (
                <Link key={label} href={href} className="block">
                  <div className="card-base rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${color}`}>
                        {parseFloat(String(value)).toFixed(0)} <span className="text-[10px] font-normal text-muted-foreground">{egp}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="card-base rounded-2xl p-3.5 h-[60px] animate-pulse bg-secondary/50" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ─── Sales tab ──────────────────────────────────────── */
  const SalesContent = (
    <div className="space-y-4 md:space-y-6">
      <StaggerChildren className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-4">
        {[
          { label: t("dash_total_revenue"),  value:revenueStats?.total??0,            color:"text-primary",      Icon:Receipt,       href:"/payments" },
          { label: t("dash_gaming_time"),     value:revenueStats?.sessionRevenue??0,   color:"text-emerald-500",  Icon:Gamepad2,      href:"/sessions" },
          { label: t("dash_room_orders"),     value:revenueStats?.roomOrderRevenue??0, color:"text-primary",      Icon:ShoppingCart,  href:"/orders" },
          { label: t("dash_buffet_pos"),      value:revenueStats?.orderRevenue??0,     color:"text-orange-500",   Icon:Utensils,      href:"/orders" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <HoverCard>
              <Link href={stat.href} className="block">
                <div className="bg-card border border-card-border rounded-2xl p-4 md:p-5 flex items-center gap-4 md:block cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="md:hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color === "text-primary" ? "bg-primary/15" : stat.color === "text-emerald-500" ? "bg-emerald-500/15" : stat.color === "text-orange-500" ? "bg-orange-500/15" : "bg-primary/15"}`}>
                      <stat.Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 md:flex-none">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium md:mb-3">{stat.label}</p>
                    <p className={`text-2xl md:text-3xl font-bold tabular ${stat.color}`} style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
                      {stat.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("egp_label")}</p>
                  </div>
                </div>
              </Link>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Revenue chart */}
      <HoverCard>
        <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm md:text-base font-semibold">{t("dash_daily_revenue")}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{PERIOD_LABELS[period]}</p>
            </div>
            <p className="text-base md:text-lg font-bold text-primary">{(revenueStats?.total??0).toFixed(2)} {egp}</p>
          </div>
          {dailyChartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">{t("no_data")}</div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 260}>
              <BarChart data={dailyChartData} margin={{ top:4, right:0, left:-18, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fill:"hsl(var(--muted-foreground))", fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:"hsl(var(--muted-foreground))", fontSize:10 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"hsl(var(--muted))", radius:5 } as any} />
                <Bar dataKey={revenueKey} fill="#006FEE" radius={[5,5,0,0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </HoverCard>

      {/* Payment breakdown */}
      <HoverCard>
        <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 overflow-hidden">
          <h3 className="text-sm md:text-base font-semibold mb-4">{t("dash_payment_methods")}</h3>
          {totalPayments === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("no_data")}</p>
          ) : (
            <div className="space-y-4">
              {[
                { name:t("dash_cash_method"),     key:"cash",     value:paymentBreakdown?.cash??0,     color:"#006FEE", Icon:Banknote },
                { name:t("dash_instapay_method"), key:"instapay", value:paymentBreakdown?.instapay??0, color:"#17c964", Icon:Smartphone },
                { name:t("dash_visa_method"),     key:"visa",     value:paymentBreakdown?.visa??0,     color:"#f5a524", Icon:CreditCard },
              ].map(d => (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <d.Icon className="h-4 w-4" style={{ color:d.color }} />
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{d.value.toFixed(2)} {egp}</span>
                      <span className="text-xs text-muted-foreground w-8 text-end">
                        {totalPayments > 0 ? Math.round((d.value/totalPayments)*100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width:0 }}
                      animate={{ width:`${totalPayments>0 ? (d.value/totalPayments)*100 : 0}%` }}
                      transition={{ duration:0.8, ease:"easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor:d.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </HoverCard>
    </div>
  );

  /* ─── Shifts tab ─────────────────────────────────────── */
  const ShiftsContent = (() => {
    const shifts = shiftsData ?? [];
    const totalRevenue   = shifts.reduce((s, sh) => s + sh.totalRevenue, 0);
    const totalSessions  = shifts.reduce((s, sh) => s + sh.sessionCount, 0);
    const totalOrders    = shifts.reduce((s, sh) => s + sh.orderCount, 0);

    function fmtDuration(mins: number) {
      const h = Math.floor(mins / 60), m = mins % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    function fmtTime(iso: string | null | undefined) {
      if (!iso) return "—";
      const d = new Date(iso);
      return d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    function fmtDate(iso: string) {
      const d = new Date(iso);
      return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" });
    }

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Summary strip */}
        <StaggerChildren className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          {[
            { label: t("dash_shifts_count"),   value: shifts.length,  isFloat:false, color:"text-primary",     Icon:Clock,         href:"/shifts" },
            { label: t("dash_total_revenue"),  value: totalRevenue,   isFloat:true,  color:"text-emerald-500", Icon:Receipt,       href:"/payments" },
            { label: t("dash_sessions_total"), value: totalSessions,  isFloat:false, color:"text-primary",     Icon:Gamepad2,      href:"/sessions" },
            { label: t("dash_orders_total"),   value: totalOrders,    isFloat:false, color:"text-orange-500",  Icon:ShoppingCart,  href:"/orders" },
          ].map(stat => (
            <StaggerItem key={stat.label}>
              <HoverCard>
                <Link href={stat.href} className="block">
                  <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color==="text-primary"?"bg-primary/15":stat.color==="text-emerald-500"?"bg-emerald-500/15":stat.color==="text-orange-500"?"bg-orange-500/15":"bg-primary/15"}`}>
                      <stat.Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      <p className={`text-xl font-bold tabular ${stat.color}`} style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
                        {stat.isFloat ? (stat.value as number).toFixed(2) : stat.value}
                        {stat.isFloat && <span className="text-sm opacity-60 ms-1">{egp}</span>}
                      </p>
                    </div>
                  </div>
                </Link>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Per-shift cards */}
        {isLoadingShifts ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : shifts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground text-sm">{t("dash_no_shifts")}</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {shifts.map(shift => {
              const isOpen = shift.status === "open";
              const diff = shift.difference ?? 0;
              const hasDiff = diff !== 0 && shift.status === "closed";

              const shiftMeta: ShiftMeta = {
                id: shift.id,
                userName: shift.userName ?? null,
                openedAt: shift.openedAt as unknown as string,
                closedAt: shift.closedAt as unknown as string ?? null,
                status: shift.status,
                totalRevenue: shift.totalRevenue,
                durationMinutes: shift.durationMinutes,
                gamingRevenue: shift.gamingRevenue,
                roomOrderRevenue: shift.roomOrderRevenue,
                posRevenue: shift.posRevenue,
                sessionCount: shift.sessionCount,
                orderCount: shift.orderCount,
              };

              return (
                <HoverCard key={shift.id}>
                  <div className={`bg-card rounded-2xl border ${isOpen ? "border-emerald-500/30" : "border-card-border"}`}>

                    {/* ── Clickable header → /shifts ── */}
                    <Link href="/shifts" className="block p-4 md:p-5 pb-3 hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? "bg-emerald-500/15" : "bg-secondary"}`}>
                            <Clock className={`h-5 w-5 ${isOpen ? "text-emerald-500" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{shift.userName ?? t("dash_cashier")}</p>
                              {isOpen && (
                                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-semibold">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 live-dot" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  </span>
                                  {t("dash_shift_live")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {fmtDate(shift.openedAt as unknown as string)} · {fmtTime(shift.openedAt as unknown as string)} → {isOpen ? t("dash_now") : fmtTime(shift.closedAt as unknown as string)}
                              <span className="ms-2 text-primary/70">{fmtDuration(shift.durationMinutes)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-end shrink-0">
                          <p className="text-lg md:text-xl font-bold text-primary tabular" style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
                            {shift.totalRevenue.toFixed(2)} <span className="text-sm opacity-60">{egp}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">{t("dash_total_revenue_label")}</p>
                        </div>
                      </div>
                    </Link>

                    {/* ── Clickable stat tiles ── */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 px-4 md:px-5 mb-3">
                      {/* Gaming Time */}
                      <button
                        onClick={() => openDrawer(shiftMeta, "gaming")}
                        className="bg-emerald-500/8 hover:bg-emerald-500/15 active:scale-95 rounded-xl px-3 py-2.5 text-start transition-all duration-150 group"
                      >
                        <p className="text-[10px] text-emerald-600 font-medium mb-0.5 flex items-center gap-1">
                          {t("dash_gaming_time")}
                          <span className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors text-[8px]">↗</span>
                        </p>
                        <p className="text-sm font-bold text-emerald-500 tabular">{shift.gamingRevenue.toFixed(2)} {egp}</p>
                      </button>

                      {/* Room Orders */}
                      <button
                        onClick={() => openDrawer(shiftMeta, "roomOrders")}
                        className="bg-primary/8 hover:bg-primary/15 active:scale-95 rounded-xl px-3 py-2.5 text-start transition-all duration-150 group"
                      >
                        <p className="text-[10px] text-primary font-medium mb-0.5 flex items-center gap-1">
                          {t("dash_room_orders")}
                          <span className="text-primary/40 group-hover:text-primary transition-colors text-[8px]">↗</span>
                        </p>
                        <p className="text-sm font-bold text-primary tabular">{shift.roomOrderRevenue.toFixed(2)} {egp}</p>
                      </button>

                      {/* POS/Buffet */}
                      <button
                        onClick={() => openDrawer(shiftMeta, "pos")}
                        className="bg-orange-500/8 hover:bg-orange-500/15 active:scale-95 rounded-xl px-3 py-2.5 text-start transition-all duration-150 group"
                      >
                        <p className="text-[10px] text-orange-500 font-medium mb-0.5 flex items-center gap-1">
                          {t("dash_buffet_pos_short")}
                          <span className="text-orange-500/40 group-hover:text-orange-500 transition-colors text-[8px]">↗</span>
                        </p>
                        <p className="text-sm font-bold text-orange-500 tabular">{shift.posRevenue.toFixed(2)} {egp}</p>
                      </button>

                      {/* Sessions */}
                      <button
                        onClick={() => openDrawer(shiftMeta, "gaming")}
                        className="bg-secondary hover:bg-muted active:scale-95 rounded-xl px-3 py-2.5 text-start transition-all duration-150 group"
                      >
                        <p className="text-[10px] text-muted-foreground font-medium mb-0.5 flex items-center gap-1">
                          {t("dash_sessions_label")}
                          <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors text-[8px]">↗</span>
                        </p>
                        <p className="text-sm font-bold tabular">{shift.sessionCount}</p>
                      </button>

                      {/* Orders */}
                      <button
                        onClick={() => openDrawer(shiftMeta, "orders")}
                        className="bg-secondary hover:bg-muted active:scale-95 rounded-xl px-3 py-2.5 text-start transition-all duration-150 group"
                      >
                        <p className="text-[10px] text-muted-foreground font-medium mb-0.5 flex items-center gap-1">
                          {t("dash_orders_label")}
                          <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors text-[8px]">↗</span>
                        </p>
                        <p className="text-sm font-bold tabular">{shift.orderCount}</p>
                      </button>
                    </div>

                    {/* ── Payment methods + reconciliation ── */}
                    <div className="flex flex-wrap items-center gap-3 px-4 md:px-5 pb-4 pt-2 border-t border-border/50 text-xs">
                      {shift.cashPayments > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Banknote className="h-3.5 w-3.5" />
                          <span className="tabular">{shift.cashPayments.toFixed(2)} {egp}</span>
                        </span>
                      )}
                      {shift.instapayPayments > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Smartphone className="h-3.5 w-3.5" />
                          <span className="tabular">{shift.instapayPayments.toFixed(2)} {egp}</span>
                        </span>
                      )}
                      {shift.visaPayments > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span className="tabular">{shift.visaPayments.toFixed(2)} {egp}</span>
                        </span>
                      )}
                      {hasDiff && (
                        <span className={`ms-auto flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${diff > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {diff > 0 ? "+" : ""}{diff.toFixed(2)} {egp}
                        </span>
                      )}
                      {shift.status === "closed" && diff === 0 && (
                        <span className="ms-auto flex items-center gap-1 text-emerald-500 text-[11px] font-semibold">
                          <Check className="h-3 w-3" /> {t("dash_balanced")}
                        </span>
                      )}
                    </div>
                  </div>
                </HoverCard>
              );
            })}
          </div>
        )}
      </div>
    );
  })();

  /* ─── Details tab ────────────────────────────────────── */
  const ASSET_ICON_MAP: Record<string, string> = {
    ps:"🎮", billiard:"🎱", air_hockey:"🏒", babyfoot:"⚽", other:"🕹️",
  };

  function CategoryBreakdown({ byCategory, total, color }: {
    byCategory: any[]; total: number; color: string;
  }) {
    if (byCategory.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-6">{t("dash_no_orders")}</p>;
    }
    return (
      <div className="space-y-4">
        {byCategory.map((cat: any) => (
          <div key={cat.categoryId ?? "__none__"}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${color}`}>{lang === "ar" ? (cat.categoryNameAr || cat.categoryName) : (cat.categoryName || cat.categoryNameAr)}</span>
                {total > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-current/10 ${color}`}>
                    {Math.round(((cat.total ?? 0)/total)*100)}%
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold ${color}`}>{(cat.total ?? 0).toFixed(2)} {egp}</span>
            </div>
            <div className={`space-y-1.5 ps-3 border-s-2`} style={{ borderColor: "currentColor", opacity: 1 }}>
              {(cat.products ?? []).map((p: any) => (
                <div key={p.productId} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">
                    {lang === "ar" ? (p.nameAr || p.name) : (p.name || p.nameAr)}<span className="ms-1 opacity-50">×{p.quantity}</span>
                  </span>
                  <span className="font-medium ms-2 whitespace-nowrap">{(p.total ?? 0).toFixed(2)} {egp}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const DetailsContent = (
    <div className="space-y-4 md:space-y-6">
      {isLoadingBreakdown ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        </div>
      ) : noBreakdownData ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-muted-foreground text-sm">{t("no_data")}</p>
        </div>
      ) : (
        <>
          <div className={`grid gap-3 md:gap-4 ${source === "all" ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
            {/* Gaming time breakdown */}
            {source !== "buffet" && (
              <HoverCard>
                <div className="bg-card border border-emerald-500/15 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <Gamepad2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{t("dash_gaming_time")}</h3>
                    </div>
                    <span className="text-base md:text-lg font-bold text-emerald-500">{(breakdown?.gaming.total??0).toFixed(2)} {egp}</span>
                  </div>
                  {(breakdown?.gaming.byType.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("dash_no_completed_sessions")}</p>
                  ) : (
                    <div>
                      {breakdown!.gaming.byType.map((item: any) => (
                        <div key={item.type} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                          <span className="text-xl">{ASSET_ICON_MAP[item.type]??"🕹️"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.typeAr}</p>
                            <p className="text-xs text-muted-foreground">{item.sessions} {t("dash_sessions_unit")}</p>
                          </div>
                          <div className="text-end">
                            <p className="text-sm font-bold text-emerald-500">{item.total.toFixed(2)} {egp}</p>
                            {breakdown!.gaming.total > 0 && (
                              <p className="text-[11px] text-muted-foreground">{Math.round((item.total/breakdown!.gaming.total)*100)}%</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HoverCard>
            )}

            {/* Room orders breakdown */}
            {source !== "buffet" && (
              <HoverCard>
                <div className="bg-card border border-primary/15 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{t("dash_room_orders")}</h3>
                    </div>
                    <span className="text-base md:text-lg font-bold text-primary">{((breakdown as any)?.roomOrders?.total??0).toFixed(2)} {egp}</span>
                  </div>
                  <CategoryBreakdown
                    byCategory={(breakdown as any)?.roomOrders?.byCategory ?? []}
                    total={(breakdown as any)?.roomOrders?.total ?? 0}
                    color="text-primary"
                  />
                </div>
              </HoverCard>
            )}

            {/* POS / buffet breakdown */}
            {source !== "gaming" && (
              <HoverCard>
                <div className="bg-card border border-orange-500/15 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
                        <Utensils className="h-4 w-4 text-orange-500" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{t("dash_buffet_pos")}</h3>
                    </div>
                    <span className="text-base md:text-lg font-bold text-orange-500">{(breakdown?.buffet.total??0).toFixed(2)} {egp}</span>
                  </div>
                  <CategoryBreakdown
                    byCategory={breakdown?.buffet.byCategory ?? []}
                    total={breakdown?.buffet.total ?? 0}
                    color="text-orange-500"
                  />
                </div>
              </HoverCard>
            )}
          </div>

          {/* Grand total */}
          <div className="rounded-2xl bg-primary/8 border border-primary/20 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{t("dash_grand_total")}</p>
              <p className="text-sm font-semibold mt-0.5">
                {PERIOD_LABELS[period]}
                {source !== "all" && <span className="ms-2 text-primary text-xs">· {SOURCE_OPTIONS.find(s=>s.id===source)?.label}</span>}
              </p>
            </div>
            <span className="text-3xl md:text-4xl font-bold text-primary tabular" style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
              {(breakdown?.grandTotal??0).toFixed(2)}
              <span className="text-lg md:text-xl text-primary/60 ms-1">{egp}</span>
            </span>
          </div>

          {/* ── Rooms Panel ── */}
          <HoverCard>
            <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold">{t("dash_room_overview")}</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{PERIOD_LABELS[period]}</span>
              </div>

              {!roomsData || roomsData.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Monitor className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  {t("dash_no_room_data")}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-sm min-w-[460px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className={`pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium ${lang==="ar"?"text-right":"text-left"}`}>
                          {t("dash_col_room")}
                        </th>
                        <th className="pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-end">
                          {t("dash_col_sessions")}
                        </th>
                        <th className="pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-end">
                          {t("dash_col_time")}
                        </th>
                        <th className="pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-end">
                          {t("dash_gaming_time")}
                        </th>
                        <th className="pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-end">
                          {t("dash_col_orders")}
                        </th>
                        <th className="pb-3 text-[11px] uppercase tracking-wide text-muted-foreground font-medium text-end">
                          {t("dash_col_total")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomsData.map(room => {
                        const name = lang==="ar" ? (room.assetNameAr || room.assetName) : (room.assetName || room.assetNameAr);
                        const h = Math.floor((room.totalMinutes||0) / 60);
                        const m = Math.round((room.totalMinutes||0) % 60);
                        const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                        return (
                          <tr key={room.assetId} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="py-3">
                              <Link href={`/assets/${room.assetId}/history`} className="flex items-center gap-2.5 group">
                                <span className="text-lg">{ASSET_ICON_MAP[room.assetType]??"🕹️"}</span>
                                <div>
                                  <p className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{name}</p>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    room.assetStatus === "available"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-amber-500/10 text-amber-500"
                                  }`}>
                                    {room.assetStatus === "available"
                                      ? t("dash_room_available")
                                      : t("dash_room_busy")}
                                  </span>
                                </div>
                              </Link>
                            </td>
                            <td className="py-3 text-end tabular-nums text-muted-foreground">
                              {room.sessionCount}
                            </td>
                            <td className="py-3 text-end tabular-nums text-muted-foreground text-xs">
                              {room.totalMinutes > 0 ? durationStr : "-"}
                            </td>
                            <td className="py-3 text-end tabular-nums text-emerald-500 font-medium">
                              {room.gamingRevenue > 0 ? `${room.gamingRevenue.toFixed(2)} ${egp}` : "-"}
                            </td>
                            <td className="py-3 text-end tabular-nums text-primary font-medium">
                              {room.roomOrderRevenue > 0 ? `${room.roomOrderRevenue.toFixed(2)} ${egp}` : "-"}
                            </td>
                            <td className="py-3 text-end tabular-nums font-bold">
                              {room.totalRevenue > 0 ? `${room.totalRevenue.toFixed(2)} ${egp}` : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td className="pt-3 text-xs font-bold text-muted-foreground">{t("dash_col_total")}</td>
                        <td className="pt-3 text-end tabular-nums font-bold text-muted-foreground">
                          {roomsData.reduce((s,r) => s+r.sessionCount,0)}
                        </td>
                        <td className="pt-3 text-end text-xs text-muted-foreground tabular-nums">
                          {(() => {
                            const totalMins = roomsData.reduce((s,r) => s+(r.totalMinutes||0),0);
                            const h=Math.floor(totalMins/60), m=Math.round(totalMins%60);
                            return totalMins > 0 ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : "-";
                          })()}
                        </td>
                        <td className="pt-3 text-end tabular-nums font-bold text-emerald-500">
                          {roomsData.reduce((s,r) => s+r.gamingRevenue,0).toFixed(2)} {egp}
                        </td>
                        <td className="pt-3 text-end tabular-nums font-bold text-primary">
                          {roomsData.reduce((s,r) => s+r.roomOrderRevenue,0).toFixed(2)} {egp}
                        </td>
                        <td className="pt-3 text-end tabular-nums font-bold text-foreground">
                          {roomsData.reduce((s,r) => s+r.totalRevenue,0).toFixed(2)} {egp}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </HoverCard>
        </>
      )}
    </div>
  );

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background w-full max-w-full">
      {MobileTopBar}
      {DesktopHeader}

      {/* Mobile filter sheet */}
      <FilterSheet
        open={filterOpen} onClose={() => setFilterOpen(false)}
        source={source} setSource={setSource}
        method={method} setMethod={setMethod}
        t={t}
        sourceOptions={SOURCE_OPTIONS}
        methodOptions={METHOD_OPTIONS}
      />

      {/* Shift detail drawer */}
      <ShiftDetailDrawer
        shiftId={drawerShift?.shiftId ?? null}
        initialTab={drawerShift?.tab ?? "gaming"}
        shiftMeta={drawerShift?.meta ?? null}
        onClose={() => setDrawerShift(null)}
      />

      {/* Mobile bottom nav */}
      <MobileBottomNav tab={tab} setTab={setTab} t={t} pendingOrders={summary?.pendingOrders ?? 0} />

      {/* Main content */}
      <div className="p-4 md:p-8" style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom, 0px))" }}>
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }} transition={{ duration:0.18 }}>
              {OverviewContent}
            </motion.div>
          )}
          {tab === "sales" && (
            <motion.div key="sales" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }} transition={{ duration:0.18 }}>
              {SalesContent}
            </motion.div>
          )}
          {tab === "details" && (
            <motion.div key="details" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }} transition={{ duration:0.18 }}>
              {DetailsContent}
            </motion.div>
          )}
          {tab === "shifts" && (
            <motion.div key="shifts" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }} transition={{ duration:0.18 }}>
              {ShiftsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
