import { useState, useEffect } from "react";
import {
  useListActiveSessions,
  useListSessions,
  usePauseSession,
  useResumeSession,
  useEndSession,
  useCreatePayment,
  useVerifyPayment,
  useCreateDiscountRequest,
  useGetSessionDiscounts,
  getListActiveSessionsQueryKey,
  getListAssetsQueryKey,
  getGetSessionDiscountsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Gamepad2, Clock, Pause, Play, SquareSquare, Receipt, Banknote, CreditCard,
  Smartphone, AlertTriangle, ShoppingBag, History, CheckCircle, XCircle, Tag,
  ChevronDown, ChevronUp, LayoutGrid, LayoutList, Users, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ShiftGate } from "@/components/shift-gate";
import { useLang } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

type PaymentMethod = "cash" | "instapay" | "visa";

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  instapay: <Smartphone className="h-5 w-5" />,
  visa: <CreditCard className="h-5 w-5" />,
};

interface CheckoutState {
  sessionId: number;
  assetName: string;
  currentCost: number;
  ordersCost: number;
  totalCost: number;
  currentMinutes: number;
  pricePerHour: number;
  undeliveredOrders: Array<{ id?: number; status: string; totalAmount: number; items?: any[] }>;
  deliveredOrders: Array<{ id: number; totalAmount: number; items?: any[] }>;
}

type DiscountType = "session_time" | "order";
type DiscountKind = "percent" | "fixed";

function getTypePlaceholderClass(type: string | null): string {
  const t = (type || "").toLowerCase();
  if (t.includes("vip")) return "from-purple-700 to-purple-950";
  if (t.includes("console") || t.includes("ps") || t.includes("playstation")) return "from-emerald-700 to-emerald-950";
  if (t.includes("billiard") || t.includes("pool")) return "from-amber-700 to-amber-950";
  if (t.includes("pc") || t.includes("gaming") || t.includes("computer")) return "from-blue-700 to-blue-950";
  return "from-slate-600 to-slate-900";
}

interface SessionRowProps {
  session: any;
  t: (key: string) => string;
  lang: string;
  egp: string;
  onPauseResume: (action: "pause" | "resume", id: number) => void;
  onCheckout: (session: any) => void;
  pauseResumePending: boolean;
}

function SessionListRow({ session, t, lang, egp, onPauseResume, onCheckout, pauseResumePending }: SessionRowProps) {
  const isPaused = session.status === "paused";
  const baseMinutes = session.currentMinutes as number;

  // Live seconds counter — only ticks when session is active (not paused).
  // When isPaused becomes true, liveSeconds is reset to 0 and no interval is started,
  // so the display is frozen at exactly the server-provided baseMinutes value and
  // will NOT drift regardless of how many times the API polls and updates baseMinutes.
  const [liveSeconds, setLiveSeconds] = useState(0);
  useEffect(() => {
    setLiveSeconds(0);          // reset whenever server data or pause state changes
    if (isPaused) return;       // frozen — no interval for paused sessions
    const id = setInterval(() => setLiveSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [baseMinutes, isPaused]);

  const totalSeconds = Math.round(baseMinutes * 60) + liveSeconds; // liveSeconds = 0 when paused
  const displayHours = Math.floor(totalSeconds / 3600);
  const displayMins = Math.floor((totalSeconds % 3600) / 60);
  const timerStr = `${displayHours.toString().padStart(2, "0")}:${displayMins.toString().padStart(2, "0")}`;

  const name = lang === "ar"
    ? (session.assetNameAr || session.assetName)
    : (session.assetName || session.assetNameAr);

  const currentCost = session.currentCost as number;
  const ordersCost = (session.ordersCost ?? 0) as number;
  const totalCost = (session.totalCost ?? currentCost) as number;
  const undeliveredCount = (session.undeliveredOrders?.length ?? 0) as number;
  const rawType = session.assetType as string | null;
  const typeLabel = rawType ? rawType.charAt(0).toUpperCase() + rawType.slice(1) : null;
  const capacity = session.assetCapacity as number | null;
  const imageUrl = session.assetImageUrl as string | null;

  const startedTime = session.startedAt
    ? new Date(session.startedAt).toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const statusBadge = (
    <span className={cn(
      "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
      isPaused ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"
    )}>
      {isPaused ? t("sessions_filter_paused") : t("sessions_in_play")}
    </span>
  );

  const undeliveredBadge = undeliveredCount > 0 && (
    <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5 shrink-0">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
      </span>
      <ShoppingBag className="h-3 w-3 text-destructive" />
      <span className="text-xs font-bold text-destructive">{undeliveredCount}</span>
    </div>
  );

  const pauseResumeBtn = isPaused ? (
    <Button
      size="sm"
      className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs w-full"
      onClick={() => onPauseResume("resume", session.id)}
      disabled={pauseResumePending}
    >
      <Play className="h-3.5 w-3.5 me-1.5" />
      {t("sessions_resume_btn")}
    </Button>
  ) : (
    <Button
      size="sm"
      variant="secondary"
      className="h-9 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-semibold text-xs w-full"
      onClick={() => onPauseResume("pause", session.id)}
      disabled={pauseResumePending}
    >
      <Pause className="h-3.5 w-3.5 me-1.5" />
      {t("sessions_pause_btn")}
    </Button>
  );

  const endCheckoutBtn = (
    <Button
      size="sm"
      variant="destructive"
      className="h-9 font-semibold text-xs w-full"
      onClick={() => onCheckout(session)}
    >
      <SquareSquare className="h-3.5 w-3.5 me-1.5" />
      {t("sessions_end_checkout_btn")}
    </Button>
  );

  const viewDetailsBtn = (
    <Link href={`/sessions/${session.id}`} className="block w-full">
      <Button size="sm" variant="outline" className="h-9 font-semibold text-xs w-full">
        <Receipt className="h-3.5 w-3.5 me-1.5" />
        {t("session_details_btn")}
      </Button>
    </Link>
  );

  return (
    <div className={cn("card-base overflow-hidden border-s-4", isPaused ? "border-s-amber-500" : "border-s-emerald-500")}>

      {/* ── Desktop / Tablet (≥ sm): horizontal flex row ── */}
      <div className="hidden sm:flex items-stretch">
        {/* Thumbnail */}
        <div className="shrink-0 w-32 md:w-40 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name ?? ""} className="w-full h-full object-cover min-h-[110px]" />
          ) : (
            <div className={cn("w-full h-full bg-gradient-to-br min-h-[110px] flex items-center justify-center", getTypePlaceholderClass(rawType))}>
              <Gamepad2 className="h-9 w-9 text-white/40" />
            </div>
          )}
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-lg leading-tight truncate max-w-[200px]">
              {name || `Session #${session.id}`}
            </span>
            {statusBadge}
            {undeliveredBadge}
          </div>
          {typeLabel && (
            <p className="text-xs text-muted-foreground mt-1">
              {typeLabel}{capacity ? ` • ${capacity} ${t("sessions_seats")}` : ""}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("sessions_started")} {startedTime}
          </p>
        </div>

        {/* Elapsed time */}
        <div className="hidden md:flex flex-col items-center justify-center px-5 border-s border-border/40 shrink-0 min-w-[90px]">
          <Clock className="h-4 w-4 text-muted-foreground mb-1.5" />
          <p className="text-2xl font-mono font-bold tracking-tight tabular-nums">{timerStr}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{t("sessions_hr_label")}</p>
        </div>

        {/* Costs */}
        <div className="flex flex-col items-end justify-center px-5 border-s border-border/40 shrink-0 min-w-[130px]">
          <p className="text-2xl font-bold text-emerald-500 tabular-nums">
            {totalCost.toFixed(2)}
            <span className="text-xs text-emerald-500/70 ms-1">{egp}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {t("gaming_cost")}: <span className="font-semibold text-foreground">{currentCost.toFixed(2)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t("orders_cost")}: <span className="font-semibold text-foreground">{ordersCost.toFixed(2)}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 p-3 shrink-0 justify-center border-s border-border/40 min-w-[140px]">
          {pauseResumeBtn}
          {endCheckoutBtn}
          {viewDetailsBtn}
        </div>
      </div>

      {/* ── Mobile (< sm): stacked layout ── */}
      <div className="sm:hidden p-4 space-y-3">
        {/* Session info */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-base leading-tight">{name || `Session #${session.id}`}</span>
            {statusBadge}
            {undeliveredBadge}
          </div>
          {typeLabel && (
            <p className="text-xs text-muted-foreground">
              {typeLabel}{capacity ? ` • ${capacity} ${t("sessions_seats")}` : ""}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{t("sessions_started")} {startedTime}</p>
        </div>

        {/* Elapsed + total cost inline */}
        <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-3 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t("sessions_hr_label")}</p>
            <p className="text-xl font-mono font-bold tabular-nums">{timerStr}</p>
          </div>
          <div className="text-end">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t("total_cost_label")}</p>
            <p className="text-xl font-bold text-emerald-500 tabular-nums">
              {totalCost.toFixed(2)} <span className="text-xs">{egp}</span>
            </p>
          </div>
        </div>

        {/* Gaming / orders cost breakdown */}
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{t("gaming_cost")}: <span className="font-semibold text-foreground">{currentCost.toFixed(2)}</span></span>
          <span>{t("orders_cost")}: <span className="font-semibold text-foreground">{ordersCost.toFixed(2)}</span></span>
        </div>

        {/* Full-width action buttons stacked vertically */}
        <div className="space-y-2">
          {pauseResumeBtn}
          {endCheckoutBtn}
          {viewDetailsBtn}
        </div>
      </div>

    </div>
  );
}

export default function Sessions() {
  const { t, dir, lang } = useLang();
  const egp = t("egp_label");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: sessions, isLoading } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 8000 }
  });

  const pauseSession  = usePauseSession();
  const resumeSession = useResumeSession();
  const endSession    = useEndSession();
  const createPayment = useCreatePayment();
  const verifyPayment = useVerifyPayment();
  const createDiscount = useCreateDiscountRequest();

  const [tab, setTab] = useState<"active" | "history">("active");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [roomFilter, setRoomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  const { data: historySessions, isLoading: historyLoading } = useListSessions(
    undefined,
    { query: { enabled: tab === "history", refetchInterval: 15000 } as any }
  );

  const allHistory = (historySessions ?? []).filter(s => s.status === "ended" || s.status === "cancelled");
  const filteredHistory = historyStatusFilter === "all"
    ? allHistory.slice(0, 60)
    : allHistory.filter(s => s.status === historyStatusFilter).slice(0, 60);

  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountStr, setAmountStr] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>("session_time");
  const [discountKind, setDiscountKind] = useState<DiscountKind>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [billedMinutes, setBilledMinutes] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [discountExpanded, setDiscountExpanded] = useState(false);

  const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: t("pay_cash"),
    instapay: t("pay_instapay"),
    visa: t("pay_visa"),
  };

  const UNDELIVERED_STATUS_LABELS: Record<string, string> = {
    pending: t("status_new"),
    preparing: t("status_preparing"),
    ready: t("status_ready"),
  };

  const openCheckout = (session: any) => {
    const ordersCost = session.ordersCost ?? 0;
    const totalCost  = session.totalCost  ?? session.currentCost;
    const undeliveredOrders = session.undeliveredOrders ?? [];
    const deliveredOrders = (session.orders ?? []).filter((o: any) => o.status === "delivered");
    setCheckout({
      sessionId: session.id,
      assetName: session.assetNameAr || session.assetName || `${t("session_label")} #${session.id}`,
      currentCost: session.currentCost,
      ordersCost,
      totalCost,
      currentMinutes: session.currentMinutes ?? 0,
      pricePerHour: session.pricePerHour ?? 0,
      undeliveredOrders,
      deliveredOrders,
    });
    setPaymentMethod("cash");
    setAmountStr(totalCost.toFixed(2));
    setDiscountExpanded(false);
  };

  const closeCheckout = () => {
    if (isProcessing) return;
    setCheckout(null);
    setAmountStr("");
    setDiscountOpen(false);
    resetDiscountForm();
  };

  const resetDiscountForm = () => {
    setDiscountType("session_time");
    setDiscountKind("percent");
    setDiscountValue("");
    setBilledMinutes("");
    setDiscountReason("");
    setSelectedOrderId(null);
  };

  const { data: sessionDiscounts = [] } = useGetSessionDiscounts(
    checkout?.sessionId ?? 0,
    { query: { enabled: !!checkout?.sessionId, refetchInterval: 10000 } as any }
  );

  const pendingDiscount = sessionDiscounts.find(d => d.status === "pending");
  const approvedDiscount = sessionDiscounts.find(d => d.status === "approved");
  const rejectedDiscount = sessionDiscounts.find(d => d.status === "rejected" && !sessionDiscounts.find(d2 => d2.status !== "rejected"));

  const effectiveTotalCost = (() => {
    if (!checkout) return 0;
    if (!approvedDiscount) return checkout.totalCost;
    if (approvedDiscount.type === "session_time") {
      const discountedGaming = approvedDiscount.discountedAmount ?? checkout.currentCost;
      return Math.max(0, Math.round((discountedGaming + checkout.ordersCost) * 100) / 100);
    }
    if (approvedDiscount.type === "order") {
      const originalOrder = checkout.deliveredOrders.find(o => o.id === approvedDiscount.orderId);
      const originalAmt = originalOrder ? originalOrder.totalAmount : 0;
      const discountedAmt = approvedDiscount.discountedAmount ?? originalAmt;
      return Math.max(0, Math.round((checkout.currentCost + checkout.ordersCost - originalAmt + discountedAmt) * 100) / 100);
    }
    return checkout.totalCost;
  })();

  const discountPreview = (() => {
    if (!checkout || !discountValue) return null;
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) return null;

    if (discountType === "session_time") {
      const original = checkout.currentCost;
      if (discountKind === "percent" && val <= 100) {
        const after = Math.round(original * (1 - val / 100) * 100) / 100;
        return { original, after, totalAfter: Math.max(0, after + checkout.ordersCost) };
      }
      if (discountKind === "fixed") {
        const after = Math.max(0, Math.round((original - val) * 100) / 100);
        return { original, after, totalAfter: Math.max(0, after + checkout.ordersCost) };
      }
      if (billedMinutes) {
        const mins = parseFloat(billedMinutes);
        if (!isNaN(mins) && mins >= 0 && checkout.pricePerHour > 0) {
          const after = Math.round((mins / 60) * checkout.pricePerHour * 100) / 100;
          return { original, after, totalAfter: Math.max(0, after + checkout.ordersCost) };
        }
      }
    }
    if (discountType === "order" && selectedOrderId) {
      const order = checkout.deliveredOrders.find(o => o.id === selectedOrderId);
      if (order) {
        const original = order.totalAmount;
        if (discountKind === "percent" && val <= 100) {
          const after = Math.round(original * (1 - val / 100) * 100) / 100;
          return { original, after, totalAfter: Math.max(0, checkout.currentCost + checkout.ordersCost - original + after) };
        }
        if (discountKind === "fixed") {
          const after = Math.max(0, Math.round((original - val) * 100) / 100);
          return { original, after, totalAfter: Math.max(0, checkout.currentCost + checkout.ordersCost - original + after) };
        }
      }
    }
    return null;
  })();

  const handleDiscountSubmit = async () => {
    if (!checkout) return;
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) { toast.error(t("discount_value_label")); return; }
    if (discountKind === "percent" && val > 100) { toast.error(t("discount_value_label")); return; }
    if (discountType === "order" && !selectedOrderId) { toast.error(t("discount_order_label")); return; }

    try {
      const payload: any = {
        sessionId: checkout.sessionId,
        type: discountType,
        discountKind,
        discountValue: val,
        reason: discountReason.trim() || undefined,
      };
      if (discountType === "order") payload.orderId = selectedOrderId;
      if (discountType === "session_time" && billedMinutes) {
        const mins = parseFloat(billedMinutes);
        if (!isNaN(mins)) payload.billedMinutes = mins;
      }
      await createDiscount.mutateAsync({ data: payload });
      toast.success(t("discount_submitted_ok"));
      queryClient.invalidateQueries({ queryKey: getGetSessionDiscountsQueryKey(checkout.sessionId) });
      setDiscountOpen(false);
      resetDiscountForm();
    } catch (err: any) {
      const code = err?.data?.error;
      toast.error(code === "duplicate_pending" ? t("discount_duplicate_error") : t("discount_submit_error"));
    }
  };

  const handleCheckoutConfirm = async () => {
    if (!checkout) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { toast.error(t("amount_invalid")); return; }
    if (amount < effectiveTotalCost - 0.01) {
      toast.error(`${t("amount_too_low_error")} (${effectiveTotalCost.toFixed(2)} ${egp})`);
      return;
    }

    setIsProcessing(true);
    try {
      const payment = await createPayment.mutateAsync({
        data: { sessionId: checkout.sessionId, method: paymentMethod, amount },
      });
      await verifyPayment.mutateAsync({ paymentId: payment.id, data: {} });

      try {
        await endSession.mutateAsync({ sessionId: checkout.sessionId });
      } catch (endErr: any) {
        if (endErr?.response?.status === 402) {
          await endSession.mutateAsync({ sessionId: checkout.sessionId });
        } else {
          throw endErr;
        }
      }

      toast.success(t("session_ended_ok"));
      setCheckout(null);
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
    } catch (err: any) {
      if (err?.response?.data?.error === "no_open_shift") {
        toast.error(t("no_open_shift_toast"), {
          action: { label: t("shift_gate_open_btn"), onClick: () => setLocation("/shifts") },
        });
      } else {
        toast.error(err?.response?.data?.error || err?.message || t("error_generic"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseResume = async (action: "pause" | "resume", sessionId: number) => {
    try {
      if (action === "pause") await pauseSession.mutateAsync({ sessionId });
      if (action === "resume") await resumeSession.mutateAsync({ sessionId });
      toast.success(t("session_updated"));
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
    } catch {
      toast.error(t("error_generic"));
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const allActiveSessions = sessions ?? [];

  const roomOptions = [...new Set(
    allActiveSessions
      .map(s => lang === "ar" ? ((s as any).assetNameAr || s.assetName) : (s.assetName || (s as any).assetNameAr))
      .filter(Boolean)
  )] as string[];

  const filteredSessions = allActiveSessions.filter(s => {
    const name = lang === "ar" ? ((s as any).assetNameAr || s.assetName) : (s.assetName || (s as any).assetNameAr);
    if (roomFilter && name !== roomFilter) return false;
    if (statusFilter === "active" && s.status !== "active") return false;
    if (statusFilter === "paused" && s.status !== "paused") return false;
    return true;
  });

  const gamingTotal = filteredSessions.reduce((sum, s) => sum + s.currentCost, 0);
  const ordersTotal = filteredSessions.reduce((sum, s) => sum + ((s as any).ordersCost ?? 0), 0);
  const combinedTotal = filteredSessions.reduce((sum, s) => sum + ((s as any).totalCost ?? s.currentCost), 0);
  const uniqueRooms = new Set(filteredSessions.map(s => s.assetId)).size;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const selectClass = "h-9 px-3 pe-8 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer";

  return (
    <ShiftGate>
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-4 md:p-8 space-y-5 pb-24">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("sessions_title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("sessions_live_subtitle")}</p>
          </div>
          {tab === "active" && allActiveSessions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-emerald-600">
                {allActiveSessions.length} {t("sessions_active_badge")}
              </span>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="inline-flex bg-secondary rounded-lg p-1 gap-1">
          <button
            onClick={() => setTab("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Gamepad2 className="h-4 w-4" />
            {t("sessions_active_tab")}
            {allActiveSessions.length > 0 && (
              <span className="ms-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">{allActiveSessions.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <History className="h-4 w-4" />
            {t("sessions_history_tab")}
          </button>
        </div>

        {/* ══ ACTIVE TAB ══════════════════════════════════════════════════ */}
        {tab === "active" && (
          <div className="space-y-5">

            {/* ── Filters row ── */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Room filter */}
              <div className="relative">
                <select
                  value={roomFilter}
                  onChange={e => setRoomFilter(e.target.value)}
                  className={selectClass}
                  style={{ paddingInlineEnd: "2rem" }}
                >
                  <option value="">{t("sessions_filter_all_rooms")}</option>
                  {roomOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={selectClass}
                  style={{ paddingInlineEnd: "2rem" }}
                >
                  <option value="all">{t("sessions_filter_all_statuses")}</option>
                  <option value="active">{t("sessions_filter_in_play")}</option>
                  <option value="paused">{t("sessions_filter_paused")}</option>
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="ms-auto flex gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded transition-colors", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  title={t("sessions_view_list")}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  title={t("sessions_view_grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-2xl font-bold tabular-nums">{filteredSessions.length}</span>
                </div>
                <p className="text-xs font-medium">{t("sessions_active_badge")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("sessions_stat_across_rooms").replace("{n}", String(uniqueRooms))}
                </p>
              </div>
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-2xl font-bold tabular-nums text-blue-500">{gamingTotal.toFixed(0)}</span>
                </div>
                <p className="text-xs font-medium">{t("gaming_cost")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("sessions_stat_live_gaming")}</p>
              </div>
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-2xl font-bold tabular-nums text-amber-500">{ordersTotal.toFixed(0)}</span>
                </div>
                <p className="text-xs font-medium">{t("orders_cost")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("sessions_stat_active_orders")}</p>
              </div>
              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-2xl font-bold tabular-nums text-emerald-500">{combinedTotal.toFixed(0)}</span>
                </div>
                <p className="text-xs font-medium">{t("sessions_footer_combined")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("sessions_stat_live_value")}</p>
              </div>
            </div>

            {/* ── Empty state ── */}
            {filteredSessions.length === 0 && (
              <div className="py-12 text-center text-muted-foreground rounded-xl card-base">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">{t("no_active_sessions")}</h3>
                <p>{allActiveSessions.length === 0 ? t("no_sessions_hint") : t("sessions_filter_all_statuses")}</p>
                {allActiveSessions.length === 0 && (
                  <Link href="/assets">
                    <Button className="mt-4">{t("go_to_devices")}</Button>
                  </Link>
                )}
              </div>
            )}

            {/* ── List view ── */}
            {viewMode === "list" && filteredSessions.length > 0 && (
              <div className="space-y-3">
                {filteredSessions.map(session => (
                  <SessionListRow
                    key={session.id}
                    session={session}
                    t={t}
                    lang={lang}
                    egp={egp}
                    onPauseResume={handlePauseResume}
                    onCheckout={openCheckout}
                    pauseResumePending={pauseSession.isPending || resumeSession.isPending}
                  />
                ))}
              </div>
            )}

            {/* ── Grid view ── */}
            {viewMode === "grid" && filteredSessions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {filteredSessions.map(session => {
                  const isPaused = session.status === "paused";
                  const name = lang === "ar"
                    ? ((session as any).assetNameAr || session.assetName)
                    : (session.assetName || (session as any).assetNameAr);
                  return (
                    <div
                      key={session.id}
                      className={cn("card-base overflow-hidden border-s-4", isPaused ? "border-s-amber-500" : "border-s-primary")}
                    >
                      {/* Card header with thumbnail */}
                      <div className="h-24 relative overflow-hidden">
                        {(session as any).assetImageUrl ? (
                          <img src={(session as any).assetImageUrl} alt={name ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", getTypePlaceholderClass((session as any).assetType))}>
                            <Gamepad2 className="h-8 w-8 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 start-3 end-3 flex items-center justify-between">
                          <p className="text-white font-bold text-base leading-tight truncate">{name || `Session #${session.id}`}</p>
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ms-2", isPaused ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white")}>
                            {isPaused ? t("sessions_filter_paused") : t("sessions_in_play")}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {(session as any).undeliveredOrders?.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-1 w-fit">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                            </span>
                            <ShoppingBag className="h-3 w-3 text-destructive" />
                            <span className="text-xs font-bold text-destructive">{(session as any).undeliveredOrders.length}</span>
                          </div>
                        )}

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{t("elapsed_time")}</p>
                            <p className="text-2xl font-mono font-bold tracking-tight">
                              {Math.floor(session.currentMinutes / 60).toString().padStart(2, "0")}:
                              {(session.currentMinutes % 60).toString().padStart(2, "0")}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="text-xs text-muted-foreground mb-0.5">{t("total_cost_label")}</p>
                            <p className="text-2xl font-bold text-emerald-500 tabular-nums">
                              {((session as any).totalCost ?? session.currentCost).toFixed(2)}
                              <span className="text-sm text-emerald-500/70 ms-1">{egp}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
                          <span>{t("gaming_cost")}: <span className="font-semibold text-foreground">{session.currentCost.toFixed(2)}</span></span>
                          <span>{t("orders_cost")}: <span className="font-semibold text-foreground">{((session as any).ordersCost ?? 0).toFixed(2)}</span></span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {isPaused ? (
                            <Button
                              className="h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handlePauseResume("resume", session.id)}
                              disabled={resumeSession.isPending}
                            >
                              <Play className="me-1.5 h-4 w-4" /> {t("resume")}
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              className="h-11 font-bold border border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                              onClick={() => handlePauseResume("pause", session.id)}
                              disabled={pauseSession.isPending}
                            >
                              <Pause className="me-1.5 h-4 w-4" /> {t("pause")}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            className="h-11 font-bold"
                            onClick={() => openCheckout(session)}
                          >
                            <SquareSquare className="me-1.5 h-4 w-4" /> {t("end_and_pay")}
                          </Button>
                          <Link href={`/sessions/${session.id}`} className="col-span-2">
                            <Button variant="outline" className="w-full h-10">
                              <Receipt className="me-1.5 h-4 w-4" /> {t("session_details_btn")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY TAB ═════════════════════════════════════════════════ */}
        {tab === "history" && (
          <div className="space-y-4">
            {/* History filters */}
            <div className="flex gap-2">
              {(["all", "ended", "cancelled"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryStatusFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                    historyStatusFilter === f
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" ? t("sessions_history_filter_all") : f === "ended" ? t("sessions_history_ended") : t("sessions_history_cancelled")}
                </button>
              ))}
            </div>

            {historyLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground rounded-xl card-base">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{t("sessions_history_empty")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map(s => {
                  const name = lang === "ar"
                    ? ((s as any).assetNameAr || s.assetName)
                    : (s.assetName || (s as any).assetNameAr);
                  const isCancelled = s.status === "cancelled";
                  const mins = s.totalMinutes ? Math.round(parseFloat(String(s.totalMinutes))) : 0;
                  const cost = s.totalCost ? parseFloat(String(s.totalCost)) : 0;
                  const startedStr = s.startedAt ? format(new Date(s.startedAt), "HH:mm") : "—";
                  const endedStr = (s as any).endedAt ? format(new Date((s as any).endedAt), "HH:mm") : null;
                  return (
                    <div key={s.id} className={cn("card-base flex items-center gap-3 px-4 py-3 border-s-4", isCancelled ? "border-s-destructive" : "border-s-emerald-500")}>
                      <div className={cn("p-2 rounded-md shrink-0", isCancelled ? "bg-destructive/10" : "bg-emerald-500/10")}>
                        {isCancelled
                          ? <XCircle className="h-5 w-5 text-destructive" />
                          : <CheckCircle className="h-5 w-5 text-emerald-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{name || `Session #${s.id}`}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {startedStr}{endedStr ? ` → ${endedStr}` : ""}
                          {" · "}
                          {t("session_duration_label")}: {Math.floor(mins / 60).toString().padStart(2, "0")}:{(mins % 60).toString().padStart(2, "0")}
                        </p>
                      </div>
                      <div className="text-end shrink-0 flex flex-col items-end gap-1">
                        <p className={cn("font-bold tabular-nums text-sm", isCancelled ? "text-muted-foreground" : "text-emerald-500")}>
                          {cost.toFixed(2)} <span className="text-xs text-muted-foreground">{egp}</span>
                        </p>
                        <Link href={`/sessions/${s.id}`}>
                          <button className="text-xs text-primary hover:underline">{t("session_details_btn")}</button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Footer totals bar (active tab only) ── */}
      {tab === "active" && filteredSessions.length > 0 && (
        <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur-sm px-4 md:px-8 py-3 flex items-center gap-4 flex-wrap text-sm">
          <span className="text-muted-foreground font-medium">
            {t("sessions_showing").replace("{n}", String(filteredSessions.length))}
          </span>
          <div className="ms-auto flex items-center gap-4 flex-wrap">
            <span className="text-muted-foreground">
              {t("sessions_footer_gaming")}: <strong className="text-foreground tabular-nums">{gamingTotal.toFixed(2)} {egp}</strong>
            </span>
            <span className="text-muted-foreground">
              {t("sessions_footer_orders")}: <strong className="text-foreground tabular-nums">{ordersTotal.toFixed(2)} {egp}</strong>
            </span>
            <span className="font-semibold text-emerald-500">
              {t("sessions_footer_combined")}: <strong className="tabular-nums">{combinedTotal.toFixed(2)} {egp}</strong>
            </span>
          </div>
        </div>
      )}
    </div>

      {/* ══ CHECKOUT DIALOG (unchanged) ══════════════════════════════════ */}
      <Dialog open={!!checkout} onOpenChange={closeCheckout}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5 text-emerald-500" />
              {t("checkout_title")}
            </DialogTitle>
          </DialogHeader>

          {checkout && (
            <div className="space-y-4 py-2">
              {checkout.undeliveredOrders.length > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                  <div className="flex items-center gap-2 font-bold text-amber-500 mb-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {t("undelivered_orders_warning")}
                  </div>
                  <ul className="space-y-1">
                    {checkout.undeliveredOrders.map((o, i) => (
                      <li key={o.id ?? i} className="flex justify-between items-start gap-2 text-muted-foreground">
                        <span>
                          <span className="font-medium">{UNDELIVERED_STATUS_LABELS[o.status] ?? o.status}</span>
                          {o.items && o.items.length > 0 && (
                            <span className="block text-xs">
                              {o.items.map((item: any) => `${item.quantity}× ${lang === "ar" ? (item.productNameAr || item.productName) : (item.productName || item.productNameAr)}`).join("، ")}
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-foreground shrink-0">{o.totalAmount.toFixed(2)} {egp}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">{t("undelivered_not_billed")}</p>
                </div>
              )}

              {approvedDiscount && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 flex items-center gap-2 text-sm text-emerald-600">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{t("discount_applied_note")}</span>
                </div>
              )}
              {pendingDiscount && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 flex items-center gap-2 text-sm text-amber-600">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{t("discount_pending_note")}</span>
                </div>
              )}
              {rejectedDiscount && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 flex items-center gap-2 text-sm text-destructive">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{t("discount_rejected_note")}</span>
                </div>
              )}

              <div className="rounded-xl bg-secondary/50 border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{checkout.assetName}</p>
                {approvedDiscount ? (
                  <>
                    <p className="text-lg line-through text-muted-foreground/60 tabular-nums">{checkout.totalCost.toFixed(2)}</p>
                    <p className="text-4xl font-bold text-emerald-500 tabular-nums">{effectiveTotalCost.toFixed(2)}</p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-emerald-500 tabular-nums">{effectiveTotalCost.toFixed(2)}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{t("egp_label")}</p>
                {(checkout.ordersCost > 0 || approvedDiscount) && (
                  <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3 flex-wrap">
                    <span>{t("gaming_cost")}: <span className="font-semibold text-foreground">{checkout.currentCost.toFixed(2)}</span></span>
                    <span>{t("orders_cost")}: <span className="font-semibold text-foreground">{checkout.ordersCost.toFixed(2)}</span></span>
                    {approvedDiscount && (
                      <span className="text-emerald-500 font-semibold w-full text-center">
                        -{(checkout.totalCost - effectiveTotalCost).toFixed(2)} {t("egp_label")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!pendingDiscount && !approvedDiscount && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setDiscountExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {t("apply_discount")}
                    </span>
                    {discountExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {discountExpanded && (
                    <div className="p-4 border-t border-border space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("discount_type_label")}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["session_time", "order"] as DiscountType[]).map(dt => (
                            <button
                              key={dt}
                              onClick={() => { setDiscountType(dt); setSelectedOrderId(null); }}
                              className={cn(
                                "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors",
                                discountType === dt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                              )}
                            >
                              {dt === "session_time" ? t("discount_type_session") : t("discount_type_order")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {discountType === "order" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t("discount_order_label")}</Label>
                          {checkout.deliveredOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground">{t("sessions_no_delivered_orders")}</p>
                          ) : (
                            <div className="space-y-1">
                              {checkout.deliveredOrders.map(o => (
                                <button
                                  key={o.id}
                                  onClick={() => setSelectedOrderId(o.id)}
                                  className={cn(
                                    "w-full flex justify-between items-center px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors",
                                    selectedOrderId === o.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                                  )}
                                >
                                  <span>{t("discount_order_ref")} #{o.id}</span>
                                  <span>{o.totalAmount.toFixed(2)} {egp}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {discountType === "session_time" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">{t("discount_billed_minutes_label")}</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={t("sessions_billed_mins_placeholder")}
                            value={billedMinutes}
                            onChange={e => setBilledMinutes(e.target.value)}
                            className="h-9 text-sm"
                            dir="ltr"
                          />
                          <p className="text-[10px] text-muted-foreground">{t("discount_billed_minutes_hint")}</p>
                        </div>
                      )}

                      {!(discountType === "session_time" && billedMinutes) && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">{t("discount_kind_label")}</Label>
                            <div className="flex gap-1.5">
                              {(["percent", "fixed"] as DiscountKind[]).map(dk => (
                                <button
                                  key={dk}
                                  onClick={() => setDiscountKind(dk)}
                                  className={cn(
                                    "flex-1 px-2 py-1.5 rounded-lg border-2 text-[11px] font-medium transition-colors",
                                    discountKind === dk ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                                  )}
                                >
                                  {dk === "percent" ? "%" : egp}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">{t("discount_value_label")}</Label>
                            <Input
                              type="number"
                              min={0}
                              max={discountKind === "percent" ? 100 : undefined}
                              placeholder={discountKind === "percent" ? "20" : "50"}
                              value={discountValue}
                              onChange={e => setDiscountValue(e.target.value)}
                              className="h-9 text-sm"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      )}

                      {discountPreview && (
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs space-y-1">
                          <p className="font-semibold text-emerald-600 mb-1">{t("discount_preview_label")}</p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("discount_original")}</span>
                            <span className="line-through text-muted-foreground">{discountPreview.original.toFixed(2)} {egp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("discount_after")}</span>
                            <span className="font-bold text-emerald-600">{discountPreview.after.toFixed(2)} {egp}</span>
                          </div>
                          <div className="flex justify-between border-t border-emerald-500/20 pt-1 mt-1">
                            <span className="font-semibold">{t("sessions_total_after_discount")}</span>
                            <span className="font-bold text-emerald-600">{discountPreview.totalAfter.toFixed(2)} {egp}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("discount_reason_label")}</Label>
                        <Textarea
                          placeholder={t("discount_reason_placeholder")}
                          value={discountReason}
                          onChange={e => setDiscountReason(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>

                      <Button
                        onClick={handleDiscountSubmit}
                        disabled={createDiscount.isPending}
                        className="w-full"
                        size="sm"
                      >
                        {createDiscount.isPending ? t("discount_saving") : t("discount_submit")}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("payment_method")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "instapay", "visa"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        paymentMethod === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {PAYMENT_METHOD_ICONS[m]}
                      {PAYMENT_METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("received_amount")} ({egp})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={effectiveTotalCost}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="text-xl font-bold h-12 text-center"
                  dir="ltr"
                />
                {parseFloat(amountStr) > effectiveTotalCost + 0.01 && (
                  <p className="text-sm text-amber-500 text-center">
                    {t("change_due")}: {(parseFloat(amountStr) - effectiveTotalCost).toFixed(2)} {egp}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={closeCheckout} disabled={isProcessing} className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCheckoutConfirm}
              disabled={isProcessing || !!pendingDiscount}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("processing")}
                </span>
              ) : pendingDiscount ? (
                <span className="text-xs">{t("discount_pending_note")}</span>
              ) : (
                t("confirm_payment")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShiftGate>
  );
}
