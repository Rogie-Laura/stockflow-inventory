"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Coins,
  Receipt,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { LiveIndicator } from "@/components/monitor/live-indicator";
import { MonitorInstallQr } from "@/components/monitor/monitor-install-qr";
import { MonitorAccountLogin } from "@/components/monitor/monitor-account-login";
import { useInventory } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";
import { computeSalesChangePercent } from "@/lib/sales-analytics";
import { Button } from "@/components/ui/button";

export default function MonitorPage() {
  const { sales, refresh } = useInventory();

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

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
      salesChange: computeSalesChangePercent(sales),
    };
  }, [todaySales, sales]);

  return (
    <>
      <Header
        title="Monitoring Dashboard"
        subtitle="Summary sa web — full dashboard sa PinoyStock Monitor app"
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
            icon={Coins}
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

        <div className="grid gap-4 lg:grid-cols-2">
          <MonitorInstallQr />
          <MonitorAccountLogin />
        </div>
      </main>
    </>
  );
}
