"use client";

import { Monitor } from "lucide-react";
import type { Sale } from "@/types/inventory";
import type { PosTerminal } from "@/types/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPeso } from "@/lib/currency";

interface TerminalSalesProps {
  sales: Sale[];
  terminals: PosTerminal[];
}

export function TerminalSales({ sales, terminals }: TerminalSalesProps) {
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));

  const rows = terminals.map((terminal) => {
    const terminalSales = todaySales.filter((s) => s.terminalId === terminal.id);
    const total = terminalSales.reduce((sum, s) => sum + s.total, 0);
    return {
      terminal,
      count: terminalSales.length,
      total,
    };
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Monitor className="h-4 w-4 text-emerald-500" />
          Sales per POS Terminal (Today)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(({ terminal, count, total }) => (
          <div
            key={terminal.id}
            className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{terminal.code}</p>
              <p className="text-xs text-muted-foreground">{terminal.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatPeso(total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {count} transaction{count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
