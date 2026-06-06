import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useListOrders, getListOrdersQueryKey,
  useUpdateOrderStatus, useCancelOrder,
  useListReturnRequests, getListReturnRequestsQueryKey,
  useApproveItemReturn, useRejectItemReturn, useRequestItemReturn,
} from "@workspace/api-client-react";
import type { Order, ReturnRequest } from "@workspace/api-client-react";
import type { TranslationKey } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  ShoppingCart, Check, Clock, ChefHat, Package, X, Search,
  ChevronDown, ChevronUp, RotateCcw, QrCode, Monitor,
  Loader2, Timer, User, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Elapsed timer
// ─────────────────────────────────────────────────────────────────────────────
function ElapsedTimer({ from }: { from: string }) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 1000))
  );
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [from]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return <span className="tabular-nums">{h}h {m}m</span>;
  return <span className="tabular-nums">{m}:{String(s).padStart(2, "0")}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status, t }: { status: string; t: (k: TranslationKey) => string }) {
  switch (status) {
    case "pending":
      return <Badge variant="destructive" className="text-[10px] px-2 py-0.5">{t("status_new")}</Badge>;
    case "preparing":
      return <Badge className="bg-amber-500 text-black text-[10px] px-2 py-0.5 border-0">{t("status_preparing")}</Badge>;
    case "ready":
      return <Badge className="bg-emerald-500 text-black text-[10px] px-2 py-0.5 border-0">{t("status_ready")}</Badge>;
    case "delivered":
      return <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-[10px] px-2 py-0.5">{t("status_delivered_lbl")}</Badge>;
    case "closed":
      return <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{t("status_closed_lbl")}</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="text-muted-foreground text-[10px] px-2 py-0.5">{t("status_cancelled_lbl")}</Badge>;
    default:
      return <Badge className="text-[10px]">{status}</Badge>;
  }
}

function ItemReturnBadge({ status, t }: { status: string; t: (k: TranslationKey) => string }) {
  switch (status) {
    case "return_requested":
      return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 text-[10px] px-1.5 py-0.5">{t("return_pending_badge")}</Badge>;
    case "returned":
      return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px] px-1.5 py-0.5">{t("return_approved_badge")}</Badge>;
    case "return_rejected":
      return <Badge className="bg-red-500/15 text-red-600 border border-red-500/30 text-[10px] px-1.5 py-0.5">{t("return_rejected_badge")}</Badge>;
    default:
      return null;
  }
}

function SourceBadge({ source }: { source: string }) {
  return source === "qr" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
      <QrCode className="h-2.5 w-2.5" /> QR
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
      <Monitor className="h-2.5 w-2.5" /> POS
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Order card (Kanban)
// ─────────────────────────────────────────────────────────────────────────────
interface OrderCardProps {
  order: Order;
  lang: string;
  t: (k: TranslationKey) => string;
  onCardClick: (o: Order) => void;
  onStatusUpdate: (orderId: number, status: string) => void;
  onCancelClick: (o: Order) => void;
  isUpdating: boolean;
}

function OrderCard({ order, lang, t, onCardClick, onStatusUpdate, onCancelClick, isUpdating }: OrderCardProps) {
  const assetLabel = lang === "ar"
    ? (order.assetNameAr || order.assetName || t("direct_order"))
    : (order.assetName || order.assetNameAr || t("direct_order"));
  const canCancel = ["pending", "preparing"].includes(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="bg-card border border-border/60 rounded-2xl p-3.5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
      onClick={() => onCardClick(order)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-muted-foreground">#{order.id}</span>
          <SourceBadge source={order.source} />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-mono font-semibold">
          <Timer className="h-3 w-3 shrink-0" />
          <ElapsedTimer from={order.createdAt} />
        </div>
      </div>

      <p className="text-sm font-semibold leading-tight mb-1 truncate">{assetLabel}</p>
      <p className="text-[11px] text-muted-foreground mb-2">
        {order.items.length} {t("ord_items_count")} · {order.totalAmount.toFixed(2)} {t("egp_label")}
      </p>

      {order.createdByUserName && (
        <p className="text-[10px] text-muted-foreground/60 mb-2 flex items-center gap-1">
          <User className="h-2.5 w-2.5" /> {order.createdByUserName}
        </p>
      )}

      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
        {order.status === "pending" && (
          <Button size="sm" className="flex-1 h-7 text-[11px] bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl"
            onClick={() => onStatusUpdate(order.id, "preparing")} disabled={isUpdating}>
            <ChefHat className="h-3 w-3 me-1" /> {t("ord_mark_preparing")}
          </Button>
        )}
        {order.status === "preparing" && (
          <Button size="sm" className="flex-1 h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl"
            onClick={() => onStatusUpdate(order.id, "ready")} disabled={isUpdating}>
            <Package className="h-3 w-3 me-1" /> {t("ord_mark_ready")}
          </Button>
        )}
        {order.status === "ready" && (
          <Button size="sm" className="flex-1 h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            onClick={() => onStatusUpdate(order.id, "delivered")} disabled={isUpdating}>
            <Check className="h-3 w-3 me-1" /> {t("confirm_delivery")}
          </Button>
        )}
        {order.status === "delivered" && (
          <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px] rounded-xl"
            onClick={() => onStatusUpdate(order.id, "closed")} disabled={isUpdating}>
            <CheckCircle2 className="h-3 w-3 me-1" /> {t("ord_close_order")}
          </Button>
        )}
        {canCancel && (
          <Button size="sm" variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl shrink-0"
            onClick={() => onCancelClick(order)} disabled={isUpdating}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban column
// ─────────────────────────────────────────────────────────────────────────────
interface KanbanColumnProps {
  title: string;
  countClass: string;
  dotClass: string;
  orders: Order[];
  lang: string;
  t: (k: TranslationKey) => string;
  onCardClick: (o: Order) => void;
  onStatusUpdate: (orderId: number, status: string) => void;
  onCancelClick: (o: Order) => void;
  isUpdating: boolean;
}

function KanbanColumn({ title, countClass, dotClass, orders, lang, t, onCardClick, onStatusUpdate, onCancelClick, isUpdating }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-h-[180px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={`ms-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${countClass}`}>
          {orders.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5 flex-1">
        <AnimatePresence>
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/40 border-2 border-dashed border-border/40 rounded-2xl flex-1"
            >
              <ShoppingCart className="h-5 w-5 mb-1.5 opacity-40" />
              <p className="text-[11px]">{t("ord_empty_col")}</p>
            </motion.div>
          ) : (
            orders.map(order => (
              <OrderCard key={order.id} order={order} lang={lang} t={t}
                onCardClick={onCardClick} onStatusUpdate={onStatusUpdate}
                onCancelClick={onCancelClick} isUpdating={isUpdating} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Order detail drawer (custom slide-over)
// ─────────────────────────────────────────────────────────────────────────────
interface DrawerProps {
  order: Order;
  lang: string;
  t: (k: TranslationKey) => string;
  isMgmt: boolean;
  isCashierUp: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: number, status: string) => void;
  onApprove: (orderId: number, itemId: number) => void;
  onReject: (orderId: number, itemId: number) => void;
  onRequestReturn: (orderId: number, itemId: number, reason: string, qty: number) => void;
  isUpdating: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  isRequesting: boolean;
}

function OrderDrawer({
  order, lang, t, isMgmt, isCashierUp, onClose,
  onStatusUpdate, onApprove, onReject, onRequestReturn,
  isUpdating, isApproving, isRejecting, isRequesting,
}: DrawerProps) {
  const [returnItemId, setReturnItemId] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnQty, setReturnQty] = useState(1);

  const assetLabel = lang === "ar"
    ? (order.assetNameAr || order.assetName || t("direct_order"))
    : (order.assetName || order.assetNameAr || t("direct_order"));

  const fmtTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const handleReturnSubmit = (itemId: number, maxQty: number) => {
    if (!returnReason.trim()) { toast.error(t("return_reason_required")); return; }
    onRequestReturn(order.id, itemId, returnReason, Math.min(returnQty, maxQty));
    setReturnItemId(null);
    setReturnReason("");
    setReturnQty(1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed inset-y-0 end-0 z-50 w-full max-w-md md:max-w-lg bg-background border-s border-border/60 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("ord_drawer_title")}</p>
            <h3 className="text-lg font-bold">#{order.id} · {assetLabel}</h3>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 pb-10">
          {/* Status + source */}
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} t={t} />
            <SourceBadge source={order.source} />
          </div>

          {/* Quick action buttons */}
          {["pending","preparing","ready","delivered"].includes(order.status) && (
            <div className="flex gap-2 flex-wrap">
              {order.status === "pending" && (
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  onClick={() => onStatusUpdate(order.id, "preparing")} disabled={isUpdating}>
                  <ChefHat className="h-3.5 w-3.5 me-1" /> {t("ord_mark_preparing")}
                </Button>
              )}
              {order.status === "preparing" && (
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                  onClick={() => onStatusUpdate(order.id, "ready")} disabled={isUpdating}>
                  <Package className="h-3.5 w-3.5 me-1" /> {t("ord_mark_ready")}
                </Button>
              )}
              {order.status === "ready" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  onClick={() => onStatusUpdate(order.id, "delivered")} disabled={isUpdating}>
                  <Check className="h-3.5 w-3.5 me-1" /> {t("confirm_delivery")}
                </Button>
              )}
              {order.status === "delivered" && (
                <Button size="sm" variant="outline"
                  onClick={() => onStatusUpdate(order.id, "closed")} disabled={isUpdating}>
                  <CheckCircle2 className="h-3.5 w-3.5 me-1" /> {t("ord_close_order")}
                </Button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="card-base rounded-2xl p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {t("ord_timeline_ordered")}
            </p>
            <div className="space-y-3 ps-3 border-s-2 border-border/40">
              {[
                { label: t("ord_timeline_ordered"), ts: order.createdAt, dot: "bg-primary" },
                { label: t("ord_timeline_preparing"), ts: (order as any).preparingAt, dot: "bg-amber-500" },
                { label: t("ord_timeline_ready"), ts: (order as any).readyAt, dot: "bg-emerald-500" },
                { label: t("ord_timeline_delivered"), ts: (order as any).deliveredAt, dot: "bg-blue-500" },
              ].filter(s => !!s.ts).map(step => (
                <div key={step.label} className="flex items-start gap-2.5 relative -ms-[17px]">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 border-2 border-background ${step.dot}`} />
                  <div>
                    <p className="text-xs font-semibold leading-none mb-0.5">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(step.ts), "dd/MM/yyyy")} · {fmtTime(step.ts)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {order.createdByUserName && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-3 pt-3 border-t border-border/40">
                <User className="h-3 w-3" /> {t("ord_created_by")}: {order.createdByUserName}
              </p>
            )}
          </div>

          {/* Cancel reason */}
          {order.status === "cancelled" && (order as any).cancelReason && (
            <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-3.5">
              <p className="text-xs font-semibold text-red-500 mb-1">{t("ord_cancel_reason_show")}</p>
              <p className="text-sm text-muted-foreground">{(order as any).cancelReason}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("ord_items_section")}</p>
            <div className="space-y-2.5">
              {order.items.map(item => {
                const name = lang === "ar"
                  ? ((item as any).productNameAr || item.productName)
                  : (item.productName || (item as any).productNameAr);
                const itemStatus = (item as any).status ?? "active";
                const itemNotes = (item as any).notes;
                const itemReturnReason = (item as any).returnReason;
                const returnedQty = (item as any).returnedQuantity ?? 0;
                const remaining = item.quantity - returnedQty;
                const canRequestReturn = order.status === "delivered" && itemStatus === "active" && isCashierUp && remaining > 0;
                const canMgmtAction = itemStatus === "return_requested" && isMgmt;
                const isReturnOpen = returnItemId === item.id;

                return (
                  <div key={item.id} className="card-base rounded-xl p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0 flex items-start gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{item.quantity}× {name}</span>
                        {itemStatus !== "active" && <ItemReturnBadge status={itemStatus} t={t} />}
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-bold text-emerald-500">{item.totalPrice.toFixed(2)} {t("egp_label")}</p>
                        <p className="text-[10px] text-muted-foreground">{item.unitPrice.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>

                    {itemNotes && (
                      <p className="text-[11px] text-muted-foreground bg-secondary/50 rounded-lg px-2.5 py-1.5 mb-1.5">
                        💬 {itemNotes}
                      </p>
                    )}
                    {itemReturnReason && (
                      <p className="text-[11px] text-amber-600/80 bg-amber-500/8 rounded-lg px-2.5 py-1.5 mb-1.5">
                        ↩ {itemReturnReason}
                      </p>
                    )}

                    {canMgmtAction && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" className="flex-1 h-7 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg"
                          onClick={() => onApprove(order.id, item.id)} disabled={isApproving}>
                          <Check className="h-3 w-3 me-1" /> {t("returns_approve_btn")}
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-[11px] rounded-lg px-3"
                          onClick={() => onReject(order.id, item.id)} disabled={isRejecting}>
                          <X className="h-3 w-3 me-1" /> {t("returns_reject_btn")}
                        </Button>
                      </div>
                    )}

                    {canRequestReturn && (
                      <div className="mt-2">
                        {!isReturnOpen ? (
                          <Button size="sm" variant="outline"
                            className="h-7 text-[11px] rounded-lg w-full text-muted-foreground"
                            onClick={() => { setReturnItemId(item.id); setReturnQty(remaining); }}>
                            <RotateCcw className="h-3 w-3 me-1" /> {t("ord_request_return_btn")}
                          </Button>
                        ) : (
                          <div className="space-y-2 p-2.5 bg-secondary/40 rounded-xl border border-border/40">
                            <div className="flex gap-2">
                              <input type="number" min={1} max={remaining} value={returnQty}
                                onChange={e => setReturnQty(Math.max(1, Math.min(remaining, Number(e.target.value))))}
                                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                              <input type="text" value={returnReason}
                                onChange={e => setReturnReason(e.target.value)}
                                placeholder={t("ord_return_reason_ph")}
                                className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex gap-1.5">
                              <Button size="sm"
                                className="flex-1 h-7 text-[11px] bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg"
                                onClick={() => handleReturnSubmit(item.id, remaining)} disabled={isRequesting}>
                                {t("ord_request_return_btn")}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-[11px] rounded-lg"
                                onClick={() => { setReturnItemId(null); setReturnReason(""); }}>
                                {t("cancel")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3">
            <p className="text-sm font-semibold text-muted-foreground">{t("col_total")}</p>
            <p className="text-xl font-bold text-primary tabular-nums">
              {order.totalAmount.toFixed(2)}
              <span className="text-sm font-normal text-primary/60 ms-1">{t("egp_label")}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Returns tab
// ─────────────────────────────────────────────────────────────────────────────
interface ReturnsContentProps {
  returns: ReturnRequest[];
  lang: string;
  t: (k: TranslationKey) => string;
  onApprove: (orderId: number, itemId: number) => void;
  onReject: (orderId: number, itemId: number) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function ReturnsContent({ returns, lang, t, onApprove, onReject, isApproving, isRejecting }: ReturnsContentProps) {
  if (returns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground card-base rounded-2xl">
        <RotateCcw className="h-10 w-10 mx-auto mb-3 opacity-25" />
        <p className="font-bold">{t("ord_returns_empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {returns.map(req => {
        const name = lang === "ar"
          ? ((req as any).productNameAr || req.productName)
          : (req.productName || (req as any).productNameAr);
        const asset = lang === "ar"
          ? ((req as any).assetNameAr || (req as any).assetName || t("direct_order"))
          : ((req as any).assetName || (req as any).assetNameAr || t("direct_order"));
        const returnQty = (req as any).returnQuantity ?? req.quantity;
        const unitPrice = (req as any).unitPrice ?? 0;

        return (
          <div key={`${req.orderId}-${req.itemId}`} className="card-base rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-muted-foreground">
                    {t("return_order_num")} #{req.orderId}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-60">· {asset}</span>
                </div>
                <p className="text-sm font-semibold">{returnQty}× {name}</p>
                {(req as any).returnReason && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 bg-secondary/50 rounded-lg px-2.5 py-1 inline-block">
                    {(req as any).returnReason}
                  </p>
                )}
              </div>
              <div className="text-end shrink-0">
                <p className="text-sm font-bold text-emerald-500">
                  {(unitPrice * returnQty).toFixed(2)} {t("egp_label")}
                </p>
              </div>
            </div>

            {(req as any).requestedByName && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-3">
                <User className="h-3 w-3" /> {t("ord_requested_by")}: {(req as any).requestedByName}
              </p>
            )}

            <div className="flex gap-2">
              <Button size="sm"
                className="flex-1 h-8 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl"
                onClick={() => onApprove(req.orderId, req.itemId)} disabled={isApproving}>
                <Check className="h-3.5 w-3.5 me-1" /> {t("returns_approve_btn")}
              </Button>
              <Button size="sm" variant="destructive" className="h-8 text-[11px] rounded-xl px-4"
                onClick={() => onReject(req.orderId, req.itemId)} disabled={isRejecting}>
                <X className="h-3.5 w-3.5 me-1" /> {t("returns_reject_btn")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History tab
// ─────────────────────────────────────────────────────────────────────────────
interface HistoryContentProps {
  orders: Order[];
  lang: string;
  t: (k: TranslationKey) => string;
  search: string;
  onSearchChange: (v: string) => void;
  expanded: Set<number>;
  onToggle: (id: number) => void;
}

function HistoryContent({ orders, lang, t, search, onSearchChange, expanded, onToggle }: HistoryContentProps) {
  const fmtTime = (ts: string) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input type="text" value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder={t("ord_search_ph")}
          className="w-full rounded-xl border border-border bg-secondary/30 ps-10 pe-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground card-base rounded-2xl">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-25" />
          <p className="font-bold">{t("ord_history_empty")}</p>
        </div>
      ) : (
        <div className="card-base rounded-2xl overflow-hidden">
          {orders.map((order, idx) => {
            const isExpanded = expanded.has(order.id);
            const asset = lang === "ar"
              ? (order.assetNameAr || order.assetName || t("direct_order"))
              : (order.assetName || order.assetNameAr || t("direct_order"));

            return (
              <div key={order.id} className={idx !== orders.length - 1 ? "border-b border-border/40" : ""}>
                <div
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer gap-3"
                  onClick={() => onToggle(order.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-muted-foreground shrink-0">#{order.id}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{asset}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(order.createdAt), "dd/MM/yyyy")} · {fmtTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <SourceBadge source={order.source} />
                    <StatusBadge status={order.status} t={t} />
                    <p className="text-sm font-bold text-emerald-500">
                      {order.totalAmount.toFixed(2)} {t("egp_label")}
                    </p>
                    {isExpanded
                      ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 bg-secondary/10 space-y-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground mb-2 ps-1">
                          <span><Clock className="h-2.5 w-2.5 inline me-0.5" />{t("ord_timeline_ordered")}: {fmtTime(order.createdAt)}</span>
                          {(order as any).preparingAt && <span>👨‍🍳 {t("ord_timeline_preparing")}: {fmtTime((order as any).preparingAt)}</span>}
                          {(order as any).readyAt && <span>📦 {t("ord_timeline_ready")}: {fmtTime((order as any).readyAt)}</span>}
                          {(order as any).deliveredAt && <span>✅ {t("ord_timeline_delivered")}: {fmtTime((order as any).deliveredAt)}</span>}
                        </div>
                        {order.items.map(item => {
                          const name = lang === "ar"
                            ? ((item as any).productNameAr || item.productName)
                            : (item.productName || (item as any).productNameAr);
                          const itemStatus = (item as any).status ?? "active";
                          return (
                            <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-muted-foreground shrink-0">{item.quantity}×</span>
                                <span className="font-medium truncate">{name}</span>
                                {itemStatus !== "active" && <ItemReturnBadge status={itemStatus} t={t} />}
                              </div>
                              <span className="font-semibold text-emerald-500 shrink-0">
                                {item.totalPrice.toFixed(2)} {t("egp_label")}
                              </span>
                            </div>
                          );
                        })}
                        {(order as any).cancelReason && (
                          <p className="text-[11px] text-red-500/80 bg-red-500/5 rounded-lg px-2.5 py-1.5 mt-1">
                            ✕ {(order as any).cancelReason}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Orders page
// ─────────────────────────────────────────────────────────────────────────────
export default function Orders() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sourceFilter, setSourceFilter] = useState<"all" | "qr" | "pos">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const [historySearch, setHistorySearch] = useState("");

  const isMgmt = ["platform_owner", "owner", "manager"].includes(user?.role ?? "");
  const isCashierUp = ["platform_owner", "owner", "manager", "cashier"].includes(user?.role ?? "");

  const { data: orders = [], isLoading } = useListOrders(undefined, {
    query: { queryKey: getListOrdersQueryKey(), refetchInterval: 10_000 },
  });

  const { data: returnRequests = [] } = useListReturnRequests(
    { status: "pending" } as any,
    { query: { queryKey: getListReturnRequestsQueryKey({ status: "pending" } as any), refetchInterval: 15_000 } }
  );

  const updateStatus = useUpdateOrderStatus();
  const cancelOrderMut = useCancelOrder();
  const approveReturn = useApproveItemReturn();
  const rejectReturn = useRejectItemReturn();
  const requestReturn = useRequestItemReturn();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey({ status: "pending" } as any) });
  }, [queryClient]);

  // Keep the drawer in sync with live order data
  useEffect(() => {
    if (!selectedOrder) return;
    const updated = orders.find(o => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  }, [orders]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = useCallback(async (orderId: number, status: string) => {
    const toastKeys: Record<string, TranslationKey> = {
      preparing: "ord_preparing_ok",
      ready: "ord_ready_ok",
      delivered: "order_delivered_ok",
      closed: "ord_closed_ok",
    };
    try {
      await updateStatus.mutateAsync({ orderId, data: { status: status as any } });
      toast.success(t(toastKeys[status] ?? "ord_closed_ok"));
      invalidateAll();
    } catch {
      toast.error(t("ord_status_err"));
    }
  }, [updateStatus, t, invalidateAll]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    try {
      await cancelOrderMut.mutateAsync({ orderId: cancelTarget.id, data: { reason: cancelReason } });
      toast.success(t("ord_cancel_ok"));
      setCancelTarget(null);
      setCancelReason("");
      invalidateAll();
    } catch {
      toast.error(t("ord_cancel_err"));
    }
  }, [cancelTarget, cancelReason, cancelOrderMut, t, invalidateAll]);

  const handleApprove = useCallback(async (orderId: number, itemId: number) => {
    try {
      await approveReturn.mutateAsync({ orderId, itemId });
      toast.success(t("ord_approve_ok"));
      invalidateAll();
    } catch {
      toast.error(t("ord_return_action_err"));
    }
  }, [approveReturn, t, invalidateAll]);

  const handleReject = useCallback(async (orderId: number, itemId: number) => {
    try {
      await rejectReturn.mutateAsync({ orderId, itemId });
      toast.success(t("ord_reject_ok"));
      invalidateAll();
    } catch {
      toast.error(t("ord_return_action_err"));
    }
  }, [rejectReturn, t, invalidateAll]);

  const handleRequestReturn = useCallback(async (orderId: number, itemId: number, reason: string, qty: number) => {
    try {
      await requestReturn.mutateAsync({ orderId, itemId, data: { reason, quantity: qty } });
      toast.success(t("ord_return_req_ok"));
      invalidateAll();
    } catch {
      toast.error(t("ord_return_req_err"));
    }
  }, [requestReturn, t, invalidateAll]);

  const toggleHistory = useCallback((id: number) => {
    setExpandedHistory(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const activeOrders = useMemo(() =>
    orders.filter(o => !["closed", "cancelled"].includes(o.status)), [orders]);
  const historyOrders = useMemo(() =>
    orders.filter(o => ["closed", "cancelled"].includes(o.status)), [orders]);

  const filteredActive = useMemo(() =>
    sourceFilter === "all" ? activeOrders : activeOrders.filter(o => o.source === sourceFilter),
    [activeOrders, sourceFilter]);

  const pendingOrders   = useMemo(() => filteredActive.filter(o => o.status === "pending"),   [filteredActive]);
  const preparingOrders = useMemo(() => filteredActive.filter(o => o.status === "preparing"), [filteredActive]);
  const readyOrders     = useMemo(() => filteredActive.filter(o => o.status === "ready"),     [filteredActive]);
  const deliveredOrders = useMemo(() => filteredActive.filter(o => o.status === "delivered"), [filteredActive]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return historyOrders;
    const q = historySearch.toLowerCase();
    return historyOrders.filter(o =>
      String(o.id).includes(q) ||
      (o.assetName ?? "").toLowerCase().includes(q) ||
      (o.assetNameAr ?? "").toLowerCase().includes(q)
    );
  }, [historyOrders, historySearch]);

  const isUpdating  = updateStatus.isPending;
  const isApproving = approveReturn.isPending;
  const isRejecting = rejectReturn.isPending;
  const isRequesting = requestReturn.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-5 max-w-[1600px]">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">{t("orders_title")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{t("orders_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 rounded-full px-3 py-1.5 text-xs font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {t("dash_shift_live")}
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="h-11 bg-secondary/50 rounded-xl p-1 flex gap-1 w-full md:w-auto">
          <TabsTrigger value="active"
            className="flex-1 md:flex-none text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 h-9 flex items-center gap-1.5">
            {t("active_orders_tab")}
            {activeOrders.length > 0 && (
              <span className="bg-primary/20 data-[state=active]:bg-primary-foreground/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            )}
          </TabsTrigger>
          {isMgmt && (
            <TabsTrigger value="returns"
              className="flex-1 md:flex-none text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 h-9 flex items-center gap-1.5">
              {t("ord_tab_returns")}
              {returnRequests.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {returnRequests.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="history"
            className="flex-1 md:flex-none text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 h-9">
            {t("orders_history_tab")}
          </TabsTrigger>
        </TabsList>

        {/* ── Active / Kanban ── */}
        <TabsContent value="active" className="mt-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(["all", "qr", "pos"] as const).map(src => {
              const count = src === "all"
                ? activeOrders.length
                : activeOrders.filter(o => o.source === src).length;
              return (
                <button key={src}
                  onClick={() => setSourceFilter(src)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                    sourceFilter === src
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}>
                  {t(src === "all" ? "ord_src_all" : src === "qr" ? "ord_src_qr" : "ord_src_pos")}
                  <span className="ms-1.5 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KanbanColumn title={t("ord_col_pending")}   countClass="bg-red-500/15 text-red-500"     dotClass="bg-red-500"
              orders={pendingOrders}   lang={lang} t={t} onCardClick={setSelectedOrder}
              onStatusUpdate={handleStatusUpdate} onCancelClick={setCancelTarget} isUpdating={isUpdating} />
            <KanbanColumn title={t("ord_col_preparing")} countClass="bg-amber-500/15 text-amber-500"   dotClass="bg-amber-500"
              orders={preparingOrders} lang={lang} t={t} onCardClick={setSelectedOrder}
              onStatusUpdate={handleStatusUpdate} onCancelClick={setCancelTarget} isUpdating={isUpdating} />
            <KanbanColumn title={t("ord_col_ready")}     countClass="bg-emerald-500/15 text-emerald-500" dotClass="bg-emerald-500"
              orders={readyOrders}     lang={lang} t={t} onCardClick={setSelectedOrder}
              onStatusUpdate={handleStatusUpdate} onCancelClick={setCancelTarget} isUpdating={isUpdating} />
            <KanbanColumn title={t("ord_col_delivered")} countClass="bg-blue-500/15 text-blue-500"     dotClass="bg-blue-500"
              orders={deliveredOrders} lang={lang} t={t} onCardClick={setSelectedOrder}
              onStatusUpdate={handleStatusUpdate} onCancelClick={setCancelTarget} isUpdating={isUpdating} />
          </div>
        </TabsContent>

        {/* ── Returns ── */}
        {isMgmt && (
          <TabsContent value="returns" className="mt-5">
            <ReturnsContent returns={returnRequests} lang={lang} t={t}
              onApprove={handleApprove} onReject={handleReject}
              isApproving={isApproving} isRejecting={isRejecting} />
          </TabsContent>
        )}

        {/* ── History ── */}
        <TabsContent value="history" className="mt-5">
          <HistoryContent orders={filteredHistory} lang={lang} t={t}
            search={historySearch} onSearchChange={setHistorySearch}
            expanded={expandedHistory} onToggle={toggleHistory} />
        </TabsContent>
      </Tabs>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDrawer
            order={selectedOrder}
            lang={lang}
            t={t}
            isMgmt={isMgmt}
            isCashierUp={isCashierUp}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestReturn={handleRequestReturn}
            isUpdating={isUpdating}
            isApproving={isApproving}
            isRejecting={isRejecting}
            isRequesting={isRequesting}
          />
        )}
      </AnimatePresence>

      {/* Cancel dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) { setCancelTarget(null); setCancelReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("ord_cancel_title")}</DialogTitle>
            <DialogDescription>{t("ord_cancel_body")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {cancelTarget && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2">
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span>#{cancelTarget.id} · {cancelTarget.items.length} {t("ord_items_count")} · {cancelTarget.totalAmount.toFixed(2)} {t("egp_label")}</span>
              </div>
            )}
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder={t("ord_cancel_reason_ph")}
              rows={3}
              className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setCancelTarget(null); setCancelReason(""); }}>
              {t("cancel")}
            </Button>
            <Button variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || cancelOrderMut.isPending}>
              {cancelOrderMut.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : t("ord_cancel_confirm_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
