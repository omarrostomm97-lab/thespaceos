import { useListKdsOrders, useUpdateOrderStatus, getListKdsOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, UtensilsCrossed, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Kds() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListKdsOrders({
    query: { refetchInterval: 5000 }
  });

  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = async (orderId: number, status: 'preparing' | 'ready') => {
    try {
      await updateStatus.mutateAsync({ orderId, data: { status } });
      toast.success(status === 'preparing' ? "تم البدء في التحضير" : "الطلب جاهز للتسليم");
      queryClient.invalidateQueries({ queryKey: getListKdsOrdersQueryKey() });
    } catch (error) {
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

  // Group orders by status
  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] p-4 gap-4 bg-background">
      {/* Pending Orders Column */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        <div className="h-14 bg-destructive/10 border-b border-destructive/20 flex items-center px-4 shrink-0">
          <AlertCircle className="h-5 w-5 text-destructive mr-2" />
          <h2 className="text-xl font-bold text-destructive">طلبات جديدة ({pendingOrders.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pendingOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-destructive shadow-sm hover-elevate">
              <CardHeader className="py-3 px-4 bg-secondary/30">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {order.assetNameAr || order.assetName ? `جهاز: ${order.assetNameAr || order.assetName}` : 'طلب مباشر'}
                  </CardTitle>
                  <span className="font-mono text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-lg border-b border-border/50 last:border-0 pb-2 last:pb-0">
                      <span className="font-bold">{item.quantity}x {item.productNameAr || item.productName}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full h-14 rounded-t-none text-lg font-bold bg-primary hover:bg-primary/90"
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

      {/* Preparing Orders Column */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        <div className="h-14 bg-amber-500/10 border-b border-amber-500/20 flex items-center px-4 shrink-0">
          <UtensilsCrossed className="h-5 w-5 text-amber-500 mr-2" />
          <h2 className="text-xl font-bold text-amber-500">جاري التحضير ({preparingOrders.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {preparingOrders.map(order => (
            <Card key={order.id} className="border-l-4 border-l-amber-500 shadow-sm hover-elevate">
              <CardHeader className="py-3 px-4 bg-secondary/30">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {order.assetNameAr || order.assetName ? `جهاز: ${order.assetNameAr || order.assetName}` : 'طلب مباشر'}
                  </CardTitle>
                  <span className="font-mono text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.preparingAt || order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-lg border-b border-border/50 last:border-0 pb-2 last:pb-0">
                      <span className="font-bold">{item.quantity}x {item.productNameAr || item.productName}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full h-14 rounded-t-none text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
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
