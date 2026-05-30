import { useListPayments, useVerifyPayment, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShieldAlert, CreditCard, Banknote } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Payments() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useListPayments();
  const verifyPayment = useVerifyPayment();

  const handleVerify = async (paymentId: number) => {
    try {
      await verifyPayment.mutateAsync({ paymentId, data: {} });
      toast.success("تم تأكيد الدفع بنجاح");
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ أثناء التأكيد");
    }
  };

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'instapay': return <CreditCard className="h-5 w-5 text-indigo-400" />;
      case 'visa': return <CreditCard className="h-5 w-5 text-blue-500" />;
      default: return <Banknote className="h-5 w-5 text-emerald-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const verifiedPayments = payments?.filter(p => p.status === 'verified') || [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">المدفوعات المعلقة</h2>
          <p className="text-muted-foreground mt-1">تأكيد مدفوعات انستا باي والفيزا التي تحتاج مراجعة الكاشير</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> يحتاج إلى تأكيد ({pendingPayments.length})
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingPayments.map(payment => (
            <Card key={payment.id} className="bg-card border-l-4 border-l-amber-500 shadow-md">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.method)}
                    <span className="font-bold uppercase tracking-wider">{payment.method}</span>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/50">معلق</Badge>
                </div>
                
                <div className="text-3xl font-bold text-foreground mb-4 font-mono">
                  {payment.amount.toFixed(2)} ج.م
                </div>

                {payment.instapayReference && (
                  <div className="bg-secondary/50 p-2 rounded text-sm mb-4 font-mono">
                    <span className="text-muted-foreground">الرقم المرجعي:</span> {payment.instapayReference}
                  </div>
                )}
                
                {payment.transactionReference && !payment.instapayReference && (
                  <div className="bg-secondary/50 p-2 rounded text-sm mb-4 font-mono">
                    <span className="text-muted-foreground">رقم العملية:</span> {payment.transactionReference}
                  </div>
                )}

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12"
                  onClick={() => handleVerify(payment.id)}
                  disabled={verifyPayment.isPending}
                >
                  <Check className="mr-2 h-5 w-5" />
                  تأكيد إستلام المبلغ
                </Button>
              </CardContent>
            </Card>
          ))}
          {pendingPayments.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
              لا توجد مدفوعات معلقة
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 space-y-4">
        <h3 className="text-lg font-bold text-muted-foreground">أحدث المدفوعات المؤكدة</h3>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4">رقم الجلسة</th>
                <th className="px-6 py-4">الطريقة</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">أكد بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {verifiedPayments.slice(0, 10).map(payment => (
                <tr key={payment.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="px-6 py-4 font-medium">#{payment.sessionId}</td>
                  <td className="px-6 py-4 font-medium uppercase text-xs">{payment.method}</td>
                  <td className="px-6 py-4 font-bold text-emerald-500 font-mono">{payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{payment.verifiedByUserName || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
