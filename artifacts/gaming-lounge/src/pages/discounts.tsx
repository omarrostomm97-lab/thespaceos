import { useState } from "react";
import {
  useListDiscountRequests,
  useApproveDiscountRequest,
  useRejectDiscountRequest,
  getListDiscountRequestsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/hooks/use-language";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tag, CheckCircle, XCircle, Clock, History, User, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "pending" | "history";
type ReviewAction = "approve" | "reject";

interface ReviewState {
  requestId: number;
  action: ReviewAction;
  adminNote: string;
}

export default function Discounts() {
  const { t, dir, lang } = useLang();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [review, setReview] = useState<ReviewState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: pending = [], isLoading: pendingLoading, refetch: refetchPending } = useListDiscountRequests(
    { status: "pending" },
    { query: { refetchInterval: 20000 } }
  );
  const { data: history = [], isLoading: historyLoading, refetch: refetchHistory } = useListDiscountRequests(
    { status: "history" },
    { query: { enabled: tab === "history", refetchInterval: 60000 } }
  );

  const approveMut = useApproveDiscountRequest();
  const rejectMut  = useRejectDiscountRequest();

  const requests = tab === "pending" ? pending : history;
  const isLoading = tab === "pending" ? pendingLoading : historyLoading;

  const openReview = (requestId: number, action: ReviewAction) => {
    setReview({ requestId, action, adminNote: "" });
  };

  const handleConfirmReview = async () => {
    if (!review) return;
    setIsSaving(true);
    try {
      if (review.action === "approve") {
        await approveMut.mutateAsync({ requestId: review.requestId, data: { adminNote: review.adminNote || undefined } });
        toast.success(t("discount_approve_ok"));
      } else {
        await rejectMut.mutateAsync({ requestId: review.requestId, data: { adminNote: review.adminNote || undefined } });
        toast.success(t("discount_reject_ok"));
      }
      queryClient.invalidateQueries({ queryKey: getListDiscountRequestsQueryKey({ status: "pending" }) });
      queryClient.invalidateQueries({ queryKey: getListDiscountRequestsQueryKey({ status: "history" }) });
      setReview(null);
    } catch {
      toast.error(t("discount_action_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const EGP = (n: number) => `${n.toFixed(2)} ج.م`;

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px]">{t("discount_pending_badge")}</Badge>;
    if (status === "approved") return <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px]">{t("discount_approved_badge")}</Badge>;
    return <Badge className="bg-destructive/20 text-destructive border border-destructive/30 text-[10px]">{t("discount_rejected_badge")}</Badge>;
  };

  const typeLabel = (type: string) => type === "session_time" ? t("discount_type_session") : t("discount_type_order");
  const kindLabel = (kind: string, value: number) =>
    kind === "percent" ? `${value}%` : `${value} ج.م`;

  return (
    <FadeIn className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {t("discounts_page_title")}
              {pending.length > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">{t("discounts_page_subtitle")}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => tab === "pending" ? refetchPending() : refetchHistory()}>
          <RotateCcw className="h-3.5 w-3.5 me-2" />
          {lang === "ar" ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition",
            tab === "pending" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {lang === "ar" ? "قيد الانتظار" : "Pending"}
          {pending.length > 0 && (
            <span className={cn("text-[10px] font-bold px-1 rounded-full", tab === "pending" ? "bg-white/20 text-white" : "bg-primary/20 text-primary")}>
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition",
            tab === "history" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          <History className="h-3.5 w-3.5" />
          {lang === "ar" ? "السجل" : "History"}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Tag className="h-12 w-12 text-muted-foreground/25" />
          <p className="font-semibold text-muted-foreground">
            {tab === "pending" ? t("discounts_empty") : (lang === "ar" ? "لا توجد طلبات خصم سابقة" : "No past discount requests")}
          </p>
          <p className="text-sm text-muted-foreground/60">
            {t("discounts_empty_hint")}
          </p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && requests.length > 0 && (
        <StaggerChildren className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map(req => {
            const isResolved = tab === "history";
            const isApproved = req.status === "approved";

            return (
              <StaggerItem key={req.id}>
                <div className="card-base rounded-2xl overflow-hidden relative">
                  <div
                    className="absolute top-0 inset-x-0 h-0.5"
                    style={{
                      background: isResolved
                        ? isApproved ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#ef4444,#f87171)"
                        : "linear-gradient(90deg,#006fee,#338ef7)"
                    }}
                  />

                  <div className="p-4 space-y-3">
                    {/* Type + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{typeLabel(req.type)}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {statusBadge(req.status)}
                          {req.sessionAssetNameAr || req.sessionAssetName ? (
                            <span className="text-xs text-muted-foreground">{req.sessionAssetNameAr || req.sessionAssetName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t("discount_session_label")} #{req.sessionId}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-bold">{kindLabel(req.discountKind, req.discountValue)}</p>
                        {req.billedMinutes !== null && req.billedMinutes !== undefined && (
                          <p className="text-[10px] text-muted-foreground">{req.billedMinutes} min</p>
                        )}
                      </div>
                    </div>

                    {/* Before / after preview */}
                    {(req.originalGamingCost !== null || req.originalOrderTotal !== null) && req.discountedAmount !== null && (
                      <div className="flex gap-4 text-xs bg-secondary/50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-muted-foreground">{t("discount_original")}</p>
                          <p className="font-semibold line-through text-muted-foreground">
                            {EGP(req.originalGamingCost ?? req.originalOrderTotal ?? 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("discount_after")}</p>
                          <p className="font-bold text-emerald-500">{EGP(req.discountedAmount)}</p>
                        </div>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{t("discount_session_label")} #{req.sessionId}</span>
                      {req.orderId && <span>{t("discount_order_ref")} #{req.orderId}</span>}
                      <span>{format(new Date(req.createdAt), "dd/MM HH:mm")}</span>
                    </div>

                    {/* Reason */}
                    {req.reason && (
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{t("discount_reason_label")}</p>
                        <p className="text-xs text-foreground leading-snug">{req.reason}</p>
                      </div>
                    )}

                    {/* Requested by */}
                    {req.requestedByName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span>{t("discount_requested_by")}: <span className="font-medium text-foreground">{req.requestedByName}</span></span>
                      </div>
                    )}

                    {/* Admin note (history) */}
                    {req.adminNote && (
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{t("discount_admin_note_label")}</p>
                        <p className="text-xs">{req.adminNote}</p>
                      </div>
                    )}

                    {/* Action buttons — pending only */}
                    {!isResolved && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
                          onClick={() => openReview(req.id, "approve")}
                        >
                          <CheckCircle className="h-4 w-4 me-1.5" />
                          {t("discount_approve_btn")}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 h-9 text-sm"
                          onClick={() => openReview(req.id, "reject")}
                        >
                          <XCircle className="h-4 w-4 me-1.5" />
                          {t("discount_reject_btn")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}

      {/* Review confirmation dialog */}
      <Dialog open={!!review} onOpenChange={() => !isSaving && setReview(null)}>
        <DialogContent className="max-w-sm" dir={dir}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", review?.action === "approve" ? "text-emerald-500" : "text-destructive")}>
              {review?.action === "approve"
                ? <><CheckCircle className="h-4 w-4" /> {t("discount_approve_btn")}</>
                : <><XCircle className="h-4 w-4" /> {t("discount_reject_btn")}</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("discount_admin_note_label")}</Label>
              <Textarea
                placeholder={t("discount_admin_note_placeholder")}
                value={review?.adminNote ?? ""}
                onChange={e => setReview(r => r ? { ...r, adminNote: e.target.value } : r)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReview(null)} disabled={isSaving} className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmReview}
              disabled={isSaving}
              className={cn("flex-1", review?.action === "approve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-destructive hover:bg-destructive/90 text-white")}
            >
              {isSaving ? t("discount_saving") : (review?.action === "approve" ? t("discount_approve_btn") : t("discount_reject_btn"))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
