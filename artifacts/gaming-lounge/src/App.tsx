import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  return user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />;
}

// Simple role guard wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'platform_owner') return <Redirect to="/unauthorized" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />
      <Route path="/qr/:token" component={QrMenu} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/tenants">
        <ProtectedRoute>
          <AdminRoute>
            <Layout>
              <AdminTenants />
            </Layout>
          </AdminRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute>
          <AdminRoute>
            <Layout>
              <AdminUsers />
            </Layout>
          </AdminRoute>
        </ProtectedRoute>
      </Route>

      {/* Protected Tenant Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/assets">
        <ProtectedRoute>
          <Layout>
            <Assets />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/sessions">
        <ProtectedRoute>
          <Layout>
            <Sessions />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/sessions/:id">
        <ProtectedRoute>
          <Layout>
            <SessionDetail />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/pos">
        <ProtectedRoute>
          <Layout>
            <Pos />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/kds">
        <ProtectedRoute>
          <Layout>
            <Kds />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/orders">
        <ProtectedRoute>
          <Layout>
            <Orders />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/menu">
        <ProtectedRoute>
          <Layout>
            <Menu />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/inventory">
        <ProtectedRoute>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/shifts">
        <ProtectedRoute>
          <Layout>
            <Shifts />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/payments">
        <ProtectedRoute>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/audit">
        <ProtectedRoute>
          <Layout>
            <Audit />
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/performance">
        <ProtectedRoute>
          <Layout><Performance /></Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
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
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
