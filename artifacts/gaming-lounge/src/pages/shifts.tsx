import { useState, useEffect } from "react";
import { useGetCurrentShift, useListShifts, useOpenShift, useCloseShift, getGetCurrentShiftQueryKey, getListShiftsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLang } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Banknote, CreditCard, Smartphone, Clock, TrendingUp, BarChart3,
  AlertCircle, ChevronRight, CheckSquare, Eye,
} from "lucide-react";
import ShiftDetailDrawer, { ShiftMeta, ShiftDrawerTab } from "@/components/shift-detail-drawer";

/* ─── helpers ──────────────────────────────────────── */
function fmtDuration(mins: number, hShort: string, mShort: string) {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return h > 0 ? `${h}${hShort} ${m}${mShort}` : `${m}${mShort}`;
}

function DiffBadge({ value, egp }: { value: number | null | undefined; egp: string }) {
  if (value == null) return <span className="text-muted-foreground text-xs">—</span>;
  const isNeg = value < 0;
  const isPos = value > 0;
  return (
    <span className={cn(
      "font-mono font-bold text-sm tabular-nums",
      isNeg ? "text-destructive" : isPos ? "text-emerald-500" : "text-muted-foreground"
    )}>
      {isPos ? "+" : ""}{value.toFixed(2)}
      <span className="text-[10px] font-normal ms-1">{egp}</span>
    </span>
  );
}

/* ─── main page ─────────────────────────────────────── */
export default function Shifts() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const isMgmt = user?.role !== "cashier";
  const egp = lang === "ar" ? "ج.م" : "EGP";
  const queryClient = useQueryClient();

  /* ── data ── */
  const {
    data: currentShift,
    isLoading: isLoadingCurrent,
    isError: isCurrentError,
  } = useGetCurrentShift({ query: { queryKey: getGetCurrentShiftQueryKey(), refetchInterval: 15_000 } });

  const { data: shifts, isLoading: isLoadingList } = useListShifts({
    query: { queryKey: getListShiftsQueryKey(), refetchInterval: 30_000 },
  });

  /* ── form state ── */
  const [openingCash, setOpeningCash] = useState("");
  const [actualCash, setActualCash] = useState("");

  /* ── drawer state ── */
  const [drawerShiftId, setDrawerShiftId]   = useState<number | null>(null);
  const [drawerMeta, setDrawerMeta]         = useState<ShiftMeta | null>(null);
  const [drawerInitTab, setDrawerInitTab]   = useState<ShiftDrawerTab>("gaming");

  /* ── live elapsed timer ── */
  const [elapsed, setElapsed] = useState("00:00:00");
  useEffect(() => {
    if (!currentShift) { setElapsed("00:00:00"); return; }
    const update = () => {
      const diff = Date.now() - new Date(currentShift.openedAt).getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setElapsed(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [currentShift?.openedAt]);

  /* ── actions ── */
  const openShift  = useOpenShift();
  const closeShift = useCloseShift();

  const handleOpen = async () => {
    if (!openingCash) return;
    try {
      await openShift.mutateAsync({ data: { openingCash: parseFloat(openingCash) } });
      toast.success(t("shift_open_success"));
      setOpeningCash("");
      queryClient.invalidateQueries({ queryKey: getGetCurrentShiftQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
    } catch {
      toast.error(t("shift_open_error"));
    }
  };

  const handleClose = async () => {
    if (!actualCash || !currentShift) return;
    try {
      await closeShift.mutateAsync({
        shiftId: currentShift.id,
        data: { actualCash: parseFloat(actualCash) },
      });
      toast.success(t("shift_close_success"));
      setActualCash("");
      queryClient.invalidateQueries({ queryKey: getGetCurrentShiftQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListShiftsQueryKey() });
    } catch {
      toast.error(t("shift_close_error"));
    }
  };

  /* ── open drawer helpers ── */
  const openDrawerForShift = (shift: any, tab: ShiftDrawerTab = "gaming") => {
    setDrawerShiftId(shift.id);
    setDrawerInitTab(tab);
    setDrawerMeta({
      id: shift.id,
      userName: shift.userName,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt,
      status: shift.status,
      totalRevenue: shift.totalRevenue ?? 0,
      durationMinutes: shift.durationMinutes ?? 0,
      gamingRevenue: shift.gamingRevenue ?? 0,
      roomOrderRevenue: shift.roomOrderRevenue ?? 0,
      posRevenue: shift.posRevenue ?? 0,
      sessionCount: shift.sessionCount ?? 0,
      orderCount: shift.orderCount ?? 0,
      expectedCash: shift.expectedCash,
      actualCash: shift.actualCash,
      difference: shift.difference,
      withdrawalTotal: shift.withdrawalTotal ?? 0,
    });
  };

  const openCurrentShiftDrawer = () => {
    if (!currentShift) return;
    const fromList = (shifts as any[])?.find((s: any) => s.id === currentShift.id);
    openDrawerForShift({
      id: currentShift.id,
      userName: currentShift.userName,
      openedAt: currentShift.openedAt,
      closedAt: currentShift.closedAt,
      status: "open",
      totalRevenue: fromList?.totalRevenue
        ?? Math.max(0, (currentShift as any).grossCash - currentShift.openingCash),
      durationMinutes: fromList?.durationMinutes
        ?? Math.round((Date.now() - new Date(currentShift.openedAt).getTime()) / 60_000),
      gamingRevenue: fromList?.gamingRevenue ?? 0,
      roomOrderRevenue: fromList?.roomOrderRevenue ?? 0,
      posRevenue: fromList?.posRevenue ?? 0,
      sessionCount: fromList?.sessionCount ?? 0,
      orderCount: fromList?.orderCount ?? 0,
      expectedCash: currentShift.expectedCash,
      actualCash: null,
      difference: null,
      withdrawalTotal: (currentShift as any).withdrawalTotal ?? 0,
    });
  };

  /* ── stats strip ── */
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const closedShifts = (shifts as any[])?.filter((s: any) => s.status === "closed") ?? [];
  const thisMonthClosed = closedShifts.filter((s: any) => new Date(s.openedAt) >= startOfMonth);
  const monthRevenue = thisMonthClosed.reduce((a: number, s: any) => a + (s.totalRevenue ?? 0), 0);
  const diffsWithValues = thisMonthClosed.filter((s: any) => s.difference != null);
  const avgDiff = diffsWithValues.length
    ? diffsWithValues.reduce((a: number, s: any) => a + s.difference, 0) / diffsWithValues.length
    : 0;

  /* ── CS: live income chips from current shift ── */
  const cashIncome      = currentShift?.cashIncome      ?? 0;
  const visaIncome      = currentShift?.visaIncome      ?? 0;
  const walletIncome    = currentShift?.walletIncome    ?? 0;
  const withdrawalTotal = currentShift?.withdrawalTotal ?? 0;
  const shiftExpenses      = currentShift?.shiftExpenses      ?? 0;
  const shiftExpenseItems  = currentShift?.shiftExpenseItems  ?? [];

  if ((isLoadingCurrent && !isCurrentError) || isLoadingList) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* ── Page header ── */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          {t("shifts_mgmt_title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{t("shifts_mgmt_subtitle")}</p>
      </div>

      {/* ── Stats strip (mgmt only) ── */}
      {isMgmt && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card-base rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {t("shifts_this_month")}
              </p>
            </div>
            <p className="text-2xl font-bold tabular-nums">{thisMonthClosed.length}</p>
          </div>
          <div className="card-base rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {t("shifts_revenue_month")}
              </p>
            </div>
            <p className="text-lg font-bold text-emerald-500 tabular-nums">
              {monthRevenue.toFixed(0)}
              <span className="text-xs font-normal text-muted-foreground ms-1">{egp}</span>
            </p>
          </div>
          <div className="card-base rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {t("shifts_avg_diff")}
              </p>
            </div>
            <p className={cn(
              "text-lg font-bold tabular-nums",
              avgDiff < 0 ? "text-destructive" : avgDiff > 0 ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {avgDiff > 0 ? "+" : ""}{avgDiff.toFixed(0)}
              <span className="text-xs font-normal text-muted-foreground ms-1">{egp}</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Current shift card ── */}
      <div className="card-base rounded-3xl overflow-hidden">
        {/* Header stripe */}
        <div className={cn(
          "px-5 py-3 flex items-center justify-between",
          currentShift ? "bg-emerald-500/10 border-b border-emerald-500/20" : "bg-amber-500/10 border-b border-amber-500/20"
        )}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {currentShift && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              )}
              <span className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                currentShift ? "bg-emerald-500" : "bg-amber-400"
              )} />
            </span>
            <p className="text-sm font-bold">
              {currentShift ? t("shift_open") : t("open_shift")}
            </p>
          </div>
          {currentShift && (
            <p className="text-xl font-mono font-bold text-emerald-500 tabular-nums tracking-widest">
              {elapsed}
            </p>
          )}
        </div>

        <div className="p-5">
          {!currentShift ? (
            /* ── No open shift ── */
            <div className="space-y-5">
              <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                  {t("shift_no_open_warning")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t("shift_opening_cash_label")}</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleOpen()}
                    className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    onClick={handleOpen}
                    disabled={openShift.isPending || !openingCash}
                    className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    {openShift.isPending ? t("loading") : t("shift_open_btn")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Open shift detail ── */
            <div className="space-y-4">
              {/* Cashier + time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    {t("shift_responsible")}
                  </p>
                  <p className="font-bold text-sm">{currentShift.userName || "—"}</p>
                </div>
                <div className="bg-muted/40 rounded-2xl p-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                    {t("shift_open_time")}
                  </p>
                  <p className="font-bold text-sm font-mono">
                    {new Date(currentShift.openedAt).toLocaleTimeString(
                      lang === "ar" ? "ar-EG" : "en-US",
                      { hour: "2-digit", minute: "2-digit", hour12: true }
                    )}
                  </p>
                </div>
              </div>

              {/* Payment method breakdown chips */}
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-2 py-2.5">
                    <Banknote className="h-4 w-4 text-emerald-500" />
                    <p className="text-[10px] text-emerald-600 font-semibold">{t("shift_cash_income")}</p>
                    <p className="text-sm font-bold text-emerald-500 tabular-nums">{cashIncome.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-primary/8 border border-primary/20 rounded-xl px-2 py-2.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-primary font-semibold">{t("shift_visa_income")}</p>
                    <p className="text-sm font-bold text-primary tabular-nums">{visaIncome.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-purple-500/8 border border-purple-500/20 rounded-xl px-2 py-2.5">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <p className="text-[10px] text-purple-600 font-semibold">{t("shift_wallet_income")}</p>
                    <p className="text-sm font-bold text-purple-500 tabular-nums">{walletIncome.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Receipt-style cash breakdown */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2.5">
                {/* Opening float */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("shift_opening_cash")}</span>
                  <span className="font-mono font-semibold tabular-nums">
                    +{currentShift.openingCash.toFixed(2)} {egp}
                  </span>
                </div>
                {/* Cash income */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("shift_receipt_cash_income")}</span>
                  <span className="font-mono text-emerald-500 font-semibold tabular-nums">
                    +{cashIncome.toFixed(2)} {egp}
                  </span>
                </div>
                {/* Owner withdrawals (hidden when 0) */}
                {withdrawalTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-destructive font-medium">{t("shift_withdrawals_deduction")}</span>
                    <span className="font-mono text-destructive font-semibold tabular-nums">
                      −{withdrawalTotal.toFixed(2)} {egp}
                    </span>
                  </div>
                )}
                {/* Shift expenses (hidden when 0) */}
                {shiftExpenses > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-500 font-medium">{t("shift_receipt_expenses")}</span>
                    <span className="font-mono text-orange-500 font-semibold tabular-nums">
                      −{shiftExpenses.toFixed(2)} {egp}
                    </span>
                  </div>
                )}
                {/* Divider + Count this much */}
                <div className="border-t-2 border-dashed border-primary/25 pt-3 flex items-center justify-between">
                  <p className="font-bold text-primary text-sm">{t("shift_count_this")}</p>
                  <p className="text-2xl font-bold text-emerald-500 font-mono tabular-nums">
                    {(currentShift.expectedCash ?? 0).toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground ms-1">{egp}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={openCurrentShiftDrawer}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {t("shift_view_details_btn")}
                </button>
              </div>

              {/* Close shift form */}
              <div className="border-t border-border/50 pt-4 space-y-3">
                <label className="block text-sm font-bold text-destructive">
                  {t("shift_close_title")}
                </label>

                {/* Expense items deducted this shift */}
                {shiftExpenseItems.length > 0 && (
                  <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 overflow-hidden">
                    <div className="px-3 py-2 border-b border-orange-500/20">
                      <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wide">
                        {t("shift_close_expenses_label")}
                      </p>
                    </div>
                    <div className="divide-y divide-orange-500/10">
                      {shiftExpenseItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2">
                          <span className="text-sm text-foreground/80 truncate max-w-[65%]">
                            {item.title || "—"}
                          </span>
                          <span className="text-sm font-mono font-semibold text-orange-500 tabular-nums shrink-0">
                            −{item.amount.toFixed(2)} {egp}
                          </span>
                        </div>
                      ))}
                    </div>
                    {shiftExpenseItems.length > 1 && (
                      <div className="flex items-center justify-between px-3 py-2 border-t border-orange-500/20 bg-orange-500/8">
                        <span className="text-xs font-bold text-orange-600">{t("shift_receipt_expenses")}</span>
                        <span className="text-sm font-mono font-bold text-orange-500 tabular-nums">
                          −{shiftExpenses.toFixed(2)} {egp}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder={t("shift_actual_cash_placeholder")}
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleClose()}
                    className="h-12 flex-1 rounded-xl border border-destructive/40 bg-background px-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-destructive/30"
                  />
                  <button
                    onClick={handleClose}
                    disabled={closeShift.isPending || !actualCash}
                    className="h-12 px-5 flex items-center gap-2 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm disabled:opacity-50 whitespace-nowrap"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {closeShift.isPending ? t("loading") : t("shift_close_btn")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Shift history table ── */}
      <div className="card-base rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-bold text-base">
            {isMgmt ? t("shift_history_title") : t("shift_cashier_history_title")}
          </h3>
          <span className="text-sm text-muted-foreground tabular-nums">{closedShifts.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir={lang === "ar" ? "rtl" : "ltr"}
            style={{ minWidth: isMgmt ? "560px" : "320px" }}>
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                {isMgmt && (
                  <th className="px-4 py-3 text-start text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("shift_col_cashier")}
                  </th>
                )}
                <th className="px-4 py-3 text-start text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("shift_col_date")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("shift_col_sessions")}
                </th>
                <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("shift_col_orders")}
                </th>
                {isMgmt && (
                  <>
                    <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("shift_col_revenue")}
                    </th>
                    <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("shift_col_expected")}
                    </th>
                    <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("shift_col_actual")}
                    </th>
                    <th className="px-4 py-3 text-end text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("shift_col_diff")}
                    </th>
                  </>
                )}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {closedShifts.length === 0 && (
                <tr>
                  <td colSpan={isMgmt ? 9 : 4} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    {t("shift_no_history")}
                  </td>
                </tr>
              )}
              {closedShifts.map((shift: any) => {
                const durationMins = shift.durationMinutes ?? 0;
                return (
                  <tr
                    key={shift.id}
                    onClick={() => openDrawerForShift(shift)}
                    className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors active:bg-muted/50 group"
                  >
                    {/* Cashier — mgmt only */}
                    {isMgmt && (
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">{shift.userName || "—"}</p>
                      </td>
                    )}

                    {/* Date + duration */}
                    <td className="px-4 py-3">
                      <p className="text-sm">
                        {format(new Date(shift.openedAt), "dd/MM/yyyy")}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(shift.openedAt).toLocaleTimeString(
                          lang === "ar" ? "ar-EG" : "en-US",
                          { hour: "2-digit", minute: "2-digit", hour12: true }
                        )}
                        {durationMins > 0 && (
                          <span className="ms-2 text-primary/70">{fmtDuration(durationMins, t("dash_hour_short"), t("dash_minute_short"))}</span>
                        )}
                      </p>
                    </td>

                    {/* Sessions count */}
                    <td className="px-4 py-3 text-end">
                      <span className="text-sm tabular-nums text-muted-foreground">{shift.sessionCount ?? 0}</span>
                    </td>

                    {/* Orders count */}
                    <td className="px-4 py-3 text-end">
                      <span className="text-sm tabular-nums text-muted-foreground">{shift.orderCount ?? 0}</span>
                    </td>

                    {/* Revenue — mgmt only */}
                    {isMgmt && (
                      <td className="px-4 py-3 text-end">
                        {(shift.totalRevenue ?? 0) > 0 ? (
                          <span className="font-mono font-bold text-emerald-500 text-sm tabular-nums">
                            {(shift.totalRevenue ?? 0).toFixed(2)}
                            <span className="text-[10px] font-normal text-muted-foreground ms-1">{egp}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                    )}

                    {/* Expected / Actual / Diff — mgmt only */}
                    {isMgmt && (
                      <>
                        <td className="px-4 py-3 text-end">
                          <span className="font-mono text-sm tabular-nums text-muted-foreground">
                            {shift.expectedCash != null ? shift.expectedCash.toFixed(2) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <span className="font-mono text-sm tabular-nums">
                            {shift.actualCash != null ? shift.actualCash.toFixed(2) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <DiffBadge value={shift.difference} egp={egp} />
                        </td>
                      </>
                    )}

                    {/* Arrow */}
                    <td className="px-3 py-3">
                      <ChevronRight className={cn(
                        "h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors",
                        lang === "ar" && "rotate-180"
                      )} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      <ShiftDetailDrawer
        shiftId={drawerShiftId}
        initialTab={drawerInitTab}
        shiftMeta={drawerMeta}
        isMgmt={isMgmt}
        onClose={() => { setDrawerShiftId(null); setDrawerMeta(null); }}
      />
    </div>
  );
}
