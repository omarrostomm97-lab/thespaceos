import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import {
  useListInventoryItems,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useCreateInventoryMovement,
  getListInventoryItemsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, AlertTriangle, Plus, Pencil, Trash2, ArrowUpDown, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/hooks/use-language";

const MGMT_ROLES = ["platform_owner", "owner", "manager"];

interface ItemForm {
  name: string;
  nameAr: string;
  unit: string;
  currentStock: string;
  minStockLevel: string;
}

interface MovementForm {
  type: string;
  quantity: string;
  reason: string;
}

const emptyItemForm = (): ItemForm => ({ name: "", nameAr: "", unit: "pcs", currentStock: "0", minStockLevel: "10" });
const emptyMovementForm = (): MovementForm => ({ type: "purchase", quantity: "", reason: "" });

export default function Inventory() {
  const { user } = useAuth();
  const { t, dir } = useLang();
  const queryClient = useQueryClient();
  const isManager = MGMT_ROLES.includes(user?.role ?? "");
  const searchStr = useSearch();
  const [, setLocation] = useLocation();

  const MOVEMENT_TYPES = [
    { value: "purchase", label: t("inv_move_purchase") },
    { value: "sale",     label: t("inv_move_sale") },
    { value: "waste",    label: t("inv_move_waste") },
    { value: "adjustment", label: t("inv_move_adjustment") },
  ];

  const { data: items, isLoading } = useListInventoryItems();

  const createItem    = useCreateInventoryItem();
  const updateItem    = useUpdateInventoryItem();
  const deleteItemMut = useDeleteInventoryItem();
  const createMovement = useCreateInventoryMovement();

  const [itemDialog, setItemDialog] = useState<{ open: boolean; editing: null | { id: number } }>({ open: false, editing: null });
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm());

  const [movementDialog, setMovementDialog] = useState<{ open: boolean; itemId: number | null; itemName: string }>({ open: false, itemId: null, itemName: "" });
  const [movementForm, setMovementForm] = useState<MovementForm>(emptyMovementForm());

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const [search, setSearch] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(() => new URLSearchParams(searchStr).get("low") === "1");

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });

  const openAddItem = () => {
    setItemForm(emptyItemForm());
    setItemDialog({ open: true, editing: null });
  };

  const openEditItem = (item: { id: number; name: string; nameAr?: string | null; unit: string; currentStock: number; minStockLevel?: number | null }) => {
    setItemForm({
      name: item.name,
      nameAr: item.nameAr ?? "",
      unit: item.unit,
      currentStock: String(item.currentStock),
      minStockLevel: item.minStockLevel != null ? String(item.minStockLevel) : "",
    });
    setItemDialog({ open: true, editing: { id: item.id } });
  };

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.unit) { toast.error(t("inv_name_unit_required")); return; }
    const payload = {
      name: itemForm.name,
      nameAr: itemForm.nameAr || undefined,
      unit: itemForm.unit,
      currentStock: parseFloat(itemForm.currentStock) || 0,
      minStockLevel: itemForm.minStockLevel ? parseFloat(itemForm.minStockLevel) : undefined,
    };
    try {
      if (itemDialog.editing) {
        await updateItem.mutateAsync({ itemId: itemDialog.editing.id, data: payload });
        toast.success(t("inv_item_updated_ok"));
      } else {
        await createItem.mutateAsync({ data: payload });
        toast.success(t("inv_item_added_ok"));
      }
      setItemDialog({ open: false, editing: null });
      refresh();
    } catch {
      toast.error(t("inv_item_error"));
    }
  };

  const openMovement = (item: { id: number; name: string; nameAr?: string | null }) => {
    setMovementForm(emptyMovementForm());
    setMovementDialog({ open: true, itemId: item.id, itemName: item.nameAr || item.name });
  };

  const saveMovement = async () => {
    if (!movementDialog.itemId || !movementForm.quantity) { toast.error(t("inv_qty_required")); return; }
    const qty = parseFloat(movementForm.quantity);
    if (isNaN(qty) || qty <= 0) { toast.error(t("inv_qty_invalid")); return; }
    try {
      await createMovement.mutateAsync({
        data: {
          inventoryItemId: movementDialog.itemId,
          type: movementForm.type as any,
          quantity: qty,
          reason: movementForm.reason || undefined,
        }
      });
      toast.success(t("inv_movement_ok"));
      setMovementDialog({ open: false, itemId: null, itemName: "" });
      refresh();
    } catch {
      toast.error(t("inv_item_error"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteItemMut.mutateAsync({ itemId: deleteConfirm.id });
      toast.success(t("inv_deleted_ok"));
      setDeleteConfirm(null);
      refresh();
    } catch {
      toast.error(t("inv_delete_error"));
    }
  };

  const q = search.toLowerCase();
  const filteredItems = items?.filter(item => {
    if (q && !item.nameAr?.toLowerCase().includes(q) && !item.name?.toLowerCase().includes(q)) return false;
    if (showLowOnly && item.currentStock > (item.minStockLevel ?? 0)) return false;
    return true;
  }) ?? [];

  const lowStockCount = items?.filter(i => i.currentStock <= (i.minStockLevel ?? 0)).length ?? 0;

  const isSavingItem = createItem.isPending || updateItem.isPending;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">{t("inv_title")}</h2>
          <p className="text-muted-foreground mt-1">
            {items?.length ?? 0} {t("inv_item_count_suffix")}
            {lowStockCount > 0 && (
              <span className="text-destructive font-medium me-2"> · {lowStockCount} {t("inv_low_stock_suffix")}</span>
            )}
          </p>
        </div>
        {isManager && (
          <Button onClick={openAddItem} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("inv_add_item_btn")}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t("inv_search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        {showLowOnly && (
          <button
            onClick={() => { setShowLowOnly(false); setLocation("/inventory"); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            {t("inv_show_low_only")}
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-secondary text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-5 py-3">{t("inv_col_item")}</th>
              <th className="px-5 py-3">{t("inv_col_unit")}</th>
              <th className="px-5 py-3">{t("inv_col_stock")}</th>
              <th className="px-5 py-3">{t("inv_col_min")}</th>
              <th className="px-5 py-3">{t("inv_col_status")}</th>
              <th className="px-5 py-3 text-left">{t("inv_col_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const isLow = item.currentStock <= (item.minStockLevel ?? 0);
              return (
                <tr key={item.id} className={`border-b border-border/50 hover:bg-secondary/20 ${isLow ? "bg-destructive/5" : ""}`}>
                  <td className="px-5 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p>{item.nameAr || item.name}</p>
                        {item.nameAr && <p className="text-xs text-muted-foreground">{item.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{item.unit}</td>
                  <td className={`px-5 py-3 font-mono font-bold text-base ${isLow ? "text-destructive" : "text-foreground"}`}>
                    {item.currentStock}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{item.minStockLevel ?? "—"}</td>
                  <td className="px-5 py-3">
                    {isLow ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {t("inv_status_low")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">{t("inv_status_ok")}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-left">
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => openMovement(item)}>
                        <ArrowUpDown className="h-3 w-3" />
                        {t("inv_movement_btn")}
                      </Button>
                      {isManager && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteConfirm({ id: item.id, name: item.nameAr || item.name })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  {search ? t("inv_no_results") : t("inv_empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog.open} onOpenChange={(open) => !isSavingItem && setItemDialog({ open, editing: null })}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>{itemDialog.editing ? t("inv_edit_title") : t("inv_add_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("inv_name_ar_label")}</Label>
              <Input value={itemForm.nameAr} onChange={(e) => setItemForm(f => ({ ...f, nameAr: e.target.value }))} placeholder="مثال: علب بيبسي" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("inv_name_en_label")}</Label>
              <Input value={itemForm.name} onChange={(e) => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Pepsi Cans" dir="ltr" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t("inv_unit_label")}</Label>
                <Input value={itemForm.unit} onChange={(e) => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("inv_stock_label")}</Label>
                <Input type="number" step="1" min="0" value={itemForm.currentStock}
                  onChange={(e) => setItemForm(f => ({ ...f, currentStock: e.target.value }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("inv_min_label")}</Label>
                <Input type="number" step="1" min="0" value={itemForm.minStockLevel}
                  onChange={(e) => setItemForm(f => ({ ...f, minStockLevel: e.target.value }))} dir="ltr" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setItemDialog({ open: false, editing: null })} disabled={isSavingItem}>{t("cancel")}</Button>
            <Button onClick={saveItem} disabled={isSavingItem}>
              {isSavingItem ? t("saving") : itemDialog.editing ? t("save_changes") : t("inv_add_confirm_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Movement Dialog */}
      <Dialog open={movementDialog.open} onOpenChange={(open) => !createMovement.isPending && setMovementDialog({ open, itemId: null, itemName: "" })}>
        <DialogContent className="max-w-sm" dir={dir}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {t("inv_movement_dialog_title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded">{t("inv_movement_item_prefix")} <strong>{movementDialog.itemName}</strong></p>
            <div className="space-y-1.5">
              <Label>{t("inv_movement_type_label")}</Label>
              <Select value={movementForm.type} onValueChange={(v) => setMovementForm(f => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map((mt) => (
                    <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("inv_movement_qty_label")}</Label>
              <Input type="number" step="1" min="1" value={movementForm.quantity}
                onChange={(e) => setMovementForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("inv_movement_reason_label")}</Label>
              <Input value={movementForm.reason} onChange={(e) => setMovementForm(f => ({ ...f, reason: e.target.value }))} placeholder={t("inv_movement_reason_placeholder")} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMovementDialog({ open: false, itemId: null, itemName: "" })} disabled={createMovement.isPending}>{t("cancel")}</Button>
            <Button onClick={saveMovement} disabled={createMovement.isPending}>
              {createMovement.isPending ? t("inv_movement_recording") : t("inv_movement_record_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("inv_delete_dialog_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("inv_delete_dialog_body")} "<strong>{deleteConfirm?.name}</strong>" {t("inv_delete_dialog_suffix")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteItemMut.isPending ? t("inv_deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
