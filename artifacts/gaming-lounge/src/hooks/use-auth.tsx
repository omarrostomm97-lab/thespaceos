import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { User } from "@workspace/api-client-react";
import { useGetMe, getGetMeQueryKey, useRefreshToken } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("gl_token"));
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

  const doLogout = () => {
    localStorage.removeItem("gl_token");
    localStorage.removeItem("gl_refresh_token");
    setToken(null);
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/login");
  };

  const logout = doLogout;

  return (
    <AuthContext.Provider value={{ user: user || null, token, isLoading, login, logout }}>
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
