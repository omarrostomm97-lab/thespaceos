import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListAssets,
  useListBookings,
  useStartSession,
  useCreateAsset,
  useUpdateAsset,
  useGenerateAssetQr,
  useGetDashboardSummary,
  getListAssetsQueryKey,
  getListActiveSessionsQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { Asset, Booking } from "@workspace/api-client-react";
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
  QrCode, Printer, RefreshCw, Zap, History, CalendarX, FileDown,
  ImageIcon, UploadCloud, X, Search, LayoutGrid, LayoutList,
  Users, TrendingUp, ChevronDown, MoreHorizontal, Camera,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { TranslationKey } from "@/lib/i18n";
import { ShiftGate } from "@/components/shift-gate";
import { cn } from "@/lib/utils";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

const ASSET_TYPES: { value: string; labelKey: TranslationKey }[] = [
  { value: "ps",         labelKey: "type_ps" },
  { value: "billiard",   labelKey: "type_billiard" },
  { value: "air_hockey", labelKey: "type_air_hockey" },
  { value: "babyfoot",   labelKey: "type_babyfoot" },
  { value: "other",      labelKey: "type_other" },
];

const TYPE_FILTER_KEYS: { value: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  { value: "all",       labelKey: "filter_all_rooms",   icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: "ps",        labelKey: "type_ps",             icon: <Tv className="h-3.5 w-3.5" /> },
  { value: "billiard",  labelKey: "type_billiard",       icon: <Trophy className="h-3.5 w-3.5" /> },
  { value: "air_hockey",labelKey: "type_air_hockey",     icon: <Wind className="h-3.5 w-3.5" /> },
  { value: "babyfoot",  labelKey: "type_babyfoot",       icon: <Target className="h-3.5 w-3.5" /> },
  { value: "other",     labelKey: "type_other",          icon: <Gamepad2 className="h-3.5 w-3.5" /> },
];

function getAssetIcon(type: string, className = "h-5 w-5") {
  switch (type) {
    case "ps":         return <Tv className={className} />;
    case "billiard":   return <Trophy className={className} />;
    case "air_hockey": return <Wind className={className} />;
    case "babyfoot":   return <Target className={className} />;
    default:           return <Gamepad2 className={className} />;
  }
}

function getTypePlaceholderGrad(type: string): string {
  switch (type) {
    case "ps":         return "from-blue-900 to-blue-950";
    case "billiard":   return "from-emerald-900 to-emerald-950";
    case "air_hockey": return "from-cyan-900 to-cyan-950";
    case "babyfoot":   return "from-amber-900 to-amber-950";
    default:           return "from-slate-800 to-slate-950";
  }
}

function fmtHHMM(dt: string | Date) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/* ─── Stat Tile ──────────────────────────────────────── */
function StatTile({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string | number; accent: string;
}) {
  return (
    <div className="card-base rounded-2xl flex items-center gap-3 px-4 py-3 flex-1 min-w-0 bg-card">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent + "20", color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold tabular leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ─── Desktop Photo Card ─────────────────────────────── */
interface AssetCardProps {
  asset: Asset;
  isMgmt: boolean;
  canStart: boolean;
  onEdit: (a: Asset) => void;
  onQr: (a: Asset) => void;
  onStart: (id: number) => void;
  starting: boolean;
  t: (key: TranslationKey) => string;
  lang: string;
  nextBooking?: Booking | null;
  onInlineUpload: (asset: Asset) => void;
  uploadingId: number | null;
}

function AssetCard({
  asset, isMgmt, canStart, onEdit, onQr, onStart, starting, t, lang,
  nextBooking, onInlineUpload, uploadingId,
}: AssetCardProps) {
  const isAvailable = asset.status === "available";
  const [moreOpen, setMoreOpen] = useState(false);
  const now = new Date();
  const isCurrentlyBooked =
    !!nextBooking &&
    new Date(nextBooking.startsAt) <= now &&
    new Date(nextBooking.endsAt) > now;

  const accentColor = isAvailable ? "#006FEE" : "#f5a524";
  const imageUrl = (asset as any).imageUrl as string | null;
  const name = lang === "ar"
    ? (asset.nameAr || asset.name)
    : (asset.name || asset.nameAr);
  const typeLabel = ASSET_TYPES.find(a => a.value === asset.type)?.labelKey ?? "type_other";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col rounded-2xl overflow-hidden bg-card card-base group"
      style={{ border: "1px solid hsl(var(--card-border))" }}
    >
      {/* ── Photo area ── */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isMgmt ? "cursor-pointer" : "cursor-default"
        )}
        style={{ aspectRatio: "16/10" }}
        onClick={() => { if (isMgmt) onInlineUpload(asset); }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name ?? ""}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex items-center justify-center",
            getTypePlaceholderGrad(asset.type)
          )}>
            <div style={{ color: accentColor, opacity: 0.5 }}>{getAssetIcon(asset.type, "h-10 w-10")}</div>
          </div>
        )}

        {/* Uploading overlay */}
        {uploadingId === asset.id && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-white text-xs font-semibold">{t("asset_uploading_photo")}</span>
          </div>
        )}

        {/* Camera icon hint on hover for mgmt */}
        {isMgmt && uploadingId !== asset.id && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none">
            <Camera className="h-7 w-7 text-white drop-shadow" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold backdrop-blur-sm"
          style={
            isAvailable
              ? { background: "rgba(23,201,100,0.18)", border: "1px solid rgba(23,201,100,0.3)", color: "#17c964" }
              : { background: "rgba(245,165,36,0.18)", border: "1px solid rgba(245,165,36,0.3)", color: "#f5a524" }
          }
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: isAvailable ? "#17c964" : "#f5a524",
              boxShadow: isAvailable ? "0 0 5px rgba(23,201,100,0.9)" : "0 0 5px rgba(245,165,36,0.9)",
            }}
          />
          {isAvailable ? t("status_available") : t("status_busy")}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        {/* Name + type icon row */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0" style={{ color: accentColor }}>
            {getAssetIcon(asset.type, "h-4 w-4")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{name}</h3>
            <p className="text-[11px] text-muted-foreground">{t(typeLabel)}</p>
          </div>
        </div>

        {/* Price + capacity */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold tabular" style={{ color: accentColor }}>{asset.pricePerHour}</span>
            <span className="text-[11px] text-muted-foreground">{t("price_per_hour")}</span>
          </div>
          {(asset as any).capacity && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{(asset as any).capacity}</span>
            </div>
          )}
        </div>

        {/* Booking warning */}
        {isCurrentlyBooked && (
          <div className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-1 rounded-md"
            style={{ background: "rgba(243,18,96,0.08)", border: "1px solid rgba(243,18,96,0.18)", color: "#f31260" }}>
            <CalendarX className="h-2.5 w-2.5 shrink-0" />
            {t("booking_reserved_until")} {fmtHHMM(nextBooking!.endsAt)}
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-1.5 mt-auto pt-0.5">
          {/* Primary CTA */}
          <div className="flex-1">
            {isAvailable && isCurrentlyBooked ? (
              <div className="h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"
                style={{ background: "rgba(243,18,96,0.08)", border: "1px solid rgba(243,18,96,0.18)", color: "#f31260" }}>
                <CalendarX className="h-3 w-3" /> {t("booking_reserved_until")}
              </div>
            ) : isAvailable && canStart ? (
              <button
                className="w-full h-8 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                  boxShadow: "0 3px 12px rgba(0,111,238,0.35)",
                }}
                onClick={() => onStart(asset.id)}
                disabled={starting}
              >
                <Zap className="h-3.5 w-3.5" />
                {t("start_session")}
              </button>
            ) : isAvailable && !canStart ? (
              <div className="h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)", color: "#64748b" }}>
                <Zap className="h-3.5 w-3.5 opacity-40" /> {t("start_session")}
              </div>
            ) : (
              <Link href="/sessions" className="block">
                <div className="h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                  style={{ background: "rgba(245,165,36,0.1)", border: "1px solid rgba(245,165,36,0.3)", color: "#f5a524" }}>
                  <Play className="h-3.5 w-3.5" /> {t("view_session")}
                </div>
              </Link>
            )}
          </div>

          {/* QR button */}
          <button
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border/40"
            onClick={() => onQr(asset)}
            title={t("qr_title")}
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>

          {/* More button (mgmt) */}
          {isMgmt && (
            <div className="relative shrink-0">
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border/40"
                onClick={() => setMoreOpen(v => !v)}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute end-0 top-9 z-20 w-36 rounded-xl border border-border/60 bg-popover shadow-xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors"
                        onClick={() => { setMoreOpen(false); onEdit(asset); }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("save")}
                      </button>
                      <Link href={`/assets/${asset.id}/history`}>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors"
                          onClick={() => setMoreOpen(false)}
                        >
                          <History className="h-3.5 w-3.5 text-muted-foreground" />
                          {t("asset_history_tab")}
                        </button>
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mobile List Row ────────────────────────────────── */
function AssetListRow({
  asset, isMgmt, canStart, onEdit, onQr, onStart, starting, t, lang,
  nextBooking, onInlineUpload, uploadingId,
}: AssetCardProps) {
  const isAvailable = asset.status === "available";
  const [moreOpen, setMoreOpen] = useState(false);
  const now = new Date();
  const isCurrentlyBooked =
    !!nextBooking &&
    new Date(nextBooking.startsAt) <= now &&
    new Date(nextBooking.endsAt) > now;

  const accentColor = isAvailable ? "#006FEE" : "#f5a524";
  const imageUrl = (asset as any).imageUrl as string | null;
  const name = lang === "ar"
    ? (asset.nameAr || asset.name)
    : (asset.name || asset.nameAr);
  const typeLabel = ASSET_TYPES.find(a => a.value === asset.type)?.labelKey ?? "type_other";

  return (
    <div className="card-base rounded-2xl overflow-hidden flex bg-card" style={{ border: "1px solid hsl(var(--card-border))" }}>
      {/* Photo thumbnail */}
      <div
        className={cn("relative shrink-0 w-28 sm:w-36", isMgmt ? "cursor-pointer" : "")}
        onClick={() => { if (isMgmt) onInlineUpload(asset); }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center min-h-[100px]", getTypePlaceholderGrad(asset.type))}>
            <div style={{ color: accentColor, opacity: 0.4 }}>{getAssetIcon(asset.type, "h-8 w-8")}</div>
          </div>
        )}
        {uploadingId === asset.id && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 start-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm"
          style={
            isAvailable
              ? { background: "rgba(23,201,100,0.18)", border: "1px solid rgba(23,201,100,0.3)", color: "#17c964" }
              : { background: "rgba(245,165,36,0.18)", border: "1px solid rgba(245,165,36,0.3)", color: "#f5a524" }
          }
        >
          <span className="w-1 h-1 rounded-full" style={{ background: isAvailable ? "#17c964" : "#f5a524" }} />
          {isAvailable ? t("status_available") : t("status_busy")}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0 p-3 gap-2">
        {/* Name + type */}
        <div className="flex items-start gap-1.5">
          <div className="mt-0.5 shrink-0" style={{ color: accentColor }}>{getAssetIcon(asset.type, "h-3.5 w-3.5")}</div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-tight">{name}</h3>
            <p className="text-[11px] text-muted-foreground">{t(typeLabel)}</p>
          </div>
        </div>

        {/* Price + capacity */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold tabular" style={{ color: accentColor }}>{asset.pricePerHour}</span>
            <span className="text-[11px] text-muted-foreground">{t("price_per_hour")}</span>
          </div>
          {(asset as any).capacity && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" /><span>{(asset as any).capacity}</span>
            </div>
          )}
        </div>

        {/* Booking warning */}
        {isCurrentlyBooked && (
          <div className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1"
            style={{ background: "rgba(243,18,96,0.08)", color: "#f31260" }}>
            <CalendarX className="h-2.5 w-2.5" />
            {t("booking_reserved_until")} {fmtHHMM(nextBooking!.endsAt)}
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1">
            {isAvailable && canStart ? (
              <button
                className="w-full h-8 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)" }}
                onClick={() => onStart(asset.id)}
                disabled={starting}
              >
                <Zap className="h-3.5 w-3.5" /> {t("start_session")}
              </button>
            ) : isAvailable && !canStart ? (
              <div className="h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{ background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)", color: "#64748b" }}>
                <Zap className="h-3.5 w-3.5 opacity-40" /> {t("start_session")}
              </div>
            ) : (
              <Link href="/sessions" className="block">
                <div className="h-8 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5"
                  style={{ background: "rgba(245,165,36,0.1)", border: "1px solid rgba(245,165,36,0.3)", color: "#f5a524" }}>
                  <Play className="h-3.5 w-3.5" /> {t("view_session")}
                </div>
              </Link>
            )}
          </div>

          {/* More */}
          <div className="relative shrink-0">
            <button
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border/40"
              onClick={() => setMoreOpen(v => !v)}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute end-0 top-9 z-20 w-40 rounded-xl border border-border/60 bg-popover shadow-xl overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors"
                      onClick={() => { setMoreOpen(false); onQr(asset); }}
                    >
                      <QrCode className="h-3.5 w-3.5 text-muted-foreground" /> {t("qr_title")}
                    </button>
                    {isMgmt && (
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors"
                        onClick={() => { setMoreOpen(false); onEdit(asset); }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" /> {t("save")}
                      </button>
                    )}
                    {isMgmt && (
                      <Link href={`/assets/${asset.id}/history`}>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors"
                          onClick={() => setMoreOpen(false)}
                        >
                          <History className="h-3.5 w-3.5 text-muted-foreground" /> {t("asset_history_tab")}
                        </button>
                      </Link>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Form state ─────────────────────────────────────── */
interface FormState { nameAr: string; name: string; type: string; pricePerHour: string; capacity: string; imageUrl: string; }
const EMPTY_FORM: FormState = { nameAr: "", name: "", type: "ps", pricePerHour: "", capacity: "", imageUrl: "" };

/* ─── Page ───────────────────────────────────────────── */
export default function Assets() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user, impersonatedTenant } = useAuth();
  const venueName = impersonatedTenant?.name ?? user?.tenantName ?? "";
  const { t, dir, lang } = useLang();
  const isMgmt = MGMT_ROLES.includes(user?.role ?? "");
  const canStart = !["owner", "platform_owner"].includes(user?.role ?? "");

  const { data: assets, isLoading } = useListAssets();
  const { data: upcomingBookings = [] } = useListBookings({ status: "upcoming,active" });
  const { data: dashSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 30000 },
  } as any);

  const bookingByAsset = useMemo(() => {
    const map = new Map<number, Booking>();
    for (const b of upcomingBookings) {
      const existing = map.get(b.assetId);
      if (!existing || new Date(b.startsAt) < new Date(existing.startsAt)) {
        map.set(b.assetId, b);
      }
    }
    return map;
  }, [upcomingBookings]);

  const startSession = useStartSession();
  const createAsset  = useCreateAsset();
  const updateAsset  = useUpdateAsset();
  const generateQr   = useGenerateAssetQr();

  /* ── UI state ── */
  const [viewMode, setViewMode]             = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery]       = useState("");
  const [typeFilter, setTypeFilter]         = useState("all");
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editingAsset, setEditingAsset]     = useState<Asset | null>(null);
  const [form, setForm]                     = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors]                 = useState<Partial<FormState>>({});
  const [qrDialogOpen, setQrDialogOpen]     = useState(false);
  const [qrAsset, setQrAsset]               = useState<Asset | null>(null);
  const [qrToken, setQrToken]               = useState<string | null>(null);
  const [qrLoading, setQrLoading]           = useState(false);
  const [qrConfirmRegen, setQrConfirmRegen] = useState(false);

  /* ── Photo upload (dialog) ── */
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Inline photo upload (card) ── */
  const [inlineUploadingId, setInlineUploadingId] = useState<number | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);
  const inlineTargetAsset  = useRef<Asset | null>(null);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("gl_token") : null;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/storage/uploads", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      return imageUrl as string;
    } catch {
      return null;
    }
  };

  const handleDialogPhotoChange = async (file: File) => {
    setIsUploadingPhoto(true);
    setPhotoUploadError(null);
    const url = await uploadPhoto(file);
    if (url) {
      setForm(f => ({ ...f, imageUrl: url }));
    } else {
      setPhotoUploadError(t("asset_upload_error"));
    }
    setIsUploadingPhoto(false);
  };

  const handleInlineUpload = useCallback((asset: Asset) => {
    inlineTargetAsset.current = asset;
    inlineFileInputRef.current?.click();
  }, []);

  const handleInlineFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !inlineTargetAsset.current) return;
    const asset = inlineTargetAsset.current;
    setInlineUploadingId(asset.id);
    const url = await uploadPhoto(file);
    if (url) {
      try {
        await updateAsset.mutateAsync({
          assetId: asset.id,
          data: {
            name: asset.name,
            nameAr: asset.nameAr ?? undefined,
            type: asset.type,
            pricePerHour: asset.pricePerHour,
            capacity: (asset as any).capacity ?? undefined,
            imageUrl: url,
          } as any,
        });
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
        toast.success(t("device_updated"));
      } catch {
        toast.error(t("error_generic"));
      }
    } else {
      toast.error(t("asset_upload_error"));
    }
    setInlineUploadingId(null);
    inlineTargetAsset.current = null;
  };

  /* ── Asset stats ── */
  const totalRooms   = assets?.length ?? 0;
  const availableNow = assets?.filter(a => a.status === "available").length ?? 0;
  const inSession    = assets?.filter(a => a.status !== "available").length ?? 0;
  const revenueToday = (dashSummary as any)?.revenueToday;
  const revenueDisplay = revenueToday != null
    ? `${Number(revenueToday).toFixed(0)} ${t("egp_label")}`
    : "—";

  /* ── Filtered assets ── */
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchType   = typeFilter === "all" || a.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || (a.name ?? "").toLowerCase().includes(q) || (a.nameAr ?? "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [assets, typeFilter, searchQuery]);

  /* ── Dialogs ── */
  const openAdd = () => { setEditingAsset(null); setForm(EMPTY_FORM); setErrors({}); setDialogOpen(true); };
  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      nameAr: asset.nameAr ?? "",
      name: asset.name,
      type: asset.type,
      pricePerHour: String(asset.pricePerHour),
      capacity: (asset as any).capacity != null ? String((asset as any).capacity) : "",
      imageUrl: (asset as any).imageUrl ?? "",
    });
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
    const capacityVal = form.capacity.trim() ? parseInt(form.capacity) : undefined;
    const imageUrlVal = form.imageUrl.trim() || undefined;
    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({ assetId: editingAsset.id, data: { name: nameValue, nameAr: form.nameAr.trim() || undefined, type: form.type as Asset["type"], pricePerHour: price, capacity: capacityVal, imageUrl: imageUrlVal } as any });
        toast.success(t("device_updated"));
      } else {
        await createAsset.mutateAsync({ data: { name: nameValue, nameAr: form.nameAr.trim() || undefined, type: form.type as Asset["type"], pricePerHour: price, capacity: capacityVal, imageUrl: imageUrlVal } as any });
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
    } catch (err: any) {
      if (err?.response?.data?.error === "no_open_shift") {
        toast.error(t("no_open_shift_toast"), {
          action: { label: t("shift_gate_open_btn"), onClick: () => setLocation("/shifts") },
        });
      } else {
        toast.error(t("session_error"));
      }
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

  /* ── Shared card props ── */
  const sharedCardProps = {
    isMgmt, canStart, onEdit: openEdit, onQr: openQr,
    onStart: handleStartSession, starting: startSession.isPending,
    t, lang, onInlineUpload: handleInlineUpload, uploadingId: inlineUploadingId,
  };

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-52 rounded-xl bg-muted skeleton-shimmer" />
            <div className="h-4 w-36 rounded-lg bg-muted skeleton-shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl skeleton-shimmer" style={{ aspectRatio: "4/5" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ShiftGate>
    <>
      {/* Hidden inline file input */}
      <input
        ref={inlineFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInlineFileChange}
      />

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

      <div className="p-4 sm:p-8 space-y-5 print:hidden" dir={dir}>

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,111,238,0.2) 0%, rgba(51,142,247,0.1) 100%)",
                border: "1px solid rgba(0,111,238,0.25)",
              }}
            >
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{t("assets_title")}</h2>
              <p className="text-sm text-muted-foreground">{t("assets_subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {["platform_owner", "owner"].includes(user?.role ?? "") && assets && assets.length > 0 && (
              <button
                onClick={() => {
                  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                  const params = new URLSearchParams({ venue: venueName });
                  window.open(`${window.location.origin}${base}/print-all-qr?${params}`, "_blank");
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                }}
              >
                <FileDown className="h-4 w-4" />
                {t("rooms_export_qr")}
              </button>
            )}
            {isMgmt && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)",
                  boxShadow: "0 4px 14px rgba(0,111,238,0.3)",
                }}
              >
                <Plus className="h-4 w-4" />
                {t("add_device")}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile stats strip ── */}
        <div className="flex gap-2 sm:hidden overflow-x-auto pb-1 -mx-4 px-4">
          <StatTile icon={<Gamepad2 className="h-4 w-4" />} label={t("stat_total_rooms")} value={totalRooms} accent="#006FEE" />
          <StatTile icon={<span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />} label={t("stat_available_now")} value={availableNow} accent="#17c964" />
          <StatTile icon={<span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />} label={t("stat_in_session")} value={inSession} accent="#f5a524" />
          <StatTile icon={<TrendingUp className="h-4 w-4" />} label={t("kpi_revenue_today")} value={revenueDisplay} accent="#a78bfa" />
        </div>

        {/* ── Desktop toolbar: category dropdown + search + view toggle ── */}
        <div className="hidden sm:flex items-center gap-3">
          {/* All Categories dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-border/60 bg-secondary/40 ps-3 pe-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer text-foreground"
            >
              {TYPE_FILTER_KEYS.map(f => (
                <option key={f.value} value={f.value}>{t(f.labelKey)}</option>
              ))}
            </select>
            <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder={t("rooms_search_ph")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 ps-8 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border/60 overflow-hidden bg-secondary/40">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("h-9 w-9 flex items-center justify-center transition-colors", viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("h-9 w-9 flex items-center justify-center transition-colors", viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Mobile filter tabs ── */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1 min-w-0">
            {TYPE_FILTER_KEYS.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                  typeFilter === f.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {f.icon}
                {t(f.labelKey)}
              </button>
            ))}
          </div>
          {/* Mobile search */}
          <div className="relative shrink-0">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder={t("rooms_search_ph")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 w-32 rounded-xl border border-border/60 bg-secondary/40 ps-8 pe-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* ── Empty state ── */}
        {filteredAssets.length === 0 && !isLoading && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl text-center space-y-4"
            style={{ background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)", border: "1px dashed hsl(var(--border))" }}
          >
            <div className="p-4 rounded-2xl" style={{ background: "rgba(0,111,238,0.1)", border: "1px solid rgba(0,111,238,0.15)" }}>
              <Gamepad2 className="h-10 w-10 text-primary opacity-60" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("no_devices")}</h3>
              <p className="text-muted-foreground mt-1 text-sm max-w-xs">{t("no_devices_hint")}</p>
            </div>
            {isMgmt && (assets?.length ?? 0) === 0 && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #006FEE 0%, #338ef7 100%)" }}
              >
                <Plus className="h-4 w-4" /> {t("add_first_device")}
              </button>
            )}
          </div>
        )}

        {/* ── Desktop grid view ── */}
        {filteredAssets.length > 0 && (
          <>
            {/* Desktop: grid (hidden on mobile) */}
            <div className={cn(
              "hidden sm:grid gap-4",
              viewMode === "list"
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            )}>
              {filteredAssets.map((asset, i) =>
                viewMode === "list" ? (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <AssetListRow asset={asset} nextBooking={bookingByAsset.get(asset.id) ?? null} {...sharedCardProps} />
                  </motion.div>
                ) : (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <AssetCard asset={asset} nextBooking={bookingByAsset.get(asset.id) ?? null} {...sharedCardProps} />
                  </motion.div>
                )
              )}
            </div>

            {/* Mobile: always list */}
            <div className="flex sm:hidden flex-col gap-3">
              {filteredAssets.map((asset, i) => (
                <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <AssetListRow asset={asset} nextBooking={bookingByAsset.get(asset.id) ?? null} {...sharedCardProps} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── Desktop stats strip ── */}
        {(assets?.length ?? 0) > 0 && (
          <div className="hidden sm:flex gap-3 pt-2">
            <StatTile icon={<Gamepad2 className="h-4 w-4" />} label={t("stat_total_rooms")} value={totalRooms} accent="#006FEE" />
            <StatTile icon={<span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />} label={t("stat_available_now")} value={availableNow} accent="#17c964" />
            <StatTile icon={<span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />} label={t("stat_in_session")} value={inSession} accent="#f5a524" />
            <StatTile icon={<TrendingUp className="h-4 w-4" />} label={t("kpi_revenue_today")} value={revenueDisplay} accent="#a78bfa" />
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
              <div className="space-y-1.5">
                <Label htmlFor="capacity">{t("asset_capacity_label")} <span className="text-muted-foreground text-xs">{t("device_name_en_hint")}</span></Label>
                <Input id="capacity" type="number" min="1" step="1" placeholder="4" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              {/* Room photo upload */}
              <div className="space-y-1.5">
                <Label>{t("asset_image_url_label")} <span className="text-muted-foreground text-xs">{t("device_name_en_hint")}</span></Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleDialogPhotoChange(f); e.target.value = ""; }}
                />
                {form.imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border/60 bg-secondary/30">
                    <img
                      src={form.imageUrl}
                      alt="Room photo"
                      className="w-full h-32 object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute top-2 end-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="h-7 px-2 rounded-md text-xs font-semibold bg-background/80 backdrop-blur border border-border/60 hover:bg-background transition-colors flex items-center gap-1"
                      >
                        <UploadCloud className="h-3 w-3" />
                        {t("asset_change_photo")}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, imageUrl: "" })); setPhotoUploadError(null); }}
                        className="h-7 w-7 rounded-md flex items-center justify-center bg-destructive/80 text-white hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-xs">{t("asset_uploading_photo")}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 opacity-40" />
                        <span className="text-xs font-medium">{t("asset_choose_photo")}</span>
                      </>
                    )}
                  </button>
                )}
                {photoUploadError && <p className="text-xs text-destructive">{photoUploadError}</p>}
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
              <Button size="sm" onClick={() => {
                const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                const params = new URLSearchParams({
                  url: qrUrl,
                  title: qrAsset?.name ?? "",
                  type: "room",
                  venue: venueName,
                });
                window.open(`${window.location.origin}${base}/print-qr?${params}`, "_blank");
              }} disabled={!qrToken || qrLoading} className="gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                {t("print")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
    </ShiftGate>
  );
}
