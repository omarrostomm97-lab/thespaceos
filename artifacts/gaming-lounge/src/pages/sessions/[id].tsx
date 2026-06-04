import { useState, useEffect, useMemo } from "react";
import { useGetSession, useCancelSession, useRequestItemReturn, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Clock, Gamepad2, Receipt, AlertCircle, AlertTriangle, ShoppingCart, History, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/hooks/use-language";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

const ACTION_COLORS: Record<string, string> = {
  started:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resumed:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ended:     "bg-secondary text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function SessionDetail() {
  const { t, dir, lang } = useLang();
  const { user } = useAuth();
  const params = useParams();
  const sessionId = params.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const ACTION_LABELS: Record<string, string> = {
    started:   t("action_started"),
    paused:    t("action_paused"),
    resumed:   t("action_resumed"),
    ended:     t("action_ended"),
    cancelled: t("action_cancelled"),
  };

  const { data: session, isLoading } = useGetSession(sessionId, {
    query: { queryKey: getGetSessionQueryKey(sessionId), enabled: !!sessionId, refetchInterval: 10000 }
  });

  const cancelSession = useCancelSession();
  const requestReturn = useRequestItemReturn();

  const [returnDialog, setReturnDialog] = useState<{ orderId: number; itemId: number; productName: string; maxQty: number } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnQty, setReturnQty] = useState(1);

  /* ── Real-time clock ── */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!session || !["active", "paused"].includes(session.status)) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [session?.status]);

  /* ── Elapsed minutes (live for active, frozen for paused/ended) ── */
  const elapsedMinutes = useMemo(() => {
    if (!session) return 0;
    if (session.status === "ended" || session.status === "cancelled") {
      return session.totalMinutes ?? 0;
    }
    const startMs = new Date(session.startedAt).getTime();
    const endMs =
      session.status === "paused" && session.pausedAt
        ? new Date(session.pausedAt).getTime()
        : now.getTime();
    return Math.max(0, (endMs - startMs) / 60000 - ((session as any).pausedDurationMinutes ?? 0));
  }, [session, now]);

  /* ── Gaming cost (live for active/paused; uses frozen elapsedMinutes for ended) ── */
  const gamingCost = useMemo(() => {
    if (!session) return 0;
    const pricePerHour = (session as any).pricePerHour ?? 0;
    return (elapsedMinutes / 60) * pricePerHour;
  }, [session, elapsedMinutes]);

  /* ── Orders cost (only delivered orders are billable) ── */
  const ordersCost = useMemo(() => {
    if (!session?.orders) return 0;
    return (session.orders as any[])
      .filter((o) => o.status === "delivered")
      .reduce((sum: number, o: any) => sum + (o.totalAmount ?? 0), 0);
  }, [session?.orders]);

  /* ── Undelivered orders (warn cashier before checkout) ── */
  const undeliveredOrders = useMemo(() => {
    if (!session?.orders) return [] as any[];
    return (session.orders as any[]).filter((o) =>
      ["pending", "preparing", "ready"].includes(o.status)
    );
  }, [session?.orders]);

  /* ── Grand total: frozen persisted value for ended sessions to prevent drift ── */
  const totalCost = useMemo(() => {
    if (!session) return 0;
    if (session.status === "ended" || session.status === "cancelled") {
      return session.totalCost ?? 0;
    }
    return gamingCost + ordersCost;
  }, [session, gamingCost, ordersCost]);

  /* ── Gaming display cost: derived from frozen total for ended; live otherwise ── */
  const displayGamingCost = useMemo(() => {
    if (!session) return 0;
    if (session.status === "ended" || session.status === "cancelled") {
      return Math.max(0, totalCost - ordersCost);
    }
    return gamingCost;
  }, [session, totalCost, gamingCost, ordersCost]);

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync({ sessionId, data: { reason: t("cancel_reason_default") } });
      toast.success(t("cancel_ok"));
      queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
    } catch {
      toast.error(t("cancel_error"));
    }
  };

  const handleReturnRequest = async () => {
    if (!returnDialog) return;
    if (!returnReason.trim()) { toast.error(t("return_reason_required")); return; }
    try {
      await requestReturn.mutateAsync({ orderId: returnDialog.orderId, itemId: returnDialog.itemId, data: { reason: returnReason.trim(), quantity: returnQty } });
      toast.success(t("return_request_ok"));
      queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
      setReturnDialog(null);
      setReturnReason("");
      setReturnQty(1);
    } catch {
      toast.error(t("return_request_error"));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return <div className="p-8 text-center text-destructive">{t("session_not_found")}</div>;
  }

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const isActive = ["active", "paused"].includes(session.status);
  const isCashier = user?.role === "cashier";

  const hoursDisplay = Math.floor(elapsedMinutes / 60);
  const minsDisplay  = Math.round(elapsedMinutes % 60);
  const timeLabel    = `${hoursDisplay}${lang === "ar" ? "س" : "h"} ${minsDisplay}${lang === "ar" ? "د" : "m"}`;

  const itemStatusBadge = (status: string) => {
    if (status === "return_requested") return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">{t("return_pending_badge")}</Badge>;
    if (status === "returned")         return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">{t("return_approved_badge")}</Badge>;
    if (status === "return_rejected")  return <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-[10px]">{t("return_rejected_badge")}</Badge>;
    return null;
  };

  return (
    <div className="p-8 space-y-6" dir={dir}>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
          <BackIcon className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            {t("session_label")} #{session.id}
            {session.status === "active"    && <Badge className="bg-emerald-500 text-black">{t("badge_active")}</Badge>}
            {session.status === "paused"    && <Badge className="bg-amber-500 text-black">{t("badge_paused")}</Badge>}
            {session.status === "ended"     && <Badge variant="secondary">{t("badge_ended")}</Badge>}
            {session.status === "cancelled" && <Badge variant="destructive">{t("badge_cancelled")}</Badge>}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            {lang === "ar" ? (session.assetNameAr || session.assetName) : (session.assetName || session.assetNameAr)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Time details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("time_details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("start_time")}</p>
                <p className="font-bold">{format(new Date(session.startedAt), "hh:mm a")}</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("elapsed_time")}</p>
                <p className="font-bold tabular-nums">{timeLabel}</p>
              </div>
            </div>

            {isActive && (
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={handleCancel}
                disabled={cancelSession.isPending}
              >
                <AlertCircle className="h-4 w-4 me-2" />
                {t("cancel_session")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Cost & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-500" />
              {t("cost_payment")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-5 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-muted-foreground mb-1 text-sm">{t("total_cost_label")}</p>
              <p className="text-4xl font-bold text-emerald-500 tabular-nums">{totalCost.toFixed(2)} ج.م</p>

              {/* Breakdown */}
              {(ordersCost > 0 || isActive) && (
                <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
                  <span>{t("gaming_cost")}: <span className="font-semibold text-foreground">{displayGamingCost.toFixed(2)}</span></span>
                  <span>{t("orders_cost")}: <span className="font-semibold text-foreground">{ordersCost.toFixed(2)}</span></span>
                </div>
              )}
            </div>

            {/* Undelivered orders warning */}
            {undeliveredOrders.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                <div className="flex items-center gap-2 font-bold text-amber-500 mb-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {t("undelivered_orders_warning")}
                </div>
                <ul className="space-y-1">
                  {undeliveredOrders.map((o: any) => {
                    const statusLabel = o.status === "pending" ? t("status_new") : o.status === "preparing" ? t("status_preparing") : t("status_ready");
                    return (
                      <li key={o.id} className="flex justify-between text-muted-foreground">
                        <span>{statusLabel} — {(o.items as any[])?.map((i: any) => `${i.quantity}× ${lang === "ar" ? (i.productNameAr || i.productName) : (i.productName || i.productNameAr)}`).join("، ")}</span>
                        <span className="font-semibold text-foreground shrink-0 ms-2">{o.totalAmount.toFixed(2)} ج.م</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">{t("undelivered_not_billed")}</p>
              </div>
            )}

            {session.payments && session.payments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-bold mb-2">{t("payments_list")}</h4>
                {session.payments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                    <div className="flex gap-2">
                      <Badge variant="outline">{payment.method}</Badge>
                      <Badge variant={payment.status === "verified" ? "default" : "secondary"}>
                        {payment.status === "verified" ? t("payment_confirmed") : t("payment_pending_badge")}
                      </Badge>
                    </div>
                    <span className="font-bold">{payment.amount.toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event log */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {t("event_log")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!session.sessionLogs || session.sessionLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                {t("no_events")}
              </div>
            ) : (
              <ol className="relative border-e border-border/50 me-4 space-y-0">
                {session.sessionLogs.map((log: any, idx: number) => (
                  <li key={log.id} className="mb-6 me-6">
                    <span className="absolute -end-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border ring-4 ring-background text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className={`p-3 rounded-lg border ${ACTION_COLORS[log.action] ?? "bg-secondary/30 border-border"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{ACTION_LABELS[log.action] ?? log.action}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "dd/MM hh:mm a")}</span>
                      </div>
                      {(log.previousStatus || log.newStatus) && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {log.previousStatus && <span>{log.previousStatus}</span>}
                          {log.previousStatus && log.newStatus && <span className="mx-1">{dir === "rtl" ? "←" : "→"}</span>}
                          {log.newStatus && <span>{log.newStatus}</span>}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t("by_user")}: {log.performedByName ?? `${lang === "ar" ? "مستخدم" : "User"} #${log.performedByUserId}`}
                      </p>
                      {log.note && (
                        <p className="text-xs mt-1 italic text-muted-foreground">{t("note_label")}: {log.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Return History — managers/owners only */}
        {!isCashier && (() => {
          const returnedItems = (session.orders as any[] ?? []).flatMap((o: any) =>
            ((o.items as any[]) ?? [])
              .filter((i: any) => i.status === "returned" || i.status === "return_rejected")
              .map((i: any) => ({ ...i, orderId: o.id }))
          );
          if (returnedItems.length === 0) return null;
          return (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-blue-500" />
                  {lang === "ar" ? "سجل الإرجاعات" : "Return History"}
                  <span className="text-sm font-normal text-muted-foreground ms-1">({returnedItems.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {returnedItems.map((item: any) => {
                    const productName = lang === "ar" ? (item.productNameAr || item.productName) : (item.productName || item.productNameAr);
                    const isApproved = item.status === "returned";
                    return (
                      <div key={`${item.orderId}-${item.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-secondary/20">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isApproved ? "bg-blue-500/10" : "bg-destructive/10"}`}>
                          {isApproved
                            ? <CheckCircle className="h-4 w-4 text-blue-500" />
                            : <XCircle className="h-4 w-4 text-destructive" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.quantity}× {productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("order_label")} #{item.orderId}
                            {item.returnReason ? ` · ${item.returnReason}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isApproved
                            ? <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">{t("return_approved_badge")}</Badge>
                            : <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-[10px]">{t("return_rejected_badge")}</Badge>
                          }
                          <p className="text-xs text-muted-foreground">{parseFloat(item.totalPrice).toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Related orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              {t("related_orders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!session.orders || session.orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                {t("no_related_orders")}
              </div>
            ) : (
              <div className="space-y-4">
                {session.orders.map((order: any) => {
                  const isDelivered = order.status === "delivered";
                  return (
                    <div key={order.id} className="border border-border/50 rounded-xl overflow-hidden">
                      {/* Order header */}
                      <div className="flex justify-between items-center px-4 py-3 bg-secondary/30">
                        <div className="flex gap-2 items-center">
                          <span className="font-bold text-sm">{t("order_label")} #{order.id}</span>
                          <Badge variant={isDelivered || order.status === "closed" ? "outline" : "default"}>
                            {order.status}
                          </Badge>
                        </div>
                        <span className="font-bold text-emerald-500 text-sm">{order.totalAmount.toFixed(2)} ج.م</span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-border/30">
                        {order.items.map((item: any) => {
                          const productName = lang === "ar" ? (item.productNameAr || item.productName) : (item.productName || item.productNameAr);
                          const alreadyReturned = item.returnedQuantity ?? 0;
                          const remaining = item.quantity - alreadyReturned;
                          const canRequest = isDelivered && (item.status === "active" || item.status === "return_rejected") && remaining > 0;
                          const returnLabel = alreadyReturned > 0
                            ? `${alreadyReturned}/${item.quantity} ${lang === "ar" ? "مُرجع" : "returned"}`
                            : null;
                          return (
                            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                <span className="text-sm text-muted-foreground shrink-0">{item.quantity}×</span>
                                <span className="text-sm font-medium truncate">{productName}</span>
                                {itemStatusBadge(item.status)}
                                {returnLabel && (
                                  <span className="text-[10px] text-amber-500/80">({returnLabel})</span>
                                )}
                                {item.returnReason && item.status !== "active" && (
                                  <span className="text-xs text-muted-foreground truncate hidden md:block">
                                    — {item.returnReason}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground">{parseFloat(item.totalPrice).toFixed(2)} ج.م</span>
                                {canRequest && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                                    onClick={() => {
                                      setReturnDialog({ orderId: order.id, itemId: item.id, productName, maxQty: remaining });
                                      setReturnReason("");
                                      setReturnQty(1);
                                    }}
                                  >
                                    <RotateCcw className="h-3 w-3 me-1" />
                                    {t("return_request_btn")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Return Request Dialog */}
      <Dialog open={!!returnDialog} onOpenChange={open => { if (!open) { setReturnDialog(null); setReturnReason(""); setReturnQty(1); } }}>
        <DialogContent dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              {t("return_confirm_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {returnDialog && (
              <p className="text-sm font-medium">{returnDialog.productName}</p>
            )}

            {/* Quantity selector — only shown when order item has qty > 1 */}
            {returnDialog && returnDialog.maxQty > 1 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">
                  {lang === "ar" ? "الكمية المُرجعة" : "Quantity to return"}
                  <span className="text-muted-foreground/50 ms-1">
                    ({lang === "ar" ? `من ${returnDialog.maxQty}` : `of ${returnDialog.maxQty}`})
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setReturnQty(q => Math.max(1, q - 1))}
                    disabled={returnQty <= 1}
                  >−</Button>
                  <span className="w-8 text-center font-bold tabular-nums">{returnQty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setReturnQty(q => Math.min(returnDialog.maxQty, q + 1))}
                    disabled={returnQty >= returnDialog.maxQty}
                  >+</Button>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{t("return_confirm_body")}</p>
            <Textarea
              placeholder={t("return_reason_placeholder")}
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              className="resize-none"
              rows={3}
              dir={dir}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setReturnDialog(null); setReturnReason(""); setReturnQty(1); }}>
              {t("cancel")}
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-black"
              onClick={handleReturnRequest}
              disabled={requestReturn.isPending || !returnReason.trim()}
            >
              {requestReturn.isPending ? t("processing") : t("return_request_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
