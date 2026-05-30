import { useListProductCategories, useListProducts, useCreateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem {
  product: any;
  quantity: number;
}

export default function Pos() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const { data: categories, isLoading: isLoadingCats } = useListProductCategories();
  const { data: products, isLoading: isLoadingProds } = useListProducts({
    query: { enabled: true }
  });

  const createOrder = useCreateOrder();

  const filteredProducts = products?.filter(p => 
    p.isAvailable && (!activeCategory || p.categoryId === activeCategory)
  );

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

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async (paymentMethod: 'cash' | 'instapay' | 'visa') => {
    if (cart.length === 0) return;
    
    try {
      await createOrder.mutateAsync({
        data: {
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        }
      });
      
      toast.success("تم تأكيد الطلب بنجاح");
      setCart([]);
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ أثناء تأكيد الطلب");
    }
  };

  if (isLoadingCats || isLoadingProds) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Products Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-l border-border">
        <div className="p-4 border-b border-border bg-card shrink-0 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            <Button 
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="h-12 px-6 text-lg font-medium"
            >
              الكل
            </Button>
            {categories?.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className="h-12 px-6 text-lg font-medium"
              >
                {cat.nameAr || cat.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProducts?.map(product => (
              <Button
                key={product.id}
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-2 p-2 whitespace-normal bg-card hover:bg-secondary border-2 border-transparent hover:border-primary hover-elevate transition-all"
                onClick={() => addToCart(product)}
              >
                <span className="font-bold text-lg text-center leading-tight line-clamp-2">
                  {product.nameAr || product.name}
                </span>
                <span className="text-primary font-bold text-xl">
                  {product.price} ج.م
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] flex flex-col bg-card shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-sidebar text-foreground shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            سلة الطلبات
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-destructive hover:text-destructive">
              إفراغ
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p className="text-lg">السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-bold">{item.product.nameAr || item.product.name}</p>
                  <p className="text-primary font-medium">{item.product.price} ج.م</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary px-3 py-1 rounded-md font-bold text-lg">
                    {item.quantity}x
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border bg-sidebar mt-auto space-y-4 shrink-0">
          <div className="flex justify-between items-center text-xl">
            <span className="text-muted-foreground">الإجمالي:</span>
            <span className="font-bold text-3xl text-emerald-500">{total.toFixed(2)} ج.م</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={cart.length === 0 || createOrder.isPending}
              onClick={() => handleCheckout('cash')}
            >
              دفع وتأكيد الطلب
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
