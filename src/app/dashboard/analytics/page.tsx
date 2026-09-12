"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { chartData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const { products } = useInventory();

  const topProducts = [...products]
    .sort((a, b) => b.price * b.quantity - a.price * b.quantity)
    .slice(0, 5)
    .map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
      value: p.price * p.quantity,
    }));

  const stockData = chartData.map((d) => ({
    month: d.month,
    stock: d.stock,
  }));

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Insights and performance metrics"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          <CategoryChart />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Top Products by Value
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
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
                        `$${Number(value).toLocaleString()}`,
                        "Value",
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
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Stock Levels Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border/50"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="stock"
                      fill="#6366f1"
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
