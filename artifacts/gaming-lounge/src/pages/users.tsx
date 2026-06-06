import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useActivateUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users as UsersIcon, UserPlus, UserX, UserCheck, Pencil, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";
import type { UserInputRole, UserUpdateRole } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerChildren, staggerItemVariants } from "@/components/motion";
import { cn } from "@/lib/utils";

const ROLES: Record<string, { ar: string; en: string; color: string }> = {
  owner:         { ar: "مالك",       en: "Owner",          color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  manager:       { ar: "مدير",       en: "Manager",        color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  cashier:       { ar: "كاشير",      en: "Cashier",        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  buffet_worker: { ar: "عامل بوفيه", en: "Buffet Worker",  color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

interface CreateForm {
  name: string;
  nameAr: string;
  email: string;
  password: string;
  role: string;
}

interface EditForm {
  userId: number;
  name: string;
  nameAr: string;
  role: string;
  password: string;
}

const BLANK_CREATE: CreateForm = { name: "", nameAr: "", email: "", password: "", role: "cashier" };

export default function Users() {
  const { t, dir, lang } = useLang();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useListUsers({ query: { refetchInterval: 30000 } as any });

  const createUser   = useCreateUser();
  const updateUser   = useUpdateUser();
  const deactivateMut = useDeactivateUser();
  const activateMut  = useActivateUser();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(BLANK_CREATE);
  const [showPassword, setShowPassword] = useState(false);
  const [editState, setEditState] = useState<EditForm | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const activeUsers   = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);

  const roleLabel = (role: string) => {
    const r = ROLES[role];
    if (!r) return role;
    return lang === "ar" ? r.ar : r.en;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    try {
      await createUser.mutateAsync({
        data: {
          name: createForm.name,
          nameAr: createForm.nameAr || undefined,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role as UserInputRole,
        },
      });
      toast.success(lang === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully");
      setCreateForm(BLANK_CREATE);
      setShowCreate(false);
      setShowPassword(false);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (err: any) {
      const code = err?.response?.data?.error;
      const msg = code === "email_taken"
        ? (lang === "ar" ? "البريد الإلكتروني مستخدم مسبقاً" : "Email already taken")
        : (lang === "ar" ? "حدث خطأ أثناء إنشاء المستخدم" : "Failed to create user");
      toast.error(msg);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState) return;
    try {
      await updateUser.mutateAsync({
        userId: editState.userId,
        data: {
          name: editState.name || undefined,
          nameAr: editState.nameAr || undefined,
          role: editState.role as UserUpdateRole,
          password: editState.password || undefined,
        },
      });
      toast.success(lang === "ar" ? "تم حفظ التعديلات" : "Changes saved");
      setEditState(null);
      setShowEditPassword(false);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ أثناء حفظ التعديلات" : "Failed to save changes");
    }
  };

  const handleDeactivate = async (userId: number, name: string) => {
    const msg = lang === "ar"
      ? `هل أنت متأكد من إيقاف تفعيل "${name}"؟`
      : `Deactivate "${name}"? They won't be able to log in.`;
    if (!confirm(msg)) return;
    try {
      await deactivateMut.mutateAsync({ userId });
      toast.success(lang === "ar" ? "تم إيقاف المستخدم" : "User deactivated");
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleActivate = async (userId: number, name: string) => {
    try {
      await activateMut.mutateAsync({ userId });
      toast.success(lang === "ar" ? `تم تفعيل "${name}"` : `"${name}" activated`);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
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
    <FadeIn className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{lang === "ar" ? "إدارة الموظفين" : "Staff Management"}</h1>
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "إضافة وتعديل وإدارة حسابات الموظفين" : "Add, edit, and manage staff accounts"}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          {lang === "ar" ? "موظف جديد" : "New Staff"}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ROLES).map(([role, info]) => {
          const count = activeUsers.filter(u => u.role === role).length;
          return (
            <div key={role} className="card-base rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", role === "owner" ? "bg-amber-400" : role === "manager" ? "bg-blue-400" : role === "cashier" ? "bg-emerald-400" : "bg-orange-400")} />
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? info.ar : info.en}</p>
                <p className="text-lg font-bold tabular-nums">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active users */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          {lang === "ar" ? `الموظفون النشطون (${activeUsers.length})` : `Active Staff (${activeUsers.length})`}
        </h2>

        {activeUsers.length === 0 ? (
          <div className="card-base rounded-xl py-12 text-center text-muted-foreground">
            <UsersIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>{lang === "ar" ? "لا يوجد موظفون بعد" : "No staff yet"}</p>
          </div>
        ) : (
          <StaggerChildren className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-sm" dir={dir}>
              <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "الاسم" : "Name"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "البريد" : "Email"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "الدور" : "Role"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "الحالة" : "Status"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map(u => {
                  const roleInfo = ROLES[u.role];
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <motion.tr key={u.id} variants={staggerItemVariants} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {(u.nameAr || u.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{u.nameAr || u.name}</p>
                            {u.nameAr && u.name && <p className="text-[10px] text-muted-foreground">{u.name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{u.email}</td>
                      <td className="px-5 py-3">
                        {roleInfo ? (
                          <Badge className={cn("text-[10px] border", roleInfo.color)}>{lang === "ar" ? roleInfo.ar : roleInfo.en}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {lang === "ar" ? "نشط" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => {
                              setEditState({ userId: u.id, name: u.name, nameAr: u.nameAr ?? "", role: u.role, password: "" });
                              setShowEditPassword(false);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {lang === "ar" ? "تعديل" : "Edit"}
                          </Button>
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeactivate(u.id, u.nameAr || u.name)}
                              disabled={deactivateMut.isPending}
                            >
                              <UserX className="h-3.5 w-3.5" />
                              {lang === "ar" ? "إيقاف" : "Deactivate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </StaggerChildren>
        )}
      </div>

      {/* Inactive users */}
      {inactiveUsers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <UserX className="h-4 w-4" />
            {lang === "ar" ? `الموظفون الموقوفون (${inactiveUsers.length})` : `Deactivated Staff (${inactiveUsers.length})`}
          </h2>
          <div className="rounded-xl border border-border overflow-hidden bg-card opacity-70">
            <table className="w-full text-sm" dir={dir}>
              <thead className="bg-secondary/60 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "الاسم" : "Name"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "البريد" : "Email"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "الدور" : "Role"}</th>
                  <th className="px-5 py-3 text-start">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {inactiveUsers.map(u => {
                  const roleInfo = ROLES[u.role];
                  return (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                            {(u.nameAr || u.name).charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-muted-foreground line-through">{u.nameAr || u.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{u.email}</td>
                      <td className="px-5 py-3">
                        {roleInfo ? (
                          <span className="text-xs text-muted-foreground">{lang === "ar" ? roleInfo.ar : roleInfo.en}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{u.role}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-emerald-500 hover:bg-emerald-500/10"
                          onClick={() => handleActivate(u.id, u.nameAr || u.name)}
                          disabled={activateMut.isPending}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          {activateMut.isPending
                            ? (lang === "ar" ? "جاري التفعيل..." : "Activating...")
                            : (lang === "ar" ? "إعادة تفعيل" : "Reactivate")}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); if (!v) { setCreateForm(BLANK_CREATE); setShowPassword(false); } }}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              {lang === "ar" ? "إضافة موظف جديد" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "ar" ? "الاسم (إنجليزي) *" : "Name (English) *"}</Label>
                <Input
                  value={createForm.name}
                  onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ahmed Hassan"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                <Input
                  value={createForm.nameAr}
                  onChange={e => setCreateForm(p => ({ ...p, nameAr: e.target.value }))}
                  placeholder="أحمد حسن"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{lang === "ar" ? "البريد الإلكتروني *" : "Email *"}</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ahmed@example.com"
                required
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{lang === "ar" ? "كلمة المرور *" : "Password *"}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="pe-10"
                />
                <button
                  type="button"
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{lang === "ar" ? "الدور" : "Role"}</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([role, info]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setCreateForm(p => ({ ...p, role }))}
                    className={cn(
                      "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors text-start",
                      createForm.role === role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {lang === "ar" ? info.ar : info.en}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={createUser.isPending} className="flex-1">
                {createUser.isPending
                  ? (lang === "ar" ? "جاري الإنشاء..." : "Creating...")
                  : (lang === "ar" ? "إنشاء الحساب" : "Create Account")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editState} onOpenChange={v => { if (!v) { setEditState(null); setShowEditPassword(false); } }}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              {lang === "ar" ? "تعديل بيانات الموظف" : "Edit Staff Member"}
            </DialogTitle>
          </DialogHeader>
          {editState && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
                  <Input
                    value={editState.name}
                    onChange={e => setEditState(s => s ? { ...s, name: e.target.value } : s)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                  <Input
                    value={editState.nameAr}
                    onChange={e => setEditState(s => s ? { ...s, nameAr: e.target.value } : s)}
                    placeholder={lang === "ar" ? "اختياري" : "Optional"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "ar" ? "الدور" : "Role"}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLES).map(([role, info]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setEditState(s => s ? { ...s, role } : s)}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors text-start",
                        editState.role === role
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {lang === "ar" ? info.ar : info.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "ar" ? "كلمة مرور جديدة (اتركها فارغة للإبقاء)" : "New Password (leave blank to keep)"}</Label>
                <div className="relative">
                  <Input
                    type={showEditPassword ? "text" : "password"}
                    value={editState.password}
                    onChange={e => setEditState(s => s ? { ...s, password: e.target.value } : s)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="pe-10"
                  />
                  <button
                    type="button"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowEditPassword(v => !v)}
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditState(null)} className="flex-1">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={updateUser.isPending} className="flex-1">
                  {updateUser.isPending
                    ? (lang === "ar" ? "جاري الحفظ..." : "Saving...")
                    : (lang === "ar" ? "حفظ التعديلات" : "Save Changes")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
