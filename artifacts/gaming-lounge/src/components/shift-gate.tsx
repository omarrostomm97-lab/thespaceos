import React from "react";
import { useGetCurrentShift, getGetCurrentShiftQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";
import { Link } from "wouter";
import { Clock } from "lucide-react";

export function ShiftGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t, dir } = useLang();

  const isCashier = user?.role === "cashier";

  const { data: currentShift, isLoading } = useGetCurrentShift(undefined, {
    query: {
      queryKey: getGetCurrentShiftQueryKey(),
      enabled: isCashier,
      refetchInterval: 30000,
    },
  });

  if (!isCashier) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
        dir={dir}
      >
        <div
          className="flex flex-col items-center gap-6 max-w-sm w-full rounded-2xl p-8"
          style={{
            background: "linear-gradient(145deg, var(--asset-card-from, hsl(var(--card))) 0%, var(--asset-card-to, hsl(var(--secondary))) 100%)",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(245,165,36,0.15)",
              border: "1px solid rgba(245,165,36,0.3)",
              boxShadow: "0 0 24px rgba(245,165,36,0.15)",
            }}
          >
            <Clock className="h-8 w-8" style={{ color: "#f5a524" }} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">{t("shift_gate_title")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("shift_gate_body")}</p>
          </div>

          <Link href="/shifts" className="w-full">
            <button
              className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                boxShadow: "0 4px 16px rgba(0,111,238,0.35), 0 1px 0 rgba(255,255,255,0.15) inset",
              }}
            >
              <Clock className="h-4 w-4" />
              {t("shift_gate_open_btn")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
