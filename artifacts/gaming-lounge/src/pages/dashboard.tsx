import { useState, useEffect, useRef } from "react";
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
  LayoutDashboard, ChefHat, Search, Download, Banknote,
  Smartphone, CreditCard, Filter,
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
type Period = "today" | "week" | "month";
type Source = "all" | "gaming" | "buffet";
type PayMethod = "all" | "cash" | "instapay" | "visa";

/* ─── Count-up hook ──────────────────────────────────── */
function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (target === 0) { setCurrent(0); return; }
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return current;
}

/* ─── Helpers ────────────────────────────────────────── */
const DAY_NAMES_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDayLabel(dateStr: string, lang: "ar" | "en") {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return lang === "ar" ? "اليوم" : "Today";
  if (diff === -1) return lang === "ar" ? "أمس" : "Yesterday";
  return lang === "ar" ? DAY_NAMES_AR[d.getDay()] : DAY_NAMES_EN[d.getDay()];
}

const ASSET_TYPE_ICON: Record<string, string> = {
  ps: "🎮", billiard: "🎱", air_hockey: "🏒", babyfoot: "⚽", other: "🕹️",
};

/* ─── Sub-components ─────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-xl px-3.5 py-2.5 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: item.color || "#006FEE" }}>
          {typeof item.value === "number" ? item.value.toFixed(2) : item.value} ج.م
        </p>
      ))}
    </div>
  );
}

function TrendBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
      pos ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
    }`}>
      {pos ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

interface KpiCardProps {
  label: string; value: number; subtitle?: string; icon: React.ElementType;
  iconClass: string; isLive?: boolean; trend?: number; isFloat?: boolean;
}
function KpiCard({ label, value, subtitle, icon: Icon, iconClass, isLive, trend, isFloat }: KpiCardProps) {
  const animated = useCountUp(value);
  const display = isFloat ? animated.toFixed(2) : Math.round(animated).toLocaleString();
  return (
    <HoverCard>
      <div className="bg-card border border-card-border rounded-xl p-5 h-full">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium leading-tight">{label}</span>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 live-dot" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            {trend !== undefined && <TrendBadge value={trend} />}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[40px] font-bold leading-none tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
              {display}
            </p>
            {isFloat && <span className="text-sm text-muted-foreground block mt-1">ج.م</span>}
            {subtitle && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </HoverCard>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-xl bg-muted" />
        <div className="h-4 w-48 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-xl bg-muted" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

/* ─── Pill filter group ──────────────────────────────── */
function PillGroup<T extends string>({
  options, value, onChange, label,
}: {
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>}
      <div className="flex items-center gap-0.5 bg-muted/40 border border-border rounded-lg p-0.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              value === opt.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {value === opt.id && (
              <motion.div
                layoutId={`pill-${label}`}
                className="absolute inset-0 bg-card border border-border rounded-md shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            {opt.icon && <span className="relative z-10 text-[11px]">{opt.icon}</span>}
            <span className="relative z-10">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────── */
export default function Dashboard() {
  const [period, setPeriod]   = useState<Period>("week");
  const [source, setSource]   = useState<Source>("all");
  const [method, setMethod]   = useState<PayMethod>("all");
  const [tab, setTab]         = useState<"overview" | "sales" | "details">("overview");
  const { user } = useAuth();
  const { t, lang } = useLang();

  // Build filter params (cast to any so we can pass extra fields without regen)
  const revenueParams  = { period, source, method } as any;
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

  const dailyChartData = (revenueStats?.dailyBreakdown ?? []).map(d => ({
    day: formatDayLabel(d.date, lang),
    [t("kpi_revenue_today")]: d.total,
  }));

  const paymentBreakdown = revenueStats?.paymentMethodBreakdown;
  const paymentChartData = [
    { name: "نقداً",    value: paymentBreakdown?.cash    ?? 0, fill: "#006FEE" },
    { name: "إنستاباي", value: paymentBreakdown?.instapay ?? 0, fill: "#17c964" },
    { name: "فيزا",     value: paymentBreakdown?.visa    ?? 0, fill: "#f5a524" },
  ].filter(d => d.value > 0);

  const totalPayments = paymentChartData.reduce((s, d) => s + d.value, 0);
  const noBreakdownData = !breakdown || breakdown.grandTotal === 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("greeting_morning") : hour < 18 ? t("greeting_afternoon") : t("greeting_evening");
  const userName = user?.nameAr || user?.name || "";

  const TABS = [
    { id: "overview" as const, label: t("tab_overview") },
    { id: "sales"    as const, label: t("tab_sales") },
    { id: "details"  as const, label: t("tab_details") },
  ];

  const PERIOD_LABELS: Record<Period, string> = {
    today: t("period_today"),
    week:  t("period_week"),
    month: t("period_month"),
  };

  const SOURCE_OPTIONS = [
    { id: "all"     as Source, label: lang === "ar" ? "الكل"   : "All",    icon: null },
    { id: "gaming"  as Source, label: lang === "ar" ? "ألعاب"  : "Gaming", icon: "🎮" },
    { id: "buffet"  as Source, label: lang === "ar" ? "بوفيه"  : "Buffet", icon: "🍽️" },
  ];

  const METHOD_OPTIONS = [
    { id: "all"      as PayMethod, label: lang === "ar" ? "الكل"    : "All",     icon: null },
    { id: "cash"     as PayMethod, label: lang === "ar" ? "كاش"     : "Cash",    icon: "💵" },
    { id: "instapay" as PayMethod, label: lang === "ar" ? "انستا"   : "Insta",   icon: "📱" },
    { id: "visa"     as PayMethod, label: lang === "ar" ? "فيزا"    : "Visa",    icon: "💳" },
  ];

  const revenueKey = t("kpi_revenue_today");
  const hasActiveFilters = source !== "all" || method !== "all";

  return (
    <div className="min-h-screen bg-background">

      {/* ─── Sticky Header ──────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">

          {/* Row 1: Greeting + Actions */}
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
                <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150" aria-label="search">
                  <Search className="h-4 w-4" />
                </button>
                <button className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150" aria-label="notifications">
                  <Bell className="h-4 w-4" />
                  {(summary?.pendingOrders ?? 0) > 0 && (
                    <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
                <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150" aria-label="export">
                  <Download className="h-4 w-4" />
                </button>

                {!summary?.openShift ? (
                  <Link href="/shifts">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl cursor-pointer">
                      <Plus className="h-4 w-4" />
                      {t("open_shift")}
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium px-4 py-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t("shift_open")}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Amber shift warning */}
          {!summary?.openShift && (
            <FadeIn delay={0.08}>
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2.5 rounded-xl mb-4 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{t("no_shift_warning")}</span>
              </div>
            </FadeIn>
          )}

          {/* Row 2: Tabs + Period */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              {TABS.map((tabItem) => (
                <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    tab === tabItem.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === tabItem.id && (
                    <motion.div layoutId="tab-pill" className="absolute inset-0 bg-secondary rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                  )}
                  <span className="relative z-10">{tabItem.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 bg-muted/40 border border-border rounded-lg p-0.5">
              {(["today", "week", "month"] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 ${
                    period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period === p && (
                    <motion.div layoutId="period-pill" className="absolute inset-0 bg-card border border-border rounded-md shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                  )}
                  <span className="relative z-10">{PERIOD_LABELS[p]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Source + Method filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-medium">{lang === "ar" ? "تصفية:" : "Filter:"}</span>
            </div>
            <PillGroup
              options={SOURCE_OPTIONS}
              value={source}
              onChange={setSource}
              label={lang === "ar" ? "المصدر" : "Source"}
            />
            <PillGroup
              options={METHOD_OPTIONS}
              value={method}
              onChange={setMethod}
              label={lang === "ar" ? "طريقة الدفع" : "Payment"}
            />
            {hasActiveFilters && (
              <button
                onClick={() => { setSource("all"); setMethod("all"); }}
                className="text-xs text-primary hover:underline"
              >
                {lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────── */}
      <div className="p-8">
        <AnimatePresence mode="wait">

          {/* ─── Overview ─────────────────────────── */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="space-y-6">

              <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StaggerItem>
                  <KpiCard label={t("kpi_active_sessions")} value={summary?.activeSessions ?? 0}
                    subtitle={`${lang === "ar" ? "من أصل" : "of"} ${summary?.totalAssets ?? 0} ${lang === "ar" ? "أجهزة" : "devices"}`}
                    icon={Gamepad2} iconClass="bg-primary/15 text-primary" isLive />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label={source === "gaming" ? (lang === "ar" ? "إيرادات الألعاب" : "Gaming Revenue")
                      : source === "buffet" ? (lang === "ar" ? "إيرادات البوفيه" : "Buffet Revenue")
                      : t("kpi_revenue_today")}
                    value={
                      source === "gaming" ? ((summary as any)?.gamingRevenueToday ?? 0)
                      : source === "buffet" ? ((summary as any)?.buffetRevenueToday ?? 0)
                      : (summary?.revenueToday ?? 0)
                    }
                    isFloat
                    subtitle={lang === "ar" ? "الإجمالي الكلي لليوم" : "Total for today"}
                    icon={Receipt} iconClass="bg-emerald-500/15 text-emerald-500" />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard label={t("kpi_pending_orders")} value={summary?.pendingOrders ?? 0}
                    subtitle={lang === "ar" ? "تحتاج لتنفيذ في المطبخ" : "Awaiting kitchen"}
                    icon={ShoppingCart} iconClass="bg-amber-500/15 text-amber-500" />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard label={t("kpi_low_stock")} value={summary?.lowStockAlerts ?? 0}
                    subtitle={lang === "ar" ? "أصناف قاربت على النفاذ" : "Items running low"}
                    icon={AlertTriangle} iconClass="bg-red-500/15 text-red-500" />
                </StaggerItem>
              </StaggerChildren>

              {/* Gaming vs Buffet split (only in "all" source view) */}
              {source === "all" && ((summary as any)?.gamingRevenueToday !== undefined) && (
                <div className="grid gap-4 md:grid-cols-2">
                  <HoverCard>
                    <div className="bg-card border border-emerald-500/15 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Gamepad2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "إيرادات الألعاب — اليوم" : "Gaming Revenue — Today"}</p>
                        <p className="text-2xl font-bold text-emerald-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                          {((summary as any)?.gamingRevenueToday ?? 0).toFixed(2)} <span className="text-base font-normal opacity-60">ج.م</span>
                        </p>
                      </div>
                    </div>
                  </HoverCard>
                  <HoverCard>
                    <div className="bg-card border border-orange-500/15 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                        <Utensils className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "إيرادات البوفيه — اليوم" : "Buffet Revenue — Today"}</p>
                        <p className="text-2xl font-bold text-orange-500 tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                          {((summary as any)?.buffetRevenueToday ?? 0).toFixed(2)} <span className="text-base font-normal opacity-60">ج.م</span>
                        </p>
                      </div>
                    </div>
                  </HoverCard>
                </div>
              )}

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-3">
                <HoverCard className="md:col-span-2">
                  <div className="bg-card border border-card-border rounded-xl p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="text-base font-semibold">{t("sales_performance")}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {period === "today" ? (lang === "ar" ? "إيرادات اليوم" : "Today's revenue")
                            : period === "week" ? (lang === "ar" ? "آخر 7 أيام" : "Last 7 days")
                            : (lang === "ar" ? "آخر 30 يوماً" : "Last 30 days")}
                          {source !== "all" && <span className="ms-2 text-primary">{SOURCE_OPTIONS.find(s => s.id === source)?.label}</span>}
                          {method !== "all" && <span className="ms-1 text-primary">· {METHOD_OPTIONS.find(m => m.id === method)?.label}</span>}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-muted-foreground">{t("total")}</p>
                        <p className="text-lg font-bold text-primary">{(revenueStats?.total ?? 0).toFixed(2)} ج.م</p>
                      </div>
                    </div>
                    {isLoadingRevenue ? (
                      <div className="h-[200px] flex items-end gap-2 pt-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="flex-1 rounded-t-md bg-muted skeleton-shimmer" style={{ height: `${40 + (i % 3) * 25}%` }} />
                        ))}
                      </div>
                    ) : dailyChartData.length === 0 ? (
                      <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <TrendingUp className="h-8 w-8 opacity-25" /><p className="text-sm">{t("no_data")}</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyChartData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 6 } as any} />
                          <Bar dataKey={revenueKey} fill="#006FEE" radius={[5, 5, 0, 0]} animationDuration={800} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </HoverCard>

                <HoverCard>
                  <div className="bg-card border border-card-border rounded-xl p-6 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <Receipt className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">{t("payment_sources")}</h3>
                    </div>

                    {paymentChartData.length > 0 && (
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        {paymentChartData.map(d => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                            <span className="text-[11px] text-muted-foreground">{d.name}</span>
                            <span className="text-[11px] font-semibold tabular-nums">{d.value.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex-1 min-h-0">
                      {isLoadingRevenue ? (
                        <div className="h-[160px] rounded-lg bg-muted skeleton-shimmer" />
                      ) : dailyChartData.length === 0 ? (
                        <div className="h-[160px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <TrendingUp className="h-7 w-7 opacity-20" /><p className="text-xs">{t("no_data")}</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={160}>
                          <AreaChart data={dailyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#006FEE" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey={revenueKey} stroke="#006FEE" strokeWidth={2} fill="url(#areaGrad)" dot={false} animationDuration={900} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("sessions_revenue")}</span>
                        <span className="font-semibold text-primary tabular-nums">{(revenueStats?.sessionRevenue ?? 0).toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{t("orders_revenue")}</span>
                        <span className="font-semibold text-emerald-500 tabular-nums">{(revenueStats?.orderRevenue ?? 0).toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  </div>
                </HoverCard>
              </div>

              {/* Active sessions + Quick actions */}
              <div className="grid gap-4 md:grid-cols-7">
                <HoverCard className="md:col-span-4">
                  <div className="bg-card border border-card-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <Activity className="h-4 w-4 text-primary" />
                        <h3 className="text-base font-semibold">{t("current_sessions")}</h3>
                        {(activeSessions?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                            {activeSessions?.length}
                          </span>
                        )}
                      </div>
                      {(activeSessions?.length ?? 0) > 5 && (
                        <Link href="/sessions">
                          <span className="text-xs text-primary hover:underline cursor-pointer">{t("view_all")}</span>
                        </Link>
                      )}
                    </div>

                    {activeSessions?.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-25" />
                        <p className="text-sm">{t("no_active_sessions")}</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {activeSessions?.slice(0, 5).map((session, i) => (
                          <motion.div key={session.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                            className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center shrink-0">
                                <Gamepad2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold leading-tight">{session.assetNameAr || session.assetName}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {Math.floor(session.currentMinutes / 60)}{lang === "ar" ? "س" : "h"} {session.currentMinutes % 60}{lang === "ar" ? "د" : "m"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <p className="text-sm font-bold text-emerald-500">{session.currentCost.toFixed(2)} ج.م</p>
                              <Link href={`/sessions/${session.id}`}>
                                <span className="text-xs border border-border/80 rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer transition-colors duration-150">
                                  {t("manage")}
                                </span>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </HoverCard>

                <div className="md:col-span-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("quick_actions")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { href: "/pos",    icon: Monitor,      labelKey: "qa_pos"     as const, cls: "bg-primary/10 border-primary/25 text-primary hover:bg-primary/15" },
                      { href: "/assets", icon: Gamepad2,     labelKey: "qa_devices" as const, cls: "bg-secondary border-border text-foreground hover:bg-secondary/70" },
                      { href: "/kds",    icon: ChefHat,      labelKey: "qa_kitchen" as const, cls: "bg-secondary border-border text-foreground hover:bg-secondary/70" },
                      { href: "/orders", icon: ShoppingCart, labelKey: "qa_orders"  as const, cls: "bg-secondary border-border text-foreground hover:bg-secondary/70" },
                    ].map(({ href, icon: Icon, labelKey, cls }) => (
                      <Link key={href} href={href}>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`flex flex-col items-center justify-center gap-2 h-24 rounded-xl border cursor-pointer transition-colors duration-150 ${cls}`}>
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{t(labelKey)}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Sales ────────────────────────────────── */}
          {tab === "sales" && (
            <motion.div key="sales" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="space-y-6">

              <StaggerChildren className="grid gap-4 md:grid-cols-3">
                {[
                  { label: lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue",   value: revenueStats?.total          ?? 0, color: "text-primary",      icon: Receipt },
                  { label: t("sessions_revenue"),                                   value: revenueStats?.sessionRevenue ?? 0, color: "text-emerald-500",  icon: Gamepad2 },
                  { label: t("orders_revenue"),                                     value: revenueStats?.orderRevenue   ?? 0, color: "text-amber-500",    icon: Utensils },
                ].map(stat => (
                  <StaggerItem key={stat.label}>
                    <HoverCard>
                      <div className="bg-card border border-card-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium">{stat.label}</p>
                          <stat.icon className={`h-4 w-4 ${stat.color} opacity-60`} />
                        </div>
                        <p className={`text-3xl font-bold tabular ${stat.color}`} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                          {stat.value.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "جنيه مصري" : "EGP"}</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                ))}
              </StaggerChildren>

              <HoverCard>
                <div className="bg-card border border-card-border rounded-xl p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold">{lang === "ar" ? "توزيع الإيرادات اليومية" : "Daily Revenue Distribution"}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{PERIOD_LABELS[period]}
                        {source !== "all" && <span className="ms-2 text-primary">{SOURCE_OPTIONS.find(s => s.id === source)?.label}</span>}
                        {method !== "all" && <span className="ms-1 text-primary">· {METHOD_OPTIONS.find(m => m.id === method)?.label}</span>}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">{(revenueStats?.total ?? 0).toFixed(2)} ج.م</p>
                  </div>
                  {dailyChartData.length === 0 ? (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">{t("no_data")}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={dailyChartData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", radius: 6 } as any} />
                        <Bar dataKey={revenueKey} fill="#006FEE" radius={[5, 5, 0, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </HoverCard>

              {/* Payment breakdown */}
              <HoverCard>
                <div className="bg-card border border-card-border rounded-xl p-6">
                  <h3 className="text-base font-semibold mb-5">{lang === "ar" ? "توزيع طرق الدفع" : "Payment Method Breakdown"}</h3>
                  {paymentChartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("no_data")}</p>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { name: "نقداً", key: "cash", value: paymentBreakdown?.cash ?? 0, color: "#006FEE", icon: <Banknote className="h-4 w-4" /> },
                        { name: "إنستاباي", key: "instapay", value: paymentBreakdown?.instapay ?? 0, color: "#17c964", icon: <Smartphone className="h-4 w-4" /> },
                        { name: "فيزا / ماستر", key: "visa", value: paymentBreakdown?.visa ?? 0, color: "#f5a524", icon: <CreditCard className="h-4 w-4" /> },
                      ].map(d => (
                        <div key={d.key}>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                              <div style={{ color: d.color }}>{d.icon}</div>
                              <span className="text-sm font-medium">{d.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold">{d.value.toFixed(2)} ج.م</span>
                              <span className="text-xs text-muted-foreground w-8 text-end">
                                {totalPayments > 0 ? Math.round((d.value / totalPayments) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${totalPayments > 0 ? (d.value / totalPayments) * 100 : 0}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: d.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HoverCard>
            </motion.div>
          )}

          {/* ─── Details ──────────────────────────────── */}
          {tab === "details" && (
            <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="space-y-6">
              {isLoadingBreakdown ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-64 rounded-xl bg-muted animate-pulse" />
                  <div className="h-64 rounded-xl bg-muted animate-pulse" />
                </div>
              ) : noBreakdownData ? (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground text-sm">{t("no_data")}</p>
                </div>
              ) : (
                <>
                  <div className={`grid gap-4 ${source === "all" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                    {/* Gaming */}
                    {source !== "buffet" && (
                      <HoverCard>
                        <div className="bg-card border border-emerald-500/15 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                <Gamepad2 className="h-4 w-4 text-emerald-500" />
                              </div>
                              <h3 className="font-semibold">{lang === "ar" ? "إيرادات الألعاب" : "Gaming Revenue"}</h3>
                            </div>
                            <span className="text-lg font-bold text-emerald-500">{(breakdown?.gaming.total ?? 0).toFixed(2)} ج.م</span>
                          </div>
                          {(breakdown?.gaming.byType.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">{lang === "ar" ? "لا توجد جلسات منتهية" : "No completed sessions"}</p>
                          ) : (
                            <div>
                              {breakdown!.gaming.byType.map(item => (
                                <div key={item.type} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                                  <span className="text-xl">{ASSET_TYPE_ICON[item.type] ?? "🕹️"}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{item.typeAr}</p>
                                    <p className="text-xs text-muted-foreground">{item.sessions} {lang === "ar" ? "جلسة" : "sessions"}</p>
                                  </div>
                                  <div className="text-end">
                                    <p className="text-sm font-bold text-emerald-500">{item.total.toFixed(2)} ج.م</p>
                                    {breakdown!.gaming.total > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round((item.total / breakdown!.gaming.total) * 100)}%
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </HoverCard>
                    )}

                    {/* Buffet */}
                    {source !== "gaming" && (
                      <HoverCard>
                        <div className="bg-card border border-orange-500/15 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
                                <Utensils className="h-4 w-4 text-orange-500" />
                              </div>
                              <h3 className="font-semibold">{lang === "ar" ? "إيرادات البوفيه" : "Buffet Revenue"}</h3>
                            </div>
                            <span className="text-lg font-bold text-orange-500">{(breakdown?.buffet.total ?? 0).toFixed(2)} ج.م</span>
                          </div>
                          {(breakdown?.buffet.byCategory.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">{lang === "ar" ? "لا توجد طلبات في هذه الفترة" : "No orders this period"}</p>
                          ) : (
                            <div className="space-y-4">
                              {breakdown!.buffet.byCategory.map(cat => (
                                <div key={cat.categoryId ?? "__none__"}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-orange-500">{cat.categoryNameAr || cat.categoryName}</span>
                                      {breakdown!.buffet.total > 0 && (
                                        <span className="text-xs bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full">
                                          {Math.round((cat.total / breakdown!.buffet.total) * 100)}%
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-orange-500">{cat.total.toFixed(2)} ج.م</span>
                                  </div>
                                  <div className="space-y-1.5 ps-3 border-s-2 border-orange-500/20">
                                    {cat.products.map(product => (
                                      <div key={product.productId} className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground truncate">
                                          {product.nameAr || product.name}
                                          <span className="ms-1 opacity-50">×{product.quantity}</span>
                                        </span>
                                        <span className="font-medium ms-2 whitespace-nowrap">{product.total.toFixed(2)} ج.م</span>
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

                  {/* Grand Total */}
                  <div className="rounded-xl bg-primary/8 border border-primary/20 px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{lang === "ar" ? "الإجمالي الكلي" : "Grand Total"}</p>
                      <p className="text-base font-semibold mt-1">
                        {PERIOD_LABELS[period]}
                        {source !== "all" && <span className="ms-2 text-primary text-sm">· {SOURCE_OPTIONS.find(s => s.id === source)?.label}</span>}
                        {method !== "all" && <span className="ms-1 text-primary text-sm">· {METHOD_OPTIONS.find(m => m.id === method)?.label}</span>}
                      </p>
                    </div>
                    <span className="text-4xl font-bold text-primary tabular" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                      {(breakdown?.grandTotal ?? 0).toFixed(2)}
                      <span className="text-xl text-primary/60 ms-1">ج.م</span>
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
