import { useState } from "react";
import {
  useGetFinanceDailySummary,
  useGetFinanceProfitLoss,
  useGetFinanceExpensesReport,
  useGetFinanceCashFlow,
  useGetFinanceShiftDifferences,
} from "@workspace/api-client-react";
import { useLang } from "@/hooks/use-language";
import { FadeIn } from "@/components/motion";
import { BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { cn } from "@/lib/utils";

type ReportTab = "daily" | "profitloss" | "expenses" | "cashflow" | "shifts";

export default function FinanceReports() {
  const { t, lang } = useLang();
  const EGP = (n: number | string | null | undefined) => {
    const egp = t("egp_label");
    return n != null ? `${parseFloat(String(n)).toFixed(2)} ${egp}` : `0.00 ${egp}`;
  };
  const [tab, setTab] = useState<ReportTab>("profitloss");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  const { data: daily, isLoading: dailyLoading } = useGetFinanceDailySummary({ date: selectedDate }, { query: { enabled: tab === "daily" } as any });
  const { data: pl, isLoading: plLoading } = useGetFinanceProfitLoss({ period }, { query: { enabled: tab === "profitloss" } as any });
  const { data: expReport, isLoading: expLoading } = useGetFinanceExpensesReport({ period }, { query: { enabled: tab === "expenses" } as any });
  const { data: cashflow, isLoading: cfLoading } = useGetFinanceCashFlow({ period }, { query: { enabled: tab === "cashflow" } as any });
  const { data: shifts, isLoading: shiftsLoading } = useGetFinanceShiftDifferences({ period }, { query: { enabled: tab === "shifts" } as any });

  const TABS: { id: ReportTab; label: string }[] = [
    { id: "profitloss", label: t("finance_report_profit_loss") },
    { id: "daily",      label: t("finance_report_daily") },
    { id: "expenses",   label: t("finance_report_expenses") },
    { id: "cashflow",   label: t("finance_report_cash_flow") },
    { id: "shifts",     label: t("finance_report_shifts") },
  ];

  const PeriodPicker = () => (
    <div className="flex gap-2">
      {(["week", "month", "quarter"] as const).map(p => (
        <button key={p} onClick={() => setPeriod(p)}
          className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition",
            period === p ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}>
          {p === "week" ? t("period_week") : p === "month" ? t("period_month") : (lang === "ar" ? "ربع سنة" : "Quarter")}
        </button>
      ))}
    </div>
  );

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t("finance_reports_title")}</h1>
          <p className="text-xs text-muted-foreground">{t("finance_subtitle")}</p>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={cn("px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0",
              tab === tb.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── PROFIT & LOSS ── */}
      {tab === "profitloss" && (
        <div className="space-y-4">
          <PeriodPicker />
          {plLoading ? <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div> : pl ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "الدخل" : "Income"}</p>
                  <p className="text-lg font-bold text-emerald-500 tabular">{EGP(pl.totalIncome)}</p>
                </div>
                <div className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("finance_expenses")}</p>
                  <p className="text-lg font-bold text-red-500 tabular">{EGP(pl.totalExpenses)}</p>
                </div>
                <div className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("finance_report_net_profit")}</p>
                  <p className={cn("text-lg font-bold tabular", pl.netProfit >= 0 ? "text-primary" : "text-red-500")}>{EGP(pl.netProfit)}</p>
                </div>
              </div>
              {pl.expensesByCategory.length > 0 && (
                <div className="card-base rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold">{t("finance_report_by_category")}</p>
                  {pl.expensesByCategory.map((cat: any) => {
                    const pct = pl.totalExpenses > 0 ? (cat.total / pl.totalExpenses) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{lang === "ar" ? cat.nameAr ?? cat.name : cat.name}</span>
                          <span className="font-semibold tabular">{EGP(cat.total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── DAILY SUMMARY ── */}
      {tab === "daily" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t("finance_report_select_date")}</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {dailyLoading ? <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div> : daily ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("finance_report_verified_income"), val: daily.verifiedIncome, color: "text-emerald-500" },
                { label: t("finance_report_expenses_paid"), val: daily.expensesPaid, color: "text-red-500" },
                { label: t("finance_report_net_profit"), val: daily.netProfit, color: daily.netProfit >= 0 ? "text-primary" : "text-red-500" },
                { label: t("finance_report_cash_difference"), val: daily.cashDifference, color: daily.cashDifference === 0 ? "text-emerald-500" : "text-amber-500" },
                { label: t("finance_capital_title"), val: daily.capitalAdded, color: "text-blue-500" },
                { label: t("finance_withdrawals_title"), val: daily.withdrawals, color: "text-purple-500" },
              ].map(item => (
                <div key={item.label} className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={cn("text-lg font-bold tabular", item.color)}>{EGP(item.val)}</p>
                </div>
              ))}
            </div>
          ) : <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">{t("finance_no_data")}</div>}
        </div>
      )}

      {/* ── EXPENSES REPORT ── */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <PeriodPicker />
          {expLoading ? <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div> : expReport ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("finance_total_paid")}</p>
                  <p className="text-xl font-bold text-red-500 tabular">{EGP(expReport.total)}</p>
                </div>
                <div className="card-base rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("finance_total_pending")}</p>
                  <p className="text-xl font-bold text-amber-500 tabular">{EGP(expReport.pending)}</p>
                </div>
              </div>
              {expReport.transactions.length > 0 && (
                <div className="space-y-2">
                  {expReport.transactions.map((tx: any) => (
                    <div key={tx.id} className="card-base rounded-xl flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tx.title ?? (lang === "ar" ? tx.categoryNameAr ?? tx.categoryName : tx.categoryName) ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.transactionDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}{tx.vendorName ? ` · ${tx.vendorName}` : ""}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-bold text-red-500 tabular">{EGP(tx.amount)}</p>
                        <p className={cn("text-[10px]", tx.status === "paid" ? "text-emerald-500" : "text-amber-500")}>{tx.status === "paid" ? t("finance_status_paid") : t("finance_status_pending")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── CASH FLOW ── */}
      {tab === "cashflow" && (
        <div className="space-y-4">
          <PeriodPicker />
          {cfLoading ? <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div> : cashflow && cashflow.dailyFlow.length > 0 ? (
            <div className="card-base rounded-2xl p-4">
              <p className="text-sm font-semibold mb-4">{t("finance_report_cash_flow")}</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cashflow.dailyFlow} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="cgIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17c964" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#17c964" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cgExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f31260" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f31260" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} ${t("egp_label")}`} />
                  <Area type="monotone" dataKey="income" stroke="#17c964" strokeWidth={2} fill="url(#cgIncome)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f31260" strokeWidth={2} fill="url(#cgExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">{t("finance_no_data")}</div>}
        </div>
      )}

      {/* ── SHIFT DIFFERENCES ── */}
      {tab === "shifts" && (
        <div className="space-y-4">
          <PeriodPicker />
          {shiftsLoading ? <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">{t("loading")}</div> : shifts && (shifts as any[]).length > 0 ? (
            <div className="space-y-2">
              {(shifts as any[]).map((s: any) => {
                const diff = s.difference ? parseFloat(s.difference) : 0;
                const isOk = diff === 0 || s.differenceExplanation;
                return (
                  <div key={s.id} className="card-base rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isOk ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                      {isOk ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{new Date(s.openedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</p>
                      {s.differenceExplanation && <p className="text-xs text-muted-foreground truncate">{s.differenceExplanation}</p>}
                    </div>
                    <div className="text-end shrink-0">
                      <p className={cn("text-sm font-bold tabular", diff === 0 ? "text-emerald-500" : "text-amber-500")}>
                        {diff === 0 ? t("finance_report_balanced") : `${diff > 0 ? "+" : ""}${diff.toFixed(2)} ${t("egp_label")}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">{t("finance_no_data")}</div>}
        </div>
      )}
    </FadeIn>
  );
}
