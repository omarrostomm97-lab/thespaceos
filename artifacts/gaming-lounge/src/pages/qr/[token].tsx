import { useGetQrMenu, usePlaceQrOrder } from "@workspace/api-client-react";
import { getProductEmoji } from "@/lib/product-emoji";
import { useParams } from "wouter";
import { useState, useMemo } from "react";
import { Gamepad2, ShoppingCart, Plus, Minus, X, Search, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function QrMenu() {
  const { token } = useParams();
  const { data: menuData, isLoading } = useGetQrMenu(token || "");
  const placeOrder = usePlaceQrOrder();

  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

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
        p.name.toLowerCase().includes(q) || (p.nameAr ?? "").includes(q)
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

  const getQty = (productId: number) => cart.find(i => i.product.id === productId)?.quantity ?? 0;
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await placeOrder.mutateAsync({
        token: token || "",
        data: {
          customerName: customerName || undefined,
          items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        },
      });
      toast.success("Order placed successfully!");
      setCart([]);
      setShowCart(false);
      setCustomerName("");
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[#7c3aed]/30 border-t-[#7c3aed] animate-spin" />
          <Gamepad2 className="absolute inset-0 m-auto h-6 w-6 text-[#7c3aed]" />
        </div>
        <p className="text-[#7c3aed]/70 text-sm tracking-widest uppercase">Loading Menu</p>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-sm">
          <Gamepad2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Menu Not Found</h1>
          <p className="text-gray-500 text-sm">This QR code is invalid or the session has ended.</p>
        </div>
      </div>
    );
  }

  const { asset, activeSession } = menuData;

  /* ── Cart View ── */
  if (showCart) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col" dir="ltr">
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCart(false)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="font-bold text-lg">Your Order</h2>
            <span className="ml-auto text-sm text-gray-500">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 space-y-3 pb-32">
          {cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {getProductEmoji(item.product.nameAr ?? "", item.product.name ?? "", "", "")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{item.product.name}</p>
                {item.product.nameAr && <p className="text-xs text-gray-500" dir="rtl">{item.product.nameAr}</p>}
                <p className="text-[#7c3aed] font-bold mt-0.5">{(item.product.price * item.quantity).toFixed(0)} EGP</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => updateCart(item.product, -1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateCart(item.product, 1)}
                  className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Name Input */}
          <div className="mt-4">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Your name (optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:bg-[#7c3aed]/5 transition-colors"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mt-4">
            <span className="text-gray-400 font-medium">Total</span>
            <span className="text-2xl font-bold text-white">{cartTotal.toFixed(0)} <span className="text-sm text-gray-500">EGP</span></span>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCart(false)}
              className="flex-1 h-14 rounded-2xl border border-white/10 text-gray-300 hover:bg-white/5 font-semibold transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || placeOrder.isPending}
              className="flex-[2] h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-lg transition-colors"
            >
              {placeOrder.isPending ? "Placing…" : `Confirm Order · ${cartTotal.toFixed(0)} EGP`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Menu View ── */
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="ltr">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#7c3aed]/20 border border-[#7c3aed]/30 rounded-xl p-2.5">
              <Gamepad2 className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">{asset.name}</h1>
              <p className={`text-xs tracking-wide uppercase ${activeSession ? "text-emerald-400" : "text-gray-500"}`}>
                {activeSession ? "Active Session · Order Now" : "Browse Menu"}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c3aed]/50 focus:bg-[#7c3aed]/5 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {!search && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categoriesWithItems.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Products */}
      <main className="px-4 py-4 pb-32">
        {activeCategory === "all" && !search ? (
          <div className="space-y-8">
            {categoriesWithItems.map(cat => {
              const catProducts = availableProducts.filter(p => p.categoryId === cat.id);
              if (!catProducts.length) return null;
              return (
                <section key={cat.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#7c3aed]">{cat.name}</h2>
                    <div className="flex-1 h-px bg-[#7c3aed]/20" />
                    <span className="text-xs text-gray-600">{catProducts.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {catProducts.map(p => <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} />)}
                  </div>
                </section>
              );
            })}
            {(() => {
              const uncat = availableProducts.filter(p => !p.categoryId);
              if (!uncat.length) return null;
              return (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#7c3aed]">Other</h2>
                    <div className="flex-1 h-px bg-[#7c3aed]/20" />
                  </div>
                  <div className="space-y-2">
                    {uncat.map(p => <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} />)}
                  </div>
                </section>
              );
            })()}
          </div>
        ) : (
          <div>
            {search && <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>}
            {filtered.length === 0 ? (
              <div className="text-center py-16"><p className="text-gray-600 text-sm">No items found</p></div>
            ) : (
              <div className="space-y-2">
                {filtered.map(p => <ProductCard key={p.id} product={p} qty={getQty(p.id)} onUpdate={updateCart} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5">
        {cartCount > 0 ? (
          <button
            onClick={() => setShowCart(true)}
            className="w-full h-14 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-base transition-colors flex items-center justify-between px-5 shadow-xl shadow-[#7c3aed]/20"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              View Order
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {cartCount} · {cartTotal.toFixed(0)} EGP
            </div>
          </button>
        ) : (
          <p className="text-center text-xs text-gray-700 tracking-wide">
            Add items to place an order
          </p>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, qty, onUpdate }: {
  product: any;
  qty: number;
  onUpdate: (product: any, delta: number) => void;
}) {
  const emoji = getProductEmoji(product.nameAr ?? "", product.name ?? "", "", "");

  return (
    <div className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#7c3aed]/20 rounded-2xl p-4 transition-all duration-200">
      <div className="shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl select-none">
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-base leading-tight">{product.name}</h3>
        {product.nameAr && <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{product.nameAr}</p>}
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <div className="text-right">
          <div className="text-[#7c3aed] font-bold text-lg tabular-nums">
            {product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
          </div>
          <div className="text-gray-600 text-xs">EGP</div>
        </div>

        {qty > 0 ? (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => onUpdate(product, -1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-5 text-center font-bold text-sm">{qty}</span>
            <button
              onClick={() => onUpdate(product, 1)}
              className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white hover:bg-[#6d28d9] transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onUpdate(product, 1)}
            className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
