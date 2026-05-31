import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Monitor, Gamepad2, ShoppingCart, UtensilsCrossed,
  Package, Clock, ReceiptText, Users, ShieldAlert, Settings, LogOut,
  TrendingUp, BookOpen, ChefHat, HelpCircle,
} from "lucide-react";
import { ROUTE_ALLOWED_ROLES, UserRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";

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

  const initials =
    user?.nameAr?.charAt(0) ||
    user?.name?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* ─── Sidebar ──────────────────────────────────── */}
      <aside className="w-64 border-l border-sidebar-border bg-sidebar flex flex-col shrink-0">

        {/* Brand + User Profile */}
        <div className="px-4 pt-5 pb-3 shrink-0">
          {/* Brand row */}
          <div className="flex items-center gap-2.5 px-1 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">جيمينج لاونج</span>
          </div>

          {/* User card */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar with gradient ring */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-primary via-blue-400 to-indigo-500">
                  <div className="w-full h-full rounded-full bg-sidebar flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{initials}</span>
                  </div>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-[2px] border-sidebar" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                  {user?.nameAr || user?.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {ROLE_LABELS[user?.role ?? ""] || user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-5 pb-1.5 shrink-0">
          التنقل
        </p>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          {visibleNav.map((item) => {
            const isActive =
              location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.routeKey} href={item.href}>
                <motion.div
                  whileHover={isActive ? {} : { x: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 select-none",
                    isActive
                      ? "bg-primary text-white font-medium"
                      : "text-sidebar-foreground/55 hover:bg-white/[0.05] hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom pinned */}
        <div className="px-3 py-3 border-t border-sidebar-border shrink-0 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/45 hover:text-sidebar-foreground hover:bg-white/[0.05] transition-colors duration-150 text-sm">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>المساعدة والمعلومات</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/45 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors duration-150 text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
