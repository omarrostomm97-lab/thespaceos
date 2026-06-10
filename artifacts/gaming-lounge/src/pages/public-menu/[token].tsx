import { useGetPublicMenu } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useState, useMemo } from "react";
import { getProductEmoji } from "@/lib/product-emoji";
import { Search, X, ChevronRight } from "lucide-react";
import { LogoImg } from "@/components/logo-img";

export default function PublicMenuPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = useGetPublicMenu(token || "");
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const availableProducts = useMemo(() => {
    if (!data) return [];
    return data.products.filter(p => p.isAvailable);
  }, [data]);

  const filtered = useMemo(() => {
    let list = availableProducts;
    if (activeCategory !== "all") {
      list = list.filter(p => p.categoryId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameAr ?? "").includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [availableProducts, activeCategory, search]);

  const categoriesWithItems = useMemo(() => {
    if (!data) return [];
    const ids = new Set(availableProducts.map(p => p.categoryId));
    return data.categories.filter(c => ids.has(c.id));
  }, [data, availableProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full border-4 border-[#7c3aed]/30 border-t-[#7c3aed] animate-spin" />
        <LogoImg variant="always" height={40} />
        <p className="text-[#7c3aed]/70 text-sm tracking-widest uppercase">Loading Menu</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-sm">
          <div className="flex justify-center mb-4"><LogoImg variant="always" height={52} /></div>
          <h1 className="text-xl font-bold text-white mb-2">Menu Not Found</h1>
          <p className="text-gray-500 text-sm">This QR code is invalid or the menu is no longer available.</p>
        </div>
      </div>
    );
  }

  const { tenant } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="ltr">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-xl p-2.5 flex items-center justify-center">
              <LogoImg variant="always" height={36} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">{tenant.name}</h1>
              <p className="text-xs text-gray-500 tracking-wide uppercase">Menu</p>
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

      {/* Content */}
      <main className="px-4 py-4 pb-12">

        {/* Category sections (when "All" is active and no search) */}
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
                    {catProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}
            {/* Uncategorized */}
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
                    {uncat.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>
        ) : (
          /* Filtered flat list */
          <div>
            {search && (
              <p className="text-xs text-gray-600 mb-4 uppercase tracking-wider">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
              </p>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-sm">No items found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2.5">
        <div className="flex items-center justify-center gap-3">
          <p className="text-xs text-gray-700 tracking-wide">Display only · Ask staff to order</p>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-700 uppercase tracking-[0.15em]">Powered by</span>
            <LogoImg variant="always" height={28} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: { id: number; name: string; nameAr?: string | null; price: number; description?: string | null; categoryId?: number | null } }) {
  const emoji = getProductEmoji(
    product.nameAr ?? "",
    product.name,
    "",
    ""
  );

  return (
    <div className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#7c3aed]/20 rounded-2xl p-4 transition-all duration-200">
      {/* Emoji */}
      <div className="shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl select-none">
        {emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-base leading-tight">{product.name}</h3>
        {product.nameAr && (
          <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{product.nameAr}</p>
        )}
        {product.description && (
          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{product.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <div className="text-[#7c3aed] font-bold text-lg tabular-nums">
          {product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
        </div>
        <div className="text-gray-600 text-xs">EGP</div>
      </div>

      <ChevronRight className="shrink-0 h-4 w-4 text-gray-700 group-hover:text-[#7c3aed]/50 transition-colors" />
    </div>
  );
}
