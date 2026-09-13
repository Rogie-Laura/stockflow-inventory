"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Receipt,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { HourlySalesChart } from "@/components/monitor/hourly-sales-chart";
import { SalesFeed } from "@/components/monitor/sales-feed";
import { InventoryHealth } from "@/components/monitor/inventory-health";
import { TopProducts } from "@/components/monitor/top-products";
import { TerminalSales } from "@/components/monitor/terminal-sales";
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import { hourlySalesData } from "@/lib/mock-data";
import { formatPeso } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function MonitorPage() {
  const { products, sales, activities } = useInventory();
  const { terminals } = useStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todaySales = useMemo(
    () => sales.filter((s) => s.createdAt.startsWith(today)),
    [sales, today]
  );

  const metrics = useMemo(() => {
    const total = todaySales.reduce((sum, s) => sum + s.total, 0);
    const items = todaySales.reduce(
      (sum, s) => sum + s.items.reduce((i, item) => i + item.quantity, 0),
      0
    );
    return {
      todaySales: total,
      todayTransactions: todaySales.length,
      avgOrderValue: total / Math.max(todaySales.length, 1),
      itemsSoldToday: items,
      salesChange: 18.4,
    };
  }, [todaySales]);

  const alertProducts = products.filter(
    (p) => p.status === "low_stock" || p.status === "out_of_stock"
  );

  const recentActivities = activities.slice(0, 6);

  return (
    <>
      <Header
        title="Monitoring Dashboard"
        subtitle="Real-time sales and inventory monitoring"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <LiveIndicator />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/pos">
                <Store className="mr-1 h-4 w-4" />
                Open POS
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={formatPeso(metrics.todaySales)}
            change={metrics.salesChange}
            icon={DollarSign}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Transactions"
            value={metrics.todayTransactions.toString()}
            icon={Receipt}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Avg Order Value"
            value={formatPeso(metrics.avgOrderValue)}
            icon={TrendingUp}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Items Sold"
            value={metrics.itemsSoldToday.toString()}
            icon={ShoppingBag}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HourlySalesChart data={hourlySalesData} />
          </div>
          <InventoryHealth products={products} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <TerminalSales sales={sales} terminals={terminals} />
          <SalesFeed sales={sales} />
          <TopProducts sales={sales} />

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Package className="h-4 w-4 text-amber-500" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-emerald-600 dark:text-emerald-400">
                  All products well stocked
                </p>
              ) : (
                <div className="max-h-[280px] space-y-2 overflow-y-auto">
                  {alertProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span>{product.image}</span>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity} units left
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border border-border/50 px-3 py-2 text-sm"
                >
                  <p>{activity.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
