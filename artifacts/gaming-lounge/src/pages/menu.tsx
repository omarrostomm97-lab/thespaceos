import { useState } from "react";
import { useListProducts, useListProductCategories, useUpdateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Utensils, Coffee, Popcorn } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Menu() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories, isLoading: isLoadingCats } = useListProductCategories();
  const { data: products, isLoading: isLoadingProds } = useListProducts();

  const updateProduct = useUpdateProduct();

  const toggleAvailability = async (productId: number, currentStatus: boolean) => {
    try {
      await updateProduct.mutateAsync({
        productId,
        data: { isAvailable: !currentStatus }
      });
      toast.success("تم تحديث حالة المنتج");
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  if (isLoadingCats || isLoadingProds) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const defaultTab = categories?.[0]?.id.toString() || "all";

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">إدارة المنيو</h2>
          <p className="text-muted-foreground mt-1">إدارة المنتجات وتوافرها في النظام</p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="mb-6 bg-secondary flex flex-wrap h-auto p-1">
          <TabsTrigger value="all" className="flex-1 min-w-[100px] text-base h-10">
            الكل
          </TabsTrigger>
          {categories?.map((cat) => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id.toString()} 
              className="flex-1 min-w-[100px] text-base h-10"
            >
              {cat.nameAr || cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {products
            ?.filter(p => activeCategory === "all" || !activeCategory || p.categoryId?.toString() === activeCategory)
            .map((product) => (
            <Card key={product.id} className={`border-2 ${product.isAvailable ? 'border-border' : 'border-destructive/30 opacity-70'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{product.nameAr || product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.categoryNameAr || product.categoryName}</p>
                  </div>
                  <Badge variant="outline" className="font-bold text-base bg-secondary">{product.price} ج.م</Badge>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <span className={`text-sm font-medium ${product.isAvailable ? 'text-emerald-500' : 'text-destructive'}`}>
                    {product.isAvailable ? 'متاح' : 'غير متاح'}
                  </span>
                  <Switch 
                    checked={product.isAvailable} 
                    onCheckedChange={() => toggleAvailability(product.id, product.isAvailable)}
                    disabled={updateProduct.isPending}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
