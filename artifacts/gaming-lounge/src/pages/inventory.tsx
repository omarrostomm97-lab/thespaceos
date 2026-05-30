import { useListInventoryItems } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Inventory() {
  const { data: items, isLoading } = useListInventoryItems();

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
          <h2 className="text-3xl font-bold tracking-tight text-primary">المخزون</h2>
          <p className="text-muted-foreground mt-1">إدارة البضائع والمكونات وتتبع الكميات</p>
        </div>
        <Button>إضافة صنف جديد</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">الصنف</th>
              <th className="px-6 py-4">الوحدة</th>
              <th className="px-6 py-4">الرصيد الحالي</th>
              <th className="px-6 py-4">الحد الأدنى</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items?.map(item => {
              const isLow = item.currentStock <= (item.minStockLevel || 0);
              return (
                <tr key={item.id} className={`border-b border-border hover:bg-secondary/30 ${isLow ? 'bg-destructive/5' : ''}`}>
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {item.nameAr || item.name}
                  </td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className={`px-6 py-4 font-mono font-bold text-lg ${isLow ? 'text-destructive' : ''}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.minStockLevel || "-"}</td>
                  <td className="px-6 py-4">
                    {isLow ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-max">
                        <AlertTriangle className="h-3 w-3" />
                        نقص مخزون
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">متوفر</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm">تعديل الرصيد</Button>
                  </td>
                </tr>
              );
            })}
            {items?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">لا توجد أصناف في المخزون</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
