import type { StoreRole } from "@/types/store";

const ADMIN_ROUTES = [
  "/dashboard",
  "/dashboard/products",
  "/dashboard/categories",
  "/dashboard/suppliers",
  "/dashboard/analytics",
  "/dashboard/monitor",
  "/dashboard/transactions",
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/team",
];

const CASHIER_ROUTES = ["/dashboard/pos"];

export function canAccessRoute(role: StoreRole | null, pathname: string): boolean {
  if (!role) return true;

  if (role === "store_admin" || role === "supervisor") {
    return true;
  }

  if (role === "cashier") {
    return CASHIER_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
  }

  return false;
}

export function isStoreAdmin(role: StoreRole | null): boolean {
  return role === "store_admin";
}

export function canManageInventory(role: StoreRole | null): boolean {
  return role === "store_admin" || role === "supervisor";
}

export function canManageTeam(role: StoreRole | null): boolean {
  return role === "store_admin";
}

export { ADMIN_ROUTES, CASHIER_ROUTES };
