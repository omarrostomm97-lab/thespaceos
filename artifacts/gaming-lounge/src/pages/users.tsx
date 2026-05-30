import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Shield } from "lucide-react";

export default function Users() {
  const { data: users, isLoading } = useListUsers();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'owner': return <Badge className="bg-primary">المالك</Badge>;
      case 'manager': return <Badge variant="default">مدير فرع</Badge>;
      case 'cashier': return <Badge variant="outline" className="border-emerald-500 text-emerald-500">كاشير</Badge>;
      case 'buffet_worker': return <Badge variant="outline" className="border-amber-500 text-amber-500">مطبخ / بوفيه</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">المستخدمين</h2>
          <p className="text-muted-foreground mt-1">إدارة حسابات وصلاحيات الموظفين</p>
        </div>
        <Button>إضافة مستخدم جديد</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm text-right">
          <thead className="bg-secondary text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">الاسم</th>
              <th className="px-6 py-4">البريد الإلكتروني</th>
              <th className="px-6 py-4">الصلاحية</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs">
                    {user.nameAr?.charAt(0) || user.name.charAt(0)}
                  </div>
                  {user.nameAr || user.name}
                </td>
                <td className="px-6 py-4 text-muted-foreground font-mono text-xs" dir="ltr">{user.email}</td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> نشط
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs font-bold">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" /> موقوف
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-left">
                  <Button variant="ghost" size="sm">تعديل</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
