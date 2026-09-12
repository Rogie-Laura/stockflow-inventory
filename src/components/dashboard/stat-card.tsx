import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  gradient: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
              gradient
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
