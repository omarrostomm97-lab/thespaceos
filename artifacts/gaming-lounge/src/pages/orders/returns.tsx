import { useState } from "react";
import { useListReturnRequests, useApproveItemReturn, useRejectItemReturn, getListReturnRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, CheckCircle, XCircle, User, Calendar, Clock, History } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const EGP = (n: number) => `${n.toFixed(2)} ج.م`;

type Tab = "pending" | "history";

export default function OrderReturns() {
  const { t, dir, lang } = useLang();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");

  const { data: pendingRequests = [], isLoading: pendingLoading, refetch: refetchPending } = useListReturnRequests(
    { status: "pending" },
    { query: { refetchInterval: 30000 } }
  );

  const { data: historyRequests = [], isLoading: historyLoading, refetch: refetchHistory } = useListReturnRequests(
    { status: "history" },
    { query: { enabled: tab === "history", refetchInterval: 60000 } }
  );

  const approveReturn = useApproveItemReturn();
  const rejectReturn = useRejectItemReturn();

  const handleApprove = async (orderId: number, itemId: number) => {
    try {
      await approveReturn.mutateAsync({ orderId, itemId });
      toast.success(t("return_approve_ok"));
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey({ status: "pending" }) });
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey({ status: "history" }) });
    } catch {
      toast.error(t("return_action_error"));
    }
  };

  const handleReject = async (orderId: number, itemId: number) => {
    try {
      await rejectReturn.mutateAsync({ orderId, itemId });
      toast.success(t("return_reject_ok"));
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey({ status: "pending" }) });
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey({ status: "history" }) });
    } catch {
      toast.error(t("return_action_error"));
    }
  };

  const requests = tab === "pending" ? pendingRequests : historyRequests;
  const isLoading = tab === "pending" ? pendingLoading : historyLoading;

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <RotateCcw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {t("returns_page_title")}
              {pendingRequests.length > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-black">
                  {pendingRequests.length}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">{t("returns_page_subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => tab === "pending" ? refetchPending() : refetchHistory()}>
          <RotateCcw className="h-3.5 w-3.5 me-2" />
          {lang === "ar" ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition",
            tab === "pending" ? "bg-amber-500 text-black" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {lang === "ar" ? "قيد الانتظار" : "Pending"}
          {pendingRequests.length > 0 && (
            <span className={cn("text-[10px] font-bold px-1 rounded-full", tab === "pending" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-500")}>
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition",
            tab === "history" ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          <History className="h-3.5 w-3.5" />
          {lang === "ar" ? "السجل" : "History"}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          {tab === "pending"
            ? <RotateCcw className="h-12 w-12 text-muted-foreground/25" />
            : <History className="h-12 w-12 text-muted-foreground/25" />
          }
          <p className="font-semibold text-muted-foreground">
            {tab === "pending" ? t("returns_empty") : (lang === "ar" ? "لا توجد إرجاعات محلولة بعد" : "No resolved returns yet")}
          </p>
          <p className="text-sm text-muted-foreground/60">
            {tab === "pending" ? t("returns_empty_hint") : (lang === "ar" ? "ستظهر الإرجاعات المقبولة والمرفوضة هنا" : "Approved and rejected returns will appear here")}
          </p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && requests.length > 0 && (
        <StaggerChildren className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map(req => {
            const productName = lang === "ar" ? (req.productNameAr || req.productName) : (req.productName || req.productNameAr || "");
            const roomName = lang === "ar" ? (req.assetNameAr || req.assetName) : (req.assetName || req.assetNameAr);
            const isResolved = tab === "history";
            const isApproved = req.itemStatus === "returned";

            return (
              <StaggerItem key={`${req.orderId}-${req.itemId}`}>
                <div className="card-base rounded-2xl overflow-hidden relative">
                  {/* Status stripe */}
                  <div
                    className="absolute top-0 inset-x-0 h-0.5"
                    style={{
                      background: isResolved
                        ? isApproved ? "linear-gradient(90deg,#3b82f6,#60a5fa)" : "linear-gradient(90deg,#ef4444,#f87171)"
                        : "linear-gradient(90deg,#f5a524,#f59e0b)"
                    }}
                  />

                  <div className="p-4 space-y-3">
                    {/* Product + amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{productName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isResolved ? (
                            isApproved
                              ? <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">{t("return_approved_badge")}</Badge>
                              : <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-[10px]">{t("return_rejected_badge")}</Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">{t("return_pending_badge")}</Badge>
                          )}
                          {roomName && <span className="text-xs text-muted-foreground">{roomName}</span>}
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-base font-bold text-emerald-500">{EGP((req.returnQuantity ?? req.quantity) * req.unitPrice)}</p>
                        <p className="text-xs text-muted-foreground">{req.returnQuantity ?? req.quantity}×</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{t("return_order_num")} #{req.orderId}</span>
                      {req.sessionId && <span>Session #{req.sessionId}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(req.orderedAt), "dd/MM hh:mm a")}
                      </span>
                      {isResolved && req.returnedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {format(new Date(req.returnedAt), "dd/MM hh:mm a")}
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    {req.returnReason && (
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{t("return_reason_label")}</p>
                        <p className="text-xs text-foreground leading-snug">{req.returnReason}</p>
                      </div>
                    )}

                    {/* Requested by */}
                    {req.requestedByName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span>{t("return_requested_by")}: <span className="font-medium text-foreground">{req.requestedByName}</span></span>
                      </div>
                    )}

                    {/* Action buttons — pending only */}
                    {!isResolved && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
                          onClick={() => handleApprove(req.orderId, req.itemId)}
                          disabled={approveReturn.isPending || rejectReturn.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5 me-1.5" />
                          {t("returns_approve_btn")}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 h-9 px-3"
                          onClick={() => handleReject(req.orderId, req.itemId)}
                          disabled={approveReturn.isPending || rejectReturn.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 me-1.5" />
                          {t("returns_reject_btn")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </FadeIn>
  );
}
