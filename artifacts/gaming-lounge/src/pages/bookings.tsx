import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Plus, X, Clock, User, FileText, ChevronDown, AlertCircle,
} from "lucide-react";
import {
  useListBookings, useCreateBooking, useCancelBooking, useListAssets,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import type { Booking } from "@workspace/api-client-react";
import { useLang } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShiftGate } from "@/components/shift-gate";
import type { TranslationKey } from "@/lib/i18n";

const DURATIONS: { value: number; key: TranslationKey }[] = [
  { value: 30,  key: "dur_30"  },
  { value: 60,  key: "dur_60"  },
  { value: 90,  key: "dur_90"  },
  { value: 120, key: "dur_120" },
  { value: 180, key: "dur_180" },
  { value: 240, key: "dur_240" },
];

function fmtTime(dt: string | Date) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDate(dt: string | Date, lang: string) {
  return new Date(dt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function todayStr() { return new Date().toISOString().split("T")[0]; }

function defaultStartTime() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:00`;
}

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  upcoming:  { bg: "rgba(0,111,238,0.1)",   border: "rgba(0,111,238,0.25)",  color: "#006FEE" },
  active:    { bg: "rgba(23,201,100,0.1)",   border: "rgba(23,201,100,0.25)", color: "#17c964" },
  cancelled: { bg: "rgba(243,18,96,0.1)",    border: "rgba(243,18,96,0.25)",  color: "#f31260" },
  completed: { bg: "rgba(100,116,139,0.1)",  border: "rgba(100,116,139,0.25)",color: "#64748b" },
};

type Filter = "all" | "upcoming" | "cancelled";

interface BookingForm {
  assetId: string;
  customerName: string;
  date: string;
  startTime: string;
  durationMin: number;
  notes: string;
}

const EMPTY_FORM: BookingForm = {
  assetId: "", customerName: "", date: todayStr(),
  startTime: defaultStartTime(), durationMin: 60, notes: "",
};

export default function Bookings() {
  const { t, dir, lang } = useLang();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<Filter>("upcoming");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useListBookings();
  const { data: assets = [] } = useListAssets();
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  const filtered = useMemo<Booking[]>(() => {
    if (filter === "upcoming")  return bookings.filter(b => b.status === "upcoming");
    if (filter === "cancelled") return bookings.filter(b => b.status === "cancelled");
    return bookings;
  }, [bookings, filter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.assetId || !form.date || !form.startTime) {
      setFormError(`${t("booking_room")}, ${t("booking_date")}, ${t("booking_start_time")} ${lang === "ar" ? "مطلوبة" : "required"}`);
      return;
    }
    const startsAt = new Date(`${form.date}T${form.startTime}`).toISOString();
    const endsAt   = new Date(new Date(startsAt).getTime() + form.durationMin * 60_000).toISOString();
    try {
      await createBooking.mutateAsync({
        data: {
          assetId:      parseInt(form.assetId),
          customerName: form.customerName || undefined,
          startsAt,
          endsAt,
          notes: form.notes || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      toast.success(t("booking_created_ok"));
      setDialogOpen(false);
      setFormError(null);
    } catch (err: unknown) {
      const body = (err as { response?: { data?: { error?: string } } })?.response?.data ?? {};
      if ((body as { error?: string })?.error === "booking_conflict") {
        setFormError(t("booking_conflict_err"));
      } else {
        setFormError(lang === "ar" ? "حدث خطأ" : "An error occurred");
      }
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelBooking.mutateAsync({ bookingId: id });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      toast.success(t("booking_cancelled_ok"));
      setConfirmId(null);
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const filterBtnStyle = (active: boolean) => ({
    background: active ? "rgba(0,111,238,0.15)" : "var(--sb-glass-bg)",
    border: `1px solid ${active ? "rgba(0,111,238,0.3)" : "var(--sb-glass-border)"}`,
    color: active ? "#006FEE" : "var(--sb-text-inactive)",
    fontWeight: active ? 600 : 500,
  } as React.CSSProperties);

  return (
    <ShiftGate>
      <div className="p-6 space-y-6 max-w-5xl mx-auto" dir={dir}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(0,111,238,0.2) 0%, rgba(51,142,247,0.1) 100%)", border: "1px solid rgba(0,111,238,0.2)" }}
            >
              <CalendarCheck className="h-5 w-5" style={{ color: "#006FEE" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("bookings_title")}</h1>
              <p className="text-xs text-muted-foreground">
                {bookings.filter(b => b.status === "upcoming").length}
                {" "}{lang === "ar" ? "حجز قادم" : "upcoming"}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white focus-visible:outline-none"
            style={{ background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)", boxShadow: "0 4px 14px rgba(0,111,238,0.35)" }}
          >
            <Plus className="h-4 w-4" />
            {t("booking_new")}
          </motion.button>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {(["upcoming", "all", "cancelled"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={filterBtnStyle(filter === f)}
            >
              {t(`booking_filter_${f}` as TranslationKey)}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,111,238,0.08)", border: "1px solid rgba(0,111,238,0.12)" }}
            >
              <CalendarCheck className="h-8 w-8" style={{ color: "rgba(0,111,238,0.4)" }} />
            </div>
            <p className="text-foreground font-semibold">{t("booking_empty")}</p>
            <p className="text-xs text-muted-foreground">{t("booking_empty_sub")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((b, i) => {
                const style = STATUS_STYLE[b.status] ?? STATUS_STYLE.upcoming;
                const assetLabel = lang === "ar"
                  ? (b.assetNameAr || b.assetName || "—")
                  : (b.assetName || b.assetNameAr || "—");
                const durationMin = Math.round(
                  (new Date(b.endsAt).getTime() - new Date(b.startsAt).getTime()) / 60_000
                );
                const durKey = DURATIONS.find(d => d.value === durationMin)?.key;
                const durLabel = durKey ? t(durKey) : `${durationMin} ${lang === "ar" ? "د" : "min"}`;

                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className="card-base rounded-2xl p-4 flex items-center gap-4 flex-wrap"
                  >
                    {/* Status dot */}
                    <div
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{ background: style.color, boxShadow: `0 0 6px ${style.color}99` }}
                    />

                    {/* Date/time block */}
                    <div className="shrink-0 text-center min-w-[72px]">
                      <p className="text-[11px] text-muted-foreground">{fmtDate(b.startsAt, lang)}</p>
                      <p className="text-sm font-bold text-foreground tabular">{fmtTime(b.startsAt)}</p>
                      <p className="text-[11px] text-muted-foreground">→ {fmtTime(b.endsAt)}</p>
                    </div>

                    {/* Room & customer */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-foreground truncate">{assetLabel}</p>
                      {b.customerName && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{b.customerName}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
                        >
                          {t(`booking_status_${b.status}` as TranslationKey)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {durLabel}
                        </span>
                        {b.notes && (
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{b.notes}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cancel action */}
                    {b.status === "upcoming" && (
                      <div>
                        {confirmId === b.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{t("booking_cancel_confirm")}</span>
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelBooking.isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: "rgba(243,18,96,0.1)", border: "1px solid rgba(243,18,96,0.2)", color: "#f31260" }}
                            >
                              {lang === "ar" ? "تأكيد" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground"
                              style={{ background: "var(--sb-glass-bg)", border: "1px solid var(--sb-glass-border)" }}
                            >
                              {lang === "ar" ? "لا" : "No"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(b.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                            style={{ background: "rgba(243,18,96,0.07)", border: "1px solid rgba(243,18,96,0.15)", color: "#f31260" }}
                          >
                            <X className="h-3.5 w-3.5" />
                            {t("booking_cancel_btn")}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ── New Booking Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" dir={dir}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" style={{ color: "#006FEE" }} />
                {t("booking_new")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Room */}
              <div className="space-y-1.5">
                <Label>{t("booking_room")} <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm appearance-none"
                    value={form.assetId}
                    onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}
                    style={{ direction: dir }}
                  >
                    <option value="">{t("booking_select_room")}</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {lang === "ar" ? (a.nameAr || a.name) : (a.name || a.nameAr)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                    style={{ insetInlineEnd: "10px" }}
                  />
                </div>
              </div>

              {/* Customer name */}
              <div className="space-y-1.5">
                <Label>{t("booking_customer")}</Label>
                <Input
                  placeholder={lang === "ar" ? "أحمد محمد" : "Ahmed Mohamed"}
                  value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                />
              </div>

              {/* Date + Time row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("booking_date")} <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={form.date}
                    min={todayStr()}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("booking_start_time")} <span className="text-destructive">*</span></Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <Label>{t("booking_duration")}</Label>
                <div className="relative">
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm appearance-none"
                    value={form.durationMin}
                    onChange={e => setForm(f => ({ ...f, durationMin: parseInt(e.target.value) }))}
                    style={{ direction: dir }}
                  >
                    {DURATIONS.map(d => (
                      <option key={d.value} value={d.value}>{t(d.key)}</option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                    style={{ insetInlineEnd: "10px" }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>{t("booking_notes_label")}</Label>
                <Input
                  placeholder={lang === "ar" ? "أي ملاحظات إضافية..." : "Any extra notes..."}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Error */}
              {formError && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "rgba(243,18,96,0.08)", border: "1px solid rgba(243,18,96,0.2)", color: "#f31260" }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={createBooking.isPending}
                  style={{ background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)" }}
                >
                  {createBooking.isPending
                    ? (lang === "ar" ? "جاري الحجز..." : "Booking...")
                    : t("booking_save_btn")
                  }
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ShiftGate>
  );
}
