import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { User, Tenant } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey, useRefreshToken } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface ImpersonatedTenant {
  id: number;
  name: string;
  nameAr: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isImpersonating: boolean;
  impersonatedTenant: ImpersonatedTenant | null;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  enterImpersonation: (token: string, tenant: Tenant) => void;
  exitImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getImpersonatedTenant(): ImpersonatedTenant | null {
  try {
    const raw = localStorage.getItem("impersonated_tenant");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("gl_token"));
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => !!localStorage.getItem("platform_admin_token"));
  const [impersonatedTenant, setImpersonatedTenant] = useState<ImpersonatedTenant | null>(getImpersonatedTenant);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const refreshingRef = useRef(false);

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const refreshTokenMutation = useRefreshToken();

  useEffect(() => {
    if (!isError) return;
    if (refreshingRef.current) return;
    if (isImpersonating) {
      exitImpersonation();
      return;
    }

    const storedRefreshToken = localStorage.getItem("gl_refresh_token");
    if (!storedRefreshToken) {
      doLogout();
      return;
    }

    refreshingRef.current = true;
    refreshTokenMutation.mutateAsync({ data: { refreshToken: storedRefreshToken } })
      .then((response) => {
        localStorage.setItem("gl_token", response.token);
        if (response.refreshToken) {
          localStorage.setItem("gl_refresh_token", response.refreshToken);
        }
        setToken(response.token);
        queryClient.setQueryData(getGetMeQueryKey(), response.user);
      })
      .catch(() => {
        doLogout();
      })
      .finally(() => {
        refreshingRef.current = false;
      });
  }, [isError]);

  const login = (newToken: string, newUser: User, newRefreshToken?: string) => {
    localStorage.setItem("gl_token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("gl_refresh_token", newRefreshToken);
    }
    setToken(newToken);
    queryClient.setQueryData(getGetMeQueryKey(), newUser);
  };

  const enterImpersonation = (newToken: string, tenant: Tenant) => {
    const currentToken = localStorage.getItem("gl_token");
    if (currentToken) {
      localStorage.setItem("platform_admin_token", currentToken);
    }
    const tenantInfo: ImpersonatedTenant = { id: tenant.id, name: tenant.name, nameAr: tenant.nameAr ?? null };
    localStorage.setItem("impersonated_tenant", JSON.stringify(tenantInfo));
    localStorage.setItem("gl_token", newToken);
    setToken(newToken);
    setIsImpersonating(true);
    setImpersonatedTenant(tenantInfo);
    // Clear ALL cached queries so the new tenant's data is fetched fresh
    queryClient.clear();
  };

  const exitImpersonation = () => {
    const adminToken = localStorage.getItem("platform_admin_token");
    if (adminToken) {
      localStorage.setItem("gl_token", adminToken);
      setToken(adminToken);
    }
    localStorage.removeItem("platform_admin_token");
    localStorage.removeItem("impersonated_tenant");
    setIsImpersonating(false);
    setImpersonatedTenant(null);
    // Clear ALL cached queries so we return to the platform-owner view with fresh data
    queryClient.clear();
    setLocation("/admin/tenants");
  };

  const doLogout = () => {
    localStorage.removeItem("gl_token");
    localStorage.removeItem("gl_refresh_token");
    localStorage.removeItem("platform_admin_token");
    localStorage.removeItem("impersonated_tenant");
    setToken(null);
    setIsImpersonating(false);
    setImpersonatedTenant(null);
    queryClient.clear();
    setLocation("/login");
  };

  const logout = doLogout;

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, isImpersonating, impersonatedTenant, login, logout, enterImpersonation, exitImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
