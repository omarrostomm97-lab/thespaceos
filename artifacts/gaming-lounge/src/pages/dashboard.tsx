import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetDashboardSummary,
  useListActiveSessions,
  useGetRevenueStats,
  useGetDashboardBreakdown,
  getGetDashboardSummaryQueryKey,
  getListActiveSessionsQueryKey,
  getGetRevenueStatsQueryKey,
  getGetDashboardBreakdownQueryKey,
} from "@workspace/api-client-react";
import {
  Gamepad2, Receipt, AlertTriangle, Clock, ShoppingCart,
  Activity, Monitor, TrendingUp, Utensils, Bell, Plus,
  LayoutDashboard, ChefHat, Download, Banknote,
  Smartphone, CreditCard, Filter, X, Check,
  BarChart2, List,
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
type Tab = "overview" | "sales" | "details";

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

function dayLabel(dateStr: string, lang: "ar"|"en") {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0)  return lang === "ar" ? "اليوم" : "Today";
  if (diff === -1) return lang === "ar" ? "أمس"   : "Yest.";
  return lang === "ar" ? DAY_AR[d.getDay()] : DAY_EN[d.getDay()];
}

const ASSET_ICON: Record<string, string> = {
  ps:"🎮", billiard:"🎱", air_hockey:"🏒", babyfoot:"⚽", other:"🕹️",
};

/* ─── Tooltip ────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-3.5 py-2.5 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: item.color || "#006FEE" }}>
          {typeof item.value === "number" ? item.value.toFixed(2) : item.value} ج.م
        </p>
      ))}
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────── */
interface KpiCardProps {
  label: string; value: number; subtitle?: string;
  icon: React.ElementType; iconClass: string;
  isLive?: boolean; isFloat?: boolean; compact?: boolean;
}
function KpiCard({ label, value, subtitle, icon: Icon, iconClass, isLive, isFloat, compact }: KpiCardProps) {
  const animated = useCountUp(value);
  const display = isFloat ? animated.toFixed(2) : Math.round(animated).toLocaleString();
  return (
    <HoverCard>
      <div className={`bg-card border border-card-border rounded-2xl h-full ${compact ? "p-4" : "p-5"}`}>
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
            {isFloat && <span className={`text-muted-foreground block ${compact ? "text-[11px] mt-0.5" : "text-sm mt-1"}`}>ج.م</span>}
            {subtitle && <p className={`text-muted-foreground mt-1.5 leading-relaxed ${compact ? "text-[10px]" : "text-xs"}`}>{subtitle}</p>}
          </div>
          <div className={`rounded-xl flex items-center justify-center shrink-0 ${iconClass} ${compact ? "w-9 h-9" : "w-10 h-10"}`}>
            <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </div>
        </div>
      </div>
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
  open, onClose, source, setSource, method, setMethod, lang,
  sourceOptions, methodOptions,
}: {
  open: boolean; onClose: () => void;
  source: Source; setSource: (v: Source) => void;
  method: PayMethod; setMethod: (v: PayMethod) => void;
  lang: "ar" | "en";
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
              <p className="text-base font-bold">{lang === "ar" ? "الفلاتر" : "Filters"}</p>
              <div className="flex items-center gap-2">
                {(source !== "all" || method !== "all") && (
                  <button onClick={() => { setSource("all"); setMethod("all"); }}
                    className="text-xs text-primary font-medium hover:underline">
                    {lang === "ar" ? "مسح الكل" : "Clear all"}
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
                  {lang === "ar" ? "المصدر" : "Source"}
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
                  {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
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
                {lang === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile Bottom Nav ──────────────────────────────── */
function MobileBottomNav({ tab, setTab, lang, pendingOrders }: {
  tab: Tab; setTab: (t: Tab) => void; lang: "ar"|"en"; pendingOrders: number;
}) {
  const tabs = [
    { id: "overview" as Tab, labelAr: "الرئيسية", labelEn: "Home",   Icon: LayoutDashboard },
    { id: "sales"    as Tab, labelAr: "المبيعات",  labelEn: "Sales",  Icon: BarChart2 },
    { id: "details"  as Tab, labelAr: "التفصيل",   labelEn: "Details", Icon: List },
  ];
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card border-t border-border"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around pt-1 pb-2">
        {tabs.map(({ id, labelAr, labelEn, Icon }) => {
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
                {lang === "ar" ? labelAr : labelEn}
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
  total, gamingRevenue, buffetRevenue, source, openShift, lang,
}: {
  total: number; gamingRevenue: number; buffetRevenue: number;
  source: Source; openShift: boolean; lang: "ar"|"en";
}) {
  const animated = useCountUp(total, 1000);
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-primary via-primary/90 to-blue-700 shadow-xl shadow-primary/30">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Live badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 live-dot" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-white/90">
              {lang === "ar" ? "مباشر" : "Live"}
            </span>
          </div>
          <Receipt className="h-4 w-4 text-white/50" />
        </div>

        {/* Main number */}
        <p className="text-[11px] text-white/65 uppercase tracking-wider font-medium mb-1">
          {source === "gaming" ? (lang === "ar" ? "إيرادات الألعاب" : "Gaming Revenue")
           : source === "buffet" ? (lang === "ar" ? "إيرادات البوفيه" : "Buffet Revenue")
           : (lang === "ar" ? "إجمالي إيرادات اليوم" : "Today's Total Revenue")}
        </p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-[44px] font-bold text-white leading-none tabular"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            {animated.toFixed(2)}
          </span>
          <span className="text-white/60 text-lg mb-1.5">ج.م</span>
        </div>

        {/* Split row (only when source=all) */}
        {source === "all" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">🎮</span>
                <span className="text-[10px] text-white/60 font-medium">{lang === "ar" ? "ألعاب" : "Gaming"}</span>
              </div>
              <p className="text-sm font-bold text-white tabular">{gamingRevenue.toFixed(2)}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl px-3 py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">🍽️</span>
                <span className="text-[10px] text-white/60 font-medium">{lang === "ar" ? "بوفيه" : "Buffet"}</span>
              </div>
              <p className="text-sm font-bold text-white tabular">{buffetRevenue.toFixed(2)}</p>
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
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 animate-pulse pb-28 md:pb-8">
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
  const [period, setPeriod] = useState<Period>("week");
  const [source, setSource] = useState<Source>("all");
  const [method, setMethod] = useState<PayMethod>("all");
  const [tab, setTab]       = useState<Tab>("overview");
  const [filterOpen, setFilterOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t, lang } = useLang();

  const revenueParams   = { period, source, method } as any;
  const breakdownParams = { period, source } as any;

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 },
  });
  const { data: activeSessions, isLoading: isLoadingSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 },
  });
  const { data: revenueStats, isLoading: isLoadingRevenue } = useGetRevenueStats(revenueParams, {
    query: { queryKey: getGetRevenueStatsQueryKey(revenueParams) },
  });
  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetDashboardBreakdown(breakdownParams, {
    query: { queryKey: getGetDashboardBreakdownQueryKey(breakdownParams) },
  });

  if (isLoadingSummary || isLoadingSessions) return <DashboardSkeleton />;

  const revenueKey = t("kpi_revenue_today");
  const dailyChartData = (revenueStats?.dailyBreakdown ?? []).map(d => ({
    day: dayLabel(d.date, lang),
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
    { id: "all"    as Source, label: lang === "ar" ? "الكل"   : "All",    icon: "🔘" },
    { id: "gaming" as Source, label: lang === "ar" ? "ألعاب"  : "Gaming", icon: "🎮" },
    { id: "buffet" as Source, label: lang === "ar" ? "بوفيه"  : "Buffet", icon: "🍽️" },
  ];

  const METHOD_OPTIONS = [
    { id: "all"      as PayMethod, label: lang === "ar" ? "الكل"    : "All",    icon: "💰" },
    { id: "cash"     as PayMethod, label: lang === "ar" ? "كاش"     : "Cash",   icon: "💵" },
    { id: "instapay" as PayMethod, label: lang === "ar" ? "انستاباي": "Insta",  icon: "📱" },
    { id: "visa"     as PayMethod, label: lang === "ar" ? "فيزا"    : "Visa",   icon: "💳" },
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
    <div className="hidden md:block sticky top-0 z-20 bg-background border-b border-border">
      <div className="px-8 py-4">
        {/* Row 1 */}
        <div className="flex items-center justify-between mb-4">
          <FadeIn>
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {greeting}{userName ? `، ${userName}` : ""}
                </h1>
                <p className="text-sm text-muted-foreground">{t("dashboard_subtitle")}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <div className="flex items-center gap-2">
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
                    className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl cursor-pointer">
                    <Plus className="h-4 w-4" />{t("open_shift")}
                  </motion.div>
                </Link>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium px-4 py-2 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{t("shift_open")}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Shift warning */}
        {!summary?.openShift && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-xl mb-4 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{t("no_shift_warning")}</span>
          </div>
        )}

        {/* Row 2: Tabs + Period */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-0.5">
            {(["overview","sales","details"] as Tab[]).map(id => (
              <button key={id} onClick={() => setTab(id)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  tab === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {tab === id && (
                  <motion.div layoutId="desk-tab" className="absolute inset-0 bg-secondary rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                )}
                <span className="relative z-10">
                  {id === "overview" ? t("tab_overview") : id === "sales" ? t("tab_sales") : t("tab_details")}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 bg-muted/40 border border-border rounded-lg p-0.5">
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">{lang === "ar" ? "تصفية:" : "Filter:"}</span>
          </div>
          <PillGroup options={SOURCE_OPTIONS} value={source} onChange={setSource}
            label={lang === "ar" ? "المصدر" : "Source"} />
          <PillGroup options={METHOD_OPTIONS} value={method} onChange={setMethod}
            label={lang === "ar" ? "طريقة الدفع" : "Payment"} />
          {hasFilters && (
            <button onClick={() => { setSource("all"); setMethod("all"); }}
              className="text-xs text-primary hover:underline">
              {lang === "ar" ? "مسح" : "Clear"}
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
          total={heroRevenue}
          gamingRevenue={(summary as any)?.gamingRevenueToday ?? 0}
          buffetRevenue={(summary as any)?.buffetRevenueToday ?? 0}
          source={source}
          openShift={summary?.openShift ?? false}
          lang={lang}
        />
      </div>

      {/* KPI grid: 2×2 mobile, 4-col desktop */}
      <StaggerChildren className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label={t("kpi_active_sessions")} value={summary?.activeSessions ?? 0}
            subtitle={`${summary?.occupiedAssets ?? 0}/${summary?.totalAssets ?? 0} ${lang === "ar" ? "أجهزة" : "devices"}`}
            icon={Gamepad2} iconClass="bg-primary/15 text-primary" isLive compact={isMobile} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label={
              source === "gaming" ? (lang === "ar" ? "إيرادات الألعاب" : "Gaming Rev.")
              : source === "buffet" ? (lang === "ar" ? "إيرادات البوفيه" : "Buffet Rev.")
              : t("kpi_revenue_today")
            }
            value={heroRevenue}
            isFloat
            subtitle={lang === "ar" ? "اليوم" : "Today"}
            icon={Receipt} iconClass="bg-emerald-500/15 text-emerald-500"
            compact={isMobile} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label={t("kpi_pending_orders")} value={summary?.pendingOrders ?? 0}
            subtitle={lang === "ar" ? "تحتاج تنفيذ" : "Need action"}
            icon={ShoppingCart} iconClass="bg-amber-500/15 text-amber-500"
            compact={isMobile} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label={t("kpi_low_stock")} value={summary?.lowStockAlerts ?? 0}
            subtitle={lang === "ar" ? "تنبيهات المخزون" : "Stock alerts"}
            icon={AlertTriangle} iconClass="bg-red-500/15 text-red-500"
            compact={isMobile} />
        </StaggerItem>
      </StaggerChildren>

      {/* Desktop gaming/buffet split cards */}
      {source === "all" && (summary as any)?.gamingRevenueToday !== undefined && (
        <div className="hidden md:grid gap-4 md:grid-cols-2">
          <HoverCard>
            <div className="bg-card border border-emerald-500/15 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Gamepad2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "إيرادات الألعاب — اليوم" : "Gaming Revenue — Today"}</p>
                <p className="text-2xl font-bold text-emerald-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  {((summary as any)?.gamingRevenueToday ?? 0).toFixed(2)} <span className="text-base opacity-60">ج.م</span>
                </p>
              </div>
            </div>
          </HoverCard>
          <HoverCard>
            <div className="bg-card border border-orange-500/15 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                <Utensils className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "إيرادات البوفيه — اليوم" : "Buffet Revenue — Today"}</p>
                <p className="text-2xl font-bold text-orange-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  {((summary as any)?.buffetRevenueToday ?? 0).toFixed(2)} <span className="text-base opacity-60">ج.م</span>
                </p>
              </div>
            </div>
          </HoverCard>
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-3">
        {/* Revenue bar chart */}
        <HoverCard className="md:col-span-2">
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 overflow-hidden">
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
                <p className="text-base md:text-lg font-bold text-primary">{(revenueStats?.total ?? 0).toFixed(2)} ج.م</p>
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
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 flex flex-col gap-3 overflow-hidden">
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

            {/* Session / Order split */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("sessions_revenue")}</span>
                </div>
                <span className="text-xs font-bold text-primary tabular">{(revenueStats?.sessionRevenue ?? 0).toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">{t("orders_revenue")}</span>
                </div>
                <span className="text-xs font-bold text-emerald-500 tabular">{(revenueStats?.orderRevenue ?? 0).toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
        </HoverCard>
      </div>

      {/* Active sessions + Quick actions */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-7">
        {/* Sessions */}
        <HoverCard className="md:col-span-4">
          <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 overflow-hidden">
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
                <div className="flex gap-2.5 overflow-x-auto pb-1 md:hidden scrollbar-hide snap-x snap-mandatory">
                  {activeSessions?.map((session, i) => (
                    <motion.div key={session.id}
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="shrink-0 w-[155px] bg-secondary/60 rounded-2xl p-3.5 snap-start border border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                          <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          session.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                        }`}>
                          {session.status === "active" ? (lang === "ar" ? "نشطة" : "Active") : (lang === "ar" ? "موقوفة" : "Paused")}
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-tight truncate mb-1">
                        {session.assetNameAr || session.assetName}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {Math.floor(session.currentMinutes / 60)}{lang === "ar" ? "س" : "h"} {session.currentMinutes % 60}{lang === "ar" ? "د" : "m"}
                        </span>
                      </div>
                      <p className="text-base font-bold text-emerald-500">{session.currentCost.toFixed(2)} ج.م</p>
                    </motion.div>
                  ))}
                </div>

                <div className="hidden md:block space-y-0">
                  {activeSessions?.slice(0,5).map((session, i) => (
                    <motion.div key={session.id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center shrink-0">
                          <Gamepad2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{session.assetNameAr || session.assetName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{Math.floor(session.currentMinutes/60)}{lang==="ar"?"س":"h"} {session.currentMinutes%60}{lang==="ar"?"د":"m"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <p className="text-sm font-bold text-emerald-500">{session.currentCost.toFixed(2)} ج.م</p>
                        <Link href={`/sessions/${session.id}`}>
                          <span className="text-xs border border-border/80 rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                            {t("manage")}
                          </span>
                        </Link>
                      </div>
                    </motion.div>
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
              { href:"/pos",    Icon:Monitor,      label: lang==="ar"?"نقطة البيع":"POS",     cls:"bg-primary/10 border-primary/25 text-primary hover:bg-primary/15" },
              { href:"/assets", Icon:Gamepad2,     label: lang==="ar"?"الأجهزة":"Devices",   cls:"bg-secondary border-border hover:bg-secondary/70" },
              { href:"/kds",    Icon:ChefHat,      label: lang==="ar"?"المطبخ":"Kitchen",    cls:"bg-secondary border-border hover:bg-secondary/70" },
              { href:"/orders", Icon:ShoppingCart, label: lang==="ar"?"الطلبات":"Orders",    cls:"bg-secondary border-border hover:bg-secondary/70" },
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
    </div>
  );

  /* ─── Sales tab ──────────────────────────────────────── */
  const SalesContent = (
    <div className="space-y-4 md:space-y-6">
      <StaggerChildren className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3">
        {[
          { label: lang==="ar"?"إجمالي الإيرادات":"Total Revenue", value:revenueStats?.total??0,          color:"text-primary",     Icon:Receipt },
          { label: t("sessions_revenue"),                          value:revenueStats?.sessionRevenue??0,  color:"text-emerald-500", Icon:Gamepad2 },
          { label: t("orders_revenue"),                            value:revenueStats?.orderRevenue??0,    color:"text-amber-500",   Icon:Utensils },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <HoverCard>
              <div className="bg-card border border-card-border rounded-2xl p-4 md:p-5 flex items-center gap-4 md:block">
                <div className="md:hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color === "text-primary" ? "bg-primary/15" : stat.color === "text-emerald-500" ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
                    <stat.Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex-1 md:flex-none">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium md:mb-3">{stat.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold tabular ${stat.color}`} style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
                    {stat.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lang==="ar"?"جنيه مصري":"EGP"}</p>
                </div>
              </div>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Revenue chart */}
      <HoverCard>
        <div className="bg-card border border-card-border rounded-2xl p-4 md:p-6 overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm md:text-base font-semibold">{lang==="ar"?"توزيع الإيرادات اليومية":"Daily Revenue"}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{PERIOD_LABELS[period]}</p>
            </div>
            <p className="text-base md:text-lg font-bold text-primary">{(revenueStats?.total??0).toFixed(2)} ج.م</p>
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
          <h3 className="text-sm md:text-base font-semibold mb-4">{lang==="ar"?"توزيع طرق الدفع":"Payment Methods"}</h3>
          {totalPayments === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("no_data")}</p>
          ) : (
            <div className="space-y-4">
              {[
                { name:lang==="ar"?"نقداً":"Cash",          key:"cash",     value:paymentBreakdown?.cash??0,     color:"#006FEE", Icon:Banknote },
                { name:lang==="ar"?"إنستاباي":"InstaPay",   key:"instapay", value:paymentBreakdown?.instapay??0, color:"#17c964", Icon:Smartphone },
                { name:lang==="ar"?"فيزا / ماستر":"Visa",   key:"visa",     value:paymentBreakdown?.visa??0,     color:"#f5a524", Icon:CreditCard },
              ].map(d => (
                <div key={d.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <d.Icon className="h-4 w-4" style={{ color:d.color }} />
                      <span className="text-sm font-medium">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{d.value.toFixed(2)} ج.م</span>
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

  /* ─── Details tab ────────────────────────────────────── */
  const DetailsContent = (
    <div className="space-y-4 md:space-y-6">
      {isLoadingBreakdown ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          <div className={`grid gap-3 md:gap-4 ${source === "all" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {/* Gaming breakdown */}
            {source !== "buffet" && (
              <HoverCard>
                <div className="bg-card border border-emerald-500/15 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <Gamepad2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{lang==="ar"?"إيرادات الألعاب":"Gaming Revenue"}</h3>
                    </div>
                    <span className="text-base md:text-lg font-bold text-emerald-500">{(breakdown?.gaming.total??0).toFixed(2)} ج.م</span>
                  </div>
                  {(breakdown?.gaming.byType.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{lang==="ar"?"لا توجد جلسات منتهية":"No completed sessions"}</p>
                  ) : (
                    <div>
                      {breakdown!.gaming.byType.map(item => (
                        <div key={item.type} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                          <span className="text-xl">{ASSET_ICON[item.type]??"🕹️"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.typeAr}</p>
                            <p className="text-xs text-muted-foreground">{item.sessions} {lang==="ar"?"جلسة":"sessions"}</p>
                          </div>
                          <div className="text-end">
                            <p className="text-sm font-bold text-emerald-500">{item.total.toFixed(2)} ج.م</p>
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

            {/* Buffet breakdown */}
            {source !== "gaming" && (
              <HoverCard>
                <div className="bg-card border border-orange-500/15 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
                        <Utensils className="h-4 w-4 text-orange-500" />
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">{lang==="ar"?"إيرادات البوفيه":"Buffet Revenue"}</h3>
                    </div>
                    <span className="text-base md:text-lg font-bold text-orange-500">{(breakdown?.buffet.total??0).toFixed(2)} ج.م</span>
                  </div>
                  {(breakdown?.buffet.byCategory.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{lang==="ar"?"لا توجد طلبات":"No orders"}</p>
                  ) : (
                    <div className="space-y-4">
                      {breakdown!.buffet.byCategory.map(cat => (
                        <div key={cat.categoryId ?? "__none__"}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-orange-500">{cat.categoryNameAr||cat.categoryName}</span>
                              {breakdown!.buffet.total > 0 && (
                                <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full">
                                  {Math.round((cat.total/breakdown!.buffet.total)*100)}%
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-orange-500">{cat.total.toFixed(2)} ج.م</span>
                          </div>
                          <div className="space-y-1.5 ps-3 border-s-2 border-orange-500/20">
                            {cat.products.map(p => (
                              <div key={p.productId} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground truncate">
                                  {p.nameAr||p.name}<span className="ms-1 opacity-50">×{p.quantity}</span>
                                </span>
                                <span className="font-medium ms-2 whitespace-nowrap">{p.total.toFixed(2)} ج.م</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HoverCard>
            )}
          </div>

          {/* Grand total */}
          <div className="rounded-2xl bg-primary/8 border border-primary/20 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{lang==="ar"?"الإجمالي الكلي":"Grand Total"}</p>
              <p className="text-sm font-semibold mt-0.5">
                {PERIOD_LABELS[period]}
                {source !== "all" && <span className="ms-2 text-primary text-xs">· {SOURCE_OPTIONS.find(s=>s.id===source)?.label}</span>}
              </p>
            </div>
            <span className="text-3xl md:text-4xl font-bold text-primary tabular" style={{ fontFamily:"Inter, system-ui, sans-serif" }}>
              {(breakdown?.grandTotal??0).toFixed(2)}
              <span className="text-lg md:text-xl text-primary/60 ms-1">ج.م</span>
            </span>
          </div>
        </>
      )}
    </div>
  );

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {MobileTopBar}
      {DesktopHeader}

      {/* Mobile filter sheet */}
      <FilterSheet
        open={filterOpen} onClose={() => setFilterOpen(false)}
        source={source} setSource={setSource}
        method={method} setMethod={setMethod}
        lang={lang}
        sourceOptions={SOURCE_OPTIONS}
        methodOptions={METHOD_OPTIONS}
      />

      {/* Mobile bottom nav */}
      <MobileBottomNav tab={tab} setTab={setTab} lang={lang} pendingOrders={summary?.pendingOrders ?? 0} />

      {/* Main content */}
      <div className="p-4 md:p-8 pb-28 md:pb-8">
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
        </AnimatePresence>
      </div>
    </div>
  );
}
