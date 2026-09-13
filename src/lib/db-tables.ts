/** Supabase table names — all prefixed with inv_ for project-PATROLLERS */
export const TABLES = {
  profile: "inv_profile",
  category: "inv_category",
  supplier: "inv_supplier",
  item: "inv_item",
  sale: "inv_sale",
  saleItem: "inv_sale_item",
  activity: "inv_activity",
  subscription: "inv_subscription",
} as const;
