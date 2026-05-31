import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Receipt, AlertTriangle, Clock, ShoppingCart, Activity, Menu, Monitor, TrendingUp, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  ps: "🎮",
  billiard: "🎱",
  air_hockey: "🏒",
  babyfoot: "⚽",
  other: "🕹️",
};

export default function Dashboard() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 }
  });

  const { data: activeSessions, isLoading: isLoadingSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 }
  });

  const { data: revenueStats } = useGetRevenueStats({ period }, {
    query: { queryKey: getGetRevenueStatsQueryKey({ period }) }
  });

  const { data: breakdown, isLoading: isLoadingBreakdown } = useGetDashboardBreakdown({ period }, {
    query: { queryKey: getGetDashboardBreakdownQueryKey({ period }) }
  });

  if (isLoadingSummary || isLoadingSessions) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const dailyChartData = (revenueStats?.dailyBreakdown ?? []).map(d => ({
    day: formatDayLabel(d.date),
    "الإيرادات": d.total,
  }));

  const paymentBreakdown = revenueStats?.paymentMethodBreakdown;
  const paymentChartData = [
    { name: "نقداً", value: paymentBreakdown?.cash ?? 0 },
    { name: "إنستاباي", value: paymentBreakdown?.instapay ?? 0 },
    { name: "فيزا", value: paymentBreakdown?.visa ?? 0 },
  ].filter(d => d.value > 0);

  const noBreakdownData = !breakdown || breakdown.grandTotal === 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">اللوحة الرئيسية</h2>
          <p className="text-muted-foreground mt-1">نظرة عامة على العمليات الحالية</p>
        </div>
        {!summary?.openShift && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-bold">لا توجد وردية مفتوحة</span>
            <Link href="/shifts">
              <Button size="sm" variant="destructive" className="ml-4">فتح وردية</Button>
            </Link>
          </div>
        )}
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">الجلسات النشطة</CardTitle>
            <Gamepad2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {summary?.totalAssets || 0} أجهزة
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إيرادات اليوم</CardTitle>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.revenueToday?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">جنيه مصري</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">تحتاج لتنفيذ في المطبخ</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.lowStockAlerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">أصناف قاربت على النفاذ</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">الفترة الزمنية:</span>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["today", "week", "month"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {period === "today" ? "إيرادات اليوم" : period === "week" ? "إيرادات آخر 7 أيام" : "إيرادات آخر 30 يوماً"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                جارٍ تحميل بيانات الإيرادات...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tickFormatter={v => `${v} ج`}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                    formatter={(value: number) => [`${value.toFixed(2)} ج.م`, "الإيرادات"]}
                  />
                  <Bar dataKey="الإيرادات" fill="#10b981" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-primary" />
              ملخص {PERIOD_LABELS[period]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <span className="font-bold text-emerald-500">{(revenueStats?.total ?? 0).toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الجلسات</span>
              <span className="font-bold">{(revenueStats?.sessionRevenue ?? 0).toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الطلبات</span>
              <span className="font-bold">{(revenueStats?.orderRevenue ?? 0).toFixed(2)} ج.م</span>
            </div>
            {paymentChartData.length > 0 && (
              <div className="pt-1 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">طرق الدفع</p>
                {paymentChartData.map(d => (
                  <div key={d.name} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium">{d.value.toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">تفصيل الإيرادات</h3>
          <span className="text-sm text-muted-foreground">— {PERIOD_LABELS[period]}</span>
        </div>

        {isLoadingBreakdown ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : noBreakdownData ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            لا توجد بيانات لهذه الفترة
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gaming Panel */}
              <Card className="bg-card border-emerald-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Gamepad2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span>إيرادات الألعاب</span>
                    <span className="mr-auto font-bold text-emerald-500">
                      {(breakdown?.gaming.total ?? 0).toFixed(2)} ج.م
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(breakdown?.gaming.byType.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد جلسات منتهية</p>
                  ) : (
                    <div className="space-y-2">
                      {breakdown!.gaming.byType.map(item => (
                        <div key={item.type} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-xl">{ASSET_TYPE_ICON[item.type] ?? "🕹️"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{item.typeAr}</p>
                            <p className="text-xs text-muted-foreground">{item.sessions} جلسة</p>
                          </div>
                          <span className="font-bold text-emerald-500 text-sm whitespace-nowrap">
                            {item.total.toFixed(2)} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Buffet Panel */}
              <Card className="bg-card border-orange-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <Utensils className="h-4 w-4 text-orange-500" />
                    </div>
                    <span>إيرادات البوفيه</span>
                    <span className="mr-auto font-bold text-orange-500">
                      {(breakdown?.buffet.total ?? 0).toFixed(2)} ج.م
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(breakdown?.buffet.byCategory.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد طلبات في هذه الفترة</p>
                  ) : (
                    <div className="space-y-4">
                      {breakdown!.buffet.byCategory.map(cat => (
                        <div key={cat.categoryId ?? "__none__"}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-orange-400">
                              {cat.categoryNameAr || cat.categoryName}
                            </span>
                            <span className="text-sm font-bold text-orange-500">{cat.total.toFixed(2)} ج.م</span>
                          </div>
                          <div className="space-y-1 pr-3 border-r-2 border-orange-500/20">
                            {cat.products.map(product => (
                              <div key={product.productId} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground truncate">
                                  {product.nameAr || product.name}
                                  <span className="mr-1 text-muted-foreground/60">×{product.quantity}</span>
                                </span>
                                <span className="font-medium whitespace-nowrap mr-2">{product.total.toFixed(2)} ج.م</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Grand Total */}
            <div className="rounded-xl bg-primary/10 border border-primary/20 px-6 py-4 flex items-center justify-between">
              <span className="text-base font-bold">الإجمالي الكلي ({PERIOD_LABELS[period]})</span>
              <span className="text-2xl font-bold text-primary">{(breakdown?.grandTotal ?? 0).toFixed(2)} ج.م</span>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              الجلسات الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد جلسات نشطة حالياً</div>
              ) : (
                activeSessions?.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        session.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'
                      }`}>
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">{session.assetNameAr || session.assetName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>بدأت من {Math.floor(session.currentMinutes / 60)} ساعة و {session.currentMinutes % 60} دقيقة</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-emerald-500">{session.currentCost.toFixed(2)} ج.م</p>
                      <Link href={`/sessions/${session.id}`}>
                        <Button variant="outline" size="sm" className="mt-2 w-full h-8">إدارة</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            {activeSessions && activeSessions.length > 5 && (
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link href="/sessions">عرض كل الجلسات ({activeSessions.length})</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card">
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/pos">
              <Button className="w-full h-24 text-lg flex-col gap-2 shadow-md hover-elevate">
                <Monitor className="h-6 w-6" />
                نقطة البيع (POS)
              </Button>
            </Link>
            <Link href="/assets">
              <Button variant="secondary" className="w-full h-24 text-lg flex-col gap-2 hover-elevate">
                <Gamepad2 className="h-6 w-6" />
                الأجهزة
              </Button>
            </Link>
            <Link href="/kds">
              <Button variant="secondary" className="w-full h-24 text-lg flex-col gap-2 hover-elevate">
                <Menu className="h-6 w-6" />
                شاشة المطبخ
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="secondary" className="w-full h-24 text-lg flex-col gap-2 hover-elevate">
                <ShoppingCart className="h-6 w-6" />
                الطلبات
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
