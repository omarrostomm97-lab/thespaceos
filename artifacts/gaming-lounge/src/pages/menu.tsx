import { useState } from "react";
import {
  useListProducts,
  useListProductCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  getListProductsQueryKey,
  getListProductCategoriesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Settings, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

interface ProductForm {
  name: string;
  nameAr: string;
  price: string;
  categoryId: string;
}

interface CategoryForm {
  name: string;
  nameAr: string;
}

const emptyProductForm = (): ProductForm => ({ name: "", nameAr: "", price: "", categoryId: "" });
const emptyCategoryForm = (): CategoryForm => ({ name: "", nameAr: "" });

export default function Menu() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = MGMT_ROLES.includes(user?.role ?? "");

  const { data: categories, isLoading: isLoadingCats } = useListProductCategories();
  const { data: products, isLoading: isLoadingProds } = useListProducts();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProductMut = useDeleteProduct();
  const createCategory = useCreateProductCategory();
  const updateCategoryMut = useUpdateProductCategory();
  const deleteCategoryMut = useDeleteProductCategory();

  const [activeTab, setActiveTab] = useState<string>("all");

  const [productDialog, setProductDialog] = useState<{ open: boolean; editing: null | { id: number } & ProductForm }>({ open: false, editing: null });
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm());

  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing: null | { id: number } & CategoryForm }>({ open: false, editing: null });
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm());

  const [deleteProductConfirm, setDeleteProductConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{ id: number; name: string } | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProductCategoriesQueryKey() });
  };

  const openAddProduct = () => {
    setProductForm(emptyProductForm());
    setProductDialog({ open: true, editing: null });
  };

  const openEditProduct = (p: { id: number; name: string; nameAr?: string | null; price: number; categoryId?: number | null }) => {
    const form = { name: p.name, nameAr: p.nameAr ?? "", price: String(p.price), categoryId: p.categoryId ? String(p.categoryId) : "" };
    setProductForm(form);
    setProductDialog({ open: true, editing: { id: p.id, ...form } });
  };

  const saveProduct = async () => {
    const price = parseFloat(productForm.price);
    if (!productForm.name || isNaN(price) || price < 0) {
      toast.error("أدخل الاسم والسعر بشكل صحيح"); return;
    }
    const payload = {
      name: productForm.name,
      nameAr: productForm.nameAr || undefined,
      price,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : undefined,
    };
    try {
      if (productDialog.editing) {
        await updateProduct.mutateAsync({ productId: productDialog.editing.id, data: payload });
        toast.success("تم تحديث المنتج");
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast.success("تم إضافة المنتج");
      }
      setProductDialog({ open: false, editing: null });
      refresh();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductConfirm) return;
    try {
      await deleteProductMut.mutateAsync({ productId: deleteProductConfirm.id });
      toast.success("تم حذف المنتج");
      setDeleteProductConfirm(null);
      refresh();
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const toggleAvailability = async (productId: number, current: boolean) => {
    try {
      await updateProduct.mutateAsync({ productId, data: { isAvailable: !current } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const openAddCategory = () => {
    setCategoryForm(emptyCategoryForm());
    setCategoryDialog({ open: true, editing: null });
  };

  const openEditCategory = (c: { id: number; name: string; nameAr?: string | null }) => {
    const form = { name: c.name, nameAr: c.nameAr ?? "" };
    setCategoryForm(form);
    setCategoryDialog({ open: true, editing: { id: c.id, ...form } });
  };

  const saveCategory = async () => {
    if (!categoryForm.name) { toast.error("أدخل اسم الفئة"); return; }
    try {
      if (categoryDialog.editing) {
        await updateCategoryMut.mutateAsync({ categoryId: categoryDialog.editing.id, data: { name: categoryForm.name, nameAr: categoryForm.nameAr || undefined } });
        toast.success("تم تحديث الفئة");
      } else {
        await createCategory.mutateAsync({ data: { name: categoryForm.name, nameAr: categoryForm.nameAr || undefined } });
        toast.success("تم إضافة الفئة");
      }
      setCategoryDialog({ open: false, editing: null });
      refresh();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryConfirm) return;
    try {
      await deleteCategoryMut.mutateAsync({ categoryId: deleteCategoryConfirm.id });
      toast.success("تم حذف الفئة");
      setDeleteCategoryConfirm(null);
      if (activeTab === String(deleteCategoryConfirm.id)) setActiveTab("all");
      refresh();
    } catch {
      toast.error("حدث خطأ — تأكد من حذف المنتجات أولاً");
    }
  };

  const visibleProducts = products?.filter(p =>
    activeTab === "all" || p.categoryId?.toString() === activeTab
  ) ?? [];

  if (isLoadingCats || isLoadingProds) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isSavingProduct = createProduct.isPending || updateProduct.isPending;
  const isSavingCategory = createCategory.isPending || updateCategoryMut.isPending;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">إدارة المنيو</h2>
          <p className="text-muted-foreground mt-1">{products?.length ?? 0} منتج في {categories?.length ?? 0} فئة</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={openAddCategory} className="gap-2">
              <Settings className="h-4 w-4" />
              إدارة الفئات
            </Button>
            <Button onClick={openAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-secondary flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="all" className="min-w-[80px] h-9">الكل ({products?.length ?? 0})</TabsTrigger>
          {categories?.map((cat) => {
            const count = products?.filter(p => p.categoryId === cat.id).length ?? 0;
            return (
              <TabsTrigger key={cat.id} value={cat.id.toString()} className="min-w-[80px] h-9 group relative">
                <span>{cat.nameAr || cat.name} ({count})</span>
                {isManager && (
                  <span className="hidden group-hover:flex absolute -top-1.5 -left-1.5 gap-0.5">
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
            <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">لا توجد منتجات</p>
              {isManager && <Button onClick={openAddProduct} className="mt-4 gap-2"><Plus className="h-4 w-4" />إضافة منتج</Button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <Card key={product.id} className={`border-2 transition-opacity ${product.isAvailable ? "border-border" : "border-destructive/30 opacity-60"}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base leading-tight truncate">{product.nameAr || product.name}</h3>
                        {product.nameAr && <p className="text-xs text-muted-foreground truncate">{product.name}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{product.categoryNameAr || product.categoryName || "—"}</p>
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
                          {product.isAvailable ? "متاح" : "غير متاح"}
                        </span>
                      </div>
                      {isManager && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditProduct(product)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteProductConfirm({ id: product.id, name: product.nameAr || product.name })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={productDialog.open} onOpenChange={(open) => !isSavingProduct && setProductDialog({ open, editing: null })}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{productDialog.editing ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الاسم بالعربي *</Label>
              <Input value={productForm.nameAr} onChange={(e) => setProductForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: إسبريسو سينجل" />
            </div>
            <div className="space-y-1.5">
              <Label>الاسم بالإنجليزي *</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Espresso Single" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>السعر (ج.م) *</Label>
              <Input type="number" step="0.01" min="0" value={productForm.price} onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>الفئة</Label>
              <Select value={productForm.categoryId} onValueChange={(v) => setProductForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة..." />
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
            <Button variant="outline" onClick={() => setProductDialog({ open: false, editing: null })} disabled={isSavingProduct}>إلغاء</Button>
            <Button onClick={saveProduct} disabled={isSavingProduct}>
              {isSavingProduct ? "جاري الحفظ..." : productDialog.editing ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={categoryDialog.open} onOpenChange={(open) => !isSavingCategory && setCategoryDialog({ open, editing: null })}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>{categoryDialog.editing ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>الاسم بالعربي *</Label>
              <Input value={categoryForm.nameAr} onChange={(e) => setCategoryForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: مشروبات ساخنة" />
            </div>
            <div className="space-y-1.5">
              <Label>الاسم بالإنجليزي *</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hot Drinks" dir="ltr" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCategoryDialog({ open: false, editing: null })} disabled={isSavingCategory}>إلغاء</Button>
            <Button onClick={saveCategory} disabled={isSavingCategory}>
              {isSavingCategory ? "جاري الحفظ..." : categoryDialog.editing ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductConfirm} onOpenChange={(open) => !open && setDeleteProductConfirm(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف "<strong>{deleteProductConfirm?.name}</strong>"؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProductMut.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryConfirm} onOpenChange={(open) => !open && setDeleteCategoryConfirm(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفئة</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف فئة "<strong>{deleteCategoryConfirm?.name}</strong>"؟ يجب حذف منتجاتها أولاً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteCategoryMut.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
