"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import { useInventory } from "@/context/inventory-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activityIcons = {
  stock_in: { icon: ArrowUpCircle, color: "text-emerald-500" },
  stock_out: { icon: ArrowDownCircle, color: "text-red-500" },
  product_added: { icon: Package, color: "text-indigo-500" },
  low_stock: { icon: AlertTriangle, color: "text-amber-500" },
  sale_completed: { icon: ShoppingCart, color: "text-emerald-500" },
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const { activities } = useInventory();

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityIcons[activity.type];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
