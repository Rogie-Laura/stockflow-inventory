export const PRODUCT_UNITS = [
  { value: "pc", label: "Piraso (piece)" },
  { value: "pack", label: "Pack" },
  { value: "sack", label: "Sako (sack)" },
  { value: "kg", label: "Bawat kilo (per kg)" },
  { value: "g", label: "Gramo (g)" },
  { value: "L", label: "Litro (L)" },
  { value: "box", label: "Kahon (box)" },
  { value: "dozen", label: "Dosena" },
  { value: "bundle", label: "Tungkos (bundle)" },
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number]["value"];

export const MARGIN_OPTIONS = [5, 8, 10, 11, 12, 15, 20, 25, 30] as const;

export function getUnitLabel(unit: string): string {
  return PRODUCT_UNITS.find((u) => u.value === unit)?.label ?? unit;
}

/** Tubo as % of selling price (presyo ng paninda). */
export function calcSellingPrice(cost: number, marginPercent: number): number {
  if (cost <= 0 || marginPercent <= 0 || marginPercent >= 100) return cost;
  return Math.round((cost / (1 - marginPercent / 100)) * 100) / 100;
}

export function calcProfitAmount(cost: number, sellingPrice: number): number {
  return Math.round((sellingPrice - cost) * 100) / 100;
}
