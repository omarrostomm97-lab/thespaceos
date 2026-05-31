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
  LayoutDashboard, ChefHat, Search, Download,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { FadeIn, StaggerChildren, StaggerItem, HoverCard } from "@/components/motion";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 18) return "مساء الخير";
  return "مساء النور";
}

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "اليوم";
  if (diff === -1) return "أمس";
  return DAY_NAMES[d.getDay()];
}

const PERIOD_LABELS: Record<string, string> = {
  today: "اليوم",
  week: "الأسبوع",
  month: "الشهر",
};

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
      pos ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
    }`}>
      {pos ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ElementType;
  iconClass: string;
  isLive?: boolean;
  trend?: number;
  isFloat?: boolean;
}

function KpiCard({ label, value, subtitle, icon: Icon, iconClass, isLive, trend, isFloat }: KpiCardProps) {
  const animated = useCountUp(value);
  const display = isFloat ? animated.toFixed(2) : Math.round(animated).toLocaleString("ar-EG");

  return (
    <HoverCard>
      <div className="bg-card border border-card-border rounded-xl p-5 h-full">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium leading-tight">
            {label}
          </span>
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
            <p
              className="text-[40px] font-bold leading-none tabular"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
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

/* Dashboard skeleton */
function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-xl bg-muted" />
        <div className="h-4 w-48 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────── */

const TABS = [
  { id: "overview" as const, label: "نظرة عامة" },
  { id: "sales"    as const, label: "المبيعات"  },
  { id: "details"  as const, label: "التفصيل"   },
];
type TabId = (typeof TABS)[number]["id"];

/* ─── Dashboard ──────────────────────────────────────── */

export default function Dashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [tab, setTab] = useState<TabId>("overview");
  const { user } = useAuth();

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 },
  });

  const { data: activeSessions, isLoading: isLoadingSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 },
  });

  const { data: revenueStats, isLoading: isLoadingRevenue } = useGetRevenueStats({ period }, {
    query: { queryKey: getGetRevenueStatsQueryKey({ period }) },
  });

  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetDashboardBreakdown({ period }, {
    query: { queryKey: getGetDashboardBreakdownQueryKey({ period }) },
  });

  if (isLoadingSummary || isLoadingSessions) {
    return <DashboardSkeleton />;
  }

  const dailyChartData = (revenueStats?.dailyBreakdown ?? []).map(d => ({
    day: formatDayLabel(d.date),
    "الإيرادات": d.total,
  }));

  const paymentBreakdown = revenueStats?.paymentMethodBreakdown;
  const paymentChartData = [
    { name: "نقداً",     value: paymentBreakdown?.cash     ?? 0, fill: "#006FEE" },
    { name: "إنستاباي", value: paymentBreakdown?.instapay  ?? 0, fill: "#17c964" },
    { name: "فيزا",     value: paymentBreakdown?.visa      ?? 0, fill: "#f5a524" },
  ].filter(d => d.value > 0);

  const totalPayments = paymentChartData.reduce((s, d) => s + d.value, 0);
  const noBreakdownData = !breakdown || breakdown.grandTotal === 0;
  const greeting = getGreeting();
  const userName = user?.nameAr || user?.name || "";

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
                  <p className="text-sm text-muted-foreground">نظرة شاملة على أداء المركز</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="بحث"
                >
                  <Search className="h-4 w-4" />
                </button>

                <button
                  className="relative w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="الإشعارات"
                >
                  <Bell className="h-4 w-4" />
                  {(summary?.pendingOrders ?? 0) > 0 && (
                    <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>

                <button
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="تصدير التقرير"
                >
                  <Download className="h-4 w-4" />
                </button>

                {!summary?.openShift ? (
                  <Link href="/shifts">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      فتح وردية
                    </motion.div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    وردية مفتوحة
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

          {/* Amber shift warning */}
          {!summary?.openShift && (
            <FadeIn delay={0.08}>
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl mb-4 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-medium">
                  لا توجد وردية مفتوحة — يُرجى فتح وردية لتتبع الإيرادات والعمليات
                </span>
              </div>
            </FadeIn>
          )}

          {/* Row 2: Tabs + Period selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === t.id && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-secondary rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 bg-muted/40 border border-border rounded-lg p-0.5">
              {(["today", "week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`relative px-3 py-1 text-xs font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period === p && (
                    <motion.div
                      layoutId="period-pill"
                      className="absolute inset-0 bg-card border border-border rounded-md shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{PERIOD_LABELS[p]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────── */}
      <div className="p-8">
        <AnimatePresence mode="wait">

          {/* ─── Overview ─────────────────────────────── */}
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* KPI Grid */}
              <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StaggerItem>
                  <KpiCard
                    label="الجلسات النشطة"
                    value={summary?.activeSessions ?? 0}
                    subtitle={`من أصل ${summary?.totalAssets ?? 0} أجهزة`}
                    icon={Gamepad2}
                    iconClass="bg-primary/15 text-primary"
                    isLive
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="إيرادات اليوم"
                    value={summary?.revenueToday ?? 0}
                    isFloat
                    subtitle="الإجمالي الكلي لليوم"
                    icon={Receipt}
                    iconClass="bg-emerald-500/15 text-emerald-400"
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="الطلبات المعلقة"
                    value={summary?.pendingOrders ?? 0}
                    subtitle="تحتاج لتنفيذ في المطبخ"
                    icon={ShoppingCart}
                    iconClass="bg-amber-500/15 text-amber-400"
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="تنبيهات المخزون"
                    value={summary?.lowStockAlerts ?? 0}
                    subtitle="أصناف قاربت على النفاذ"
                    icon={AlertTriangle}
                    iconClass="bg-red-500/15 text-red-400"
                  />
                </StaggerItem>
              </StaggerChildren>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-3">
                <HoverCard className="md:col-span-2">
                  <div className="bg-card border border-card-border rounded-xl p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="text-base font-semibold">أداء المبيعات</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {period === "today" ? "إيرادات اليوم" : period === "week" ? "آخر 7 أيام" : "آخر 30 يوماً"}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-xs text-muted-foreground">الإجمالي</p>
                        <p className="text-lg font-bold text-primary">
                          {(revenueStats?.total ?? 0).toFixed(2)} ج.م
                        </p>
                      </div>
                    </div>
                    {isLoadingRevenue ? (
                      <div className="h-[200px] space-y-3 pt-2">
                        <div className="flex items-end gap-2 h-full">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="flex-1 rounded-t-md bg-muted skeleton-shimmer" style={{ height: `${40 + (i % 3) * 25}%` }} />
                          ))}
                        </div>
                      </div>
                    ) : dailyChartData.length === 0 ? (
                      <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <TrendingUp className="h-8 w-8 opacity-25" />
                        <p className="text-sm">لا توجد بيانات لهذه الفترة</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyChartData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" vertical={false} />
                          <XAxis
                            dataKey="day"
                            tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={48}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 } as any}
                          />
                          <Bar
                            dataKey="الإيرادات"
                            fill="#006FEE"
                            radius={[5, 5, 0, 0]}
                            animationDuration={800}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </HoverCard>

                <HoverCard>
                  <div className="bg-card border border-card-border rounded-xl p-6 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <Receipt className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold">مصادر الدفع</h3>
                    </div>

                    {/* Payment method legend row */}
                    {paymentChartData.length > 0 && (
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        {paymentChartData.map(d => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                            <span className="text-[11px] text-muted-foreground">{d.name}</span>
                            <span className="text-[11px] font-semibold tabular-nums">
                              {d.value.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Area chart */}
                    <div className="flex-1 min-h-0">
                      {isLoadingRevenue ? (
                        <div className="h-[160px] rounded-lg bg-muted skeleton-shimmer" />
                      ) : dailyChartData.length === 0 ? (
                        <div className="h-[160px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <TrendingUp className="h-7 w-7 opacity-20" />
                          <p className="text-xs">لا توجد بيانات</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={160}>
                          <AreaChart data={dailyChartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#006FEE" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#006FEE" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" vertical={false} />
                            <XAxis
                              dataKey="day"
                              tick={{ fill: "hsl(0 0% 50%)", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                              content={<CustomTooltip />}
                              cursor={{ stroke: "hsl(0 0% 20%)", strokeWidth: 1 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="الإيرادات"
                              stroke="#006FEE"
                              strokeWidth={2}
                              fill="url(#areaGrad)"
                              dot={false}
                              animationDuration={1000}
                              animationEasing="ease-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Summary totals */}
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">الجلسات</span>
                        <span className="font-semibold text-primary tabular-nums">
                          {(revenueStats?.sessionRevenue ?? 0).toFixed(2)} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">الطلبات</span>
                        <span className="font-semibold text-emerald-400 tabular-nums">
                          {(revenueStats?.orderRevenue ?? 0).toFixed(2)} ج.م
                        </span>
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
                        <h3 className="text-base font-semibold">الجلسات الحالية</h3>
                        {(activeSessions?.length ?? 0) > 0 && (
                          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                            {activeSessions?.length} نشطة
                          </span>
                        )}
                      </div>
                      {(activeSessions?.length ?? 0) > 5 && (
                        <Link href="/sessions">
                          <span className="text-xs text-primary hover:underline cursor-pointer">عرض الكل</span>
                        </Link>
                      )}
                    </div>

                    {activeSessions?.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-25" />
                        <p className="text-sm">لا توجد جلسات نشطة حالياً</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {activeSessions?.slice(0, 5).map((session, i) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                            className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/12 flex items-center justify-center shrink-0">
                                <Gamepad2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold leading-tight">
                                  {session.assetNameAr || session.assetName}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {Math.floor(session.currentMinutes / 60)}س {session.currentMinutes % 60}د
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <p className="text-sm font-bold text-emerald-400">
                                {session.currentCost.toFixed(2)} ج.م
                              </p>
                              <Link href={`/sessions/${session.id}`}>
                                <span className="text-xs border border-border/80 rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-border cursor-pointer transition-colors duration-150">
                                  إدارة
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
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    إجراءات سريعة
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { href: "/pos",    icon: Monitor,      label: "نقطة البيع",   cls: "bg-primary/10 border-primary/25 text-primary hover:bg-primary/15" },
                      { href: "/assets", icon: Gamepad2,     label: "الأجهزة",      cls: "bg-white/[0.04] border-border text-foreground hover:bg-white/[0.07]" },
                      { href: "/kds",    icon: ChefHat,      label: "شاشة المطبخ", cls: "bg-white/[0.04] border-border text-foreground hover:bg-white/[0.07]" },
                      { href: "/orders", icon: ShoppingCart, label: "الطلبات",      cls: "bg-white/[0.04] border-border text-foreground hover:bg-white/[0.07]" },
                    ].map(({ href, icon: Icon, label, cls }) => (
                      <Link key={href} href={href}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`flex flex-col items-center justify-center gap-2 h-24 rounded-xl border cursor-pointer transition-colors duration-150 ${cls}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{label}</span>
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
            <motion.div
              key="sales"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <StaggerChildren className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "إجمالي الإيرادات",  value: revenueStats?.total          ?? 0, color: "text-primary" },
                  { label: "إيرادات الجلسات",   value: revenueStats?.sessionRevenue ?? 0, color: "text-emerald-400" },
                  { label: "إيرادات الطلبات",   value: revenueStats?.orderRevenue   ?? 0, color: "text-amber-400" },
                ].map(stat => (
                  <StaggerItem key={stat.label}>
                    <HoverCard>
                      <div className="bg-card border border-card-border rounded-xl p-5">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/75 font-medium mb-3">
                          {stat.label}
                        </p>
                        <p
                          className={`text-3xl font-bold tabular ${stat.color}`}
                          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {stat.value.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">جنيه مصري</p>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                ))}
              </StaggerChildren>

              <HoverCard>
                <div className="bg-card border border-card-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-semibold">توزيع الإيرادات اليومية</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{PERIOD_LABELS[period]}</p>
                    </div>
                  </div>
                  {dailyChartData.length === 0 ? (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                      لا توجد بيانات
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={dailyChartData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 } as any} />
                        <Bar dataKey="الإيرادات" fill="#006FEE" radius={[5, 5, 0, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </HoverCard>

              {paymentChartData.length > 0 && (
                <HoverCard>
                  <div className="bg-card border border-card-border rounded-xl p-6">
                    <h3 className="text-base font-semibold mb-5">توزيع طرق الدفع</h3>
                    <div className="space-y-4">
                      {paymentChartData.map(d => (
                        <div key={d.name}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium">{d.name}</span>
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
                              style={{ backgroundColor: d.fill }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCard>
              )}
            </motion.div>
          )}

          {/* ─── Details ──────────────────────────────── */}
          {tab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {isLoadingBreakdown ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-64 rounded-xl bg-muted animate-pulse" />
                  <div className="h-64 rounded-xl bg-muted animate-pulse" />
                </div>
              ) : noBreakdownData ? (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground text-sm">لا توجد بيانات لهذه الفترة</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <HoverCard>
                      <div className="bg-card border border-emerald-500/15 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                              <Gamepad2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold">إيرادات الألعاب</h3>
                          </div>
                          <span className="text-lg font-bold text-emerald-400">
                            {(breakdown?.gaming.total ?? 0).toFixed(2)} ج.م
                          </span>
                        </div>
                        {(breakdown?.gaming.byType.length ?? 0) === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">لا توجد جلسات منتهية</p>
                        ) : (
                          <div>
                            {breakdown!.gaming.byType.map(item => (
                              <div key={item.type} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
                                <span className="text-xl">{ASSET_TYPE_ICON[item.type] ?? "🕹️"}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.typeAr}</p>
                                  <p className="text-xs text-muted-foreground">{item.sessions} جلسة</p>
                                </div>
                                <span className="text-sm font-bold text-emerald-400">{item.total.toFixed(2)} ج.م</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </HoverCard>

                    <HoverCard>
                      <div className="bg-card border border-orange-500/15 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
                              <Utensils className="h-4 w-4 text-orange-500" />
                            </div>
                            <h3 className="font-semibold">إيرادات البوفيه</h3>
                          </div>
                          <span className="text-lg font-bold text-orange-400">
                            {(breakdown?.buffet.total ?? 0).toFixed(2)} ج.م
                          </span>
                        </div>
                        {(breakdown?.buffet.byCategory.length ?? 0) === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">لا توجد طلبات في هذه الفترة</p>
                        ) : (
                          <div className="space-y-4">
                            {breakdown!.buffet.byCategory.map(cat => (
                              <div key={cat.categoryId ?? "__none__"}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-orange-400">
                                    {cat.categoryNameAr || cat.categoryName}
                                  </span>
                                  <span className="text-sm font-bold text-orange-400">{cat.total.toFixed(2)} ج.م</span>
                                </div>
                                <div className="space-y-1.5 pr-3 border-r-2 border-orange-500/20">
                                  {cat.products.map(product => (
                                    <div key={product.productId} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground truncate">
                                        {product.nameAr || product.name}
                                        <span className="mr-1 opacity-50">×{product.quantity}</span>
                                      </span>
                                      <span className="font-medium mr-2 whitespace-nowrap">{product.total.toFixed(2)} ج.م</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </HoverCard>
                  </div>

                  <div className="rounded-xl bg-primary/8 border border-primary/20 px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">الإجمالي الكلي</p>
                      <p className="text-base font-semibold mt-1">{PERIOD_LABELS[period]}</p>
                    </div>
                    <span
                      className="text-4xl font-bold text-primary tabular"
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      {(breakdown?.grandTotal ?? 0).toFixed(2)}
                      <span className="text-xl text-primary/60 mr-1">ج.م</span>
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
