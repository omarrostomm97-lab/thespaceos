import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/login";
import Dashboard from "@/pages/dashboard";
import Assets from "@/pages/assets";
import Sessions from "@/pages/sessions";
import SessionDetail from "@/pages/sessions/[id]";
import Pos from "@/pages/pos";
import Kds from "@/pages/kds";
import Orders from "@/pages/orders";
import Menu from "@/pages/menu";
import QrMenu from "@/pages/qr/[token]";
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
import { UserRole, ROUTE_ALLOWED_ROLES, defaultRedirect } from "@/lib/permissions";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
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

      <Route path="/admin/tenants">
        <ProtectedPage path="/admin/tenants"><AdminTenants /></ProtectedPage>
      </Route>
      <Route path="/admin/users">
        <ProtectedPage path="/admin/users"><AdminUsers /></ProtectedPage>
      </Route>

      <Route path="/dashboard">
        <ProtectedPage path="/dashboard"><Dashboard /></ProtectedPage>
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
