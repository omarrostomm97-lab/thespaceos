import { useGetQrMenu, usePlaceQrOrder } from "@workspace/api-client-react";
import { getProductEmoji } from "@/lib/product-emoji";
import { useParams } from "wouter";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Gamepad2, ShoppingCart, Plus, Minus, X, Search,
  ChevronLeft, CheckCircle2, Wifi, Clock, Lock, Zap,
} from "lucide-react";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const LOGO_FULL = `${BASE}/the-space-os-logo.png`;
const LOGO_ICON = `${BASE}/the-space-os-logo.png`;

/* ─── Types ────────────────────────────────────────── */
interface CartItem { product: any; quantity: number }

/* ─── Spring configs ───────────────────────────────── */
const spring = { type: "spring" as const, stiffness: 500, damping: 30 };
const gentleSpring = { type: "spring" as const, stiffness: 280, damping: 24 };

/* ══════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════ */
export default function QrMenu() {
  const { token } = useParams();
  const { data: menuData, isLoading } = useGetQrMenu(token || "");
  const placeOrder = usePlaceQrOrder();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const categoryRailRef = useRef<HTMLDivElement>(null);

  const availableProducts = useMemo(
    () => (menuData?.products ?? []).filter(p => p.isAvailable),
    [menuData]
  );

  const categoriesWithItems = useMemo(() => {
    if (!menuData) return [];
    const ids = new Set(availableProducts.map(p => p.categoryId));
    return menuData.categories.filter(c => ids.has(c.id));
  }, [menuData, availableProducts]);

  const filtered = useMemo(() => {
    let list = availableProducts;
    if (activeCategory !== "all") list = list.filter(p => p.categoryId === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || (p.nameAr ?? "").includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [availableProducts, activeCategory, search]);

  const updateCart = (product: any, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.product.id !== product.id);
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { product, quantity: 1 }];
      return prev;
    });
  };

  const getQty = (id: number) => cart.find(i => i.product.id === id)?.quantity ?? 0;
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = async () => {
    if (!cart.length) return;
    if (!activeSession) {
      toast.error("No active session. Please start a session at the front desk first.");
      return;
    }
    try {
      const result = await placeOrder.mutateAsync({
        token: token || "",
        data: {
          customerName: customerName || undefined,
          items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        },
      });
      setCartOpen(false);
      setCart([]);
      setCustomerName("");
      setOrderId((result as any)?.id ?? null);
      setOrderSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      if (msg?.includes("no_active_session") || msg?.includes("No active session")) {
        toast.error("No active session — please visit the front desk to start your session.");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    }
  };

  const scrollCatIntoView = (catId: number | "all") => {
    const rail = categoryRailRef.current;
    if (!rail) return;
    const btn = rail.querySelector(`[data-cat="${catId}"]`) as HTMLElement;
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const selectCategory = (id: number | "all") => {
    setActiveCategory(id);
    scrollCatIntoView(id);
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center gap-5">
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <div className="h-20 w-20 rounded-full border-4 border-[#7c3aed]/20 border-t-[#7c3aed]"
            style={{ animation: "spin 1s linear infinite" }} />
          <Gamepad2 className="absolute inset-0 m-auto h-8 w-8 text-[#7c3aed]" />
        </motion.div>
        <p className="text-[#7c3aed]/60 text-xs tracking-[0.3em] uppercase">Loading Menu</p>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 max-w-xs"
        >
          <Gamepad2 className="h-14 w-14 text-red-400 mx-auto mb-5" />
          <h1 className="text-xl font-bold text-white mb-2">Menu Not Found</h1>
          <p className="text-gray-500 text-sm leading-relaxed">This QR code is invalid or the session has ended.</p>
        </motion.div>
      </div>
    );
  }

  const { asset, activeSession } = menuData;
  const canOrder = !!activeSession;

  /* ── Order success screen ── */
  if (orderSuccess) {
    return (
      <motion.div
        className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Rings */}
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-emerald-500/20"
            initial={{ width: 80, height: 80, opacity: 0.6 }}
            animate={{ width: 80 + i * 100, height: 80 + i * 100, opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...gentleSpring, delay: 0.1 }}
          className="relative z-10 mb-8"
        >
          <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 space-y-3"
        >
          <h1 className="text-3xl font-bold text-white">Order Placed!</h1>
          <p className="text-gray-400 text-base">
            Your order is on its way.
          </p>
          {orderId && (
            <p className="text-xs text-gray-600 tracking-widest uppercase">Order #{orderId}</p>
          )}
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-10 w-full max-w-xs"
        >
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-sm text-gray-400 flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#7c3aed] shrink-0" />
            Staff will bring your order to your room shortly.
          </div>
        </motion.div>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setOrderSuccess(false)}
          whileTap={{ scale: 0.97 }}
          className="relative z-10 mt-6 text-sm text-[#7c3aed] underline underline-offset-4"
        >
          Order more items
        </motion.button>
      </motion.div>
    );
  }

  /* ── Main menu ── */
  return (
    <div className="min-h-screen bg-[#08080f] text-white overflow-x-hidden" dir="ltr">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/25 via-[#7c3aed]/8 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.3),transparent_60%)] pointer-events-none" />

        <div className="relative px-5 pt-10 pb-6">
          {/* Room badge */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="bg-[#7c3aed]/20 border border-[#7c3aed]/40 rounded-full px-3 py-1 flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5 text-[#7c3aed]" />
              <span className="text-[#a78bfa] text-xs font-semibold tracking-wide">Room Menu</span>
            </div>
            {/* Session pill */}
            {activeSession ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <span className="text-emerald-400 text-xs font-medium">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                <Wifi className="h-3 w-3 text-gray-500" />
                <span className="text-gray-500 text-xs">No session</span>
              </div>
            )}
          </motion.div>

          {/* Room name */}
          <motion.h1
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white leading-none mb-1"
          >
            {asset.nameAr || asset.name}
          </motion.h1>
          {asset.nameAr && (
            <motion.p
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-gray-500 text-sm"
            >
              {asset.name}
            </motion.p>
          )}

          {/* Search bar */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); if (!searchOpen && e.target.value) setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => { if (!search) setSearchOpen(false); }}
              placeholder="Search the menu…"
              className="w-full bg-white/[0.06] border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c3aed]/60 focus:bg-[#7c3aed]/5 transition-all duration-200"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setSearch(""); setSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ── No-session banner ── */}
      {!canOrder && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-1 mb-2 flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-amber-300 text-sm font-semibold leading-tight">Ordering Disabled</p>
            <p className="text-amber-400/60 text-xs mt-0.5 leading-snug">No active session for this room. Visit the front desk to start your session.</p>
          </div>
        </motion.div>
      )}

      {/* ── Category Rail ── */}
      <AnimatePresence>
        {!search && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="sticky top-0 z-20 bg-[#08080f]/90 backdrop-blur-xl border-b border-white/[0.05] py-3"
          >
            <div
              ref={categoryRailRef}
              className="flex gap-2 px-5 overflow-x-auto scrollbar-none"
            >
              {[{ id: "all" as const, name: "All", count: availableProducts.length }, ...categoriesWithItems.map(c => ({
                id: c.id as number | "all",
                name: c.name,
                count: availableProducts.filter(p => p.categoryId === c.id).length,
              }))].map(cat => (
                <motion.button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activeCategory === cat.id
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {activeCategory === cat.id && (
                    <motion.div
                      layoutId="catPill"
                      className="absolute inset-0 bg-[#7c3aed] rounded-full shadow-lg shadow-[#7c3aed]/30"
                      transition={gentleSpring}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                  <span className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id ? "bg-white/20" : "bg-white/5 text-gray-600"
                  }`}>
                    {cat.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product List ── */}
      <main className="px-4 py-5 pb-40 space-y-6">
        {search ? (
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 px-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </p>
            <div className="space-y-3">
              {filtered.length === 0
                ? <EmptyState />
                : filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} index={i} canOrder={canOrder} />
                ))}
            </div>
          </div>
        ) : activeCategory === "all" ? (
          <div className="space-y-8">
            {categoriesWithItems.map(cat => {
              const catProds = availableProducts.filter(p => p.categoryId === cat.id);
              if (!catProds.length) return null;
              return (
                <section key={cat.id}>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                      {cat.nameAr || cat.name}
                    </h2>
                    <div className="flex-1 h-px bg-[#7c3aed]/15" />
                    <span className="text-[10px] text-gray-700 tabular-nums">{catProds.length}</span>
                  </div>
                  <div className="space-y-3">
                    {catProds.map((p, i) => (
                      <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} index={i} canOrder={canOrder} />
                    ))}
                  </div>
                </section>
              );
            })}
            {(() => {
              const uncat = availableProducts.filter(p => !p.categoryId);
              if (!uncat.length) return null;
              return (
                <section>
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#a78bfa]">Other</h2>
                    <div className="flex-1 h-px bg-[#7c3aed]/15" />
                  </div>
                  <div className="space-y-3">
                    {uncat.map((p, i) => <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} index={i} canOrder={canOrder} />)}
                  </div>
                </section>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0
              ? <EmptyState />
              : filtered.map((p, i) => <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} index={i} canOrder={canOrder} />)}
          </div>
        )}

        {/* ── Powered By footer ── */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-2">
          <div className="h-px w-24 bg-white/[0.06]" />
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.18em]">Powered by</p>
          <img src={LOGO_FULL} alt="The Space OS" className="h-14 w-auto object-contain opacity-80 rounded-xl" />
        </div>
      </main>

      {/* ── Floating Cart Button ── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#08080f] via-[#08080f]/95 to-transparent pointer-events-none">
        {!canOrder ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3"
          >
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm font-medium">Start a session at the front desk to order</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {cartCount > 0 ? (
              <motion.button
                key="cart-btn"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={gentleSpring}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCartOpen(true)}
                className="pointer-events-auto w-full h-[58px] rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[15px] flex items-center justify-between px-5 shadow-2xl shadow-[#7c3aed]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <motion.div
                      key={cartCount}
                      initial={{ scale: 1.6 }}
                      animate={{ scale: 1 }}
                      transition={spring}
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white text-[#7c3aed] text-[10px] font-black flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.div>
                  </div>
                  View Order
                </div>
                <div className="bg-white/20 rounded-xl px-3 py-1.5 text-sm font-bold">
                  {cartTotal.toFixed(0)} EGP
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none text-center text-xs text-gray-700 tracking-wide py-2"
              >
                Tap + to add items · Staff will bring your order
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Cart Bottom Sheet ── */}
      <AnimatePresence>
        {cartOpen && (
          <CartSheet
            cart={cart}
            customerName={customerName}
            onNameChange={setCustomerName}
            onUpdate={updateCart}
            onClose={() => setCartOpen(false)}
            onCheckout={handleCheckout}
            isLoading={placeOrder.isPending}
            cartTotal={cartTotal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Product Card
══════════════════════════════════════════════════════ */
function ProductCard({ product, qty, onUpdate, index, canOrder }: {
  product: any; qty: number; onUpdate: (p: any, d: number) => void; index: number; canOrder: boolean;
}) {
  const emoji = getProductEmoji(product.nameAr ?? "", product.name ?? "", "", "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={`flex items-center gap-4 rounded-2xl p-4 border transition-colors duration-200 ${
        qty > 0
          ? "bg-[#7c3aed]/8 border-[#7c3aed]/30"
          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
      }`}
    >
      {/* Emoji */}
      <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl select-none transition-colors ${
        qty > 0 ? "bg-[#7c3aed]/20" : "bg-white/[0.06]"
      }`}>
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-[15px] leading-tight">{product.name}</h3>
        {product.nameAr && (
          <p className="text-xs text-gray-500 mt-0.5 truncate" dir="rtl">{product.nameAr}</p>
        )}
        {product.description && (
          <p className="text-xs text-gray-600 mt-1 leading-snug line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`font-bold text-base tabular-nums ${qty > 0 ? "text-[#a78bfa]" : "text-[#7c3aed]"}`}>
            {product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
          </span>
          <span className="text-gray-600 text-xs">EGP</span>
          {qty > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-[#a78bfa]/60 ml-1"
            >
              · {(product.price * qty).toFixed(0)} total
            </motion.span>
          )}
        </div>
      </div>

      {/* Add / Stepper — hidden when no active session */}
      {canOrder && (
        <div className="shrink-0">
          <AnimatePresence mode="wait" initial={false}>
            {qty > 0 ? (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={spring}
                className="flex items-center gap-1 bg-white/[0.06] rounded-2xl p-1"
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onUpdate(product, -1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {qty === 1 ? <X className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </motion.button>
                <motion.span
                  key={qty}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                  className="w-6 text-center font-bold text-[15px] text-white tabular-nums"
                >
                  {qty}
                </motion.span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onUpdate(product, 1)}
                  className="w-9 h-9 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={spring}
                whileTap={{ scale: 0.88 }}
                onClick={() => onUpdate(product, 1)}
                className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   Cart Bottom Sheet
══════════════════════════════════════════════════════ */
function CartSheet({ cart, customerName, onNameChange, onUpdate, onClose, onCheckout, isLoading, cartTotal }: {
  cart: CartItem[];
  customerName: string;
  onNameChange: (v: string) => void;
  onUpdate: (p: any, d: number) => void;
  onClose: () => void;
  onCheckout: () => void;
  isLoading: boolean;
  cartTotal: number;
}) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  const bgOpacity = useTransform(y, [0, 200], [0.7, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y > 100 || info.velocity.y > 400) onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black"
        style={{ opacity: bgOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-[#0f0f1a] rounded-t-3xl max-h-[85vh]"
        style={{ y }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={gentleSpring}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.01, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xl font-bold text-white">Your Order</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 overscroll-contain">
          <AnimatePresence initial={false}>
            {cart.map(item => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
              >
                <div className="w-11 h-11 bg-[#7c3aed]/15 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {getProductEmoji(item.product.nameAr ?? "", item.product.name ?? "", "", "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-[14px] leading-tight truncate">{item.product.name}</p>
                  <p className="text-[#a78bfa] font-bold text-sm mt-0.5 tabular-nums">
                    {(item.product.price * item.quantity).toFixed(0)} EGP
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onUpdate(item.product, -1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {item.quantity === 1 ? <X className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  </motion.button>
                  <motion.span
                    key={item.quantity}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                    className="w-5 text-center font-bold text-sm text-white tabular-nums"
                  >
                    {item.quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onUpdate(item.product, 1)}
                    className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Name input */}
          <div className="pt-2">
            <label className="text-[10px] text-gray-600 uppercase tracking-widest block mb-2 px-1">Your name (optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={e => onNameChange(e.target.value)}
              placeholder="Let staff know who to bring it to…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-[#7c3aed]/50 focus:bg-[#7c3aed]/5 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 pb-8 pt-3 border-t border-white/[0.06] space-y-3 bg-[#0f0f1a]">
          {/* Total row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-gray-400 text-sm">Total</span>
            <motion.span
              key={cartTotal}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={spring}
              className="text-2xl font-black text-white tabular-nums"
            >
              {cartTotal.toFixed(0)} <span className="text-sm font-normal text-gray-500">EGP</span>
            </motion.span>
          </div>

          {/* Confirm button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCheckout}
            disabled={cart.length === 0 || isLoading}
            className="w-full h-[58px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-lg transition-colors shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Place Order
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-2">🔍</div>
      <p className="text-white font-semibold">Nothing found</p>
      <p className="text-gray-600 text-sm">Try a different search or category</p>
    </div>
  );
}
