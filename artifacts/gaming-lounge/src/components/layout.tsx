import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useLang } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import {
  LayoutDashboard, Monitor, Gamepad2, ShoppingCart, UtensilsCrossed,
  Package, Clock, ReceiptText, Users, ShieldAlert, Settings, LogOut,
  TrendingUp, BookOpen, ChefHat, HelpCircle, Sun, Moon, Languages, Menu, X,
  CalendarCheck, Bell, ArrowRight, Wallet, TrendingDown, PiggyBank, BarChart3,
  Landmark, Boxes, DollarSign, RotateCcw, Tag,
} from "lucide-react";
import { useListReturnRequests, useListDiscountRequests } from "@workspace/api-client-react";
import { useBookingAlerts } from "@/hooks/use-booking-alerts";
import { ROUTE_ALLOWED_ROLES, UserRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n";
import { useState, useEffect } from "react";

interface NavItem {
  nameKey: TranslationKey;
  href: string;
  icon: React.ElementType;
  routeKey: string;
}

const navigation: NavItem[] = [
  { nameKey: "nav_dashboard",       href: "/dashboard",          icon: LayoutDashboard, routeKey: "/dashboard" },
  { nameKey: "nav_assets",          href: "/assets",             icon: Gamepad2,        routeKey: "/assets" },
  { nameKey: "nav_sessions",        href: "/sessions",           icon: Clock,           routeKey: "/sessions" },
  { nameKey: "nav_pos",             href: "/pos",                icon: Monitor,         routeKey: "/pos" },
  { nameKey: "nav_kds",             href: "/kds",                icon: ChefHat,         routeKey: "/kds" },
  { nameKey: "nav_orders",          href: "/orders",             icon: ShoppingCart,    routeKey: "/orders" },
  { nameKey: "nav_returns",         href: "/orders/returns",     icon: RotateCcw,       routeKey: "/orders/returns" },
  { nameKey: "nav_discounts",       href: "/discounts",          icon: Tag,             routeKey: "/discounts" },
  { nameKey: "nav_menu",            href: "/menu",               icon: UtensilsCrossed, routeKey: "/menu" },
  { nameKey: "nav_inventory",       href: "/inventory",          icon: Package,         routeKey: "/inventory" },
  { nameKey: "nav_shifts",          href: "/shifts",             icon: Clock,           routeKey: "/shifts" },
  { nameKey: "nav_payments",        href: "/payments",           icon: ReceiptText,     routeKey: "/payments" },
  { nameKey: "nav_recipes",         href: "/recipes",            icon: BookOpen,        routeKey: "/recipes" },
  { nameKey: "nav_bookings",        href: "/bookings",           icon: CalendarCheck,   routeKey: "/bookings" },
  { nameKey: "nav_performance",     href: "/performance",        icon: TrendingUp,      routeKey: "/performance" },
  { nameKey: "nav_users",           href: "/users",              icon: Users,           routeKey: "/users" },
  { nameKey: "nav_audit",           href: "/audit",              icon: ShieldAlert,     routeKey: "/audit" },
  { nameKey: "nav_settings",        href: "/settings",           icon: Settings,        routeKey: "/settings" },
  { nameKey: "nav_user_guide",      href: "/user-guide-scripts", icon: BookOpen,        routeKey: "/user-guide-scripts" },
];

const financeNavigation: NavItem[] = [
  { nameKey: "nav_finance_overview",     href: "/finance",              icon: DollarSign,   routeKey: "/finance" },
  { nameKey: "nav_finance_expenses",     href: "/finance/expenses",     icon: TrendingDown, routeKey: "/finance/expenses" },
  { nameKey: "nav_finance_money_in",     href: "/finance/money-in",     icon: TrendingUp,   routeKey: "/finance/money-in" },
  { nameKey: "nav_finance_capital",      href: "/finance/capital",      icon: PiggyBank,    routeKey: "/finance/capital" },
  { nameKey: "nav_finance_withdrawals",  href: "/finance/withdrawals",  icon: Wallet,       routeKey: "/finance/withdrawals" },
  { nameKey: "nav_finance_accounts",     href: "/finance/accounts",     icon: Landmark,     routeKey: "/finance/accounts" },
  { nameKey: "nav_finance_assets",       href: "/finance/assets",       icon: Boxes,        routeKey: "/finance/assets" },
  { nameKey: "nav_finance_reports",      href: "/finance/reports",      icon: BarChart3,    routeKey: "/finance/reports" },
];

const BASE_URL = import.meta.env.BASE_URL;
const LOGO = `${BASE_URL}the-space-os-logo.png`;

const FINANCE_ROLES = new Set(["platform_owner", "owner", "manager"]);

const ROLE_KEY_MAP: Record<string, TranslationKey> = {
  platform_owner: "role_platform_owner",
  owner:          "role_owner",
  manager:        "role_manager",
  cashier:        "role_cashier",
  buffet_worker:  "role_buffet_worker",
};

interface LayoutProps { children: React.ReactNode }

const fmtHHMM = (dt: string | Date) =>
  new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const MGMT_ROLES = new Set(["platform_owner", "owner", "manager"]);

export function Layout({ children }: LayoutProps) {
  const { user, logout, isImpersonating, impersonatedTenant, exitImpersonation } = useAuth();
  const [location] = useLocation();
  const { t, lang, toggleLang, dir } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts, dismiss } = useBookingAlerts();

  const isMgmt = user?.role && MGMT_ROLES.has(user.role);
  const { data: returnRequests } = useListReturnRequests(
    { status: "pending" } as any,
    { query: { enabled: !!isMgmt, refetchInterval: 30000, staleTime: 15000 } as any }
  );
  const pendingReturnsCount = returnRequests?.length ?? 0;

  const { data: pendingDiscounts } = useListDiscountRequests(
    { status: "pending" },
    { query: { enabled: !!isMgmt, refetchInterval: 30000, staleTime: 15000 } as any }
  );
  const pendingDiscountsCount = pendingDiscounts?.length ?? 0;

  useEffect(() => { setSidebarOpen(false); }, [location]);

  const role = user?.role as UserRole | undefined;
  const visibleNav = navigation.filter(item => {
    const allowed = ROUTE_ALLOWED_ROLES[item.routeKey];
    if (!allowed) return true;
    return role ? allowed.includes(role) : false;
  });

  const initials =
    user?.nameAr?.charAt(0) ||
    user?.name?.charAt(0)?.toUpperCase() ||
    "U";

  const roleKey = ROLE_KEY_MAP[user?.role ?? ""] as TranslationKey | undefined;

  const hiddenTranslate = dir === "rtl" ? "max-md:translate-x-full" : "max-md:-translate-x-full";

  // KDS gets the full screen — no sidebar, no top bar
  if (location === "/kds") {
    return (
      <div className="h-screen overflow-hidden bg-background" dir={dir}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background" dir={dir}>

      {/* ─── Mobile backdrop ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 z-50 w-64 flex flex-col shrink-0 overflow-hidden",
          "transition-transform duration-300 ease-in-out",
          dir === "rtl" ? "right-0" : "left-0",
          !sidebarOpen && hiddenTranslate,
        )}
        style={{
          background: "hsl(var(--sidebar))",
          borderInlineStart: "1px solid hsl(var(--sidebar-border))",
        }}
      >
        {/* Mobile close button */}
        <button
          className="absolute top-4 end-4 p-1.5 rounded-lg md:hidden z-10 opacity-70 hover:opacity-100"
          style={{ color: "var(--sb-text-active)" }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Top ambient glow */}
        <div
          className="absolute top-0 inset-x-0 h-48 pointer-events-none"
          style={{ background: "var(--sb-top-glow)" }}
        />

        {/* ── Brand ── */}
        <div className="relative px-5 pt-6 pb-4 shrink-0">
          <div className="flex flex-col gap-2">
            <div
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.96)",
                borderRadius: 12,
                padding: "6px 12px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <img
                src={LOGO}
                alt="The Space OS"
                style={{ height: 44, width: "auto", objectFit: "contain", objectPosition: "left center" }}
              />
            </div>
            <p className="text-[10px] font-medium tracking-wide" style={{ color: "var(--sb-text-inactive)" }}>
              {t("brand_subtitle")}
            </p>
          </div>
        </div>

        {/* ── User Profile Card ── */}
        <div className="relative px-4 pb-4 shrink-0">
          <div
            className="rounded-2xl p-3.5 relative overflow-hidden"
            style={{
              background: "var(--sb-glass-bg)",
              border: "1px solid var(--sb-glass-border)",
              boxShadow: "inset 0 1px 0 var(--sb-glass-shine)",
            }}
          >
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, var(--sb-glass-shine), transparent)` }}
            />
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(135deg, #006FEE, #17c964, #f5a524)",
                    boxShadow: "0 0 12px rgba(0,111,238,0.35)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: "var(--sb-avatar-bg)" }}
                  >
                    <span className="text-sm font-bold" style={{ color: "var(--sb-text-active)" }}>
                      {initials}
                    </span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2px]"
                  style={{
                    background: "#17c964",
                    borderColor: "var(--sb-avatar-ring-border)",
                    boxShadow: "0 0 6px rgba(23,201,100,0.6)",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold truncate leading-tight"
                  style={{ color: "var(--sb-text-active)" }}
                >
                  {user?.nameAr || user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] truncate" style={{ color: "var(--sb-text-inactive)" }}>
                    {roleKey ? t(roleKey) : (user?.role ?? "")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <p
          className="text-[9px] uppercase tracking-[0.18em] font-semibold px-6 pb-2 shrink-0"
          style={{ color: "var(--sb-icon-inactive)" }}
        >
          {t("nav_section")}
        </p>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
          {visibleNav.map(item => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.routeKey} href={item.href}>
                <motion.div
                  whileHover={isActive ? {} : { x: lang === "ar" ? -1 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none group"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(90deg, rgba(0,111,238,0.18) 0%, rgba(0,111,238,0.08) 100%)",
                          border: "1px solid rgba(0,111,238,0.2)",
                        }
                      : { border: "1px solid transparent" }
                  }
                >
                  {isActive && (
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
                        lang === "ar" ? "left-0" : "right-0"
                      )}
                      style={{
                        background: "linear-gradient(180deg, #006FEE, #338ef7)",
                        boxShadow: "0 0 8px rgba(0,111,238,0.7)",
                      }}
                    />
                  )}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: "var(--sb-nav-hover)" }}
                    />
                  )}
                  <div
                    className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                    style={
                      isActive
                        ? { background: "rgba(0,111,238,0.3)", boxShadow: "0 0 10px rgba(0,111,238,0.3)", color: "#ffffff" }
                        : { color: "var(--sb-icon-inactive)" }
                    }
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className="text-sm relative transition-colors duration-150"
                    style={{
                      color: isActive ? "var(--sb-text-active)" : "var(--sb-text-inactive)",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {t(item.nameKey)}
                  </span>
                  {item.routeKey === "/orders/returns" && pendingReturnsCount > 0 && (
                    <span
                      className="ms-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "#f5a524", color: "#000" }}
                    >
                      {pendingReturnsCount}
                    </span>
                  )}
                  {item.routeKey === "/discounts" && pendingDiscountsCount > 0 && (
                    <span
                      className="ms-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: "#f5a524", color: "#000" }}
                    >
                      {pendingDiscountsCount}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* ── Finance section (owner / manager only) ── */}
          {user?.role && FINANCE_ROLES.has(user.role) && (
            <>
              <div className="pt-3 pb-1.5 px-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1" style={{ background: "var(--sb-glass-border)" }} />
                  <p className="text-[9px] uppercase tracking-[0.18em] font-semibold shrink-0"
                    style={{ color: "var(--sb-icon-inactive)" }}>
                    {t("nav_finance_section")}
                  </p>
                  <div className="h-px flex-1" style={{ background: "var(--sb-glass-border)" }} />
                </div>
              </div>
              {financeNavigation.map(item => {
                const isActive = location === item.href || (item.href !== "/finance" && location.startsWith(item.href));
                return (
                  <Link key={item.routeKey} href={item.href}>
                    <motion.div
                      whileHover={isActive ? {} : { x: lang === "ar" ? -1 : 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none group"
                      style={
                        isActive
                          ? {
                              background: "linear-gradient(90deg, rgba(23,201,100,0.15) 0%, rgba(23,201,100,0.07) 100%)",
                              border: "1px solid rgba(23,201,100,0.2)",
                            }
                          : { border: "1px solid transparent" }
                      }
                    >
                      {isActive && (
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
                            lang === "ar" ? "left-0" : "right-0"
                          )}
                          style={{
                            background: "linear-gradient(180deg, #17c964, #12a352)",
                            boxShadow: "0 0 8px rgba(23,201,100,0.7)",
                          }}
                        />
                      )}
                      {!isActive && (
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          style={{ background: "var(--sb-nav-hover)" }}
                        />
                      )}
                      <div
                        className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                        style={
                          isActive
                            ? { background: "rgba(23,201,100,0.25)", boxShadow: "0 0 10px rgba(23,201,100,0.3)", color: "#17c964" }
                            : { color: "var(--sb-icon-inactive)" }
                        }
                      >
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className="text-sm relative transition-colors duration-150"
                        style={{
                          color: isActive ? "#17c964" : "var(--sb-text-inactive)",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        {t(item.nameKey)}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* ── Bottom: Theme + Lang + Help + Logout ── */}
        <div
          className="relative px-3 py-3 shrink-0 space-y-0.5"
          style={{ borderTop: "1px solid var(--sb-bottom-divider)" }}
        >
          {/* Theme + Language row */}
          <div className="flex items-center gap-1.5 px-1 py-2 mb-0.5">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              style={{
                background: "var(--sb-glass-bg)",
                border: "1px solid var(--sb-glass-border)",
                color: "var(--sb-text-hover)",
              }}
              title={theme === "dark" ? t("switch_to_light") : t("switch_to_dark")}
            >
              {theme === "dark"
                ? <Sun className="h-3.5 w-3.5 text-amber-400" />
                : <Moon className="h-3.5 w-3.5 text-primary" />
              }
              <span>{theme === "dark" ? t("switch_to_light") : t("switch_to_dark")}</span>
            </motion.button>

            {/* Language toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleLang}
              className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shrink-0"
              style={{
                background: "rgba(0,111,238,0.12)",
                border: "1px solid rgba(0,111,238,0.2)",
                color: "#006FEE",
              }}
              title={lang === "ar" ? t("switch_to_english") : t("switch_to_arabic")}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{lang === "ar" ? "EN" : "ع"}</span>
            </motion.button>
          </div>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            style={{ color: "var(--sb-text-inactive)", border: "1px solid transparent" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--sb-text-hover)";
              (e.currentTarget as HTMLButtonElement).style.background = "var(--sb-nav-hover)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--sb-text-inactive)";
              (e.currentTarget as HTMLButtonElement).style.background = "";
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
              <HelpCircle className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">{t("help")}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
            style={{ color: "var(--sb-text-inactive)", border: "1px solid transparent" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.07)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--sb-text-inactive)";
              (e.currentTarget as HTMLButtonElement).style.background = "";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">{t("logout")}</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Impersonation Banner ── */}
        {isImpersonating && impersonatedTenant && (
          <div
            className="shrink-0 flex items-center justify-between px-5 py-2.5"
            style={{
              background: "linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.08) 100%)",
              borderBottom: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#f59e0b" }}
              />
              <span className="text-sm font-semibold" style={{ color: "#f59e0b" }}>
                تتصفح الآن: {impersonatedTenant.nameAr || impersonatedTenant.name}
              </span>
            </div>
            <button
              onClick={exitImpersonation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:opacity-80"
              style={{
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#f59e0b",
              }}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              رجوع للوحة الإدارة
            </button>
          </div>
        )}

        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center h-14 px-4 shrink-0 border-b"
          style={{ background: "hsl(var(--sidebar))", borderColor: "hsl(var(--sidebar-border))" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: "var(--sb-text-active)" }}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center mx-auto">
            <img
              src={LOGO}
              alt="The Space OS"
              style={{ height: 26, width: "auto", objectFit: "contain", objectPosition: "left center" }}
            />
          </div>
          {/* spacer matching hamburger width */}
          <div className="w-9" />
        </div>

        {/* ── Booking alerts banner (cashier / manager) ── */}
        {alerts.length > 0 && role && ["cashier", "manager"].includes(role) && (
          <div className="shrink-0 space-y-1.5 px-4 pt-3">
            {alerts.map(b => (
              <div
                key={b.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(245,165,36,0.1)",
                  border: "1px solid rgba(245,165,36,0.25)",
                }}
              >
                <Bell className="h-4 w-4 shrink-0" style={{ color: "#f5a524" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "#f5a524" }}>
                    {t("booking_alert_title")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lang === "ar"
                      ? (b.assetNameAr || b.assetName || "")
                      : (b.assetName || b.assetNameAr || "")}
                    {" — "}
                    {fmtHHMM(b.startsAt)}
                  </p>
                </div>
                <button
                  onClick={() => dismiss(b.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
                  style={{ color: "#f5a524" }}
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
