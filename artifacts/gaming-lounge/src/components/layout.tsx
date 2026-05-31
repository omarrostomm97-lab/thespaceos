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
  owner:          "مالك",
  manager:        "مدير",
  cashier:        "كاشير",
  buffet_worker:  "عامل بوفيه",
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

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col shrink-0 relative overflow-hidden"
        style={{
          background: "hsl(0 0% 3%)",
          borderLeft: "1px solid hsl(0 0% 10%)",
        }}
      >
        {/* Top ambient glow */}
        <div
          className="absolute top-0 inset-x-0 h-48 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,111,238,0.12) 0%, transparent 70%)",
          }}
        />

        {/* ── Brand ── */}
        <div className="relative px-5 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                boxShadow: "0 0 16px rgba(0,111,238,0.45), 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">جيمينج لاونج</p>
              <p className="text-[10px] text-white/30 font-medium tracking-wide mt-0.5">نظام الإدارة</p>
            </div>
          </div>
        </div>

        {/* ── User Profile Card ── */}
        <div className="relative px-4 pb-4 shrink-0">
          <div
            className="rounded-2xl p-3.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Subtle inner shine */}
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
            />
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(135deg, #006FEE, #17c964, #f5a524)",
                    boxShadow: "0 0 12px rgba(0,111,238,0.4)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: "hsl(0 0% 8%)" }}
                  >
                    <span className="text-sm font-bold text-white">{initials}</span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2px]"
                  style={{
                    background: "#17c964",
                    borderColor: "hsl(0 0% 3%)",
                    boxShadow: "0 0 6px rgba(23,201,100,0.6)",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {user?.nameAr || user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-white/40 truncate">
                    {ROLE_LABELS[user?.role ?? ""] || user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <p className="text-[9px] uppercase tracking-[0.18em] text-white/20 font-semibold px-6 pb-2 shrink-0">
          القائمة
        </p>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          {visibleNav.map((item) => {
            const isActive =
              location === item.href || location.startsWith(item.href + "/");

            return (
              <Link key={item.routeKey} href={item.href}>
                <motion.div
                  whileHover={isActive ? {} : { x: -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none group"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(90deg, rgba(0,111,238,0.18) 0%, rgba(0,111,238,0.08) 100%)",
                          border: "1px solid rgba(0,111,238,0.2)",
                        }
                      : {
                          border: "1px solid transparent",
                        }
                  }
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{
                        background: "linear-gradient(180deg, #006FEE, #338ef7)",
                        boxShadow: "0 0 8px rgba(0,111,238,0.7)",
                        right: "auto",
                        left: 0,
                      }}
                    />
                  )}

                  {/* Hover bg */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                  )}

                  {/* Icon container */}
                  <div
                    className={cn(
                      "relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150",
                      isActive
                        ? "text-white"
                        : "text-white/35 group-hover:text-white/60"
                    )}
                    style={
                      isActive
                        ? {
                            background: "rgba(0,111,238,0.3)",
                            boxShadow: "0 0 10px rgba(0,111,238,0.3)",
                          }
                        : {}
                    }
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </div>

                  <span
                    className={cn(
                      "text-sm transition-colors duration-150 relative",
                      isActive
                        ? "text-white font-semibold"
                        : "text-white/45 font-medium group-hover:text-white/75"
                    )}
                  >
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom pinned ── */}
        <div
          className="relative px-3 py-3 shrink-0 space-y-0.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150 text-sm group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors duration-150">
              <HelpCircle className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">المساعدة والمعلومات</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 transition-all duration-150 text-sm group"
            style={{ border: "1px solid transparent" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
              (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(239,68,68,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "";
              (e.currentTarget as HTMLButtonElement).style.border = "1px solid transparent";
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">تسجيل الخروج</span>
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
