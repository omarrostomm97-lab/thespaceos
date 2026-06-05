import {
  useListUsers, useCreateUser, useDeactivateUser, useUpdateUser, useDeleteUser,
  useListTenants, getListUsersQueryKey, getListTenantsQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserX, Shield, Users, Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { UserInputRole, UserUpdateRole } from "@workspace/api-client-react";

const ROLES: Record<string, { label: string; color: string }> = {
  platform_owner: { label: "مدير النظام", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  owner: { label: "مالك", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  manager: { label: "مدير", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  cashier: { label: "كاشير", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  buffet_worker: { label: "عامل بوفيه", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

interface EditState {
  userId: number;
  name: string;
  nameAr: string;
  email: string;
  role: string;
  password: string;
  tenantId: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const isPlatformOwner = currentUser?.role === "platform_owner";
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useListUsers();
  const { data: tenants } = useListTenants({ query: { queryKey: getListTenantsQueryKey(), enabled: isPlatformOwner } });
  const createUser = useCreateUser();
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", nameAr: "", email: "", password: "", role: "cashier", tenantId: "",
  });
  const [editState, setEditState] = useState<EditState | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    try {
      const payload: Parameters<typeof createUser.mutateAsync>[0]["data"] = {
        name: form.name,
        nameAr: form.nameAr || undefined,
        email: form.email,
        password: form.password,
        role: form.role as UserInputRole,
        tenantId: isPlatformOwner && form.tenantId ? parseInt(form.tenantId) : undefined,
      };
      await createUser.mutateAsync({ data: payload });
      toast.success("تم إنشاء المستخدم بنجاح");
      setForm({ name: "", nameAr: "", email: "", password: "", role: "cashier", tenantId: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "حدث خطأ أثناء إنشاء المستخدم";
      toast.error(msg);
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

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`سيتم حذف "${userName}" نهائياً ولا يمكن التراجع. هل أنت متأكد؟`)) return;
    try {
      await deleteUser.mutateAsync({ userId });
      toast.success("تم حذف المستخدم نهائياً");
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const startEdit = (u: NonNullable<typeof users>[number]) => {
    setEditState({
      userId: u.id,
      name: u.name,
      nameAr: u.nameAr ?? "",
      email: u.email,
      role: u.role,
      password: "",
      tenantId: u.tenantId ? String(u.tenantId) : "",
    });
  };

  const cancelEdit = () => setEditState(null);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState) return;
    try {
      const data: Parameters<typeof updateUser.mutateAsync>[0]["data"] = {
        name: editState.name || undefined,
        nameAr: editState.nameAr || undefined,
        email: isPlatformOwner && editState.email ? editState.email : undefined,
        role: editState.role as UserUpdateRole,
        password: editState.password || undefined,
        tenantId: isPlatformOwner
          ? (editState.tenantId ? parseInt(editState.tenantId) : null)
          : undefined,
      };
      await updateUser.mutateAsync({ userId: editState.userId, data });
      toast.success("تم حفظ التعديلات");
      setEditState(null);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "حدث خطأ أثناء حفظ التعديلات";
      toast.error(msg);
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

  const tenantName = (tenantId: number | null | undefined) => {
    if (!tenantId || !tenants) return "—";
    const t = tenants.find(t => t.id === tenantId);
    return t ? (t.nameAr || t.name) : `#${tenantId}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Shield className="h-8 w-8" />
            إدارة المستخدمين
          </h2>
          <p className="text-muted-foreground mt-1">
            {isPlatformOwner ? "كافة المستخدمين عبر جميع الفروع" : "مستخدمو هذا الفرع"}
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
              <div className="space-y-1">
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
              {isPlatformOwner && (
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">الفرع</label>
                  <select
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-right"
                    value={form.tenantId}
                    onChange={e => setForm(p => ({ ...p, tenantId: e.target.value }))}
                  >
                    <option value="">— اختر الفرع —</option>
                    {tenants?.map(t => (
                      <option key={t.id} value={t.id}>{t.nameAr || t.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
                {isPlatformOwner && <th className="px-6 py-4">الفرع</th>}
                <th className="px-6 py-4">الدور</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => {
                const role = ROLES[u.role] ?? { label: u.role, color: "bg-secondary text-foreground border-border" };
                const isSelf = u.id === currentUser?.id;
                const isEditing = editState?.userId === u.id;

                if (isEditing && editState) {
                  return (
                    <tr key={u.id} className="border-b border-border bg-primary/5">
                      <td colSpan={isPlatformOwner ? 6 : 5} className="px-6 py-4">
                        <form onSubmit={handleSaveEdit} className="flex flex-wrap gap-3 items-end">
                          <div className="space-y-1 min-w-[140px]">
                            <label className="text-xs text-muted-foreground">الاسم (إنجليزي)</label>
                            <input
                              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                              value={editState.name}
                              onChange={e => setEditState(s => s ? { ...s, name: e.target.value } : s)}
                            />
                          </div>
                          <div className="space-y-1 min-w-[140px]">
                            <label className="text-xs text-muted-foreground">الاسم (عربي)</label>
                            <input
                              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                              value={editState.nameAr}
                              onChange={e => setEditState(s => s ? { ...s, nameAr: e.target.value } : s)}
                              placeholder="اختياري"
                            />
                          </div>
                          {isPlatformOwner && (
                            <div className="space-y-1 min-w-[190px]">
                              <label className="text-xs text-muted-foreground">البريد الإلكتروني</label>
                              <input
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                                type="email"
                                value={editState.email}
                                onChange={e => setEditState(s => s ? { ...s, email: e.target.value } : s)}
                              />
                            </div>
                          )}
                          <div className="space-y-1 min-w-[120px]">
                            <label className="text-xs text-muted-foreground">الدور</label>
                            <select
                              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                              value={editState.role}
                              onChange={e => setEditState(s => s ? { ...s, role: e.target.value } : s)}
                            >
                              {Object.entries(ROLES).filter(([r]) => r !== "platform_owner").map(([value, { label }]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>
                          {isPlatformOwner && (
                            <div className="space-y-1 min-w-[160px]">
                              <label className="text-xs text-muted-foreground">الفرع</label>
                              <select
                                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                                value={editState.tenantId}
                                onChange={e => setEditState(s => s ? { ...s, tenantId: e.target.value } : s)}
                              >
                                <option value="">— بدون فرع —</option>
                                {tenants?.map(t => (
                                  <option key={t.id} value={t.id}>{t.nameAr || t.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div className="space-y-1 min-w-[140px]">
                            <label className="text-xs text-muted-foreground">كلمة مرور جديدة (اختياري)</label>
                            <input
                              className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-right"
                              type="password"
                              value={editState.password}
                              onChange={e => setEditState(s => s ? { ...s, password: e.target.value } : s)}
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="flex gap-2 pb-0.5">
                            <Button type="submit" size="sm" className="gap-1" disabled={updateUser.isPending}>
                              <Check className="h-3.5 w-3.5" />
                              حفظ
                            </Button>
                            <Button type="button" size="sm" variant="outline" className="gap-1" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5" />
                              إلغاء
                            </Button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={u.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-6 py-4 font-medium">{u.nameAr || u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                    {isPlatformOwner && (
                      <td className="px-6 py-4 text-muted-foreground text-xs">{tenantName(u.tenantId)}</td>
                    )}
                    <td className="px-6 py-4">
                      <Badge className={`text-xs border ${role.color}`}>{role.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">نشط</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => startEdit(u)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </Button>
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
                        {isPlatformOwner && !isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-600/10 gap-1"
                            onClick={() => handleDelete(u.id, u.nameAr || u.name)}
                            disabled={deleteUser.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={isPlatformOwner ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">لا يوجد مستخدمون نشطون</td>
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
                  {isPlatformOwner && <th className="px-6 py-4">الفرع</th>}
                  <th className="px-6 py-4">الدور</th>
                  {isPlatformOwner && <th className="px-6 py-4">إجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {inactiveUsers.map(u => {
                  const role = ROLES[u.role] ?? { label: u.role, color: "" };
                  return (
                    <tr key={u.id} className="border-b border-border">
                      <td className="px-6 py-4 line-through text-muted-foreground">{u.nameAr || u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                      {isPlatformOwner && (
                        <td className="px-6 py-4 text-muted-foreground text-xs">{tenantName(u.tenantId)}</td>
                      )}
                      <td className="px-6 py-4 text-muted-foreground text-xs">{role.label}</td>
                      {isPlatformOwner && (
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-600/10 gap-1"
                            onClick={() => handleDelete(u.id, u.nameAr || u.name)}
                            disabled={deleteUser.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف
                          </Button>
                        </td>
                      )}
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
