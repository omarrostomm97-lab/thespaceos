import { useGetCurrentShift, useListShifts, useOpenShift, useCloseShift, getGetCurrentShiftQueryKey, getListShiftsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Wallet, CheckSquare, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Shifts() {
  const queryClient = useQueryClient();
  const { data: currentShift, isLoading: isLoadingCurrent, isError: isCurrentShiftError } = useGetCurrentShift();
  const { data: shifts, isLoading: isLoadingList } = useListShifts();
  
  const openShift = useOpenShift();
  const closeShift = useCloseShift();

  const [openingCash, setOpeningCash] = useState("");
  const [actualCash, setActualCash] = useState("");

  const handleOpen = async () => {
    if (!openingCash) return;
    try {
      await openShift.mutateAsync({ data: { openingCash: parseFloat(openingCash) } });
      toast.success("تم فتح الوردية بنجاح");
      setOpeningCash("");
      queryClient.invalidateQueries({ queryKey: getGetCurrentShiftQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ أثناء فتح الوردية");
    }
  };

  const handleClose = async () => {
    if (!actualCash) return;
    try {
      await closeShift.mutateAsync({ shiftId: currentShift!.id, data: { actualCash: parseFloat(actualCash) } });
      toast.success("تم إغلاق الوردية بنجاح");
      setActualCash("");
      queryClient.invalidateQueries({ queryKey: getGetCurrentShiftQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ أثناء إغلاق الوردية");
    }
  };

  if ((isLoadingCurrent && !isCurrentShiftError) || isLoadingList) {
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
          <h2 className="text-3xl font-bold tracking-tight text-primary">إدارة الورديات</h2>
          <p className="text-muted-foreground mt-1">فتح وإغلاق ورديات العمليات وحساب النقدية</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-2 border-primary">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              الوردية الحالية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!currentShift ? (
              <div className="space-y-4">
                <div className="bg-amber-500/10 text-amber-500 p-4 rounded-lg flex items-center gap-3 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-bold">لا توجد وردية مفتوحة حالياً. يرجى فتح وردية للبدء في تلقي الطلبات.</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium mb-2">النقدية الافتتاحية (الدرج)</label>
                  <div className="flex gap-3">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      className="h-12 text-lg font-bold"
                    />
                    <Button 
                      className="h-12 px-8 font-bold" 
                      onClick={handleOpen}
                      disabled={openShift.isPending || !openingCash}
                    >
                      فتح الوردية
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">مسؤول الوردية</p>
                    <p className="font-bold text-lg">{currentShift.userName}</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">وقت الفتح</p>
                    <p className="font-bold text-lg font-mono">{format(new Date(currentShift.openedAt), "HH:mm")}</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">النقدية الافتتاحية</span>
                    <span className="font-mono">{currentShift.openingCash.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-primary/20">
                    <span className="text-primary">النقدية المتوقعة بالدرج</span>
                    <span className="font-mono text-emerald-500">{currentShift.expectedCash?.toFixed(2) || "0.00"} ج.م</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <label className="block text-sm font-bold text-destructive">إغلاق الوردية (العهدية الفعلية)</label>
                  <div className="flex gap-3">
                    <Input 
                      type="number" 
                      placeholder="النقدية الفعلية الموجودة" 
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      className="h-12 text-lg font-bold border-destructive focus-visible:ring-destructive"
                    />
                    <Button 
                      variant="destructive"
                      className="h-12 px-8 font-bold" 
                      onClick={handleClose}
                      disabled={closeShift.isPending || !actualCash}
                    >
                      <CheckSquare className="ml-2 h-4 w-4" />
                      إغلاق
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              سجل الورديات السابقة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-sm text-right">
                <thead className="bg-secondary text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-4 py-3">المسؤول</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">العجز/الزيادة</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts?.filter(s => s.status === 'closed').map(shift => (
                    <tr key={shift.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="px-4 py-3 font-medium">{shift.userName}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(shift.openedAt), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${
                          (shift.difference || 0) < 0 ? 'text-destructive' : 
                          (shift.difference || 0) > 0 ? 'text-emerald-500' : 
                          'text-muted-foreground'
                        }`}>
                          {shift.difference != null ? shift.difference.toFixed(2) : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shifts?.filter(s => s.status === 'closed').length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">لا توجد ورديات مغلقة</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
