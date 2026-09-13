"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  Monitor,
  Receipt,
  CreditCard,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

const navItems = [
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt, highlight: true },
  { href: "/dashboard/pos", label: "Point of Sale", icon: ShoppingCart, highlight: true },
  { href: "/dashboard/monitor", label: "Monitor", icon: Monitor, highlight: true },
  { href: "/dashboard", label: "Inventory", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing (GCash)", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>
          {navItems.slice(0, 2).map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-emerald-500" : ""
                  )}
                />
                {item.label}
                {item.highlight && !isActive && (
                  <Activity className="ml-auto h-3 w-3 text-emerald-500 opacity-60" />
                )}
              </Link>
            );
          })}

          <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>
          {navItems.slice(2).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-indigo-500" : ""
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-4">
          <Link href="/dashboard/pos">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4 transition-colors hover:from-emerald-500/15 hover:to-teal-500/15">
              <p className="text-sm font-semibold">Mabilis na Benta</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Buksan ang POS para mag-process ng sale
              </p>
              <Button
                size="sm"
                className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-xs hover:from-emerald-600 hover:to-teal-700"
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Buksan ang POS
              </Button>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
