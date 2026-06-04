import { useState, useRef } from "react";
import {
  useListProducts,
  useListProductCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  useGenerateMenuQr,
  useGetMenuQr,
  getListProductsQueryKey,
  getListProductCategoriesQueryKey,
} from "@workspace/api-client-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings, UtensilsCrossed, QrCode, RefreshCw, Download, Copy, Check, ExternalLink } from "lucide-react";
import { getProductEmoji } from "@/lib/product-emoji";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

interface ProductForm { name: string; nameAr: string; price: string; categoryId: string; }
interface CategoryForm { name: string; nameAr: string; }

const emptyProductForm  = (): ProductForm  => ({ name: "", nameAr: "", price: "", categoryId: "" });
const emptyCategoryForm = (): CategoryForm => ({ name: "", nameAr: "" });

export default function Menu() {
  const { user } = useAuth();
  const { t, dir } = useLang();
  const queryClient = useQueryClient();
  const isManager = MGMT_ROLES.includes(user?.role ?? "");

  const { data: categories, isLoading: isLoadingCats } = useListProductCategories();
  const { data: products,   isLoading: isLoadingProds } = useListProducts();

  const createProduct     = useCreateProduct();
  const updateProduct     = useUpdateProduct();
  const deleteProductMut  = useDeleteProduct();
  const createCategory    = useCreateProductCategory();
  const updateCategoryMut = useUpdateProductCategory();
  const deleteCategoryMut = useDeleteProductCategory();

  const [activeTab, setActiveTab] = useState<string>("all");

  const [productDialog, setProductDialog]   = useState<{ open: boolean; editing: null | { id: number } & ProductForm }>({ open: false, editing: null });
  const [productForm, setProductForm]       = useState<ProductForm>(emptyProductForm());

  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing: null | { id: number } & CategoryForm }>({ open: false, editing: null });
  const [categoryForm, setCategoryForm]     = useState<CategoryForm>(emptyCategoryForm());

  const [deleteProductConfirm,  setDeleteProductConfirm]  = useState<{ id: number; name: string } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ id: number; name: string } | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProductCategoriesQueryKey() });
  };

  const openAddProduct = () => { setProductForm(emptyProductForm()); setProductDialog({ open: true, editing: null }); };
  const openEditProduct = (p: { id: number; name: string; nameAr?: string | null; price: number; categoryId?: number | null }) => {
    const form = { name: p.name, nameAr: p.nameAr ?? "", price: String(p.price), categoryId: p.categoryId ? String(p.categoryId) : "" };
    setProductForm(form);
    setProductDialog({ open: true, editing: { id: p.id, ...form } });
  };

  const saveProduct = async () => {
    const price = parseFloat(productForm.price);
    if (!productForm.name || isNaN(price) || price < 0) { toast.error(t("error_name_price")); return; }
    const payload = { name: productForm.name, nameAr: productForm.nameAr || undefined, price, categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : undefined };
    try {
      if (productDialog.editing) {
        await updateProduct.mutateAsync({ productId: productDialog.editing.id, data: payload });
        toast.success(t("product_updated_ok"));
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast.success(t("product_added_ok"));
      }
      setProductDialog({ open: false, editing: null });
      refresh();
    } catch { toast.error(t("error_generic")); }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductConfirm) return;
    try {
      await deleteProductMut.mutateAsync({ productId: deleteProductConfirm.id });
      toast.success(t("product_deleted_ok"));
      setDeleteProductConfirm(null);
      refresh();
    } catch { toast.error(t("error_generic")); }
  };

  const toggleAvailability = async (productId: number, current: boolean) => {
    try {
      await updateProduct.mutateAsync({ productId, data: { isAvailable: !current } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch { toast.error(t("error_generic")); }
  };

  const openAddCategory  = () => { setCategoryForm(emptyCategoryForm()); setCategoryDialog({ open: true, editing: null }); };
  const openEditCategory = (c: { id: number; name: string; nameAr?: string | null }) => {
    const form = { name: c.name, nameAr: c.nameAr ?? "" };
    setCategoryForm(form);
    setCategoryDialog({ open: true, editing: { id: c.id, ...form } });
  };

  const saveCategory = async () => {
    if (!categoryForm.name) { toast.error(t("error_category_name_req")); return; }
    try {
      if (categoryDialog.editing) {
        await updateCategoryMut.mutateAsync({ categoryId: categoryDialog.editing.id, data: { name: categoryForm.name, nameAr: categoryForm.nameAr || undefined } });
        toast.success(t("category_updated_ok"));
      } else {
        await createCategory.mutateAsync({ data: { name: categoryForm.name, nameAr: categoryForm.nameAr || undefined } });
        toast.success(t("category_added_ok"));
      }
      setCategoryDialog({ open: false, editing: null });
      refresh();
    } catch { toast.error(t("error_generic")); }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;
    try {
      await deleteCategoryMut.mutateAsync({ categoryId: deleteCategoryConfirm.id });
      toast.success(t("category_deleted_ok"));
      setDeleteCategoryConfirm(null);
      if (activeTab === String(deleteCategoryConfirm.id)) setActiveTab("all");
      refresh();
    } catch { toast.error(t("category_delete_error")); }
  };

  const visibleProducts = products?.filter(p => activeTab === "all" || p.categoryId?.toString() === activeTab) ?? [];

  const generateMenuQr = useGenerateMenuQr();
  const { data: qrData, refetch: refetchQr } = useGetMenuQr();
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const menuUrl = qrData?.token
    ? `${window.location.origin}${base}/public-menu/${qrData.token}`
    : null;

  const handleGenerateQr = async () => {
    try {
      await generateMenuQr.mutateAsync();
      await refetchQr();
      toast.success("QR code generated!");
    } catch {
      toast.error("Failed to generate QR code");
    }
  };

  const handleCopyUrl = () => {
    if (!menuUrl) return;
    navigator.clipboard.writeText(menuUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu-qr.png";
    a.click();
  };

  if (isLoadingCats || isLoadingProds) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isSavingProduct  = createProduct.isPending || updateProduct.isPending;
  const isSavingCategory = createCategory.isPending || updateCategoryMut.isPending;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t("menu_title")}</h2>
          <p className="text-muted-foreground mt-1">{products?.length ?? 0} {t("add_product").toLowerCase()} · {categories?.length ?? 0} {t("product_category").toLowerCase()}</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={openAddCategory} className="gap-2">
              <Settings className="h-4 w-4" />
              {t("manage_categories")}
            </Button>
            <Button onClick={openAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("add_product")}
            </Button>
          </div>
        )}
      </div>

      {/* Walk-in Menu QR Panel */}
      {isManager && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* QR Code */}
            <div className="shrink-0">
              {menuUrl ? (
                <div ref={qrCanvasRef} className="bg-white p-3 rounded-xl shadow-lg inline-block">
                  <QRCodeCanvas
                    value={menuUrl}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="M"
                    includeMargin={false}
                  />
                </div>
              ) : (
                <div className="w-[164px] h-[164px] bg-secondary rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <QrCode className="h-10 w-10 opacity-30" />
                  <span className="text-xs">No QR yet</span>
                </div>
              )}
            </div>

            {/* Info & Actions */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Walk-in Menu QR Code
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Display this QR code at your venue entrance. Customers scan it to view your full menu in English — no ordering, display only.
                </p>
              </div>

              {menuUrl && (
                <div className="flex items-center gap-2 bg-background rounded-lg border border-border px-3 py-2">
                  <code className="text-xs text-muted-foreground flex-1 truncate" dir="ltr">{menuUrl}</code>
                  <button
                    onClick={handleCopyUrl}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="Open menu"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleGenerateQr}
                  disabled={generateMenuQr.isPending}
                  className="gap-2"
                  variant={menuUrl ? "outline" : "default"}
                >
                  <RefreshCw className={`h-4 w-4 ${generateMenuQr.isPending ? "animate-spin" : ""}`} />
                  {menuUrl ? "Regenerate QR" : "Generate QR Code"}
                </Button>
                {menuUrl && (
                  <Button variant="outline" onClick={handleDownloadQr} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PNG
                  </Button>
                )}
              </div>

              {menuUrl && (
                <p className="text-xs text-muted-foreground">
                  Regenerating creates a new URL — update any printed QR codes after regenerating.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-secondary flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="all" className="min-w-[80px] h-9">{t("all_tab")} ({products?.length ?? 0})</TabsTrigger>
          {categories?.map((cat) => {
            const count = products?.filter(p => p.categoryId === cat.id).length ?? 0;
            return (
              <TabsTrigger key={cat.id} value={cat.id.toString()} className="min-w-[80px] h-9 group relative">
                <span>{cat.nameAr || cat.name} ({count})</span>
                {isManager && (
                  <span className="hidden group-hover:flex absolute -top-1.5 -start-1.5 gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                      className="bg-secondary border border-border rounded p-0.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteCategoryConfirm({ id: cat.id, name: cat.nameAr || cat.name }); }}
                      className="bg-secondary border border-border rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {visibleProducts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl card-base">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">{t("no_products")}</p>
              {isManager && (
                <Button onClick={openAddProduct} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />{t("add_product")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-xl overflow-hidden card-base transition-opacity ${product.isAvailable ? "" : "opacity-60"}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-3xl leading-none select-none shrink-0 mt-0.5">
                          {getProductEmoji(
                            product.nameAr ?? "",
                            product.name ?? "",
                            product.categoryNameAr ?? "",
                            product.categoryName ?? ""
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base leading-tight truncate">{product.nameAr || product.name}</h3>
                          {product.nameAr && <p className="text-xs text-muted-foreground truncate">{product.name}</p>}
                          <p className="text-xs text-muted-foreground mt-0.5">{product.categoryNameAr || product.categoryName || "—"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-bold text-sm bg-secondary shrink-0 ms-2">{product.price} ج.م</Badge>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={product.isAvailable}
                          onCheckedChange={() => toggleAvailability(product.id, product.isAvailable)}
                          disabled={!isManager || updateProduct.isPending}
                          className="scale-90"
                        />
                        <span className={`text-xs font-medium ${product.isAvailable ? "text-emerald-500" : "text-destructive"}`}>
                          {product.isAvailable ? t("product_available") : t("product_unavailable")}
                        </span>
                      </div>
                      {isManager && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditProduct(product)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteProductConfirm({ id: product.id, name: product.nameAr || product.name })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialog.open} onOpenChange={(open) => !isSavingProduct && setProductDialog({ open, editing: null })}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>{productDialog.editing ? t("edit_product_title") : t("add_product_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("product_name_ar_label")} *</Label>
              <Input value={productForm.nameAr} onChange={(e) => setProductForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: إسبريسو سينجل" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("product_name_en_label")} *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Espresso Single" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("product_price_label")} *</Label>
              <Input type="number" step="0.01" min="0" value={productForm.price} onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("product_category")}</Label>
              <Select value={productForm.categoryId} onValueChange={(v) => setProductForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("choose_category")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nameAr || cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductDialog({ open: false, editing: null })} disabled={isSavingProduct}>{t("cancel")}</Button>
            <Button onClick={saveProduct} disabled={isSavingProduct}>
              {isSavingProduct ? t("saving") : productDialog.editing ? t("save_changes") : t("add_product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => !isSavingCategory && setCategoryDialog({ open, editing: null })}>
        <DialogContent className="max-w-sm" dir={dir}>
          <DialogHeader>
            <DialogTitle>{categoryDialog.editing ? t("edit_category_title") : t("add_category_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("category_name_ar_label")} *</Label>
              <Input value={categoryForm.nameAr} onChange={(e) => setCategoryForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: مشروبات ساخنة" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("category_name_en_label")} *</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hot Drinks" dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCategoryDialog({ open: false, editing: null })} disabled={isSavingCategory}>{t("cancel")}</Button>
            <Button onClick={saveCategory} disabled={isSavingCategory}>
              {isSavingCategory ? t("saving") : categoryDialog.editing ? t("save") : t("add_product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product */}
      <AlertDialog open={!!deleteProductConfirm} onOpenChange={(open) => !open && setDeleteProductConfirm(null)}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_product_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_product_confirm")} "<strong>{deleteProductConfirm?.name}</strong>"؟ {t("delete_product_warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProductMut.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category */}
      <AlertDialog open={!!deleteCategoryConfirm} onOpenChange={(open) => !open && setDeleteCategoryConfirm(null)}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_category_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_category_confirm")} "<strong>{deleteCategoryConfirm?.name}</strong>"؟ {t("delete_category_warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteCategoryMut.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
