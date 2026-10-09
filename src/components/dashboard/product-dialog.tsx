"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatalistInput } from "@/components/ui/datalist-input";
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import { formatPeso } from "@/lib/currency";
import {
  MARGIN_OPTIONS,
  PRODUCT_UNITS,
  calcProfitAmount,
  calcSellingPrice,
  getUnitLabel,
  normalizeProductUnit,
} from "@/lib/product-units";
import { ConfirmYesNoDialog } from "@/components/ui/confirm-yes-no-dialog";
import type { Product } from "@/types/inventory";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type ProductFormState = {
  name: string;
  sku: string;
  categoryId: string;
  unit: string;
  cost: string;
  marginPercent: string;
  sellingPrice: string;
  quantity: string;
  minStock: string;
  description: string;
  image: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  sku: "",
  categoryId: "",
  unit: "pc",
  cost: "",
  marginPercent: "",
  sellingPrice: "",
  quantity: "",
  minStock: "",
  description: "",
  image: "📦",
};

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    unit: product.unit || "pc",
    cost: product.cost > 0 ? String(product.cost) : "",
    marginPercent:
      product.marginPercent > 0 ? String(product.marginPercent) : "",
    sellingPrice: String(product.price),
    quantity: String(product.quantity),
    minStock: String(product.minStock),
    description: product.description ?? "",
    image: product.image || "📦",
  };
}

function ProductFormDialog({
  mode,
  product,
  open,
  onOpenChange,
  trigger,
}: {
  mode: "create" | "edit";
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
}) {
  const { categories, addProduct, updateProduct } = useInventory();
  const { store } = useStore();
  const showMarginSuggestion = store?.useMarginPricing ?? true;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const listSuffix = mode === "edit" && product ? product.id : "new";
  const unitListId = `product-unit-options-${listSuffix}`;
  const marginListId = `product-margin-options-${listSuffix}`;

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      setForm(productToForm(product));
    } else if (mode === "create") {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, product]);

  const costValue = parseFloat(form.cost) || 0;
  const marginValue = parseFloat(form.marginPercent) || 0;
  const sellingPrice = parseFloat(form.sellingPrice) || 0;

  const suggestedPrice = useMemo(() => {
    if (costValue <= 0 || marginValue <= 0 || marginValue >= 100) return null;
    return calcSellingPrice(costValue, marginValue);
  }, [costValue, marginValue]);

  const profitAmount = useMemo(
    () =>
      costValue > 0 && sellingPrice > 0
        ? calcProfitAmount(costValue, sellingPrice)
        : 0,
    [costValue, sellingPrice],
  );

  const impliedMarginOnPrice = useMemo(() => {
    if (costValue <= 0 || sellingPrice <= 0 || sellingPrice <= costValue)
      return null;
    const pct = ((sellingPrice - costValue) / sellingPrice) * 100;
    return Math.round(pct * 10) / 10;
  }, [costValue, sellingPrice]);

  function validateForm(): boolean {
    if (!form.name || !form.sku || !form.categoryId) {
      toast.error("Punan ang lahat ng required fields");
      return false;
    }
    if (costValue <= 0) {
      toast.error("Ilagay ang puhunan (hal. 220)");
      return false;
    }
    if (sellingPrice <= 0) {
      toast.error(
        "Ilagay ang presyo ng bentahan (manual, hindi auto mula sa dropdown)",
      );
      return false;
    }
    if (
      form.marginPercent.trim() !== "" &&
      (marginValue <= 0 || marginValue >= 100)
    ) {
      toast.error("Ang tubo % ay dapat nasa pagitan ng 0 at 100");
      return false;
    }
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  }

  function applySuggestedPrice() {
    if (suggestedPrice == null) return;
    setForm((f) => ({ ...f, sellingPrice: String(suggestedPrice) }));
  }

  async function confirmSave() {
    const marginForDb =
      marginValue > 0 ? marginValue : (impliedMarginOnPrice ?? 0);

    const payload = {
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      unit: normalizeProductUnit(form.unit),
      marginPercent: marginForDb,
      price: sellingPrice,
      cost: costValue,
      quantity: parseInt(form.quantity) || 0,
      minStock: parseInt(form.minStock) || 10,
      description: form.description,
      image: form.image,
    };

    setSaving(true);
    try {
      if (mode === "edit" && product) {
        await updateProduct(product.id, payload);
        toast.success("Na-update na ang produkto!");
      } else {
        await addProduct(payload);
        toast.success("Na-add na ang produkto!");
        setForm(EMPTY_FORM);
      }
      setConfirmOpen(false);
      onOpenChange(false);
    } catch {
      toast.error(
        mode === "edit" ? "Failed to update product" : "Failed to add product",
      );
    } finally {
      setSaving(false);
    }
  }

  const unitLabel = getUnitLabel(form.unit);
  const isEdit = mode === "edit";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger}
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "I-edit ang Produkto" : "Magdagdag ng Produkto"}
            </DialogTitle>
            <DialogDescription>
              Puhunan, tubo %, at presyo — manual input. Presyo sa pesos (₱).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${listSuffix}`}>
                  Pangalan ng Produkto *
                </Label>
                <Input
                  id={`name-${listSuffix}`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="hal. Bigas Dinorado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sku-${listSuffix}`}>SKU / Barcode *</Label>
                <Input
                  id={`sku-${listSuffix}`}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="BRG-001"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pumili ng category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`unit-${listSuffix}`}>Unit / Yunit</Label>
                <DatalistInput
                  id={`unit-${listSuffix}`}
                  listId={unitListId}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Pumili o i-type (hal. piraso, sachet)"
                  options={PRODUCT_UNITS.map((u) => ({
                    value: u.value,
                    label: u.label,
                  }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`cost-${listSuffix}`}>Puhunan / Cost (₱) *</Label>
                <Input
                  id={`cost-${listSuffix}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="220.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`margin-${listSuffix}`}>Tubo / Margin (%)</Label>
                <DatalistInput
                  id={`margin-${listSuffix}`}
                  listId={marginListId}
                  type="number"
                  step="0.1"
                  min="0"
                  max="99.9"
                  value={form.marginPercent}
                  onChange={(e) =>
                    setForm({ ...form, marginPercent: e.target.value })
                  }
                  placeholder="hal. 10 — optional"
                  options={MARGIN_OPTIONS.map((pct) => String(pct))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`sellingPrice-${listSuffix}`}>
                Presyo ng bentahan (₱) *
              </Label>
              <Input
                id={`sellingPrice-${listSuffix}`}
                type="number"
                step="0.01"
                min="0"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
                placeholder="250.00"
              />
              {showMarginSuggestion && suggestedPrice != null && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Mula sa puhunan + tubo %: {formatPeso(suggestedPrice)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={applySuggestedPrice}
                  >
                    Gamitin bilang presyo
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Presyo ng bentahan</span>
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatPeso(sellingPrice)}
                </span>
              </div>
              {costValue > 0 && sellingPrice > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tubo: {formatPeso(profitAmount)} bawat {unitLabel.toLowerCase()}
                  {impliedMarginOnPrice != null &&
                    ` (~${impliedMarginOnPrice}% ng presyo)`}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`quantity-${listSuffix}`}>
                  Quantity ({unitLabel})
                </Label>
                <Input
                  id={`quantity-${listSuffix}`}
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`minStock-${listSuffix}`}>Minimum Stock</Label>
                <Input
                  id={`minStock-${listSuffix}`}
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) =>
                    setForm({ ...form, minStock: e.target.value })
                  }
                  placeholder="20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${listSuffix}`}>Description</Label>
              <Textarea
                id={`description-${listSuffix}`}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Detalye ng produkto..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                {isEdit ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmYesNoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isEdit ? "I-save ang mga pagbabago?" : "I-save ang produktong ito?"}
        description={
          <span>
            <strong>{form.name || "—"}</strong> ({form.sku || "—"}) · presyo{" "}
            {formatPeso(sellingPrice)} · qty {parseInt(form.quantity) || 0}
          </span>
        }
        yesLabel="Yes"
        noLabel="No"
        loading={saving}
        onYes={confirmSave}
      />
    </>
  );
}

export function ProductDialog() {
  const [open, setOpen] = useState(false);

  return (
    <ProductFormDialog
      mode="create"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
      }
    />
  );
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;

  return (
    <ProductFormDialog
      mode="edit"
      product={product}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
