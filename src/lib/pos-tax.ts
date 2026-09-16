import type { Store } from "@/types/store";

export const DEFAULT_VAT_PERCENT = 12;

export function getStoreVatRate(store: Store | null | undefined): number {
  if (!store?.posVatEnabled) return 0;
  const pct = store.posVatPercent ?? DEFAULT_VAT_PERCENT;
  return Math.max(0, Math.min(100, pct)) / 100;
}

export function calcPosTotals(
  subtotal: number,
  discount: number,
  store: Store | null | undefined,
): { tax: number; total: number; vatPercent: number; vatEnabled: boolean } {
  const taxable = Math.max(0, subtotal - discount);
  const vatEnabled = Boolean(store?.posVatEnabled);
  const vatPercent = vatEnabled
    ? store?.posVatPercent ?? DEFAULT_VAT_PERCENT
    : 0;
  const tax = vatEnabled ? taxable * getStoreVatRate(store) : 0;
  return {
    tax,
    total: taxable + tax,
    vatPercent,
    vatEnabled,
  };
}
