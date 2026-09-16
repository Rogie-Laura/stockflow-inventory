"use client";

import { Package } from "lucide-react";
import { HourlySalesChart } from "@/components/monitor/hourly-sales-chart";
import { SalesFeed } from "@/components/monitor/sales-feed";
import { InventoryHealth } from "@/components/monitor/inventory-health";
import { TopProducts } from "@/components/monitor/top-products";
import { TerminalSales } from "@/components/monitor/terminal-sales";
import { MonitorAdSlot } from "@/components/monitor/monitor-ad-slot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { Activity, Product, Sale } from "@/types/inventory";
import type { PosTerminal } from "@/types/store";

type MonitorFullDashboardProps = {
  products: Product[];
  sales: Sale[];
  activities: Activity[];
  terminals: PosTerminal[];
  hourlyData: { hour: string; sales: number; transactions: number }[];
  adPulse: number;
};

export function MonitorFullDashboard({
  products,
  sales,
  activities,
  terminals,
  hourlyData,
  adPulse,
}: MonitorFullDashboardProps) {
  const alertProducts = products.filter(
    (p) => p.status === "low_stock" || p.status === "out_of_stock"
  );
  const recentActivities = activities.slice(0, 6);

  return (
    <>
      <div className="mt-4">
        <MonitorAdSlot placement="session-top" pulse={adPulse} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlySalesChart data={hourlyData} />
        </div>
        <InventoryHealth products={products} />
      </div>

      <div className="mt-4">
        <MonitorAdSlot placement="mid-feed" pulse={adPulse} />
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

      <div className="sticky bottom-0 z-10 mt-6 pb-2 pt-2 backdrop-blur-sm">
        <MonitorAdSlot placement="session-bottom" pulse={adPulse} />
      </div>
    </>
  );
}
