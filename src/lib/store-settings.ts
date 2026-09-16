import type { Store } from "@/types/store";

export function parseDbBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === true || value === false) return value;
  if (value === "true" || value === "t") return true;
  if (value === "false" || value === "f") return false;
  return defaultValue;
}

export function mapStoreRow(row: {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  pos_pin?: string | null;
  use_margin_pricing?: boolean | null;
  pos_vat_enabled?: boolean | null;
  pos_vat_percent?: number | string | null;
}): Store {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    hasPosPin: Boolean(row.pos_pin),
    useMarginPricing: parseDbBoolean(row.use_margin_pricing, true),
    posVatEnabled: parseDbBoolean(row.pos_vat_enabled, true),
    posVatPercent: Number(row.pos_vat_percent ?? 12),
  };
}
