export type StoreRole = "store_admin" | "supervisor" | "cashier";

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  hasPosPin: boolean;
  /** When true, selling price is derived from cost + margin %. */
  useMarginPricing: boolean;
  /** Apply VAT on POS checkout. */
  posVatEnabled: boolean;
  /** VAT rate shown on receipts (e.g. 12). */
  posVatPercent: number;
}

export interface StoreMember {
  id: string;
  storeId: string;
  userId: string;
  role: StoreRole;
  email?: string;
  fullName?: string;
}

export interface PosTerminal {
  id: string;
  storeId: string;
  code: string;
  name: string;
  isActive: boolean;
  activeOperator?: string | null;
  activatedAt?: string | null;
}
