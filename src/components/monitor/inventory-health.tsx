"use client";

import type { Product } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InventoryHealthProps {
  products: Product[];
}

export function InventoryHealth({ products }: InventoryHealthProps) {
  const inStock = products.filter((p) => p.status === "in_stock").length;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;
  const total = products.length || 1;

  const healthScore = Math.round(
    ((inStock + lowStock * 0.5) / total) * 100
  );

  const segments = [
    {
      label: "In Stock",
      count: inStock,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Low Stock",
      count: lowStock,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Out of Stock",
      count: outOfStock,
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Inventory Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center">
          <div className="text-4xl font-bold">{healthScore}%</div>
          <p className="text-sm text-muted-foreground">Overall stock health</p>
          <Progress value={healthScore} className="mt-3 h-2" />
        </div>

        <div className="space-y-3">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                <span className="text-sm">{seg.label}</span>
              </div>
              <span className={`text-sm font-semibold ${seg.textColor}`}>
                {seg.count} ({Math.round((seg.count / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
