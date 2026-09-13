"use client";

import {
  AlertTriangle,
  Boxes,
  Coins,
  PackageX,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useInventory } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";
import { getTodaySalesTotal } from "@/lib/sales-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function DashboardPage() {
  const { products, categories, suppliers, sales } = useInventory();

  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;

  const lowStockProducts = products
    .filter((p) => p.status === "low_stock" || p.status === "out_of_stock")
    .slice(0, 5);
  const todaySalesTotal = getTodaySalesTotal(sales);

  return (
    <>
      <Header
        title="Inventory Overview"
        subtitle="Stock levels, alerts, and inventory analytics"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={products.length.toString()}
            change={8.2}
            icon={Boxes}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Sales Today"
            value={formatPeso(todaySalesTotal)}
            icon={Coins}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Inventory Value"
            value={formatPeso(totalValue)}
            change={12.5}
            icon={TrendingUp}
            gradient="from-violet-500 to-violet-600"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStock.toString()}
            icon={AlertTriangle}
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStock.toString()}
            icon={PackageX}
            gradient="from-red-500 to-rose-600"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <ActivityFeed />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <CategoryChart />

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All products are well stocked!
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => {
                    const category = categories.find(
                      (c) => c.id === product.categoryId
                    );
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.image}</span>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {category?.name} &middot; {product.quantity} units
                              left
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={product.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Categories",
              value: categories.length,
              icon: "🏷️",
            },
            {
              label: "Suppliers",
              value: suppliers.length,
              icon: "🚚",
            },
            {
              label: "Monthly Growth",
              value: "+12.5%",
              icon: TrendingUp,
            },
          ].map((item) => (
            <Card key={item.label} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                {typeof item.icon === "string" ? (
                  <span className="text-2xl">{item.icon}</span>
                ) : (
                  <item.icon className="h-6 w-6 text-indigo-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
