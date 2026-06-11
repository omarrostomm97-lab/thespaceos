import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@heroui/react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider, useLang } from "@/hooks/use-language";
import { ProtectedRoute } from "@/components/protected-route";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import Assets from "@/pages/assets";
import AssetHistory from "@/pages/asset-history";
import Sessions from "@/pages/sessions";
import SessionDetail from "@/pages/sessions/[id]";
import Pos from "@/pages/pos";
import Kds from "@/pages/kds";
import Orders from "@/pages/orders";
import Menu from "@/pages/menu";
import QrMenu from "@/pages/qr/[token]";
import PublicMenuPage from "@/pages/public-menu/[token]";
import PrintQrPage from "@/pages/print-qr";
import PrintAllQrPage from "@/pages/print-all-qr";
import Inventory from "@/pages/inventory";
import Shifts from "@/pages/shifts";
import Payments from "@/pages/payments";
import Users from "@/pages/users";
import Audit from "@/pages/audit";
import Settings from "@/pages/settings";
import Unauthorized from "@/pages/unauthorized";
import AdminTenants from "@/pages/admin/tenants";
import AdminUsers from "@/pages/admin/users";
import Performance from "@/pages/performance";
import Recipes from "@/pages/recipes";
import Bookings from "@/pages/bookings";
import OrderReturns from "@/pages/orders/returns";
import Discounts from "@/pages/discounts";
import FinanceIndex from "@/pages/finance/index";
import FinanceExpenses from "@/pages/finance/expenses";
import FinanceMoneyIn from "@/pages/finance/money-in";
import FinanceCapital from "@/pages/finance/capital";
import FinanceWithdrawals from "@/pages/finance/withdrawals";
import FinanceAccounts from "@/pages/finance/accounts";
import FinanceAssets from "@/pages/finance/assets";
import FinanceReports from "@/pages/finance/reports";
import UserGuideScripts from "@/pages/user-guide-scripts";
import { UserRole, ROUTE_ALLOWED_ROLES, defaultRedirect } from "@/lib/permissions";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/";
    }
  }, [isLoading, user]);

  if (isLoading) return null;
  if (!user) return null;
  return <Redirect to={defaultRedirect(user.role as UserRole)} />;
}

function RoleRoute({ path, children }: { path: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const allowed = ROUTE_ALLOWED_ROLES[path];
  if (allowed && user && !allowed.includes(user.role as UserRole)) {
    return <Redirect to={defaultRedirect(user.role as UserRole)} />;
  }
  return <>{children}</>;
}

function ProtectedPage({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleRoute path={path}>
        <Layout>{children}</Layout>
      </RoleRoute>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />
      <Route path="/qr/:token" component={QrMenu} />
      <Route path="/public-menu/:token" component={PublicMenuPage} />
      <Route path="/print-qr" component={PrintQrPage} />
      <Route path="/print-all-qr" component={PrintAllQrPage} />

      <Route path="/admin/tenants">
        <ProtectedPage path="/admin/tenants"><AdminTenants /></ProtectedPage>
      </Route>
      <Route path="/admin/users">
        <ProtectedPage path="/admin/users"><AdminUsers /></ProtectedPage>
      </Route>
      <Route path="/dashboard">
        <ProtectedPage path="/dashboard"><Dashboard /></ProtectedPage>
      </Route>
      <Route path="/assets/:id/history">
        <ProtectedPage path="/assets/:id/history"><AssetHistory /></ProtectedPage>
      </Route>
      <Route path="/assets">
        <ProtectedPage path="/assets"><Assets /></ProtectedPage>
      </Route>
      <Route path="/sessions/:id">
        <ProtectedPage path="/sessions/:id"><SessionDetail /></ProtectedPage>
      </Route>
      <Route path="/sessions">
        <ProtectedPage path="/sessions"><Sessions /></ProtectedPage>
      </Route>
      <Route path="/pos">
        <ProtectedPage path="/pos"><Pos /></ProtectedPage>
      </Route>
      <Route path="/kds">
        <ProtectedPage path="/kds"><Kds /></ProtectedPage>
      </Route>
      <Route path="/orders/returns">
        <ProtectedPage path="/orders/returns"><OrderReturns /></ProtectedPage>
      </Route>
      <Route path="/discounts">
        <ProtectedPage path="/discounts"><Discounts /></ProtectedPage>
      </Route>
      <Route path="/orders">
        <ProtectedPage path="/orders"><Orders /></ProtectedPage>
      </Route>
      <Route path="/menu">
        <ProtectedPage path="/menu"><Menu /></ProtectedPage>
      </Route>
      <Route path="/inventory">
        <ProtectedPage path="/inventory"><Inventory /></ProtectedPage>
      </Route>
      <Route path="/shifts">
        <ProtectedPage path="/shifts"><Shifts /></ProtectedPage>
      </Route>
      <Route path="/payments">
        <ProtectedPage path="/payments"><Payments /></ProtectedPage>
      </Route>
      <Route path="/recipes">
        <ProtectedPage path="/recipes"><Recipes /></ProtectedPage>
      </Route>
      <Route path="/bookings">
        <ProtectedPage path="/bookings"><Bookings /></ProtectedPage>
      </Route>
      <Route path="/performance">
        <ProtectedPage path="/performance"><Performance /></ProtectedPage>
      </Route>
      <Route path="/users">
        <ProtectedPage path="/users"><Users /></ProtectedPage>
      </Route>
      <Route path="/audit">
        <ProtectedPage path="/audit"><Audit /></ProtectedPage>
      </Route>
      <Route path="/settings">
        <ProtectedPage path="/settings"><Settings /></ProtectedPage>
      </Route>

      <Route path="/finance">
        <ProtectedPage path="/finance"><FinanceIndex /></ProtectedPage>
      </Route>
      <Route path="/finance/expenses">
        <ProtectedPage path="/finance/expenses"><FinanceExpenses /></ProtectedPage>
      </Route>
      <Route path="/finance/money-in">
        <ProtectedPage path="/finance/money-in"><FinanceMoneyIn /></ProtectedPage>
      </Route>
      <Route path="/finance/capital">
        <ProtectedPage path="/finance/capital"><FinanceCapital /></ProtectedPage>
      </Route>
      <Route path="/finance/withdrawals">
        <ProtectedPage path="/finance/withdrawals"><FinanceWithdrawals /></ProtectedPage>
      </Route>
      <Route path="/finance/accounts">
        <ProtectedPage path="/finance/accounts"><FinanceAccounts /></ProtectedPage>
      </Route>
      <Route path="/finance/assets">
        <ProtectedPage path="/finance/assets"><FinanceAssets /></ProtectedPage>
      </Route>
      <Route path="/finance/reports">
        <ProtectedPage path="/finance/reports"><FinanceReports /></ProtectedPage>
      </Route>

      <Route path="/user-guide-scripts">
        <ProtectedPage path="/user-guide-scripts"><UserGuideScripts /></ProtectedPage>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppWithI18n() {
  const { lang } = useLang();
  const heroUILocale = lang === "ar" ? "ar-AE" : "en-US";
  return (
    <I18nProvider locale={heroUILocale}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </WouterRouter>
    </I18nProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AppWithI18n />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
