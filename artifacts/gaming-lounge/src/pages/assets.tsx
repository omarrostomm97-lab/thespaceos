import { useState } from "react";
import { motion } from "framer-motion";
import {
  useListAssets,
  useStartSession,
  useCreateAsset,
  useUpdateAsset,
  useGenerateAssetQr,
  getListAssetsQueryKey,
  getListActiveSessionsQueryKey,
} from "@workspace/api-client-react";
import type { Asset } from "@workspace/api-client-react";
import { useLang } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Gamepad2, Tv, Trophy, Play, Plus, Pencil, Wind, Target,
  QrCode, Printer, RefreshCw, Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { TranslationKey } from "@/lib/i18n";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

const ASSET_TYPES: { value: string; labelKey: TranslationKey }[] = [
  { value: "ps",         labelKey: "type_ps" },
  { value: "billiard",   labelKey: "type_billiard" },
  { value: "air_hockey", labelKey: "type_air_hockey" },
  { value: "babyfoot",   labelKey: "type_babyfoot" },
  { value: "other",      labelKey: "type_other" },
];

function getAssetIcon(type: string, className = "h-7 w-7") {
  switch (type) {
    case "ps":         return <Tv className={className} />;
    case "billiard":   return <Trophy className={className} />;
    case "air_hockey": return <Wind className={className} />;
    case "babyfoot":   return <Target className={className} />;
    default:           return <Gamepad2 className={className} />;
  }
}

/* ─── Premium Asset Card ─────────────────────────────── */

interface AssetCardProps {
  asset: Asset;
  isMgmt: boolean;
  onEdit: (a: Asset) => void;
  onQr: (a: Asset) => void;
  onStart: (id: number) => void;
  starting: boolean;
  t: (key: TranslationKey) => string;
  lang: string;
}

function AssetCard({ asset, isMgmt, onEdit, onQr, onStart, starting, t, lang }: AssetCardProps) {
  const isAvailable = asset.status === "available";

  const glowColor  = isAvailable ? "rgba(0, 111, 238, 0.25)" : "rgba(245, 165, 36, 0.25)";
  const accentColor = isAvailable ? "#006FEE" : "#f5a524";
  const accentGrad  = isAvailable
    ? "linear-gradient(90deg, #006FEE, #338ef7)"
    : "linear-gradient(90deg, #f5a524, #f5a524cc)";
  const iconGrad    = isAvailable
    ? "linear-gradient(135deg, rgba(0,111,238,0.22) 0%, rgba(51,142,247,0.10) 100%)"
    : "linear-gradient(135deg, rgba(245,165,36,0.22) 0%, rgba(245,165,36,0.08) 100%)";
  const iconColor   = isAvailable ? "#338ef7" : "#f5a524";

  return (
    <motion.div
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-col overflow-hidden rounded-2xl cursor-default"
      style={{
        background: "linear-gradient(145deg, var(--asset-card-from) 0%, var(--asset-card-to) 100%)",
        border: "1px solid var(--asset-card-border)",
        boxShadow: "var(--asset-card-shadow)",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = `var(--asset-card-hover-shadow-base), 0 0 0 1px ${accentColor}40, 0 0 32px ${glowColor}`;
        el.style.borderColor = `${accentColor}50`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "var(--asset-card-shadow)";
        el.style.borderColor = "var(--asset-card-border)";
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-2xl" style={{ background: accentGrad }} />

      {/* Top corner inner shine */}
      <div
        className="absolute top-0 left-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top right, ${accentColor}08 0%, transparent 70%)` }}
      />

      {/* ── Card Body ── */}
      <div className="p-5 flex flex-col flex-1 pt-6">

        {/* Top row: icon + action buttons */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: iconGrad,
              boxShadow: `0 0 20px ${accentColor}20, inset 0 1px 0 var(--asset-card-shine)`,
              border: `1px solid ${accentColor}20`,
            }}
          >
            <div style={{ color: iconColor }}>{getAssetIcon(asset.type, "h-7 w-7")}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Status badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
              style={
                isAvailable
                  ? { background: "rgba(23,201,100,0.12)", border: "1px solid rgba(23,201,100,0.2)", color: "#17c964" }
                  : { background: "rgba(245,165,36,0.12)", border: "1px solid rgba(245,165,36,0.25)", color: "#f5a524" }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isAvailable ? "#17c964" : "#f5a524",
                  boxShadow: isAvailable ? "0 0 6px rgba(23,201,100,0.8)" : "0 0 6px rgba(245,165,36,0.8)",
                }}
              />
              {isAvailable ? t("status_available") : t("status_busy")}
            </div>

            {/* Icon buttons */}
            <div className="flex items-center gap-1">
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
                onClick={() => onQr(asset)}
                title={t("qr_title")}
              >
                <QrCode className="h-3.5 w-3.5" />
              </button>
              {isMgmt && (
                <button
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-150"
                  onClick={() => onEdit(asset)}
                  title={t("save")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-foreground leading-tight mb-1">
          {lang === "ar" ? (asset.nameAr || asset.name) : (asset.name || asset.nameAr)}
        </h3>

        {/* Type label */}
        <p className="text-xs text-muted-foreground mb-3">
          {t(ASSET_TYPES.find(t2 => t2.value === asset.type)?.labelKey ?? "type_other")}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-2xl font-bold tabular" style={{ fontFamily: "Inter, system-ui, sans-serif", color: accentColor }}>
            {asset.pricePerHour}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{t("price_per_hour")}</span>
        </div>

        {/* CTA button */}
        {isAvailable ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            style={{
              background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
              boxShadow: "0 4px 16px rgba(0,111,238,0.35), 0 1px 0 rgba(255,255,255,0.15) inset",
            }}
            onClick={() => onStart(asset.id)}
            disabled={starting}
          >
            <Zap className="h-4 w-4" />
            {t("start_session")}
          </motion.button>
        ) : (
          <Link href="/sessions" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: "rgba(245,165,36,0.1)",
                border: "1px solid rgba(245,165,36,0.3)",
                color: "#f5a524",
              }}
            >
              <Play className="h-4 w-4" />
              {t("view_session")}
            </motion.div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Form state ─────────────────────────────────────── */

interface FormState { nameAr: string; name: string; type: string; pricePerHour: string; }
const EMPTY_FORM: FormState = { nameAr: "", name: "", type: "ps", pricePerHour: "" };

/* ─── Page ───────────────────────────────────────────── */

export default function Assets() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t, dir, lang } = useLang();
  const isMgmt = MGMT_ROLES.includes(user?.role ?? "");

  const { data: assets, isLoading } = useListAssets();
  const startSession = useStartSession();
  const createAsset  = useCreateAsset();
  const updateAsset  = useUpdateAsset();
  const generateQr   = useGenerateAssetQr();

  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editingAsset, setEditingAsset]     = useState<Asset | null>(null);
  const [form, setForm]                     = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors]                 = useState<Partial<FormState>>({});
  const [qrDialogOpen, setQrDialogOpen]     = useState(false);
  const [qrAsset, setQrAsset]               = useState<Asset | null>(null);
  const [qrToken, setQrToken]               = useState<string | null>(null);
  const [qrLoading, setQrLoading]           = useState(false);
  const [qrConfirmRegen, setQrConfirmRegen] = useState(false);

  const openAdd = () => { setEditingAsset(null); setForm(EMPTY_FORM); setErrors({}); setDialogOpen(true); };
  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({ nameAr: asset.nameAr ?? "", name: asset.name, type: asset.type, pricePerHour: String(asset.pricePerHour) });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.nameAr.trim()) errs.nameAr = t("error_name_required");
    if (!form.type) errs.type = t("error_type_required");
    const price = parseFloat(form.pricePerHour);
    if (!form.pricePerHour || isNaN(price) || price <= 0) errs.pricePerHour = t("error_price_invalid");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const price = parseFloat(form.pricePerHour);
    const nameValue = form.name.trim() || form.nameAr.trim();
    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({ assetId: editingAsset.id, data: { name: nameValue, nameAr: form.nameAr.trim() || undefined, type: form.type as Asset["type"], pricePerHour: price } });
        toast.success(t("device_updated"));
      } else {
        await createAsset.mutateAsync({ data: { name: nameValue, nameAr: form.nameAr.trim() || undefined, type: form.type as Asset["type"], pricePerHour: price } });
        toast.success(t("device_added"));
      }
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast.error(t("error_generic"));
    }
  };

  const handleStartSession = async (assetId: number) => {
    try {
      const session = await startSession.mutateAsync({ data: { assetId } });
      toast.success(t("session_started"));
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      setLocation(`/sessions/${session.id}`);
    } catch {
      toast.error(t("session_error"));
    }
  };

  const openQr = async (asset: Asset) => {
    setQrAsset(asset); setQrConfirmRegen(false); setQrDialogOpen(true);
    if (asset.qrToken) {
      setQrToken(asset.qrToken);
    } else {
      setQrToken(null); setQrLoading(true);
      try {
        const result = await generateQr.mutateAsync({ assetId: asset.id });
        setQrToken(result.token);
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      } catch {
        toast.error(t("qr_error")); setQrDialogOpen(false);
      } finally { setQrLoading(false); }
    }
  };

  const handleRegenerate = async () => {
    if (!qrAsset) return;
    setQrConfirmRegen(false); setQrLoading(true);
    try {
      const result = await generateQr.mutateAsync({ assetId: qrAsset.id });
      setQrToken(result.token);
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      toast.success(t("qr_regenerated"));
    } catch {
      toast.error(t("qr_regen_error"));
    } finally { setQrLoading(false); }
  };

  const qrUrl = qrToken ? `${window.location.origin}/qr/${qrToken}` : "";
  const isSaving = createAsset.isPending || updateAsset.isPending;

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 rounded-xl bg-muted skeleton-shimmer" />
            <div className="h-4 w-36 rounded-lg bg-muted skeleton-shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 rounded-2xl skeleton-shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print target */}
      <div className="hidden print:flex flex-col items-center p-10" dir="rtl">
        {qrAsset && qrToken && (
          <>
            <p className="text-2xl font-bold mb-4">{qrAsset.nameAr || qrAsset.name}</p>
            <QRCodeSVG value={qrUrl} size={280} />
            <p className="mt-4 text-sm text-gray-500">{t("qr_scan_hint")}</p>
          </>
        )}
      </div>

      <div className="p-8 space-y-8 print:hidden">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,111,238,0.2) 0%, rgba(51,142,247,0.1) 100%)",
                border: "1px solid rgba(0,111,238,0.25)",
                boxShadow: "0 0 20px rgba(0,111,238,0.12)",
              }}
            >
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("assets_title")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("assets_subtitle")}</p>
            </div>
          </div>

          {isMgmt && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              style={{
                background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                boxShadow: "0 4px 16px rgba(0,111,238,0.3), 0 1px 0 rgba(255,255,255,0.12) inset",
              }}
            >
              <Plus className="h-4 w-4" />
              {t("add_device")}
            </motion.button>
          )}
        </div>

        {/* ── Empty state ── */}
        {assets?.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl text-center space-y-4"
            style={{ background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)", border: "1px dashed hsl(var(--border))" }}
          >
            <div className="p-5 rounded-2xl" style={{ background: "rgba(0,111,238,0.1)", border: "1px solid rgba(0,111,238,0.15)", boxShadow: "0 0 24px rgba(0,111,238,0.1)" }}>
              <Gamepad2 className="h-12 w-12 text-primary opacity-60" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t("no_devices")}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm max-w-xs leading-relaxed">{t("no_devices_hint")}</p>
            </div>
            {isMgmt && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
                style={{ background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)", boxShadow: "0 4px 16px rgba(0,111,238,0.3)" }}
              >
                <Plus className="h-4 w-4" />
                {t("add_first_device")}
              </motion.button>
            )}
          </div>
        )}

        {/* ── Asset grid ── */}
        {assets && assets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <AssetCard
                  asset={asset}
                  isMgmt={isMgmt}
                  onEdit={openEdit}
                  onQr={openQr}
                  onStart={handleStartSession}
                  starting={startSession.isPending}
                  t={t}
                  lang={lang}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Add / Edit dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" dir={dir}>
            <DialogHeader>
              <DialogTitle>{editingAsset ? t("edit_device_title") : t("add_device_title")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="nameAr">{t("device_name_ar")} <span className="text-destructive">{t("required")}</span></Label>
                <Input id="nameAr" placeholder="مثال: بلايستيشن 1" value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} />
                {errors.nameAr && <p className="text-xs text-destructive">{errors.nameAr}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("device_name_en")} <span className="text-muted-foreground text-xs">{t("device_name_en_hint")}</span></Label>
                <Input id="name" placeholder="PlayStation 1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">{t("device_type")} <span className="text-destructive">{t("required")}</span></Label>
                <select
                  id="type"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-right"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {ASSET_TYPES.map(at => <option key={at.value} value={at.value}>{t(at.labelKey)}</option>)}
                </select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pricePerHour">{t("price_per_hour_label")} <span className="text-destructive">{t("required")}</span></Label>
                <Input id="pricePerHour" type="number" min="0" step="0.5" placeholder="30" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))} />
                {errors.pricePerHour && <p className="text-xs text-destructive">{errors.pricePerHour}</p>}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>{t("cancel")}</Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? t("saving") : editingAsset ? t("save_changes") : t("add_device")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── QR dialog ── */}
        <Dialog open={qrDialogOpen} onOpenChange={(open) => { setQrDialogOpen(open); if (!open) setQrConfirmRegen(false); }}>
          <DialogContent className="sm:max-w-sm" dir={dir}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t("qr_title")} — {qrAsset?.nameAr || qrAsset?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-4 space-y-4">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">{t("generating_qr")}</p>
                </div>
              ) : qrToken ? (
                <>
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG value={qrUrl} size={200} />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">{t("qr_scan_hint")}</p>
                  <p className="text-xs text-center text-muted-foreground/60 font-mono break-all px-2">{qrUrl}</p>
                </>
              ) : null}
            </div>
            {qrConfirmRegen && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600 space-y-2">
                <p className="font-semibold">{t("qr_confirm_title")}</p>
                <p className="text-xs">{t("qr_confirm_body")}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="destructive" onClick={handleRegenerate} disabled={qrLoading}>{t("qr_confirm_yes")}</Button>
                  <Button size="sm" variant="outline" onClick={() => setQrConfirmRegen(false)}>{t("cancel")}</Button>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse">
              {!qrConfirmRegen && isMgmt && (
                <Button variant="outline" size="sm" onClick={() => setQrConfirmRegen(true)} disabled={qrLoading} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("regenerate_qr")}
                </Button>
              )}
              <Button size="sm" onClick={() => window.print()} disabled={!qrToken || qrLoading} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                {t("print")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
