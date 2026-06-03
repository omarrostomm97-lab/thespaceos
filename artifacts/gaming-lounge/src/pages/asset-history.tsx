import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowRight, ArrowLeft, Clock, ShoppingCart, History,
  Banknote, CreditCard, Smartphone,
} from "lucide-react";
import { useLang } from "@/hooks/use-language";

type Preset = "today" | "week" | "month";

interface HistorySession {
  id: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  totalMinutes: number | null;
  totalCost: number | null;
  notes: string | null;
  cancelReason: string | null;
  totalCollected: number;
  paymentMethod: string | null;
}

interface HistoryOrder {
  id: number;
  source: string;
  status: string;
  sessionId: number | null;
  createdAt: string;
  totalAmount: number;
  items: Array<{
    productName: string | null;
    productNameAr: string | null;
    quantity: number;
    totalPrice: number;
  }>;
}

interface HistoryData {
  asset: { id: number; name: string; nameAr: string | null; type: string; status: string; pricePerHour: number };
  sessions: HistorySession[];
  orders: HistoryOrder[];
}

function getDateRange(preset: Preset) {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const from = new Date(now); from.setHours(0, 0, 0, 0);
  if (preset === "week")  from.setDate(from.getDate() - 6);
  if (preset === "month") from.setDate(from.getDate() - 29);
  return { from, to: end };
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "-";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const SESSION_STATUS_COLORS: Record<string, string> = {
  active:    "bg-primary/10 text-primary border-primary/20",
  paused:    "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ended:     "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const METHOD_ICON: Record<string, React.ReactNode> = {
  cash:      <Banknote className="h-3.5 w-3.5" />,
  instapay:  <Smartphone className="h-3.5 w-3.5" />,
  visa:      <CreditCard className="h-3.5 w-3.5" />,
};

export default function AssetHistory() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [preset, setPreset] = useState<Preset>("today");
  const { lang } = useLang();
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const { from, to } = getDateRange(preset);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/assets", id, "history", preset],
    queryFn: async (): Promise<HistoryData> => {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("gl_token") : null;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `/api/assets/${id}/history?from=${from.toISOString()}&to=${to.toISOString()}`,
        { headers, credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const PRESET_LABELS: Record<Preset, string> = {
    today: isAr ? "اليوم" : "Today",
    week:  isAr ? "آخر ٧ أيام" : "Last 7 Days",
    month: isAr ? "آخر ٣٠ يوم" : "Last 30 Days",
  };

  const SESSION_STATUS_LABELS: Record<string, string> = {
    active:    isAr ? "نشطة"    : "Active",
    paused:    isAr ? "متوقفة"  : "Paused",
    ended:     isAr ? "منتهية"  : "Ended",
    cancelled: isAr ? "ملغاة"   : "Cancelled",
  };

  const ORDER_STATUS_COLORS: Record<string, string> = {
    pending:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
    preparing: "bg-primary/10 text-primary border-primary/20",
    ready:     "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    closed:    "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const ORDER_STATUS_LABELS: Record<string, string> = {
    pending:   isAr ? "جديد"            : "New",
    preparing: isAr ? "جاري التحضير"    : "Preparing",
    ready:     isAr ? "جاهز"            : "Ready",
    delivered: isAr ? "تم التسليم"      : "Delivered",
    closed:    isAr ? "مغلق"            : "Closed",
    cancelled: isAr ? "ملغي"            : "Cancelled",
  };

  const METHOD_LABELS: Record<string, string> = {
    cash:     isAr ? "كاش"       : "Cash",
    instapay: isAr ? "انستاباي"  : "Instapay",
    visa:     isAr ? "فيزا"      : "Visa",
  };

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-muted-foreground" dir={dir}>
        <p>{isAr ? "الغرفة غير موجودة" : "Room not found"}</p>
        <Link href="/assets">
          <button className="mt-4 text-primary hover:underline text-sm">
            {isAr ? "العودة للغرف" : "Back to Rooms"}
          </button>
        </Link>
      </div>
    );
  }

  const { asset, sessions, orders } = data;
  const assetDisplayName = isAr ? (asset.nameAr || asset.name) : (asset.name || asset.nameAr);

  const sessionRevTotal = sessions.reduce((s, x) => s + x.totalCollected, 0);
  const orderRevTotal   = orders.filter(o => !["cancelled"].includes(o.status)).reduce((s, x) => s + x.totalAmount, 0);

  return (
    <div className="p-4 md:p-8 space-y-6" dir={dir}>

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link href="/assets">
          <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors shrink-0">
            <BackIcon className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <History className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-2xl font-bold tracking-tight text-primary">{assetDisplayName}</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              asset.status === "available"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-amber-500/10 text-amber-500"
            }`}>
              {asset.status === "available" ? (isAr ? "متاح" : "Available") : (isAr ? "مشغول" : "Busy")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">{isAr ? "السجل التاريخي للغرفة" : "Room History Log"}</p>
        </div>
      </div>

      {/* ── Date Preset Filter ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-secondary/30 w-fit">
        {(["today", "week", "month"] as Preset[]).map(p => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              preset === p
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isAr ? "عدد الجلسات"  : "Sessions",      value: sessions.length,              unit: "" },
          { label: isAr ? "إيراد الجلسات" : "Session Revenue", value: sessionRevTotal.toFixed(2), unit: " ج.م" },
          { label: isAr ? "عدد الطلبات"  : "Orders",        value: orders.length,                unit: "" },
          { label: isAr ? "إيراد الطلبات" : "Order Revenue",  value: orderRevTotal.toFixed(2),   unit: " ج.م" },
        ].map(k => (
          <div key={k.label} className="rounded-xl card-base p-4">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-xl font-bold text-foreground">
              {k.value}<span className="text-sm font-normal text-muted-foreground">{k.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Sessions ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{isAr ? "الجلسات" : "Sessions"}</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{sessions.length}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 rounded-xl card-base text-muted-foreground text-sm">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
            {isAr ? "لا توجد جلسات في هذه الفترة" : "No sessions in this period"}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden card-base">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "البداية"        : "Start"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "النهاية"        : "End"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "المدة"          : "Duration"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "المحصّل"        : "Collected"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "طريقة الدفع"   : "Payment"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "الحالة"         : "Status"}</th>
                    <th className={`px-4 py-3 ${isAr ? "text-right" : "text-left"}`}>{isAr ? "ملاحظات"        : "Notes"}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {format(new Date(s.startedAt), "dd/MM HH:mm")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                        {s.endedAt ? format(new Date(s.endedAt), "dd/MM HH:mm") : "-"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatDuration(s.totalMinutes)}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-500 tabular-nums whitespace-nowrap">
                        {s.totalCollected > 0 ? `${s.totalCollected.toFixed(2)} ج.م` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {s.paymentMethod ? (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {METHOD_ICON[s.paymentMethod]}
                            <span className="text-xs">{METHOD_LABELS[s.paymentMethod] ?? s.paymentMethod}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${SESSION_STATUS_COLORS[s.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {SESSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate">
                        {s.cancelReason || s.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Orders ── */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{isAr ? "الطلبات" : "Orders"}</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 rounded-xl card-base text-muted-foreground text-sm">
            <ShoppingCart className="h-8 w-8 mx-auto mb-3 opacity-30" />
            {isAr ? "لا توجد طلبات في هذه الفترة" : "No orders in this period"}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="rounded-xl card-base p-4 flex flex-col sm:flex-row gap-4">
                <div className="sm:w-36 shrink-0">
                  <p className="text-xs text-muted-foreground">{format(new Date(o.createdAt), "dd/MM/yyyy")}</p>
                  <p className="text-xs font-mono text-muted-foreground">{format(new Date(o.createdAt), "HH:mm")}</p>
                  <p className="text-lg font-bold text-emerald-500 mt-1 tabular-nums">{o.totalAmount.toFixed(2)} ج.م</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ORDER_STATUS_COLORS[o.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{o.source === "qr" ? "QR" : "POS"}</span>
                    <span className="text-xs text-muted-foreground">#{o.id}</span>
                  </div>
                </div>
                <div className="flex-1 border-t sm:border-t-0 sm:border-s border-border pt-3 sm:pt-0 sm:ps-4">
                  <div className="space-y-1">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-foreground">
                          {item.quantity}× {isAr ? (item.productNameAr || item.productName) : (item.productName || item.productNameAr)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{item.totalPrice.toFixed(2)} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
