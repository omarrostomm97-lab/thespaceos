import { useListKdsOrders, useUpdateOrderStatus, getListKdsOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Check, UtensilsCrossed, AlertCircle, QrCode, Monitor, User, MessageSquare, Timer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Audio chime
// ─────────────────────────────────────────────────────────────────────────────

function playKitchenChime() {
  try {
    const ctx = new AudioContext();
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.35, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
      osc.start(t0);
      osc.stop(t0 + 0.5);
    });
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Elapsed timer — live, updates every second
// ─────────────────────────────────────────────────────────────────────────────

function useElapsed(from: string) {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - new Date(from).getTime()) / 1000));
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - new Date(from).getTime()) / 1000)), 1000);
    return () => clearInterval(id);
  }, [from]);
  return elapsed;
}

function ElapsedDisplay({ from }: { from: string }) {
  const secs = useElapsed(from);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const isUrgent = secs >= 300;
  const label = `${mins}:${String(s).padStart(2, "0")}`;
  return (
    <span className={`font-mono text-sm font-bold flex items-center gap-1 shrink-0 ${isUrgent ? "text-destructive animate-pulse" : "text-amber-500"}`}>
      <Timer className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Source badge
// ─────────────────────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source?: string | null }) {
  if (!source) return null;
  const isQr = source === "qr";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
      isQr
        ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
        : "bg-blue-500/15 text-blue-400 border border-blue-500/25"
    }`}>
      {isQr ? <QrCode className="h-2.5 w-2.5" /> : <Monitor className="h-2.5 w-2.5" />}
      {isQr ? "QR" : "POS"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KDS Order Card
// ─────────────────────────────────────────────────────────────────────────────

type KdsOrder = {
  id: number;
  status: string;
  source?: string | null;
  assetName?: string | null;
  assetNameAr?: string | null;
  customerName?: string | null;
  createdAt: string;
  preparingAt?: string | null;
  items: Array<{
    productName?: string | null;
    productNameAr?: string | null;
    quantity: number;
    notes?: string | null;
  }>;
};

function KdsCard({
  order,
  headerClass,
  actionLabel,
  actionClass,
  actionIcon,
  onAction,
  isActionPending,
}: {
  order: KdsOrder;
  headerClass: string;
  actionLabel: string;
  actionClass: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
  isActionPending: boolean;
}) {
  const timerFrom = order.status === "preparing" && order.preparingAt ? order.preparingAt : order.createdAt;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  const isUrgent = elapsed >= 300;
  const deviceLabel = order.assetNameAr || order.assetName;

  return (
    <div className={`rounded-xl border ${isUrgent ? "border-destructive/50" : "border-border"} overflow-hidden shadow-sm bg-card flex flex-col`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${headerClass} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-black tracking-tight shrink-0">#{order.id}</span>
          <SourceBadge source={order.source} />
          {deviceLabel && (
            <span className="text-sm font-semibold text-foreground truncate">{deviceLabel}</span>
          )}
        </div>
        <ElapsedDisplay from={timerFrom} />
      </div>

      {/* Customer name */}
      {order.customerName && (
        <div className="px-4 py-1.5 bg-secondary/40 border-b border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="font-semibold">{order.customerName}</span>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 p-4 space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black leading-none w-8 shrink-0 text-center tabular-nums">{item.quantity}×</span>
              <span className="text-lg font-bold leading-snug">{item.productNameAr || item.productName || "—"}</span>
            </div>
            {item.notes && (
              <div className="flex items-start gap-1.5 ms-10 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 leading-snug">{item.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      <Button
        className={`w-full h-14 rounded-t-none text-lg font-bold ${actionClass}`}
        onClick={onAction}
        disabled={isActionPending}
      >
        {actionIcon}
        {actionLabel}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main KDS page
// ─────────────────────────────────────────────────────────────────────────────

export default function Kds() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListKdsOrders({
    query: { queryKey: getListKdsOrdersQueryKey(), refetchInterval: 5000 }
  });

  const updateStatus = useUpdateOrderStatus();
  const prevPendingCount = useRef<number | null>(null);
  const [alerting, setAlerting] = useState(false);

  const pendingOrders = (orders?.filter(o => o.status === "pending") ?? []) as KdsOrder[];
  const preparingOrders = (orders?.filter(o => o.status === "preparing") ?? []) as KdsOrder[];

  useEffect(() => {
    const count = pendingOrders.length;
    let cleanup: (() => void) | undefined;
    if (prevPendingCount.current !== null && count > prevPendingCount.current) {
      playKitchenChime();
      setAlerting(true);
      const timer = setTimeout(() => setAlerting(false), 3000);
      cleanup = () => clearTimeout(timer);
    }
    prevPendingCount.current = count;
    return cleanup;
  }, [pendingOrders.length]);

  const handleUpdateStatus = async (orderId: number, status: "preparing" | "ready") => {
    try {
      await updateStatus.mutateAsync({ orderId, data: { status } });
      toast.success(status === "preparing" ? "تم البدء في التحضير" : "الطلب جاهز للتسليم");
      queryClient.invalidateQueries({ queryKey: getListKdsOrdersQueryKey() });
    } catch {
      toast.error("حدث خطأ");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] p-3 md:p-4 gap-3 md:gap-4 bg-background">

      {/* ── Pending column ── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
        <div className={`h-14 border-b flex items-center px-4 shrink-0 transition-colors duration-300 ${
          alerting
            ? "bg-destructive/30 border-destructive/40 animate-pulse"
            : "bg-destructive/10 border-destructive/20"
        }`}>
          <AlertCircle className="h-5 w-5 me-2 shrink-0 text-destructive" />
          <h2 className="text-xl font-black text-destructive flex-1">
            طلبات جديدة ({pendingOrders.length})
          </h2>
          {alerting && (
            <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 rounded-full px-2 py-0.5 border border-destructive/20 animate-bounce">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
              طلب جديد!
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <AlertCircle className="h-10 w-10 opacity-20" />
              <span>لا توجد طلبات جديدة</span>
            </div>
          ) : pendingOrders.map(order => (
            <KdsCard
              key={order.id}
              order={order}
              headerClass="bg-destructive/10 border-destructive/20"
              actionLabel="بدء التحضير"
              actionClass="bg-primary hover:bg-primary/90 text-primary-foreground"
              actionIcon={<UtensilsCrossed className="me-2 h-5 w-5" />}
              onAction={() => handleUpdateStatus(order.id, "preparing")}
              isActionPending={updateStatus.isPending}
            />
          ))}
        </div>
      </div>

      {/* ── Preparing column ── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
        <div className="h-14 bg-amber-500/10 border-b border-amber-500/20 flex items-center px-4 shrink-0">
          <UtensilsCrossed className="h-5 w-5 text-amber-500 me-2 shrink-0" />
          <h2 className="text-xl font-black text-amber-500">جاري التحضير ({preparingOrders.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {preparingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
              <UtensilsCrossed className="h-10 w-10 opacity-20" />
              <span>لا توجد طلبات قيد التحضير</span>
            </div>
          ) : preparingOrders.map(order => (
            <KdsCard
              key={order.id}
              order={order}
              headerClass="bg-amber-500/10 border-amber-500/20"
              actionLabel="جاهز للتسليم"
              actionClass="bg-emerald-600 hover:bg-emerald-700 text-white"
              actionIcon={<Check className="me-2 h-5 w-5" />}
              onAction={() => handleUpdateStatus(order.id, "ready")}
              isActionPending={updateStatus.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
