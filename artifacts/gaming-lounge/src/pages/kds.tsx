import { useListKdsOrders, useUpdateOrderStatus, getListKdsOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, UtensilsCrossed, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

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

export default function Kds() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListKdsOrders({
    query: { queryKey: getListKdsOrdersQueryKey(), refetchInterval: 5000 }
  });

  const updateStatus = useUpdateOrderStatus();
  const prevPendingCount = useRef<number | null>(null);
  const [alerting, setAlerting] = useState(false);

  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];

  useEffect(() => {
    const count = pendingOrders.length;
    if (prevPendingCount.current !== null && count > prevPendingCount.current) {
      playKitchenChime();
      setAlerting(true);
      const timer = setTimeout(() => setAlerting(false), 3000);
      return () => clearTimeout(timer);
    }
    prevPendingCount.current = count;
  }, [pendingOrders.length]);

  const handleUpdateStatus = async (orderId: number, status: 'preparing' | 'ready') => {
    try {
      await updateStatus.mutateAsync({ orderId, data: { status } });
      toast.success(status === 'preparing' ? "تم البدء في التحضير" : "الطلب جاهز للتسليم");
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

      {/* ── Pending Orders Column ── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
        <div
          className={`h-14 border-b flex items-center px-4 shrink-0 transition-colors duration-300 ${
            alerting
              ? "bg-destructive/30 border-destructive/40 animate-pulse"
              : "bg-destructive/10 border-destructive/20"
          }`}
        >
          <AlertCircle className={`h-5 w-5 mr-2 shrink-0 ${alerting ? "text-destructive" : "text-destructive"}`} />
          <h2 className="text-xl font-bold text-destructive flex-1">
            طلبات جديدة ({pendingOrders.length})
          </h2>
          {alerting && (
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 rounded-full px-2 py-0.5 border border-destructive/20 animate-bounce">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
              طلب جديد!
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <AlertCircle className="h-8 w-8 mb-2 opacity-30" />
              لا توجد طلبات جديدة
            </div>
          ) : pendingOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-destructive shadow-sm hover-elevate">
              <CardHeader className="py-3 px-4 bg-secondary/30">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base md:text-lg">
                    {order.assetNameAr || order.assetName ? `جهاز: ${order.assetNameAr || order.assetName}` : 'طلب مباشر'}
                  </CardTitle>
                  <span className="font-mono text-muted-foreground text-sm flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3 md:p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-base md:text-lg border-b border-border/50 last:border-0 pb-2 last:pb-0">
                      <span className="font-bold">{item.quantity}x {item.productNameAr || item.productName}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full h-12 md:h-14 rounded-t-none text-base md:text-lg font-bold bg-primary hover:bg-primary/90"
                  onClick={() => handleUpdateStatus(order.id, 'preparing')}
                  disabled={updateStatus.isPending}
                >
                  <UtensilsCrossed className="mr-2 h-5 w-5" />
                  بدء التحضير
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Preparing Orders Column ── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-0">
        <div className="h-14 bg-amber-500/10 border-b border-amber-500/20 flex items-center px-4 shrink-0">
          <UtensilsCrossed className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
          <h2 className="text-xl font-bold text-amber-500">جاري التحضير ({preparingOrders.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          {preparingOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <UtensilsCrossed className="h-8 w-8 mb-2 opacity-30" />
              لا توجد طلبات قيد التحضير
            </div>
          ) : preparingOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-amber-500 shadow-sm hover-elevate">
              <CardHeader className="py-3 px-4 bg-secondary/30">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base md:text-lg">
                    {order.assetNameAr || order.assetName ? `جهاز: ${order.assetNameAr || order.assetName}` : 'طلب مباشر'}
                  </CardTitle>
                  <span className="font-mono text-muted-foreground text-sm flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(order.preparingAt || order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3 md:p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-base md:text-lg border-b border-border/50 last:border-0 pb-2 last:pb-0">
                      <span className="font-bold">{item.quantity}x {item.productNameAr || item.productName}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full h-12 md:h-14 rounded-t-none text-base md:text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus(order.id, 'ready')}
                  disabled={updateStatus.isPending}
                >
                  <Check className="mr-2 h-5 w-5" />
                  جاهز للتسليم
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
