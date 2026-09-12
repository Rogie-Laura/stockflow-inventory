import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/types/inventory";

const statusConfig: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  in_stock: {
    label: "In Stock",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  low_stock: {
    label: "Low Stock",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  },
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
