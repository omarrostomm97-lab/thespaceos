import { useState } from "react";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Gamepad2, Tv, Trophy, Play, Plus, Pencil, Wind, Target, QrCode, Printer, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

const ASSET_TYPES = [
  { value: "ps",         labelAr: "بلايستيشن" },
  { value: "billiard",   labelAr: "بلياردو" },
  { value: "air_hockey", labelAr: "هوكي الهواء" },
  { value: "babyfoot",   labelAr: "كرة القدم المصغرة" },
  { value: "other",      labelAr: "أخرى" },
] as const;

function getAssetIcon(type: string, className = "h-8 w-8") {
  switch (type) {
    case "ps":         return <Tv className={className} />;
    case "billiard":   return <Trophy className={className} />;
    case "air_hockey": return <Wind className={className} />;
    case "babyfoot":   return <Target className={className} />;
    default:           return <Gamepad2 className={className} />;
  }
}

interface FormState {
  nameAr: string;
  name: string;
  type: string;
  pricePerHour: string;
}

const EMPTY_FORM: FormState = { nameAr: "", name: "", type: "ps", pricePerHour: "" };

export default function Assets() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isMgmt = MGMT_ROLES.includes(user?.role ?? "");

  const { data: assets, isLoading } = useListAssets();
  const startSession = useStartSession();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const generateQr = useGenerateAssetQr();

  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // QR dialog state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrConfirmRegen, setQrConfirmRegen] = useState(false);

  // ── Add/Edit handlers ──────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingAsset(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      nameAr: asset.nameAr ?? "",
      name: asset.name,
      type: asset.type,
      pricePerHour: String(asset.pricePerHour),
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.nameAr.trim()) errs.nameAr = "الاسم العربي مطلوب";
    if (!form.type) errs.type = "نوع الجهاز مطلوب";
    const price = parseFloat(form.pricePerHour);
    if (!form.pricePerHour || isNaN(price) || price <= 0) errs.pricePerHour = "السعر يجب أن يكون رقماً أكبر من صفر";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const price = parseFloat(form.pricePerHour);
    const nameValue = form.name.trim() || form.nameAr.trim();
    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({
          assetId: editingAsset.id,
          data: {
            name: nameValue,
            nameAr: form.nameAr.trim() || undefined,
            type: form.type as Asset["type"],
            pricePerHour: price,
          },
        });
        toast.success("تم تحديث الجهاز بنجاح");
      } else {
        await createAsset.mutateAsync({
          data: {
            name: nameValue,
            nameAr: form.nameAr.trim() || undefined,
            type: form.type as Asset["type"],
            pricePerHour: price,
          },
        });
        toast.success("تم إضافة الجهاز بنجاح");
      }
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مجدداً");
    }
  };

  const handleStartSession = async (assetId: number) => {
    try {
      const session = await startSession.mutateAsync({ data: { assetId } });
      toast.success("تم بدء الجلسة بنجاح");
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
      setLocation(`/sessions/${session.id}`);
    } catch {
      toast.error("حدث خطأ أثناء بدء الجلسة");
    }
  };

  // ── QR handlers ────────────────────────────────────────────────────────────

  const openQr = async (asset: Asset) => {
    setQrAsset(asset);
    setQrConfirmRegen(false);
    setQrDialogOpen(true);

    if (asset.qrToken) {
      setQrToken(asset.qrToken);
    } else {
      setQrToken(null);
      setQrLoading(true);
      try {
        const result = await generateQr.mutateAsync({ assetId: asset.id });
        setQrToken(result.token);
        queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      } catch {
        toast.error("فشل إنشاء رمز QR");
        setQrDialogOpen(false);
      } finally {
        setQrLoading(false);
      }
    }
  };

  const handleRegenerate = async () => {
    if (!qrAsset) return;
    setQrConfirmRegen(false);
    setQrLoading(true);
    try {
      const result = await generateQr.mutateAsync({ assetId: qrAsset.id });
      setQrToken(result.token);
      queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });
      toast.success("تم تجديد رمز QR بنجاح");
    } catch {
      toast.error("فشل تجديد رمز QR");
    } finally {
      setQrLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = qrToken
    ? `${window.location.origin}/qr/${qrToken}`
    : "";

  const isSaving = createAsset.isPending || updateAsset.isPending;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Print-only styles — only the QR block is shown on print */}
      <style>{`
        @media print {
          body > *:not(#qr-print-root) { display: none !important; }
          #qr-print-root { display: flex !important; flex-direction: column; align-items: center; padding: 40px; }
        }
        @media screen {
          #qr-print-root { display: none; }
        }
      `}</style>

      {/* Hidden print target */}
      <div id="qr-print-root">
        {qrAsset && qrToken && (
          <>
            <p style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, direction: "rtl" }}>
              {qrAsset.nameAr || qrAsset.name}
            </p>
            <QRCodeSVG value={qrUrl} size={280} />
            <p style={{ marginTop: 16, fontSize: 14, color: "#555", direction: "rtl" }}>
              امسح الكود لطلب الطعام والمشروبات
            </p>
          </>
        )}
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">الأجهزة والجلسات</h2>
            <p className="text-muted-foreground mt-1">إدارة الأجهزة وبدء جلسات اللعب</p>
          </div>
          {isMgmt && (
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة جهاز
            </Button>
          )}
        </div>

        {/* Empty state */}
        {assets?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-xl text-center space-y-4">
            <div className="p-5 rounded-full bg-secondary">
              <Gamepad2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">لا توجد أجهزة بعد</h3>
              <p className="text-muted-foreground mt-1 text-sm max-w-xs">
                أضف أجهزتك (PS، بلياردو، PC...) لتتمكن من بدء جلسات اللعب وتتبع الإيرادات
              </p>
            </div>
            {isMgmt && (
              <Button onClick={openAdd} className="mt-2 gap-2">
                <Plus className="h-4 w-4" />
                إضافة أول جهاز
              </Button>
            )}
          </div>
        )}

        {/* Device grid */}
        {assets && assets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {assets.map((asset) => {
              const isAvailable = asset.status === "available";
              return (
                <Card
                  key={asset.id}
                  className={`relative overflow-hidden border-2 transition-all ${
                    isAvailable ? "border-border hover:border-primary" : "border-amber-500/50"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${isAvailable ? "bg-emerald-500" : "bg-amber-500"}`} />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-lg ${isAvailable ? "bg-secondary text-foreground" : "bg-amber-500/20 text-amber-500"}`}>
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`px-2 py-1 text-xs font-bold rounded-md ${
                          isAvailable ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                        }`}>
                          {isAvailable ? "متاح" : "مشغول"}
                        </div>
                        {/* QR button — visible to all roles */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openQr(asset)}
                          title="رمز QR"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </Button>
                        {isMgmt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(asset)}
                            title="تعديل الجهاز"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-xl">{asset.nameAr || asset.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      <span className="text-foreground">{asset.pricePerHour}</span> ج.م / ساعة
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ASSET_TYPES.find(t => t.value === asset.type)?.labelAr ?? asset.type}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-0">
                    {isAvailable ? (
                      <Button
                        className="w-full h-12 text-md font-bold"
                        onClick={() => handleStartSession(asset.id)}
                        disabled={startSession.isPending}
                      >
                        <Play className="ml-2 h-5 w-5" />
                        بدء اللعب
                      </Button>
                    ) : (
                      <Link href="/sessions" className="w-full">
                        <Button variant="outline" className="w-full h-12 text-md border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                          عرض الجلسة
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add / Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingAsset ? "تعديل الجهاز" : "إضافة جهاز جديد"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="nameAr">اسم الجهاز (عربي) <span className="text-destructive">*</span></Label>
                <Input
                  id="nameAr"
                  placeholder="مثال: بلايستيشن 1"
                  value={form.nameAr}
                  onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                />
                {errors.nameAr && <p className="text-xs text-destructive">{errors.nameAr}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">اسم الجهاز (إنجليزي) <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
                <Input
                  id="name"
                  placeholder="مثال: PlayStation 1"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">نوع الجهاز <span className="text-destructive">*</span></Label>
                <select
                  id="type"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-right"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {ASSET_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.labelAr}</option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pricePerHour">سعر الساعة (ج.م) <span className="text-destructive">*</span></Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="مثال: 30"
                  value={form.pricePerHour}
                  onChange={e => setForm(f => ({ ...f, pricePerHour: e.target.value }))}
                />
                {errors.pricePerHour && <p className="text-xs text-destructive">{errors.pricePerHour}</p>}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "جاري الحفظ..." : editingAsset ? "حفظ التعديلات" : "إضافة الجهاز"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR code dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={(open) => { setQrDialogOpen(open); if (!open) setQrConfirmRegen(false); }}>
          <DialogContent className="sm:max-w-sm" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                رمز QR — {qrAsset?.nameAr || qrAsset?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center py-4 space-y-4">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">جاري إنشاء رمز QR...</p>
                </div>
              ) : qrToken ? (
                <>
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG value={qrUrl} size={200} />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    امسح الكود بكاميرا هاتفك لطلب الطعام والمشروبات
                  </p>
                  <p className="text-xs text-center text-muted-foreground/60 font-mono break-all px-2">
                    {qrUrl}
                  </p>
                </>
              ) : null}
            </div>

            {/* Regenerate confirmation */}
            {qrConfirmRegen && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-600 space-y-2" dir="rtl">
                <p className="font-semibold">تأكيد تجديد الكود</p>
                <p className="text-xs">الكود القديم سيتوقف عن العمل فوراً. هل أنت متأكد؟</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="destructive" onClick={handleRegenerate} disabled={qrLoading}>
                    نعم، جدد الكود
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setQrConfirmRegen(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse" dir="rtl">
              {!qrConfirmRegen && isMgmt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrConfirmRegen(true)}
                  disabled={qrLoading}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  تجديد الكود
                </Button>
              )}
              <Button
                size="sm"
                onClick={handlePrint}
                disabled={!qrToken || qrLoading}
                className="gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                طباعة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
