export type StoreRole = "store_admin" | "supervisor" | "cashier";

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  hasPosPin: boolean;
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
}
