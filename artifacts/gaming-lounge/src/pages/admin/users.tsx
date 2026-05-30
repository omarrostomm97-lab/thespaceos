import { useListUsers, useCreateUser, useDeactivateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserX, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { UserInputRole } from "@workspace/api-client-react";

const ROLES: Record<string, { label: string; color: string }> = {
  platform_owner: { label: "مدير النظام", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  owner: { label: "مالك", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  manager: { label: "مدير", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  cashier: { label: "كاشير", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  buffet_worker: { label: "عامل بوفيه", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  const createUser = useCreateUser();
  const deactivateUser = useDeactivateUser();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", nameAr: "", email: "", password: "", role: "cashier" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    try {
      await createUser.mutateAsync({ data: { ...form, role: form.role as UserInputRole } });
      toast.success("تم إنشاء المستخدم بنجاح");
      setForm({ name: "", nameAr: "", email: "", password: "", role: "cashier" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    }
  };

  const handleDeactivate = async (userId: number, userName: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء تفعيل المستخدم "${userName}"؟`)) return;
    try {
      await deactivateUser.mutateAsync({ userId });
      toast.success("تم إلغاء تفعيل المستخدم");
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error("حدث خطأ أثناء إلغاء التفعيل");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeUsers = users?.filter(u => u.isActive) ?? [];
  const inactiveUsers = users?.filter(u => !u.isActive) ?? [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Shield className="h-8 w-8" />
            إدارة المستخدمين
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentUser?.role === "platform_owner" ? "كافة المستخدمين عبر جميع الفروع" : "مستخدمو هذا الفرع"}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          مستخدم جديد
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">إضافة مستخدم جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">الاسم (بالإنجليزية) *</label>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ahmed Hassan"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">الاسم (بالعربية)</label>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                  value={form.nameAr}
                  onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                  placeholder="أحمد حسن"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">البريد الإلكتروني *</label>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">كلمة المرور *</label>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-sm text-muted-foreground">الدور</label>
                <select
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                >
                  {Object.entries(ROLES).filter(([r]) => r !== "platform_owner").map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "جارٍ الإنشاء..." : "إنشاء المستخدم"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          المستخدمون النشطون ({activeUsers.length})
        </h3>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead className="bg-secondary text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">البريد الإلكتروني</th>
                <th className="px-6 py-4">الدور</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => {
                const role = ROLES[u.role] ?? { label: u.role, color: "bg-secondary text-foreground border-border" };
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-6 py-4 font-medium">{u.nameAr || u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge className={`text-xs border ${role.color}`}>{role.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">نشط</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {!isSelf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => handleDeactivate(u.id, u.nameAr || u.name)}
                          disabled={deactivateUser.isPending}
                        >
                          <UserX className="h-4 w-4" />
                          إلغاء التفعيل
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">لا يوجد مستخدمون نشطون</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inactiveUsers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">المستخدمون غير النشطين ({inactiveUsers.length})</h3>
          <div className="bg-card rounded-lg border border-border overflow-hidden opacity-60">
            <table className="w-full text-sm text-right">
              <thead className="bg-secondary text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الدور</th>
                </tr>
              </thead>
              <tbody>
                {inactiveUsers.map(u => {
                  const role = ROLES[u.role] ?? { label: u.role, color: "" };
                  return (
                    <tr key={u.id} className="border-b border-border">
                      <td className="px-6 py-4 line-through text-muted-foreground">{u.nameAr || u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{role.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
