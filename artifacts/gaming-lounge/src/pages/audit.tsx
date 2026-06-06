import { useListAuditLogs } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function Audit() {
  const { data, isLoading } = useListAuditLogs();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const logs = data?.data || [];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">سجل العمليات (Audit)</h2>
          <p className="text-muted-foreground mt-1">تتبع دقيق لجميع حركات وتعديلات المستخدمين</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[560px]">
            <thead className="bg-secondary text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-4">الوقت</th>
                <th className="px-4 md:px-6 py-4">المستخدم</th>
                <th className="px-4 md:px-6 py-4">العملية</th>
                <th className="px-4 md:px-6 py-4">العنصر</th>
                <th className="px-4 md:px-6 py-4">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="px-4 md:px-6 py-4 font-mono text-muted-foreground text-xs" dir="ltr">
                    {format(new Date(log.createdAt), "dd/MM/yyyy")} {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                  </td>
                  <td className="px-4 md:px-6 py-4 font-bold">{log.userName || "نظام"}</td>
                  <td className="px-4 md:px-6 py-4">
                    <Badge variant="outline" className="bg-secondary">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="font-mono bg-secondary/50 px-2 py-1 rounded">
                      {log.entityType} #{log.entityId}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground text-xs">
                    {log.oldValue && <div>قبل: {log.oldValue}</div>}
                    {log.newValue && <div>بعد: {log.newValue}</div>}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">لا توجد سجلات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
