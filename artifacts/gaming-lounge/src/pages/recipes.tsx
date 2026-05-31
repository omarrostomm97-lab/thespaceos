import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductsWithRecipes,
  getGetProductsWithRecipesQueryKey,
  getProductRecipe,
  getGetProductRecipeQueryKey,
  updateProductRecipe,
  useListInventoryItems,
  getListInventoryItemsQueryKey,
} from "@workspace/api-client-react";
import type { ProductWithRecipe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ChefHat, Plus, Trash2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type DraftLine = { inventoryItemId: number; quantityUsed: string };

export default function Recipes() {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [draftItems, setDraftItems] = useState<DraftLine[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: getGetProductsWithRecipesQueryKey(),
    queryFn: () => getProductsWithRecipes(),
  });

  const { data: recipeItems, isLoading: isLoadingRecipe } = useQuery({
    queryKey: getGetProductRecipeQueryKey(selectedProductId ?? 0),
    queryFn: () => getProductRecipe(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const { data: inventoryItems } = useListInventoryItems({
    query: { queryKey: getListInventoryItemsQueryKey() }
  });

  // Sync draft whenever the loaded recipe changes (product selection or fresh fetch)
  useEffect(() => {
    if (recipeItems !== undefined && !isDirty) {
      setDraftItems(recipeItems.map(i => ({
        inventoryItemId: i.inventoryItemId,
        quantityUsed: String(i.quantityUsed),
      })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeItems]);

  const saveMutation = useMutation({
    mutationFn: (vars: { productId: number; items: DraftLine[] }) =>
      updateProductRecipe(vars.productId, {
        items: vars.items
          .map(i => ({ inventoryItemId: i.inventoryItemId, quantityUsed: parseFloat(i.quantityUsed) || 0 }))
          .filter(i => i.quantityUsed > 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetProductsWithRecipesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProductRecipeQueryKey(selectedProductId ?? 0) });
      setIsDirty(false);
      toast.success("تم حفظ الوصفة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء حفظ الوصفة"),
  });

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const handleSelectProduct = (p: ProductWithRecipe) => {
    if (isDirty) {
      // reset dirty state so the effect can sync the new product's recipe
      setIsDirty(false);
      setDraftItems([]);
    }
    setSelectedProductId(p.id);
  };

  const handleAddLine = () => {
    if (!inventoryItems?.length) return;
    const usedIds = new Set(draftItems.map(i => i.inventoryItemId));
    const next = inventoryItems.find(i => !usedIds.has(i.id));
    if (!next) { toast.info("تم إضافة كل عناصر المخزون بالفعل"); return; }
    setDraftItems(prev => [...prev, { inventoryItemId: next.id, quantityUsed: "1" }]);
    setIsDirty(true);
  };

  const handleRemoveLine = (idx: number) => {
    setDraftItems(prev => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const handleChangeItem = (idx: number, inventoryItemId: number) => {
    setDraftItems(prev => prev.map((item, i) => i === idx ? { ...item, inventoryItemId } : item));
    setIsDirty(true);
  };

  const handleChangeQty = (idx: number, qty: string) => {
    setDraftItems(prev => prev.map((item, i) => i === idx ? { ...item, quantityUsed: qty } : item));
    setIsDirty(true);
  };

  if (isLoadingProducts) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">الوصفات</h2>
        <p className="text-muted-foreground mt-1">حدد مكونات كل منتج لتفعيل خصم المخزون التلقائي عند التسليم</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Product list */}
        <Card className="bg-card w-72 shrink-0 flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              المنتجات ({products?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {!products?.length && (
                <p className="text-center text-sm text-muted-foreground py-6">لا توجد منتجات</p>
              )}
              {products?.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-colors text-right ${
                    selectedProductId === p.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <span className="truncate">{p.nameAr || p.name}</span>
                  {p.hasRecipe ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 ms-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground opacity-40 ms-2" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe editor */}
        <Card className="bg-card flex-1 flex flex-col min-h-0">
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <ChefHat className="h-12 w-12 mx-auto opacity-25" />
                <p>اختر منتجاً من القائمة لتعديل وصفته</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      {selectedProduct.nameAr || selectedProduct.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProduct.hasRecipe
                        ? `${selectedProduct.recipeItemCount} مكون مُضاف`
                        : "لا توجد وصفة — سيتم إنشاؤها عند الحفظ"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddLine}
                      variant="outline"
                      size="sm"
                      disabled={!inventoryItems?.length}
                    >
                      <Plus className="h-4 w-4 ms-1" />
                      إضافة مكون
                    </Button>
                    <Button
                      onClick={() => saveMutation.mutate({ productId: selectedProductId!, items: draftItems })}
                      size="sm"
                      disabled={saveMutation.isPending || !isDirty}
                    >
                      <Save className="h-4 w-4 ms-1" />
                      حفظ الوصفة
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto pt-4">
                {isLoadingRecipe ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : draftItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
                    <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-25" />
                    <p className="text-sm">لا توجد مكونات — اضغط "إضافة مكون" للبدء</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_160px_44px] gap-3 px-1 text-xs text-muted-foreground font-medium">
                      <span>المكون (من المخزون)</span>
                      <span className="text-center">الكمية لكل وحدة مباعة</span>
                      <span />
                    </div>
                    {draftItems.map((line, idx) => {
                      const invItem = inventoryItems?.find(i => i.id === line.inventoryItemId);
                      return (
                        <div key={idx} className="grid grid-cols-[1fr_160px_44px] gap-3 items-center">
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-right"
                            value={line.inventoryItemId}
                            onChange={e => handleChangeItem(idx, parseInt(e.target.value))}
                          >
                            {inventoryItems?.map(i => (
                              <option key={i.id} value={i.id}>{i.nameAr || i.name}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              className="w-24 text-center"
                              value={line.quantityUsed}
                              onChange={e => handleChangeQty(idx, e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground w-10 shrink-0">{invItem?.unit ?? ""}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveLine(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {isDirty && (
                      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm text-amber-600 dark:text-amber-400">
                        توجد تغييرات غير محفوظة — اضغط "حفظ الوصفة" لتطبيقها
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
