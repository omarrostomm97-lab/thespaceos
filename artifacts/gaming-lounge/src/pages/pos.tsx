import {
  useListProductCategories,
  useListProducts,
  useCreateOrder,
  useListActiveSessions,
  useCreateDiscountRequest,
  useCancelDiscountRequest,
  useGetSessionDiscounts,
  getListOrdersQueryKey,
  getListActiveSessionsQueryKey,
  getGetSessionDiscountsQueryKey,
} from "@workspace/api-client-react";
import { getProductEmoji } from "@/lib/product-emoji";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Banknote, CreditCard, Smartphone, Gamepad2, Check, Receipt, Search, Tag, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ShiftGate } from "@/components/shift-gate";
import { useLang } from "@/hooks/use-language";

interface CartItem {
  product: any;
  quantity: number;
}

type PaymentMethod = "cash" | "instapay" | "visa";
type OrderMode = "direct" | "session";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
  { id: "cash", label: "كاش", sublabel: "استلام فوري", icon: <Banknote className="h-5 w-5" />, color: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" },
  { id: "instapay", label: "انستا باي", sublabel: "يحتاج تأكيد", icon: <Smartphone className="h-5 w-5" />, color: "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600" },
  { id: "visa", label: "فيزا / ماستر", sublabel: "يحتاج تأكيد", icon: <CreditCard className="h-5 w-5" />, color: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" },
];

export default function Pos() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<OrderMode>("direct");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const [discountFormOpen, setDiscountFormOpen] = useState(false);
  const [discountPct, setDiscountPct] = useState("");
  const [discountReasonText, setDiscountReasonText] = useState("");

  const { data: categories, isLoading: isLoadingCats } = useListProductCategories();
  const { data: products, isLoading: isLoadingProds } = useListProducts(undefined, {
    query: { queryKey: [], enabled: true }
  });
  const { data: activeSessions } = useListActiveSessions({
    query: { queryKey: getListActiveSessionsQueryKey(), refetchInterval: 10000 }
  });

  const createOrder = useCreateOrder();
  const createDiscountReq = useCreateDiscountRequest();
  const cancelDiscountReq = useCancelDiscountRequest();

  const { data: posSessionDiscounts = [] } = useGetSessionDiscounts(
    selectedSessionId ?? 0,
    { query: { enabled: !!selectedSessionId && orderMode === "session", refetchInterval: 10000 } }
  );

  const sortedDiscounts = [...posSessionDiscounts].sort((a, b) => b.id - a.id);
  const latestDiscount = sortedDiscounts[0] ?? null;
  const pendingPosDiscount = latestDiscount?.status === "pending" ? latestDiscount : null;
  const approvedPosDiscount = latestDiscount?.status === "approved" ? latestDiscount : null;
  const rejectedOrCancelledDiscount =
    latestDiscount && (latestDiscount.status === "rejected" || latestDiscount.status === "cancelled")
      ? latestDiscount
      : null;

  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = products?.filter(p => {
    if (!p.isAvailable) return false;
    if (q) {
      return (
        (p.nameAr ?? "").toLowerCase().includes(q) ||
        (p.name ?? "").toLowerCase().includes(q)
      );
    }
    return !activeCategory || p.categoryId === activeCategory;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const adjustQty = (productId: number, delta: number) => {
    setCart(prev => prev
      .map(item => item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0)
    );
  };

  const resetDiscountForm = () => {
    setDiscountFormOpen(false);
    setDiscountPct("");
    setDiscountReasonText("");
  };

  const clearCart = () => {
    setCart([]);
    setSelectedSessionId(null);
    resetDiscountForm();
  };

  const handleSelectSession = (id: number | null) => {
    setSelectedSessionId(id);
    resetDiscountForm();
  };

  const handlePosDiscountSubmit = async () => {
    if (!selectedSessionId) return;
    const val = parseFloat(discountPct);
    if (isNaN(val) || val <= 0 || val > 100) {
      toast.error(t("discount_value_label")); return;
    }
    try {
      await createDiscountReq.mutateAsync({
        data: {
          type: "session_time",
          sessionId: selectedSessionId,
          discountKind: "percent",
          discountValue: val,
          reason: discountReasonText.trim() || undefined,
        } as any,
      });
      queryClient.invalidateQueries({ queryKey: getGetSessionDiscountsQueryKey(selectedSessionId) });
      resetDiscountForm();
      toast.success(t("discount_submitted_ok"));
    } catch (err: any) {
      const code = err?.response?.data?.error ?? err?.data?.error;
      toast.error(code === "duplicate_pending" ? t("discount_duplicate_error") : t("discount_submit_error"));
      setDiscountFormOpen(false);
    }
  };

  const handleCancelDiscount = async (requestId: number) => {
    try {
      await cancelDiscountReq.mutateAsync({ requestId });
      queryClient.invalidateQueries({ queryKey: getGetSessionDiscountsQueryKey(selectedSessionId!) });
      toast.success(t("discount_cancel_ok"));
    } catch {
      toast.error(t("discount_cancel_error"));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleDirectCheckout = async (paymentMethod: PaymentMethod) => {
    if (cart.length === 0) return;
    try {
      await createOrder.mutateAsync({
        data: {
          paymentMethod: paymentMethod as string,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
        } as Parameters<typeof createOrder.mutateAsync>[0]['data']
      });
      if (paymentMethod === "cash") {
        toast.success("تم تأكيد الطلب واستلام النقدية");
      } else {
        toast.success(`تم إنشاء الطلب — يحتاج تأكيد ${paymentMethod === "instapay" ? "انستا باي" : "الفيزا"} من صفحة المدفوعات`);
      }
      clearCart();
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch (err: any) {
      if (err?.response?.data?.error === "no_open_shift") {
        toast.error("افتح وردية أولاً", {
          action: { label: "فتح الوردية", onClick: () => setLocation("/shifts") },
        });
      } else {
        toast.error("حدث خطأ أثناء تأكيد الطلب");
      }
    }
  };

  const handleAddToSession = async () => {
    if (cart.length === 0 || !selectedSessionId) return;
    try {
      await createOrder.mutateAsync({
        data: {
          sessionId: selectedSessionId,
          items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity }))
        }
      });
      const session = activeSessions?.find(s => s.id === selectedSessionId);
      const roomName = (session as any)?.assetNameAr || (session as any)?.assetName || `جلسة #${selectedSessionId}`;
      toast.success(`تم إرسال الطلب إلى ${roomName} ✓`);
      clearCart();
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListActiveSessionsQueryKey() });
    } catch (err: any) {
      if (err?.response?.data?.error === "no_open_shift") {
        toast.error("افتح وردية أولاً", {
          action: { label: "فتح الوردية", onClick: () => setLocation("/shifts") },
        });
      } else {
        toast.error("حدث خطأ أثناء إرسال الطلب للغرفة");
      }
    }
  };

  const switchMode = (mode: OrderMode) => {
    setOrderMode(mode);
    setSelectedSessionId(null);
    resetDiscountForm();
  };

  if (isLoadingCats || isLoadingProds) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ShiftGate>
    <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-4rem)] bg-background">

      {/* ── Products Grid ── */}
      <div className="flex-1 flex flex-col min-w-0 border-s border-border overflow-hidden">
        {/* Search bar */}
        <div className="px-3 md:px-4 pt-3 md:pt-4 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full h-11 rounded-xl border border-border bg-background ps-9 pe-9 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              dir="rtl"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className={`px-3 md:px-4 pb-3 md:pb-4 border-b border-border bg-card shrink-0 overflow-x-auto transition-opacity ${searchQuery ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex gap-2 min-w-max">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="h-10 md:h-12 px-4 md:px-6 text-base md:text-lg font-medium"
            >
              الكل
            </Button>
            {categories?.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className="h-10 md:h-12 px-4 md:px-6 text-base md:text-lg font-medium"
              >
                {cat.nameAr || cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 p-3 md:p-4 overflow-y-auto">
          {filteredProducts?.length === 0 && q && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-3">
              <Search className="h-12 w-12" />
              <p className="text-lg">لا توجد منتجات تطابق "{searchQuery}"</p>
            </div>
          )}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredProducts?.map(product => (
              <Button
                key={product.id}
                variant="outline"
                className="h-28 md:h-36 flex flex-col items-center justify-center gap-1 p-2 whitespace-normal bg-card hover:bg-secondary border-2 border-transparent hover:border-primary transition-all"
                onClick={() => addToCart(product)}
              >
                <span className="text-3xl md:text-4xl leading-none select-none">
                  {getProductEmoji(
                    product.nameAr ?? "",
                    product.name ?? "",
                    (product as any).categoryNameAr ?? "",
                    (product as any).categoryName ?? ""
                  )}
                </span>
                <span className="font-bold text-xs md:text-sm text-center leading-tight line-clamp-2 px-1">
                  {product.nameAr || product.name}
                </span>
                <span className="text-primary font-bold text-sm md:text-base">
                  {product.price} ج.م
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cart Sidebar ── */}
      <div className="w-full md:w-[400px] lg:w-[420px] flex flex-col bg-card shrink-0 border-t md:border-t-0 md:border-s border-border max-h-[55vh] md:max-h-none">
        {/* Cart header */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-sidebar text-foreground shrink-0">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            سلة الطلبات
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
              إفراغ
            </Button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-12 md:h-16 w-12 md:w-16 mb-3 md:mb-4" />
              <p className="text-base md:text-lg">السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-2.5 md:p-3 bg-background border border-border rounded-lg">
                <div className="flex-1 min-w-0 me-2">
                  <p className="font-bold text-sm md:text-base truncate">{item.product.nameAr || item.product.name}</p>
                  <p className="text-primary font-medium text-xs md:text-sm">{(item.product.price * item.quantity).toFixed(2)} ج.م</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-base" onClick={() => adjustQty(item.product.id, -1)}>−</Button>
                  <span className="font-bold text-base md:text-lg w-5 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-base" onClick={() => adjustQty(item.product.id, 1)}>+</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout area */}
        <div className="p-3 md:p-4 border-t border-border bg-sidebar shrink-0 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-base md:text-lg">الإجمالي:</span>
            <span className="font-bold text-2xl md:text-3xl text-emerald-500">{total.toFixed(2)} ج.م</span>
          </div>

          <div className="space-y-3">
              {/* Mode toggle — always visible */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => switchMode("direct")}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-bold transition-all ${
                    orderMode === "direct"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Receipt className="h-4 w-4 shrink-0" />
                  طلب منفصل
                </button>
                <button
                  onClick={() => switchMode("session")}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-bold transition-all ${
                    orderMode === "session"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4 shrink-0" />
                  إضافة لغرفة
                </button>
              </div>

              {/* ── Direct order: payment methods (requires cart items) ── */}
              {orderMode === "direct" && (
                cart.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">اختر طريقة الدفع:</p>
                    <div className="grid gap-2">
                      {PAYMENT_METHODS.map(method => (
                        <Button
                          key={method.id}
                          className={`h-12 md:h-14 text-sm md:text-base font-bold gap-2 md:gap-3 ${method.color}`}
                          disabled={createOrder.isPending}
                          onClick={() => handleDirectCheckout(method.id)}
                        >
                          {method.icon}
                          <div className="flex flex-col items-start">
                            <span>{method.label}</span>
                            <span className="text-xs font-normal opacity-80">{method.sublabel}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button className="w-full h-12 md:h-14 text-base md:text-lg" disabled>
                    أضف منتجات للسلة
                  </Button>
                )
              )}

              {/* ── Session order: room picker + discount (always accessible) ── */}
              {orderMode === "session" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">اختر الغرفة التي تريد إضافة الطلب إليها:</p>

                  {!activeSessions || activeSessions.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground bg-secondary/30 rounded-xl border border-border">
                      <Gamepad2 className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                      لا توجد جلسات نشطة الآن
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 md:max-h-48 overflow-y-auto">
                      {activeSessions.map((session: any) => {
                        const isSelected = selectedSessionId === session.id;
                        const isPaused = session.status === "paused";
                        return (
                          <button
                            key={session.id}
                            onClick={() => handleSelectSession(isSelected ? null : session.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${isPaused ? "bg-amber-400" : "bg-emerald-500"}`} />
                              <span className="font-bold truncate text-foreground">
                                {session.assetNameAr || session.assetName || `جلسة #${session.id}`}
                              </span>
                              <span className={`text-xs shrink-0 ${isPaused ? "text-amber-500" : "text-emerald-500"}`}>
                                {isPaused ? "موقف" : "يلعب"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ms-2">
                              <span className="text-xs text-muted-foreground font-mono">
                                {(session.totalCost ?? session.currentCost ?? 0).toFixed(2)} ج.م
                              </span>
                              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 text-white"
                    disabled={!selectedSessionId || cart.length === 0 || createOrder.isPending}
                    onClick={handleAddToSession}
                  >
                    {createOrder.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      <>
                        <Gamepad2 className="me-2 h-4 w-4" />
                        إرسال للغرفة
                        {selectedSessionId && activeSessions && (
                          <span className="ms-1 opacity-80">
                            ({(activeSessions as any[]).find(s => s.id === selectedSessionId)?.assetNameAr ||
                              (activeSessions as any[]).find(s => s.id === selectedSessionId)?.assetName || ""})
                          </span>
                        )}
                      </>
                    )}
                  </Button>

                  {/* ── Discount Panel (session selected) ── */}
                  {selectedSessionId && (
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      {/* Pending chip */}
                      {pendingPosDiscount && !discountFormOpen && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span className="text-xs font-medium text-amber-500 truncate">
                              {t("discount_pending_badge")} — {pendingPosDiscount.discountValue}%
                            </span>
                          </div>
                          <button
                            onClick={() => handleCancelDiscount(pendingPosDiscount.id)}
                            disabled={cancelDiscountReq.isPending}
                            className="text-xs text-amber-600 hover:text-amber-700 font-semibold px-2 py-1 rounded-lg hover:bg-amber-500/10 shrink-0 ms-2 disabled:opacity-50"
                          >
                            {cancelDiscountReq.isPending
                              ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent inline-block" />
                              : t("discount_cancel_btn")}
                          </button>
                        </div>
                      )}

                      {/* Approved chip */}
                      {approvedPosDiscount && !pendingPosDiscount && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-medium text-emerald-500">
                            {t("discount_approved_badge")} — {approvedPosDiscount.discountValue}%
                          </span>
                        </div>
                      )}

                      {/* Rejected / cancelled chip — allow re-request */}
                      {rejectedOrCancelledDiscount && !discountFormOpen && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                            <span className="text-xs font-medium text-destructive">
                              {rejectedOrCancelledDiscount.status === "rejected" ? t("discount_rejected_badge") : t("discount_cancelled_badge")}
                            </span>
                          </div>
                          <button
                            onClick={() => setDiscountFormOpen(true)}
                            className="text-xs text-primary font-semibold px-2 py-1 rounded-lg hover:bg-primary/10 shrink-0 ms-2"
                          >
                            {t("discount_submit")}
                          </button>
                        </div>
                      )}

                      {/* Request button (no active/pending/approved discount) */}
                      {!pendingPosDiscount && !approvedPosDiscount && !rejectedOrCancelledDiscount && !discountFormOpen && (
                        <button
                          onClick={() => setDiscountFormOpen(true)}
                          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-dashed border-amber-500/40 text-amber-500 text-xs font-medium hover:bg-amber-500/5 transition-colors"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          {t("discount_pos_request_btn")}
                        </button>
                      )}

                      {/* Inline form */}
                      {discountFormOpen && !pendingPosDiscount && !approvedPosDiscount && (
                        <div className="space-y-2 bg-secondary/30 rounded-xl p-3 border border-border">
                          <p className="text-[10px] text-muted-foreground">{t("discount_pos_hint")}</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={discountPct}
                              onChange={e => setDiscountPct(e.target.value)}
                              placeholder={t("discount_pos_pct_label")}
                              className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                              dir="ltr"
                            />
                            <span className="text-sm text-muted-foreground font-bold">%</span>
                          </div>
                          <input
                            type="text"
                            value={discountReasonText}
                            onChange={e => setDiscountReasonText(e.target.value)}
                            placeholder={t("discount_reason_placeholder")}
                            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                            dir="rtl"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-9"
                              onClick={() => { setDiscountFormOpen(false); setDiscountPct(""); setDiscountReasonText(""); }}
                            >
                              {t("cancel")}
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-9 bg-amber-500 hover:bg-amber-600 text-white border-0"
                              onClick={handlePosDiscountSubmit}
                              disabled={createDiscountReq.isPending || !discountPct}
                            >
                              {createDiscountReq.isPending
                                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                : t("discount_pos_submit")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
    </ShiftGate>
  );
}
