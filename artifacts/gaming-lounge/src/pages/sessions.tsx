import { useState } from "react";
import {
  useListActiveSessions,
  usePauseSession,
  useResumeSession,
  useEndSession,
  useCreatePayment,
  useVerifyPayment,
  getListActiveSessionsQueryKey,
  getListAssetsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Clock, Pause, Play, SquareSquare, Receipt, Banknote, CreditCard, Smartphone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-language";

type PaymentMethod = "cash" | "instapay" | "visa";

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-5 w-5" />,
  instapay: <Smartphone className="h-5 w-5" />,
  visa: <CreditCard className="h-5 w-5" />,
};

interface CheckoutState {
  sessionId: number;
  assetName: string;
  currentCost: number;
}

export default function Sessions() {
  const { t, dir } = useLang();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 8000 }
  });

  const pauseSession  = usePauseSession();
  const resumeSession = useResumeSession();
  const endSession    = useEndSession();
  const createPayment = useCreatePayment();
  const verifyPayment = useVerifyPayment();

  const [checkout, setCheckout]         = useState<CheckoutState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountStr, setAmountStr]       = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: t("pay_cash"),
    instapay: t("pay_instapay"),
    visa: t("pay_visa"),
  };

  const openCheckout = (session: { id: number; assetName?: string | null; assetNameAr?: string | null; currentCost: number }) => {
    setCheckout({
      sessionId: session.id,
      assetName: session.assetNameAr || session.assetName || `${t("session_label")} #${session.id}`,
      currentCost: session.currentCost,
    });
    setPaymentMethod("cash");
    setAmountStr(session.currentCost.toFixed(2));
  };

  const closeCheckout = () => {
    if (isProcessing) return;
    setCheckout(null);
    setAmountStr("");
  };

  const handleCheckoutConfirm = async () => {
    if (!checkout) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("amount_invalid"));
      return;
    }
    if (amount < checkout.currentCost) {
      toast.error(`${t("amount_too_low_error")} (${checkout.currentCost.toFixed(2)} ج.م)`);
      return;
    }

    setIsProcessing(true);
    try {
      const payment = await createPayment.mutateAsync({
        data: { sessionId: checkout.sessionId, method: paymentMethod, amount },
      });
      await verifyPayment.mutateAsync({ paymentId: payment.id, data: {} });
      await endSession.mutateAsync({ sessionId: checkout.sessionId });

      toast.success(t("session_ended_ok"));
      setCheckout(null);
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || t("error_generic"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseResume = async (action: "pause" | "resume", sessionId: number) => {
    try {
      if (action === "pause") await pauseSession.mutateAsync({ sessionId });
      if (action === "resume") await resumeSession.mutateAsync({ sessionId });
      toast.success(t("session_updated"));
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
    } catch {
      toast.error(t("error_generic"));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t("sessions_title")}</h2>
          <p className="text-muted-foreground mt-1">{t("sessions_subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground rounded-xl card-base">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">{t("no_active_sessions")}</h3>
            <p>{t("no_sessions_hint")}</p>
            <Link href="/assets">
              <Button className="mt-4">{t("go_to_devices")}</Button>
            </Link>
          </div>
        ) : (
          sessions?.map((session) => {
            const isPaused = session.status === "paused";
            return (
              <Card
                key={session.id}
                className={`relative overflow-hidden border-s-4 ${isPaused ? "border-s-amber-500" : "border-s-primary"}`}
              >
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-md">
                        <Gamepad2 className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{session.assetNameAr || session.assetName}</CardTitle>
                        <div className="flex items-center gap-1 text-xs font-medium mt-1">
                          <span className={isPaused ? "text-amber-500" : "text-emerald-500"}>
                            {isPaused ? t("session_status_paused") : t("session_status_playing")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-0 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("elapsed_time")}</p>
                      <p className="text-2xl font-mono font-bold tracking-tight">
                        {Math.floor(session.currentMinutes / 60).toString().padStart(2, "0")}:
                        {(session.currentMinutes % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm text-muted-foreground mb-1">{t("current_cost")}</p>
                      <p className="text-2xl font-bold text-emerald-500">
                        {session.currentCost.toFixed(2)}
                        <span className="text-sm text-emerald-500/70 ms-1">ج.م</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {isPaused ? (
                      <Button
                        variant="default"
                        className="h-14 font-bold text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                        onClick={() => handlePauseResume("resume", session.id)}
                        disabled={resumeSession.isPending}
                      >
                        <Play className="me-2 h-5 w-5" />
                        {t("resume")}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-14 font-bold text-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shadow-lg"
                        onClick={() => handlePauseResume("pause", session.id)}
                        disabled={pauseSession.isPending}
                      >
                        <Pause className="me-2 h-5 w-5" />
                        {t("pause")}
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      className="h-14 font-bold text-lg shadow-lg"
                      onClick={() => openCheckout(session)}
                    >
                      <SquareSquare className="me-2 h-5 w-5" />
                      {t("end_and_pay")}
                    </Button>

                    <Link href={`/sessions/${session.id}`} className="col-span-2">
                      <Button variant="outline" className="w-full h-12">
                        <Receipt className="me-2 h-4 w-4" />
                        {t("session_details_btn")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!checkout} onOpenChange={closeCheckout}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5 text-emerald-500" />
              {t("checkout_title")}
            </DialogTitle>
          </DialogHeader>

          {checkout && (
            <div className="space-y-5 py-2">
              <div className="rounded-xl bg-secondary/50 border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">{checkout.assetName}</p>
                <p className="text-4xl font-bold text-emerald-500">{checkout.currentCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("egp_label")}</p>
              </div>

              <div className="space-y-2">
                <Label>{t("payment_method")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "instapay", "visa"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        paymentMethod === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {PAYMENT_METHOD_ICONS[m]}
                      {PAYMENT_METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("received_amount")} (ج.م)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={checkout.currentCost}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="text-xl font-bold h-12 text-center"
                  dir="ltr"
                />
                {parseFloat(amountStr) > checkout.currentCost && (
                  <p className="text-sm text-amber-500 text-center">
                    {t("change_due")}: {(parseFloat(amountStr) - checkout.currentCost).toFixed(2)} ج.م
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={closeCheckout} disabled={isProcessing} className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCheckoutConfirm}
              disabled={isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("processing")}
                </span>
              ) : (
                t("confirm_payment")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
