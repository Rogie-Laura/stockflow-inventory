"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
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
import { MonitorDownloadCta } from "@/components/monitor/monitor-download-cta";
import { MonitorFullDashboard } from "@/components/monitor/monitor-full-dashboard";
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import { useMonitorAppMode } from "@/hooks/use-monitor-app-mode";
import { useMonitorAdPulse } from "@/hooks/use-monitor-ad-pulse";
import { formatPeso } from "@/lib/currency";
import {
  buildHourlySalesChart,
  computeSalesChangePercent,
} from "@/lib/sales-analytics";
import { Button } from "@/components/ui/button";

const adsenseClient = process.env.NEXT_PUBLIC_MONITOR_ADSENSE_CLIENT;

export default function MonitorPage() {
  const { products, sales, activities, refresh } = useInventory();
  const { terminals } = useStore();
  const { isMonitorApp, ready } = useMonitorAppMode();
  const adPulse = useMonitorAdPulse(isMonitorApp);

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

  const hourlyData = useMemo(() => buildHourlySalesChart(sales), [sales]);

  const showFullDashboard = ready && isMonitorApp;

  return (
    <>
      {isMonitorApp && adsenseClient ? (
        <Script
          id="monitor-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      ) : null}

      <Header
        title="Monitoring Dashboard"
        subtitle={
          showFullDashboard
            ? "Monitoring Center · full analytics"
            : "Summary lang sa web — i-install sa phone para sa buong dashboard"
        }
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

        {showFullDashboard ? (
          <MonitorFullDashboard
            products={products}
            sales={sales}
            activities={activities}
            terminals={terminals}
            hourlyData={hourlyData}
            adPulse={adPulse}
          />
        ) : (
          <MonitorDownloadCta />
        )}
      </main>
    </>
  );
}
