import { useListReturnRequests, useApproveItemReturn, useRejectItemReturn, getListReturnRequestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, CheckCircle, XCircle, User, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function OrderReturns() {
  const { t, dir, lang } = useLang();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, refetch } = useListReturnRequests({
    query: { refetchInterval: 30000 }
  });

  const approveReturn = useApproveItemReturn();
  const rejectReturn = useRejectItemReturn();

  const handleApprove = async (orderId: number, itemId: number) => {
    try {
      await approveReturn.mutateAsync({ orderId, itemId });
      toast.success(t("return_approve_ok"));
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey() });
    } catch {
      toast.error(t("return_action_error"));
    }
  };

  const handleReject = async (orderId: number, itemId: number) => {
    try {
      await rejectReturn.mutateAsync({ orderId, itemId });
      toast.success(t("return_reject_ok"));
      queryClient.invalidateQueries({ queryKey: getListReturnRequestsQueryKey() });
    } catch {
      toast.error(t("return_action_error"));
    }
  };

  return (
    <div className="p-8 space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <RotateCcw className="h-7 w-7" />
            {t("returns_page_title")}
            {requests.length > 0 && (
              <span
                className="text-base font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "#f5a524", color: "#000" }}
              >
                {requests.length}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">{t("returns_page_subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw className="h-3.5 w-3.5 me-2" />
          {lang === "ar" ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && requests.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <RotateCcw className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-semibold text-muted-foreground">{t("returns_empty")}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">{t("returns_empty_hint")}</p>
          </CardContent>
        </Card>
      )}

      {/* Return request cards */}
      {!isLoading && requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map(req => {
            const productName = lang === "ar" ? (req.productNameAr || req.productName) : (req.productName || req.productNameAr || "");
            const roomName = lang === "ar" ? (req.assetNameAr || req.assetName) : (req.assetName || req.assetNameAr);
            const isApproving = approveReturn.isPending;
            const isRejecting = rejectReturn.isPending;

            return (
              <Card key={`${req.orderId}-${req.itemId}`} className="card-base relative overflow-hidden">
                {/* Amber accent stripe */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, #f5a524, #f59e0b)" }}
                />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base leading-tight">{productName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                          {t("return_pending_badge")}
                        </Badge>
                        {roomName && (
                          <span className="text-xs text-muted-foreground">{roomName}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-lg font-bold text-emerald-500">{req.totalPrice.toFixed(2)} ج.م</p>
                      <p className="text-xs text-muted-foreground">{req.quantity}×</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Order + session info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{t("return_order_num")} #{req.orderId}</span>
                    {req.sessionId && <span>Session #{req.sessionId}</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(req.orderedAt), "dd/MM hh:mm a")}
                    </span>
                  </div>

                  {/* Reason */}
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{ background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border)/0.5)" }}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{t("return_reason_label")}</p>
                    <p className="text-foreground leading-snug">{req.returnReason}</p>
                  </div>

                  {/* Requested by */}
                  {req.requestedByName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3 shrink-0" />
                      <span>{t("return_requested_by")}: <span className="font-medium text-foreground">{req.requestedByName}</span></span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
                      onClick={() => handleApprove(req.orderId, req.itemId)}
                      disabled={isApproving || isRejecting}
                    >
                      <CheckCircle className="h-3.5 w-3.5 me-1.5" />
                      {t("returns_approve_btn")}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 h-9 px-3"
                      onClick={() => handleReject(req.orderId, req.itemId)}
                      disabled={isApproving || isRejecting}
                    >
                      <XCircle className="h-3.5 w-3.5 me-1.5" />
                      {t("returns_reject_btn")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
