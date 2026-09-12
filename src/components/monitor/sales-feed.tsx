"use client";

import type { Sale } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const paymentIcons = {
  cash: "💵",
  card: "💳",
  ewallet: "📱",
};

interface SalesFeedProps {
  sales: Sale[];
}

export function SalesFeed({ sales }: SalesFeedProps) {
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Live Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[320px] space-y-3 overflow-y-auto">
          {todaySales.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sales today yet
            </p>
          ) : (
            todaySales.map((sale) => {
              const time = new Date(sale.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const itemCount = sale.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={sale.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">
                    {paymentIcons[sale.paymentMethod]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {sale.receiptNo}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {itemCount} items
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {time} · {sale.cashierName}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    +${sale.total.toFixed(2)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
