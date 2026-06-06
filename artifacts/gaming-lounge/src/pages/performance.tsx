import {
  useGetEmployeePerformance,
  getGetEmployeePerformanceQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Gamepad2, Receipt, TrendingUp } from "lucide-react";
import { useLang } from "@/hooks/use-language";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  owner: "مالك",
  manager: "مدير",
  cashier: "كاشير",
  buffet_worker: "موظف بوفيه",
  platform_owner: "مشرف المنصة",
};

type SortKey = "ordersHandled" | "sessionsStarted" | "revenue";

export default function Performance() {
  const { t } = useLang();
  const [sortBy, setSortBy] = useState<SortKey>("revenue");

  const { data: employees, isLoading } = useGetEmployeePerformance({
    query: { queryKey: getGetEmployeePerformanceQueryKey(), refetchInterval: 30000 }
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const sorted = [...(employees ?? [])].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));

  const chartData = sorted.map(e => ({
    name: e.userName,
    طلبات: e.ordersHandled,
    جلسات: e.sessionsStarted,
    إيرادات: e.revenue ?? 0,
  }));

  const totalOrders = sorted.reduce((s, e) => s + e.ordersHandled, 0);
  const totalSessions = sorted.reduce((s, e) => s + e.sessionsStarted, 0);
  const totalRevenue = sorted.reduce((s, e) => s + (e.revenue ?? 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">أداء الموظفين</h2>
        <p className="text-muted-foreground mt-1">مقارنة أداء الفريق بناءً على الطلبات والجلسات والإيرادات</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إجمالي الجلسات</CardTitle>
            <Gamepad2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات المُعالجة</CardTitle>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRevenue.toFixed(2)} {t("egp_label")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            مقارنة الأداء بالرسم البياني
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">لا توجد بيانات أداء متاحة</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                />
                <Bar dataKey="طلبات" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="جلسات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sortable Table */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              تفاصيل الأداء
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground self-center">ترتيب حسب:</span>
              {(["ordersHandled", "sessionsStarted", "revenue"] as SortKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1 rounded-md border transition-colors ${
                    sortBy === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {key === "ordersHandled" ? "الطلبات" : key === "sessionsStarted" ? "الجلسات" : "الإيرادات"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              لا توجد بيانات أداء متاحة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-right py-3 px-4 font-medium">#</th>
                    <th className="text-right py-3 px-4 font-medium">الموظف</th>
                    <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">الدور</th>
                    <th className="text-right py-3 px-4 font-medium">الطلبات</th>
                    <th className="text-right py-3 px-4 font-medium">الجلسات</th>
                    <th className="text-right py-3 px-4 font-medium">الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((emp, idx) => (
                    <tr key={emp.userId} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                            {emp.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium">{emp.userName}</span>
                            <div className="sm:hidden">
                              <Badge variant="outline" className="text-[10px] mt-0.5">{ROLE_LABELS[emp.role ?? ""] ?? emp.role}</Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Badge variant="outline">{ROLE_LABELS[emp.role ?? ""] ?? emp.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${sortBy === "ordersHandled" ? "text-amber-500" : ""}`}>
                          {emp.ordersHandled}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${sortBy === "sessionsStarted" ? "text-primary" : ""}`}>
                          {emp.sessionsStarted}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${sortBy === "revenue" ? "text-emerald-500" : ""}`}>
                          {(emp.revenue ?? 0).toFixed(2)} {t("egp_label")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
