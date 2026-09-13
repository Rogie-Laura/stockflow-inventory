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

function isPosOnlyPath(pathname: string): boolean {
  return CASHIER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function canAccessRoute(
  role: StoreRole | null,
  pathname: string,
  isPosLocked = false
): boolean {
  if (!role) return true;

  if (isPosLocked && (role === "store_admin" || role === "supervisor")) {
    return isPosOnlyPath(pathname);
  }

  if (role === "store_admin" || role === "supervisor") {
    return true;
  }

  if (role === "cashier") {
    return isPosOnlyPath(pathname);
  }

  return false;
}

export function isStoreAdmin(role: StoreRole | null): boolean {
  return role === "store_admin";
}

export function canManageInventory(
  role: StoreRole | null,
  isPosLocked = false
): boolean {
  if (isPosLocked) return false;
  return role === "store_admin" || role === "supervisor";
}

export function canManageTeam(role: StoreRole | null): boolean {
  return role === "store_admin";
}

export { ADMIN_ROUTES, CASHIER_ROUTES };
