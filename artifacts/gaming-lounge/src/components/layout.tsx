import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Monitor, Gamepad2, ShoppingCart, Menu, Package, Clock, ReceiptText, Users, ShieldAlert, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "اللوحة الرئيسية", href: "/dashboard", icon: LayoutDashboard },
    { name: "الأجهزة والجلسات", href: "/assets", icon: Gamepad2 },
    { name: "الجلسات النشطة", href: "/sessions", icon: Clock },
    { name: "نقطة البيع (POS)", href: "/pos", icon: Monitor },
    { name: "شاشة المطبخ (KDS)", href: "/kds", icon: Menu },
    { name: "الطلبات", href: "/orders", icon: ShoppingCart },
    { name: "المنيو", href: "/menu", icon: Menu },
    { name: "المخزون", href: "/inventory", icon: Package },
    { name: "الورديات", href: "/shifts", icon: Clock },
    { name: "المدفوعات", href: "/payments", icon: ReceiptText },
    { name: "المستخدمين", href: "/users", icon: Users },
    { name: "سجل العمليات", href: "/audit", icon: ShieldAlert },
    { name: "الإعدادات", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-sidebar flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <h1 className="text-xl font-bold text-primary">نظام جيمينج لاونج</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user?.nameAr || user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
