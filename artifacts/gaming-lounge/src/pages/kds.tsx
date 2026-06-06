import {
  useListKdsOrders, useUpdateOrderStatus, getListKdsOrdersQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Check, UtensilsCrossed, AlertCircle, QrCode, Monitor, User,
  MessageSquare, Timer, Maximize2, Minimize2, ChefHat, PackageCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Types
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

type UrgencyTier = "green" | "amber" | "red";

// ─────────────────────────────────────────────────────────────────────────────
// Urgency helper
// ─────────────────────────────────────────────────────────────────────────────

function getUrgency(secs: number): UrgencyTier {
  if (secs < 180) return "green";
  if (secs < 420) return "amber";
  return "red";
}

const URGENCY_STYLES: Record<UrgencyTier, {
  cardBorder: string;
  headerBg: string;
  headerBorder: string;
  timerText: string;
  ring: string;
}> = {
  green: {
    cardBorder: "border-s-emerald-500",
    headerBg:   "bg-emerald-500/10",
    headerBorder: "border-emerald-500/20",
    timerText:  "text-emerald-400",
    ring: "",
  },
  amber: {
    cardBorder: "border-s-amber-500",
    headerBg:   "bg-amber-500/10",
    headerBorder: "border-amber-500/20",
    timerText:  "text-amber-400",
    ring: "",
  },
  red: {
    cardBorder: "border-s-destructive",
    headerBg:   "bg-destructive/10",
    headerBorder: "border-destructive/20",
    timerText:  "text-destructive",
    ring: "ring-2 ring-destructive/50 animate-pulse",
  },
};

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
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useElapsed(from: string) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(from).getTime()) / 1000)
  );
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - new Date(from).getTime()) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [from]);
  return elapsed;
}

function useWakeLock() {
  useEffect(() => {
    let sentinel: { release: () => Promise<void> } | null = null;

    const acquire = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sentinel = await (navigator as any).wakeLock?.request("screen");
      } catch {}
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
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

function ElapsedDisplay({ from, tier }: { from: string; tier: UrgencyTier }) {
  const secs = useElapsed(from);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const label = `${mins}:${String(s).padStart(2, "0")}`;
  const style = URGENCY_STYLES[tier];
  return (
    <span className={`font-mono text-sm font-bold flex items-center gap-1 shrink-0 ${style.timerText} ${tier === "red" ? "animate-pulse" : ""}`}>
      <Timer className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}

function KdsCard({
  order,
  isNew,
  onAction,
  actionLabel,
  actionClass,
  actionIcon,
  isActionPending = false,
}: {
  order: KdsOrder;
  isNew: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionClass?: string;
  actionIcon?: React.ReactNode;
  isActionPending?: boolean;
}) {
  const timerFrom = order.status === "preparing" && order.preparingAt
    ? order.preparingAt
    : order.createdAt;
  const ageSeconds = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  const tier = getUrgency(ageSeconds);
  const ts = URGENCY_STYLES[tier];
  const deviceLabel = order.assetNameAr || order.assetName;

  return (
    <div className={`
      rounded-xl border border-border border-s-4 overflow-hidden shadow-sm bg-card flex flex-col
      ${ts.cardBorder}
      ${ts.ring}
      ${isNew ? "ring-2 ring-primary/50" : ""}
      transition-shadow duration-700
    `}>
      {/* Header */}
      <div className={`px-3 py-2.5 border-b ${ts.headerBg} ${ts.headerBorder} flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-black tracking-tight shrink-0">#{order.id}</span>
          <SourceBadge source={order.source} />
          {deviceLabel && (
            <span className="text-xs font-semibold text-foreground truncate">{deviceLabel}</span>
          )}
        </div>
        <ElapsedDisplay from={timerFrom} tier={tier} />
      </div>

      {/* Customer */}
      {order.customerName && (
        <div className="px-3 py-1 bg-secondary/40 border-b border-border/30 flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          <span className="font-semibold truncate">{order.customerName}</span>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 p-3 space-y-2.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black leading-none w-7 shrink-0 text-center tabular-nums">{item.quantity}×</span>
              <span className="text-base font-bold leading-snug">{item.productNameAr || item.productName || "—"}</span>
            </div>
            {item.notes && (
              <div className="flex items-start gap-1.5 ms-9 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1">
                <MessageSquare className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 leading-snug">{item.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      {onAction && actionLabel && actionClass && (
        <Button
          className={`w-full h-12 rounded-t-none text-base font-bold ${actionClass}`}
          onClick={onAction}
          disabled={isActionPending}
        >
          {actionIcon}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats header
// ─────────────────────────────────────────────────────────────────────────────

function StatsBar({
  pendingCount,
  preparingCount,
  readyCount,
  longestWaitSecs,
  alerting,
  isFullscreen,
  onToggleFullscreen,
}: {
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  longestWaitSecs: number;
  alerting: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const now = useClock();
  const timeLabel = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const longestMins = Math.floor(longestWaitSecs / 60);
  const longestSecs = longestWaitSecs % 60;
  const longestLabel = `${longestMins}:${String(longestSecs).padStart(2, "0")}`;
  const longestUrgency = getUrgency(longestWaitSecs);

  return (
    <div className={`shrink-0 h-12 flex items-center justify-between px-4 gap-4 border-b border-border/50 ${
      alerting ? "bg-destructive/20 border-destructive/30 animate-pulse" : "bg-card"
    }`}>
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <ChefHat className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-black tracking-tight">شاشة المطبخ</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-destructive">
          <AlertCircle className="h-3 w-3" />
          جديد: <strong className="text-sm font-black">{pendingCount}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-amber-500">
          <UtensilsCrossed className="h-3 w-3" />
          تحضير: <strong className="text-sm font-black">{preparingCount}</strong>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-500">
          <PackageCheck className="h-3 w-3" />
          جاهز: <strong className="text-sm font-black">{readyCount}</strong>
        </span>
        {longestWaitSecs > 0 && (
          <span className={`flex items-center gap-1 ${
            longestUrgency === "red" ? "text-destructive animate-pulse" :
            longestUrgency === "amber" ? "text-amber-500" : "text-muted-foreground"
          }`}>
            <Timer className="h-3 w-3" />
            أطول انتظار:
            <strong className="font-mono">{longestLabel}</strong>
          </span>
        )}
      </div>

      {/* Clock + Fullscreen */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-sm font-bold tabular-nums text-muted-foreground">{timeLabel}</span>
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main KDS page
// ─────────────────────────────────────────────────────────────────────────────

export default function Kds() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListKdsOrders({
    query: { queryKey: getListKdsOrdersQueryKey(), refetchInterval: 3000 }
  });

  const updateStatus = useUpdateOrderStatus();

  const seenIds = useRef<Set<number>>(new Set());
  const [alerting, setAlerting] = useState(false);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pendingOrders   = (orders?.filter(o => o.status === "pending")   ?? []) as KdsOrder[];
  const preparingOrders = (orders?.filter(o => o.status === "preparing") ?? []) as KdsOrder[];
  const readyOrders     = (orders?.filter(o => o.status === "ready")     ?? []) as KdsOrder[];
  const allActive       = [...pendingOrders, ...preparingOrders, ...readyOrders];

  const longestWaitSecs = allActive.length
    ? Math.max(...allActive.map(o => Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 1000)))
    : 0;

  // New-order detection: chime + column alert + per-card flash
  useEffect(() => {
    const currentIds = new Set((orders ?? []).map(o => o.id));
    const fresh: number[] = [];
    const hadOrders = seenIds.current.size > 0;
    currentIds.forEach(id => { if (!seenIds.current.has(id)) fresh.push(id); });
    seenIds.current = currentIds;

    let alertTimer: ReturnType<typeof setTimeout> | undefined;
    let flashTimer: ReturnType<typeof setTimeout> | undefined;

    if (fresh.length > 0 && hadOrders) {
      playKitchenChime();
      setAlerting(true);
      setNewIds(prev => new Set([...prev, ...fresh]));
      alertTimer = setTimeout(() => setAlerting(false), 3000);
      flashTimer = setTimeout(() => {
        setNewIds(prev => {
          const next = new Set(prev);
          fresh.forEach(id => next.delete(id));
          return next;
        });
      }, 1500);
    }

    return () => {
      clearTimeout(alertTimer);
      clearTimeout(flashTimer);
    };
  }, [orders]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } catch {}
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Screen wake lock
  useWakeLock();

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
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">

      {/* ── Stats bar ── */}
      <StatsBar
        pendingCount={pendingOrders.length}
        preparingCount={preparingOrders.length}
        readyCount={readyOrders.length}
        longestWaitSecs={longestWaitSecs}
        alerting={alerting}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* ── 3 columns ── */}
      <div className="flex-1 flex flex-row gap-3 p-3 min-h-0">

        {/* ── Pending ── */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
          <div className={`h-12 border-b flex items-center px-3 shrink-0 transition-colors duration-300 ${
            alerting ? "bg-destructive/30 border-destructive/40" : "bg-destructive/10 border-destructive/20"
          }`}>
            <AlertCircle className="h-4 w-4 me-2 shrink-0 text-destructive" />
            <h2 className="text-base font-black text-destructive flex-1">
              طلبات جديدة ({pendingOrders.length})
            </h2>
            {alerting && (
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 rounded-full px-2 py-0.5 border border-destructive/20 animate-bounce">
                طلب جديد!
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <AlertCircle className="h-10 w-10 opacity-20" />
                <span>لا توجد طلبات جديدة</span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {pendingOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <KdsCard
                      order={order}
                      isNew={newIds.has(order.id)}
                      actionLabel="بدء التحضير"
                      actionClass="bg-primary hover:bg-primary/90 text-primary-foreground"
                      actionIcon={<UtensilsCrossed className="me-2 h-4 w-4" />}
                      onAction={() => handleUpdateStatus(order.id, "preparing")}
                      isActionPending={updateStatus.isPending}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Ready for pickup (middle) ── */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
          <div className="h-12 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center px-3 shrink-0">
            <PackageCheck className="h-4 w-4 text-emerald-500 me-2 shrink-0" />
            <h2 className="text-base font-black text-emerald-500">جاهز للاستلام ({readyOrders.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
            {readyOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <PackageCheck className="h-10 w-10 opacity-20" />
                <span>لا توجد طلبات جاهزة</span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {readyOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <KdsCard
                      order={order}
                      isNew={newIds.has(order.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Preparing ── */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
          <div className="h-12 bg-amber-500/10 border-b border-amber-500/20 flex items-center px-3 shrink-0">
            <UtensilsCrossed className="h-4 w-4 text-amber-500 me-2 shrink-0" />
            <h2 className="text-base font-black text-amber-500">جاري التحضير ({preparingOrders.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
                <UtensilsCrossed className="h-10 w-10 opacity-20" />
                <span>لا توجد طلبات قيد التحضير</span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {preparingOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <KdsCard
                      order={order}
                      isNew={newIds.has(order.id)}
                      actionLabel="جاهز للتسليم"
                      actionClass="bg-emerald-600 hover:bg-emerald-700 text-white"
                      actionIcon={<Check className="me-2 h-4 w-4" />}
                      onAction={() => handleUpdateStatus(order.id, "ready")}
                      isActionPending={updateStatus.isPending}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
