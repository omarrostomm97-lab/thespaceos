import { useListOrders, getListOrdersQueryKey, useUpdateOrderStatus } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, QrCode, Monitor, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Orders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useListOrders({
    query: { refetchInterval: 10000 }
  });
  
  const updateStatus = useUpdateOrderStatus();

  const handleDeliver = async (orderId: number) => {
    try {
      await updateStatus.mutateAsync({ orderId, data: { status: 'delivered' } });
      toast.success("تم تسليم الطلب");
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="destructive" className="px-3 py-1">جديد</Badge>;
      case 'preparing': return <Badge className="bg-amber-500 text-black px-3 py-1">جاري التحضير</Badge>;
      case 'ready': return <Badge className="bg-emerald-500 text-black px-3 py-1">جاهز للتسليم</Badge>;
      case 'delivered': return <Badge variant="outline" className="text-emerald-500 border-emerald-500 px-3 py-1">تم التسليم</Badge>;
      case 'closed': return <Badge variant="secondary" className="px-3 py-1">مغلق (تم الدفع)</Badge>;
      case 'cancelled': return <Badge variant="secondary" className="text-muted-foreground px-3 py-1">ملغي</Badge>;
      default: return <Badge>{status}</Badge>;
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">سجل الطلبات</h2>
          <p className="text-muted-foreground mt-1">تتبع كافة الطلبات من المنيو الرقمي ونقطة البيع</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 h-12 bg-secondary/50">
          <TabsTrigger value="active" className="text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الطلبات النشطة
          </TabsTrigger>
          <TabsTrigger value="history" className="text-base font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            سجل الطلبات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6 space-y-4">
          {orders?.filter(o => !['closed', 'cancelled'].includes(o.status)).map(order => (
            <Card key={order.id} className="overflow-hidden border-border bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-secondary/30 p-6 flex flex-col justify-center items-center md:w-48 border-l border-border/50">
                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(order.createdAt), "HH:mm")}
                    </div>
                    <div className="font-bold text-xl mb-3 text-center">
                      {order.assetNameAr || order.assetName || "طلب مباشر"}
                    </div>
                    <div className="flex gap-2 items-center">
                      {order.source === 'qr' ? (
                        <Badge variant="outline" className="border-primary/50 text-primary">QR Menu</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500">POS</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">رقم الطلب #{order.id}</span>
                          <div>{getStatusBadge(order.status)}</div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-500">
                          {order.totalAmount.toFixed(2)} ج.م
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4 bg-background p-4 rounded-lg border border-border/50">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{item.quantity}x {item.productNameAr || item.productName}</span>
                            <span className="text-muted-foreground">{item.totalPrice.toFixed(2)} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {order.status === 'ready' && (
                      <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-8"
                          onClick={() => handleDeliver(order.id)}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          تأكيد التسليم
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders?.filter(o => !['closed', 'cancelled'].includes(o.status)).length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold">لا توجد طلبات نشطة حالياً</h3>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-6 space-y-4">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-secondary text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">الوقت</th>
                  <th className="px-6 py-4">المصدر</th>
                  <th className="px-6 py-4">الجهاز</th>
                  <th className="px-6 py-4">الإجمالي</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders?.filter(o => ['closed', 'cancelled'].includes(o.status)).map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</td>
                    <td className="px-6 py-4">
                      {order.source === 'qr' ? 'QR Menu' : 'POS'}
                    </td>
                    <td className="px-6 py-4">{order.assetNameAr || order.assetName || "-"}</td>
                    <td className="px-6 py-4 font-bold">{order.totalAmount.toFixed(2)} ج.م</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
