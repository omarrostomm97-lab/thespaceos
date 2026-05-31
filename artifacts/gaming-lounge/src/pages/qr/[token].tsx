import { useGetQrMenu, usePlaceQrOrder } from "@workspace/api-client-react";
import { getProductEmoji } from "@/lib/product-emoji";
import { useParams } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function QrMenu() {
  const { token } = useParams();
  const { data: menuData, isLoading } = useGetQrMenu(token || "");
  const placeOrder = usePlaceQrOrder();

  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive text-xl font-bold">
        رابط غير صالح
      </div>
    );
  }

  const { asset, categories, products, activeSession } = menuData;

  const filteredProducts = products.filter(p => 
    p.isAvailable && (!activeCategory || p.categoryId === activeCategory)
  );

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

  const getQty = (productId: number) => cart.find(i => i.product.id === productId)?.quantity || 0;
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await placeOrder.mutateAsync({
        token: token || "",
        data: {
          customerName: customerName || undefined,
          items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
        }
      });
      toast.success("تم إرسال الطلب بنجاح");
      setCart([]);
      setShowCart(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{asset.nameAr || asset.name}</h1>
              <p className="text-xs text-muted-foreground">
                {activeSession ? "جلسة نشطة" : "قائمة الطلبات المباشرة"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <ScrollArea className="w-full whitespace-nowrap bg-secondary/30">
          <div className="flex w-max p-2 gap-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="rounded-full px-4"
            >
              الكل
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="rounded-full px-4"
              >
                {cat.nameAr || cat.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </header>

      {/* Main Menu */}
      <main className="p-4">
        {showCart ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> السلة
            </h2>
            {cart.map(item => (
              <Card key={item.product.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{item.product.nameAr || item.product.name}</h3>
                    <p className="text-primary font-medium">{item.product.price} ج.م</p>
                  </div>
                  <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateCart(item.product, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-4 text-center font-bold">{item.quantity}</span>
                    <Button variant="default" size="icon" className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90" onClick={() => updateCart(item.product, 1)}>
                      <Plus className="h-4 w-4 text-primary-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="mt-8 space-y-4">
              <Input 
                placeholder="الاسم (اختياري)" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-12 text-lg"
              />
              <div className="flex justify-between items-center text-lg font-bold p-4 bg-secondary rounded-lg">
                <span>الإجمالي</span>
                <span className="text-emerald-500">{cartTotal.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const qty = getQty(product.id);
              return (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-3xl leading-none select-none shrink-0">
                        {getProductEmoji(
                          product.nameAr ?? "",
                          product.name ?? "",
                          (product as any).categoryNameAr ?? "",
                          (product as any).categoryName ?? ""
                        )}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg leading-tight mb-1">{product.nameAr || product.name}</h3>
                        <p className="text-primary font-bold">{product.price} ج.م</p>
                      </div>
                    </div>
                    
                    {qty > 0 ? (
                      <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => updateCart(product, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-4 text-center font-bold">{qty}</span>
                        <Button variant="default" size="icon" className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90" onClick={() => updateCart(product, 1)}>
                          <Plus className="h-4 w-4 text-primary-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="h-10 px-4 rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => updateCart(product, 1)}>
                        إضافة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {showCart ? (
          <div className="flex gap-2">
            <Button variant="outline" className="h-14 flex-1 text-lg font-bold" onClick={() => setShowCart(false)}>
              رجوع للمنيو
            </Button>
            <Button 
              className="h-14 flex-[2] text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={handleCheckout}
              disabled={cart.length === 0 || placeOrder.isPending}
            >
              تأكيد الطلب ({cartTotal.toFixed(2)})
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full h-14 text-lg font-bold shadow-xl flex items-center justify-between px-6"
            onClick={() => setShowCart(true)}
            disabled={cart.length === 0}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              مراجعة الطلب
            </span>
            {cart.length > 0 && (
              <span className="bg-primary-foreground text-primary px-3 py-1 rounded-full text-sm">
                {cart.reduce((s, i) => s + i.quantity, 0)} أصناف - {cartTotal.toFixed(2)} ج.م
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
