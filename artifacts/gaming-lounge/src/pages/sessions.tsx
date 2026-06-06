import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gamepad2, Clock, Pause, Play, SquareSquare, Receipt, Banknote, CreditCard, Smartphone, AlertTriangle, ShoppingBag, History, CheckCircle, XCircle, Tag, ChevronDown, ChevronUp } from "lucide-react";
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

  const { data: historySessions, isLoading: historyLoading } = useListSessions(
    undefined,
    { query: { enabled: tab === "history", refetchInterval: 15000 } as any }
  );
  const endedSessions = (historySessions ?? [])
    .filter(s => s.status === "ended" || s.status === "cancelled")
    .slice(0, 60);

  const [checkout, setCheckout] = useState<CheckoutState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountStr, setAmountStr] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Discount dialog state
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

  // Fetch existing discount requests for the open checkout session
  const { data: sessionDiscounts = [] } = useGetSessionDiscounts(
    checkout?.sessionId ?? 0,
    { query: { enabled: !!checkout?.sessionId, refetchInterval: 10000 } as any }
  );

  const pendingDiscount = sessionDiscounts.find(d => d.status === "pending");
  const approvedDiscount = sessionDiscounts.find(d => d.status === "approved");
  const rejectedDiscount = sessionDiscounts.find(d => d.status === "rejected" && !sessionDiscounts.find(d2 => d2.status !== "rejected"));

  // Compute effective total after any approved discount
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

  // Discount preview calculation (before submitting)
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ShiftGate>
    <div className="p-4 md:p-8 space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("nav_sessions")}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-secondary rounded-lg p-1 gap-1">
        <button
          onClick={() => setTab("active")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Gamepad2 className="h-4 w-4" />
          {t("sessions_active_tab")}
          {sessions && sessions.length > 0 && (
            <span className="ms-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">{sessions.length}</span>
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

      {/* History tab */}
      {tab === "history" && (
        <div className="space-y-3">
          {historyLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : endedSessions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground rounded-xl card-base">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{t("sessions_history_empty")}</p>
            </div>
          ) : (
            endedSessions.map(s => {
              const name = (s as any).assetNameAr || s.assetName || `${t("session_label")} #${s.id}`;
              const isCancelled = s.status === "cancelled";
              const mins = s.totalMinutes ? Math.round(parseFloat(String(s.totalMinutes))) : 0;
              const cost = s.totalCost ? parseFloat(String(s.totalCost)) : 0;
              return (
                <div key={s.id} className="card-base flex items-center gap-4 px-4 py-3">
                  <div className={`p-2 rounded-md shrink-0 ${isCancelled ? "bg-destructive/10" : "bg-emerald-500/10"}`}>
                    {isCancelled
                      ? <XCircle className="h-5 w-5 text-destructive" />
                      : <CheckCircle className="h-5 w-5 text-emerald-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("session_started_at")} {s.startedAt ? format(new Date(s.startedAt), "HH:mm") : "—"}
                      {s.endedAt && ` → ${format(new Date(s.endedAt), "HH:mm")}`}
                      {" · "}
                      {t("session_duration_label")}: {Math.floor(mins / 60).toString().padStart(2, "0")}:{(mins % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-bold text-emerald-500 tabular-nums">{cost.toFixed(2)} <span className="text-xs text-muted-foreground">{egp}</span></p>
                    <Link href={`/sessions/${s.id}`}>
                      <button className="text-xs text-primary hover:underline mt-0.5">{t("session_details_btn")}</button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active tab */}
      {tab === "active" && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sessions?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground rounded-xl card-base">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">{t("no_active_sessions")}</h3>
            <p>{t("no_sessions_hint")}</p>
            <Link href="/assets">
              <Button className="mt-4">{t("go_to_devices")}</Button>
            </Link>
          </div>
        ) : (
          sessions?.map((session) => {
            const isPaused = session.status === "paused";
            return (
              <Card
                key={session.id}
                className={`relative overflow-hidden border-s-4 ${isPaused ? "border-s-amber-500" : "border-s-primary"}`}
              >
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-md">
                        <Gamepad2 className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{(session as any).assetNameAr || session.assetName}</CardTitle>
                        <div className="flex items-center gap-1 text-xs font-medium mt-1">
                          <span className={isPaused ? "text-amber-500" : "text-emerald-500"}>
                            {isPaused ? t("session_status_paused") : t("session_status_playing")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {((session as any).undeliveredOrders?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 rounded-full px-2.5 py-1 shrink-0">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                        </span>
                        <ShoppingBag className="h-3 w-3 text-destructive" />
                        <span className="text-xs font-bold text-destructive">
                          {(session as any).undeliveredOrders.length}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-0 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("elapsed_time")}</p>
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

                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {isPaused ? (
                      <Button
                        variant="default"
                        className="h-14 font-bold text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                        onClick={() => handlePauseResume("resume", session.id)}
                        disabled={resumeSession.isPending}
                      >
                        <Play className="me-2 h-5 w-5" />
                        {t("resume")}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-14 font-bold text-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shadow-lg"
                        onClick={() => handlePauseResume("pause", session.id)}
                        disabled={pauseSession.isPending}
                      >
                        <Pause className="me-2 h-5 w-5" />
                        {t("pause")}
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      className="h-14 font-bold text-lg shadow-lg"
                      onClick={() => openCheckout(session)}
                    >
                      <SquareSquare className="me-2 h-5 w-5" />
                      {t("end_and_pay")}
                    </Button>

                    <Link href={`/sessions/${session.id}`} className="col-span-2">
                      <Button variant="outline" className="w-full h-12">
                        <Receipt className="me-2 h-4 w-4" />
                        {t("session_details_btn")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>}

      {/* Checkout Dialog */}
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
              {/* Undelivered orders warning */}
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

              {/* Discount status banners */}
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

              {/* Cost summary */}
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

              {/* Discount section — collapsible */}
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
                      {/* Discount type */}
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

                      {/* Order selector */}
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

                      {/* Billable minutes override (session_time only) */}
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

                      {/* Discount kind + value (shown when not using billable minutes override) */}
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

                      {/* Preview */}
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

                      {/* Reason */}
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

              {/* Payment method */}
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

              {/* Amount input */}
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
    </div>
    </ShiftGate>
  );
}
