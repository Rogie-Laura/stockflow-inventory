"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Header } from "@/components/dashboard/header";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { useInventory } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";
import {
  buildHourlySalesChart,
  buildTopProductsByRevenue,
  computeSalesChangePercent,
  getTodaySalesTotal,
} from "@/lib/sales-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Coins, Receipt, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { sales } = useInventory();

  const today = new Date().toISOString().split("T")[0];
  const todaySales = useMemo(
    () => sales.filter((s) => s.createdAt.startsWith(today)),
    [sales, today]
  );

  const hourlyData = useMemo(() => buildHourlySalesChart(sales), [sales]);
  const topProducts = useMemo(
    () => buildTopProductsByRevenue(sales, 5),
    [sales]
  );

  const todayTotal = getTodaySalesTotal(sales);
  const salesChange = computeSalesChangePercent(sales);
  const avgOrder =
    todaySales.length > 0 ? todayTotal / todaySales.length : 0;

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Live sales insights — updates after every POS transaction"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Sales Today"
            value={formatPeso(todayTotal)}
            change={salesChange}
            icon={Coins}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Transactions Today"
            value={todaySales.length.toString()}
            icon={Receipt}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Avg Order Today"
            value={formatPeso(avgOrder)}
            icon={TrendingUp}
            gradient="from-violet-500 to-purple-600"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          <CategoryChart />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Top Products Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  Walang benta pa ngayon.
                </p>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/50"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "13px",
                        }}
                        formatter={(value) => [
                          formatPeso(Number(value)),
                          "Sales",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Hourly Sales Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border/50"
                    />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `₱${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                      formatter={(value, name) => [
                        name === "sales"
                          ? formatPeso(Number(value))
                          : Number(value),
                        name === "sales" ? "Sales" : "Transactions",
                      ]}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
