"use client";

import type { Sale } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProductsProps {
  sales: Sale[];
}

export function TopProducts({ sales }: TopProductsProps) {
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));

  const productMap = new Map<
    string,
    { name: string; image: string; qty: number; revenue: number }
  >();

  for (const sale of todaySales) {
    for (const item of sale.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        productMap.set(item.productId, {
          name: item.productName,
          image: item.image,
          qty: item.quantity,
          revenue: item.subtotal,
        });
      }
    }
  }

  const top = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Top Sellers Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sales data yet
          </p>
        ) : (
          <div className="space-y-3">
            {top.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-xl">{product.image}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.qty} sold
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  ${product.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
