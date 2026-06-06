import { useListTenants, useImpersonateTenant } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Tenants() {
  const { data: tenants, isLoading } = useListTenants();
  const { enterImpersonation } = useAuth();
  const [, setLocation] = useLocation();
  const impersonate = useImpersonateTenant();

  const handleEnter = async (tenantId: number) => {
    try {
      const result = await impersonate.mutateAsync({ tenantId });
      enterImpersonation(result.token, result.tenant);
      setLocation("/dashboard");
    } catch {
      toast.error("تعذّر الدخول إلى هذا الفرع");
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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">إدارة الفروع (Tenants)</h2>
          <p className="text-muted-foreground mt-1">إدارة كافة المشتركين والفروع في النظام</p>
        </div>
        <Button disabled>إضافة فرع جديد</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[380px]">
            <thead className="bg-secondary text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 md:px-6 py-4">الاسم</th>
                <th className="px-4 md:px-6 py-4 hidden md:table-cell">الرابط التعريفي</th>
                <th className="px-4 md:px-6 py-4 hidden sm:table-cell">اللغة</th>
                <th className="px-4 md:px-6 py-4">الحالة</th>
                <th className="px-4 md:px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map(tenant => (
                <tr key={tenant.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="px-4 md:px-6 py-4 font-bold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p>{tenant.nameAr || tenant.name}</p>
                        <p className="text-xs text-muted-foreground font-mono md:hidden">{tenant.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-mono text-muted-foreground hidden md:table-cell" dir="ltr">{tenant.slug}</td>
                  <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      {tenant.language === 'en' ? 'English' : 'العربية'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    {tenant.isActive ? (
                      <Badge variant="outline" className="border-emerald-500 text-emerald-500">نشط</Badge>
                    ) : (
                      <Badge variant="secondary">موقوف</Badge>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-left">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleEnter(tenant.id)}
                      disabled={impersonate.isPending}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">دخول</span>
                    </Button>
                  </td>
                </tr>
              ))}
              {tenants?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">لا توجد فروع</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
