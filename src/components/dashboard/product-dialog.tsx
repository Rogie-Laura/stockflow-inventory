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
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import { formatPeso } from "@/lib/currency";
import {
  MARGIN_OPTIONS,
  PRODUCT_UNITS,
  calcProfitAmount,
  calcSellingPrice,
  getUnitLabel,
} from "@/lib/product-units";
import { ConfirmYesNoDialog } from "@/components/ui/confirm-yes-no-dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function ProductDialog() {
  const { categories, addProduct } = useInventory();
  const { store } = useStore();
  const useMarginPricing = store?.useMarginPricing ?? true;
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unit: "pc",
    cost: "",
    marginPercent: "10",
    sellingPrice: "",
    quantity: "",
    minStock: "",
    description: "",
    image: "📦",
  });

  const costValue = parseFloat(form.cost) || 0;
  const marginValue = parseFloat(form.marginPercent) || 0;
  const manualPrice = parseFloat(form.sellingPrice) || 0;

  const sellingPrice = useMemo(() => {
    if (!useMarginPricing) return manualPrice;
    return calcSellingPrice(costValue, marginValue);
  }, [useMarginPricing, manualPrice, costValue, marginValue]);

  const profitAmount = useMemo(
    () => calcProfitAmount(costValue, sellingPrice),
    [costValue, sellingPrice]
  );

  function validateForm(): boolean {
    if (!form.name || !form.sku || !form.categoryId) {
      toast.error("Punan ang lahat ng required fields");
      return false;
    }

    if (useMarginPricing) {
      if (costValue <= 0) {
        toast.error("Ilagay ang puhunan (cost) sa pesos");
        return false;
      }
      if (!marginValue || marginValue <= 0 || marginValue >= 100) {
        toast.error("Pumili ng valid na tubo %");
        return false;
      }
    } else if (manualPrice <= 0) {
      toast.error("Ilagay ang presyo ng bentahan (kasama na ang tubo kung mayroon).");
      return false;
    }

    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  }

  async function confirmAddProduct() {
    const marginForDb = useMarginPricing ? marginValue : 0;
    const costForDb = useMarginPricing ? costValue : costValue > 0 ? costValue : 0;

    setSaving(true);
    try {
      await addProduct({
        name: form.name,
        sku: form.sku,
        categoryId: form.categoryId,
        unit: form.unit,
        marginPercent: marginForDb,
        price: sellingPrice,
        cost: costForDb,
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
        marginPercent: "10",
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
            Ilagay ang detalye ng paninda. Presyo sa pesos (₱).
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
              <Label>Unit / Yunit</Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setForm({ ...form, unit: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pumili ng unit" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">
                Puhunan / Cost (₱){useMarginPricing ? " *" : " (optional)"}
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder={useMarginPricing ? "100.00" : "0 kung wala"}
              />
            </div>
            {useMarginPricing ? (
              <div className="space-y-2">
                <Label>Tubo / Margin (%)</Label>
                <Select
                  value={form.marginPercent}
                  onValueChange={(v) => setForm({ ...form, marginPercent: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pumili ng tubo %" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGIN_OPTIONS.map((pct) => (
                      <SelectItem key={pct} value={String(pct)}>
                        {pct}% kikitain sa presyo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
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
                  placeholder="120.00"
                />
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
            {useMarginPricing && costValue > 0 && marginValue > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Tubo: {formatPeso(profitAmount)} ({marginValue}% ng presyo) · bawat{" "}
                {unitLabel.toLowerCase()}
              </p>
            )}
            {!useMarginPricing && (
              <p className="mt-1 text-xs text-muted-foreground">
                Manual presyo lang — walang auto tubo % mula sa settings.
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
