import { useGetSession, useCancelSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, Gamepad2, Receipt, AlertCircle, ShoppingCart, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const ACTION_LABELS: Record<string, string> = {
  started: "بدء الجلسة",
  paused: "إيقاف مؤقت",
  resumed: "استئناف",
  ended: "إنهاء الجلسة",
  cancelled: "إلغاء الجلسة",
};

const ACTION_COLORS: Record<string, string> = {
  started: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resumed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ended: "bg-secondary text-muted-foreground border-border",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function SessionDetail() {
  const params = useParams();
  const sessionId = params.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useGetSession(sessionId, {
    query: { 
      queryKey: getGetSessionQueryKey(sessionId),
      enabled: !!sessionId,
      refetchInterval: 10000 
    }
  });

  const cancelSession = useCancelSession();

  const handleCancel = async () => {
    try {
      await cancelSession.mutateAsync({ 
        sessionId, 
        data: { reason: "تم الإلغاء بواسطة المستخدم" } 
      });
      toast.success("تم إلغاء الجلسة");
      queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey(sessionId) });
    } catch (error) {
      toast.error("حدث خطأ أثناء إلغاء الجلسة");
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
    return <div className="p-8 text-center text-destructive">لم يتم العثور على الجلسة</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            جلسة #{session.id}
            {session.status === 'active' && <Badge className="bg-emerald-500 text-black">نشطة</Badge>}
            {session.status === 'paused' && <Badge className="bg-amber-500 text-black">متوقفة مؤقتاً</Badge>}
            {session.status === 'ended' && <Badge variant="secondary">منتهية</Badge>}
            {session.status === 'cancelled' && <Badge variant="destructive">ملغية</Badge>}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            {session.assetNameAr || session.assetName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              تفاصيل الوقت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">وقت البدء</p>
                <p className="font-bold">{format(new Date(session.startedAt), "hh:mm a")}</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">الوقت الإجمالي</p>
                <p className="font-bold">{session.totalMinutes ? `${Math.floor(session.totalMinutes / 60)}س ${session.totalMinutes % 60}د` : "-"}</p>
              </div>
            </div>
            
            {['active', 'paused'].includes(session.status) && (
              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={handleCancel}
                disabled={cancelSession.isPending}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                إلغاء الجلسة
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-500" />
              التكلفة والدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 bg-secondary/30 rounded-xl border border-border/50">
              <p className="text-muted-foreground mb-2">التكلفة الإجمالية (اللعب + الطلبات)</p>
              <p className="text-4xl font-bold text-emerald-500">{(session.totalCost || 0).toFixed(2)} ج.م</p>
            </div>
            
            {session.payments && session.payments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-bold mb-2">المدفوعات</h4>
                {session.payments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center bg-background p-3 rounded border border-border">
                    <div className="flex gap-2">
                      <Badge variant="outline">{payment.method}</Badge>
                      <Badge variant={payment.status === 'verified' ? "default" : "secondary"}>
                        {payment.status === 'verified' ? 'مؤكد' : 'معلق'}
                      </Badge>
                    </div>
                    <span className="font-bold">{payment.amount.toFixed(2)} ج.م</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              سجل الأحداث
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!session.sessionLogs || session.sessionLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                لا توجد أحداث مسجلة لهذه الجلسة
              </div>
            ) : (
              <ol className="relative border-r border-border/50 me-4 space-y-0">
                {session.sessionLogs.map((log, idx) => (
                  <li key={log.id} className="mb-6 me-6">
                    <span className="absolute -end-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border ring-4 ring-background text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className={`p-3 rounded-lg border ${ACTION_COLORS[log.action] ?? "bg-secondary/30 border-border"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "dd/MM hh:mm a")}
                        </span>
                      </div>
                      {(log.previousStatus || log.newStatus) && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {log.previousStatus && <span>{log.previousStatus}</span>}
                          {log.previousStatus && log.newStatus && <span className="mx-1">←</span>}
                          {log.newStatus && <span>{log.newStatus}</span>}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        بواسطة: {log.performedByName ?? `مستخدم #${log.performedByUserId}`}
                      </p>
                      {log.note && (
                        <p className="text-xs mt-1 italic text-muted-foreground">ملاحظة: {log.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              الطلبات المرتبطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.orders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                لا توجد طلبات مرتبطة بهذه الجلسة
              </div>
            ) : (
              <div className="space-y-4">
                {session.orders?.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-start border-b border-border/50 pb-4 last:border-0">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="font-bold">طلب #{order.id}</span>
                        <Badge variant={order.status === 'delivered' || order.status === 'closed' ? 'outline' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.map((item: any) => `${item.quantity}x ${item.productNameAr || item.productName}`).join('، ')}
                      </div>
                    </div>
                    <div className="font-bold text-emerald-500">
                      {order.totalAmount.toFixed(2)} ج.م
                    </div>
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
