"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useInventory } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";
import { buildCategorySalesChart } from "@/lib/sales-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryChartProps {
  title?: string;
}

export function CategoryChart({
  title = "Sales by Category",
}: CategoryChartProps) {
  const { sales, products, categories } = useInventory();
  const categoryChartData = useMemo(
    () => buildCategorySalesChart(sales, products, categories),
    [sales, products, categories]
  );

  const hasSales = sales.length > 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryChartData.length === 0 ? (
          <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Walang sales data pa. Mag-benta sa POS para makita dito.
          </p>
        ) : (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [
                      hasSales ? formatPeso(Number(value)) : value,
                      hasSales ? "Sales" : "Products",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryChartData.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-muted-foreground">{cat.name}</span>
                  <span className="ml-auto font-medium">
                    {hasSales ? formatPeso(cat.value) : cat.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
