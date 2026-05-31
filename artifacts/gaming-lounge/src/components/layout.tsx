import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Monitor, Gamepad2, ShoppingCart, UtensilsCrossed,
  Package, Clock, ReceiptText, Users, ShieldAlert, Settings, LogOut,
  TrendingUp, BookOpen, ChefHat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTE_ALLOWED_ROLES, UserRole } from "@/lib/permissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  routeKey: string;
}

const navigation: NavItem[] = [
  { name: "اللوحة الرئيسية",    href: "/dashboard",   icon: LayoutDashboard, routeKey: "/dashboard" },
  { name: "الأجهزة",             href: "/assets",      icon: Gamepad2,        routeKey: "/assets" },
  { name: "الجلسات",             href: "/sessions",    icon: Clock,           routeKey: "/sessions" },
  { name: "نقطة البيع",          href: "/pos",         icon: Monitor,         routeKey: "/pos" },
  { name: "شاشة المطبخ",         href: "/kds",         icon: ChefHat,         routeKey: "/kds" },
  { name: "الطلبات",             href: "/orders",      icon: ShoppingCart,    routeKey: "/orders" },
  { name: "المنيو",              href: "/menu",        icon: UtensilsCrossed, routeKey: "/menu" },
  { name: "المخزون",             href: "/inventory",   icon: Package,         routeKey: "/inventory" },
  { name: "الورديات",            href: "/shifts",      icon: Clock,           routeKey: "/shifts" },
  { name: "المدفوعات",           href: "/payments",    icon: ReceiptText,     routeKey: "/payments" },
  { name: "الوصفات",             href: "/recipes",     icon: BookOpen,        routeKey: "/recipes" },
  { name: "أداء الموظفين",       href: "/performance", icon: TrendingUp,      routeKey: "/performance" },
  { name: "المستخدمين",          href: "/users",       icon: Users,           routeKey: "/users" },
  { name: "سجل العمليات",        href: "/audit",       icon: ShieldAlert,     routeKey: "/audit" },
  { name: "الإعدادات",           href: "/settings",    icon: Settings,        routeKey: "/settings" },
];

const ROLE_LABELS: Record<string, string> = {
  platform_owner: "مالك النظام",
  owner: "مالك",
  manager: "مدير",
  cashier: "كاشير",
  buffet_worker: "عامل بوفيه",
};

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const role = user?.role as UserRole | undefined;

  const visibleNav = navigation.filter((item) => {
    const allowed = ROUTE_ALLOWED_ROLES[item.routeKey];
    if (!allowed) return true;
    return role ? allowed.includes(role) : false;
  });

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-sidebar flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <h1 className="text-xl font-bold text-primary">نظام جيمينج لاونج</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleNav.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.routeKey} href={item.href}>
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
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <span className="text-sm font-bold text-primary">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user?.nameAr || user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{ROLE_LABELS[user?.role ?? ""] || user?.role}</span>
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
