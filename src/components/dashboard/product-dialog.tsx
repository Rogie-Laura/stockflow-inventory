"use client";

import { useMemo, useState } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const UNIT_DATALIST_ID = "product-unit-options";
const MARGIN_DATALIST_ID = "product-margin-options";

export function ProductDialog() {
  const { categories, addProduct } = useInventory();
  const { store } = useStore();
  const showMarginSuggestion = store?.useMarginPricing ?? true;
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });

  const costValue = parseFloat(form.cost) || 0;
  const marginValue = parseFloat(form.marginPercent) || 0;
  const sellingPrice = parseFloat(form.sellingPrice) || 0;

  const suggestedPrice = useMemo(() => {
    if (costValue <= 0 || marginValue <= 0 || marginValue >= 100) return null;
    return calcSellingPrice(costValue, marginValue);
  }, [costValue, marginValue]);

  const profitAmount = useMemo(
    () => (costValue > 0 && sellingPrice > 0 ? calcProfitAmount(costValue, sellingPrice) : 0),
    [costValue, sellingPrice],
  );

  const impliedMarginOnPrice = useMemo(() => {
    if (costValue <= 0 || sellingPrice <= 0 || sellingPrice <= costValue) return null;
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
      toast.error("Ilagay ang presyo ng bentahan (manual, hindi auto mula sa dropdown)");
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

  async function confirmAddProduct() {
    const marginForDb =
      marginValue > 0 ? marginValue : impliedMarginOnPrice ?? 0;

    setSaving(true);
    try {
      await addProduct({
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
      });

      toast.success("Na-add na ang produkto!");
      setConfirmOpen(false);
      setOpen(false);
      setForm({
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
      });
    } catch {
      toast.error("Failed to add product");
    } finally {
      setSaving(false);
    }
  }

  const unitLabel = getUnitLabel(form.unit);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Magdagdag ng Produkto</DialogTitle>
            <DialogDescription>
              Puhunan, tubo %, at presyo — manual input. Presyo sa pesos (₱).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Pangalan ng Produkto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="hal. Bigas Dinorado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Barcode *</Label>
                <Input
                  id="sku"
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
                <Label htmlFor="unit">Unit / Yunit</Label>
                <DatalistInput
                  id="unit"
                  listId={UNIT_DATALIST_ID}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="Pumili o i-type (hal. piraso, sachet)"
                  options={PRODUCT_UNITS.map((u) => ({
                    value: u.value,
                    label: u.label,
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Pwede pumili sa listahan o mag-type ng sariling unit.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cost">Puhunan / Cost (₱) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  placeholder="220.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marginPercent">Tubo / Margin (%)</Label>
                <DatalistInput
                  id="marginPercent"
                  listId={MARGIN_DATALIST_ID}
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
                <p className="text-xs text-muted-foreground">
                  I-type ang % o pumili mula sa suggestions — hindi ito pipilitin
                  ang presyo.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Presyo ng bentahan (₱) *</Label>
              <Input
                id="sellingPrice"
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
                <Label htmlFor="quantity">Quantity ({unitLabel})</Label>
                <Input
                  id="quantity"
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
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Detalye ng produkto..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmYesNoDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="I-save ang produktong ito?"
        description={
          <span>
            <strong>{form.name || "—"}</strong> ({form.sku || "—"}) · presyo{" "}
            {formatPeso(sellingPrice)} · qty {parseInt(form.quantity) || 0}
          </span>
        }
        yesLabel="Yes"
        noLabel="No"
        loading={saving}
        onYes={confirmAddProduct}
      />
    </>
  );
}
