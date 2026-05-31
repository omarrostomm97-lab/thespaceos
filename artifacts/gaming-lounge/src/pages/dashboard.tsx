import {
  useGetDashboardSummary,
  useListActiveSessions,
  useGetRevenueStats,
  getGetDashboardSummaryQueryKey,
  getListActiveSessionsQueryKey,
  getGetRevenueStatsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Receipt, AlertTriangle, Clock, ShoppingCart, Activity, Menu, Monitor, TrendingUp } from "lucide-react";
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

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 10000 }
  });

  const { data: activeSessions, isLoading: isLoadingSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 }
  });

  const { data: revenueWeek } = useGetRevenueStats({ period: "week" }, {
    query: { queryKey: getGetRevenueStatsQueryKey({ period: "week" }) }
  });

  if (isLoadingSummary || isLoadingSessions) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Build 7-day chart data from dailyBreakdown
  const dailyChartData = (revenueWeek?.dailyBreakdown ?? []).map(d => ({
    day: formatDayLabel(d.date),
    "الإيرادات": d.total,
  }));

  const paymentBreakdown = revenueWeek?.paymentMethodBreakdown;
  const paymentChartData = [
    { name: "نقداً", value: paymentBreakdown?.cash ?? 0 },
    { name: "إنستاباي", value: paymentBreakdown?.instapay ?? 0 },
    { name: "فيزا", value: paymentBreakdown?.visa ?? 0 },
  ].filter(d => d.value > 0);

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

      {/* 7-Day Revenue Chart */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              إيرادات آخر 7 أيام
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
              ملخص الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <span className="font-bold text-emerald-500">{(revenueWeek?.total ?? 0).toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الجلسات</span>
              <span className="font-bold">{(revenueWeek?.sessionRevenue ?? 0).toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-muted-foreground">الطلبات</span>
              <span className="font-bold">{(revenueWeek?.orderRevenue ?? 0).toFixed(2)} ج.م</span>
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
