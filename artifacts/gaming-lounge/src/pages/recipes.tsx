import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listProductsWithRecipes,
  getListProductsWithRecipesQueryKey,
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
import { useLang } from "@/hooks/use-language";
import { dn } from "@/lib/display";

type DraftLine = { inventoryItemId: number; quantityUsed: string };

export default function Recipes() {
  const queryClient = useQueryClient();
  const { t, lang } = useLang();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [draftItems, setDraftItems] = useState<DraftLine[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: getListProductsWithRecipesQueryKey(),
    queryFn: () => listProductsWithRecipes(),
  });

  const { data: recipeItems, isLoading: isLoadingRecipe } = useQuery({
    queryKey: getGetProductRecipeQueryKey(selectedProductId ?? 0),
    queryFn: () => getProductRecipe(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const { data: inventoryItems } = useListInventoryItems({
    query: { queryKey: getListInventoryItemsQueryKey() }
  });

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
      queryClient.invalidateQueries({ queryKey: getListProductsWithRecipesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProductRecipeQueryKey(selectedProductId ?? 0) });
      setIsDirty(false);
      toast.success(t("rec_save_ok"));
    },
    onError: () => toast.error(t("rec_save_error")),
  });

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const handleSelectProduct = (p: ProductWithRecipe) => {
    if (isDirty) {
      setIsDirty(false);
      setDraftItems([]);
    }
    setSelectedProductId(p.id);
  };

  const handleAddLine = () => {
    if (!inventoryItems?.length) return;
    const usedIds = new Set(draftItems.map(i => i.inventoryItemId));
    const next = inventoryItems.find(i => !usedIds.has(i.id));
    if (!next) { toast.info(t("rec_all_added")); return; }
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
    <div className="p-4 md:p-8 space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">{t("rec_title")}</h2>
        <p className="text-muted-foreground mt-1">{t("rec_subtitle")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
        {/* Product list */}
        <Card className="bg-card w-full md:w-72 shrink-0 flex flex-col max-h-52 md:max-h-none">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("rec_products_panel")} ({products?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {!products?.length && (
                <p className="text-center text-sm text-muted-foreground py-6">{t("rec_no_products")}</p>
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
                  <span className="truncate">{dn(p, lang)}</span>
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
        <Card className="bg-card flex-1 flex flex-col min-h-0 min-h-[300px]">
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <ChefHat className="h-12 w-12 mx-auto opacity-25" />
                <p>{t("rec_select_hint")}</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="shrink-0 border-b border-border">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      {dn(selectedProduct, lang)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedProduct.hasRecipe
                        ? `${selectedProduct.recipeItemCount} ${t("rec_ingredient_count_suffix")}`
                        : t("rec_no_recipe")}
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
                      {t("rec_add_ingredient")}
                    </Button>
                    <Button
                      onClick={() => saveMutation.mutate({ productId: selectedProductId!, items: draftItems })}
                      size="sm"
                      disabled={saveMutation.isPending || !isDirty}
                    >
                      <Save className="h-4 w-4 ms-1" />
                      {t("rec_save_recipe")}
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
                    <p className="text-sm">{t("rec_no_ingredients")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Column headers */}
                    <div className="hidden sm:grid sm:grid-cols-[1fr_160px_44px] gap-3 px-1 text-xs text-muted-foreground font-medium">
                      <span>{t("rec_col_ingredient")}</span>
                      <span className="text-center">{t("rec_col_qty")}</span>
                      <span />
                    </div>
                    {draftItems.map((line, idx) => {
                      const invItem = inventoryItems?.find(i => i.id === line.inventoryItemId);
                      return (
                        <div key={idx} className="grid grid-cols-[1fr_auto_44px] sm:grid-cols-[1fr_160px_44px] gap-2 sm:gap-3 items-center">
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-right"
                            value={line.inventoryItemId}
                            onChange={e => handleChangeItem(idx, parseInt(e.target.value))}
                          >
                            {inventoryItems?.map(i => (
                              <option key={i.id} value={i.id}>{dn(i, lang)}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              className="w-16 sm:w-24 text-center"
                              value={line.quantityUsed}
                              onChange={e => handleChangeQty(idx, e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground w-8 sm:w-10 shrink-0">{invItem?.unit ?? ""}</span>
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
                        {t("rec_unsaved_warning")}
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
