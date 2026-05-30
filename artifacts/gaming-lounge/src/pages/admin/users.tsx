import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Admin Users placeholder (platform owner only)
export default function AdminUsers() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">المستخدمين (مدير النظام)</h2>
          <p className="text-muted-foreground mt-1">إدارة كافة المستخدمين عبر جميع الفروع</p>
        </div>
      </div>

      <Card className="bg-card">
        <CardContent className="p-12 text-center text-muted-foreground">
          <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">قريباً</h3>
          <p>شاشة إدارة مستخدمي النظام العام قيد التطوير</p>
        </CardContent>
      </Card>
    </div>
  );
}
