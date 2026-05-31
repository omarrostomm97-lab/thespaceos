import { useGetSession, useCancelSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Clock, Gamepad2, Receipt, AlertCircle, ShoppingCart, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/hooks/use-language";

const ACTION_COLORS: Record<string, string> = {
  started:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused:    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resumed:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ended:     "bg-secondary text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function SessionDetail() {
  const { t, dir, lang } = useLang();
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

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync({ sessionId, data: { reason: t("cancel_reason_default") } });
      toast.success(t("cancel_ok"));
      queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
    } catch {
      toast.error(t("cancel_error"));
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

  return (
    <div className="p-8 space-y-6">
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
            {session.assetNameAr || session.assetName}
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
                <p className="text-sm text-muted-foreground">{t("total_time")}</p>
                <p className="font-bold">
                  {session.totalMinutes
                    ? `${Math.floor(session.totalMinutes / 60)}${lang === "ar" ? "س" : "h"} ${session.totalMinutes % 60}${lang === "ar" ? "د" : "m"}`
                    : "—"}
                </p>
              </div>
            </div>

            {["active", "paused"].includes(session.status) && (
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
            <div className="text-center py-6 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-muted-foreground mb-2">{t("total_cost_label")}</p>
              <p className="text-4xl font-bold text-emerald-500">{(session.totalCost || 0).toFixed(2)} ج.م</p>
            </div>

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
                {session.sessionLogs.map((log, idx) => (
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

        {/* Related orders */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              {t("related_orders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.orders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                {t("no_related_orders")}
              </div>
            ) : (
              <div className="space-y-4">
                {session.orders?.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-start border-b border-border/50 pb-4 last:border-0">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="font-bold">{t("order_label")} #{order.id}</span>
                        <Badge variant={order.status === "delivered" || order.status === "closed" ? "outline" : "default"}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.map((item: any) => `${item.quantity}x ${item.productNameAr || item.productName}`).join("، ")}
                      </div>
                    </div>
                    <div className="font-bold text-emerald-500">{order.totalAmount.toFixed(2)} ج.م</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
