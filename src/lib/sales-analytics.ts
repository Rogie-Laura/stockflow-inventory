import type { Category, Product, Sale } from "@/types/inventory";

export interface DailyRevenuePoint {
  label: string;
  revenue: number;
  transactions: number;
}

export interface HourlySalesPoint {
  hour: string;
  sales: number;
  transactions: number;
}

export interface CategorySalesPoint {
  name: string;
  value: number;
  color: string;
}

function dateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return "12PM";
  return `${hour - 12}PM`;
}

export function buildDailyRevenueChart(
  sales: Sale[],
  days = 7
): DailyRevenuePoint[] {
  const result: DailyRevenuePoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const daySales = sales.filter((s) => s.createdAt.startsWith(key));

    result.push({
      label: d.toLocaleDateString("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
      transactions: daySales.length,
    });
  }

  return result;
}

export function buildHourlySalesChart(
  sales: Sale[],
  dateStr?: string
): HourlySalesPoint[] {
  const today = dateStr ?? dateKey(new Date());
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));
  const buckets = new Map<number, { sales: number; transactions: number }>();

  for (let h = 6; h <= 21; h++) {
    buckets.set(h, { sales: 0, transactions: 0 });
  }

  for (const sale of todaySales) {
    const hour = new Date(sale.createdAt).getHours();
    const bucket = buckets.get(hour) ?? { sales: 0, transactions: 0 };
    bucket.sales += sale.total;
    bucket.transactions += 1;
    buckets.set(hour, bucket);
  }

  return [...buckets.entries()].map(([hour, data]) => ({
    hour: formatHourLabel(hour),
    sales: Math.round(data.sales * 100) / 100,
    transactions: data.transactions,
  }));
}

export function buildCategorySalesChart(
  sales: Sale[],
  products: Product[],
  categories: Category[]
): CategorySalesPoint[] {
  const productCategory = new Map(products.map((p) => [p.id, p.categoryId]));
  const totals = new Map<string, number>();

  for (const sale of sales) {
    for (const item of sale.items) {
      const catId = productCategory.get(item.productId) ?? "uncategorized";
      totals.set(catId, (totals.get(catId) ?? 0) + item.subtotal);
    }
  }

  const chart = categories
    .map((c) => ({
      name: c.name,
      value: Math.round((totals.get(c.id) ?? 0) * 100) / 100,
      color: c.color,
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  if (chart.length > 0) return chart;

  return categories
    .map((c) => ({
      name: c.name,
      value: c.productCount,
      color: c.color,
    }))
    .filter((c) => c.value > 0);
}

export function buildTopProductsByRevenue(
  sales: Sale[],
  limit = 5,
  dateStr?: string
) {
  const filterDate = dateStr ?? dateKey(new Date());
  const filtered = sales.filter((s) => s.createdAt.startsWith(filterDate));
  const productMap = new Map<
    string,
    { name: string; value: number }
  >();

  for (const sale of filtered) {
    for (const item of sale.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.value += item.subtotal;
      } else {
        productMap.set(item.productId, {
          name: item.productName,
          value: item.subtotal,
        });
      }
    }
  }

  return [...productMap.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((p) => ({
      name: p.name.length > 20 ? `${p.name.slice(0, 20)}...` : p.name,
      value: Math.round(p.value * 100) / 100,
    }));
}

export function getTodaySalesTotal(sales: Sale[]): number {
  const today = dateKey(new Date());
  return sales
    .filter((s) => s.createdAt.startsWith(today))
    .reduce((sum, s) => sum + s.total, 0);
}

export function computeSalesChangePercent(sales: Sale[]): number {
  const today = dateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateKey(yesterdayDate);

  const todayTotal = sales
    .filter((s) => s.createdAt.startsWith(today))
    .reduce((sum, s) => sum + s.total, 0);
  const yesterdayTotal = sales
    .filter((s) => s.createdAt.startsWith(yesterday))
    .reduce((sum, s) => sum + s.total, 0);

  if (yesterdayTotal === 0) return todayTotal > 0 ? 100 : 0;
  return Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 1000) / 10;
}
