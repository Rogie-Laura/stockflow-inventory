"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  LockOpen,
  Monitor,
  Receipt,
  CreditCard,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  X,
} from "lucide-react";
import { ExitPosDialog } from "@/components/pos/exit-pos-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useStore } from "@/context/store-context";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt, highlight: true, adminOnly: false },
  { href: "/dashboard/pos", label: "Point of Sale", icon: ShoppingCart, highlight: true, adminOnly: false },
  { href: "/dashboard/monitor", label: "Monitor", icon: Monitor, highlight: true, adminOnly: true },
  { href: "/dashboard", label: "Inventory", icon: LayoutDashboard, adminOnly: true },
  { href: "/dashboard/products", label: "Products", icon: Boxes, adminOnly: true },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, adminOnly: true },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, adminOnly: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  { href: "/dashboard/team", label: "Store & Team", icon: Users, adminOnly: true },
  { href: "/dashboard/billing", label: "Billing (GCash)", icon: CreditCard, adminOnly: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { store, role, selectedTerminal, isPosLocked, deactivatePosLock } =
    useStore();
  const [exitPosOpen, setExitPosOpen] = useState(false);

  const posOnlyMode = role === "cashier" || isPosLocked;

  const visibleItems = navItems.filter((item) => {
    if (posOnlyMode) return !item.adminOnly;
    return true;
  });

  const operations = visibleItems.filter((i) => i.highlight);
  const management = visibleItems.filter((i) => !i.highlight);

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

        {store && (
          <div className="border-b border-border/50 px-4 py-3">
            <p className="truncate text-sm font-semibold">{store.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {role && (
                <Badge variant="secondary" className="text-[10px]">
                  {role.replace("_", " ")}
                </Badge>
              )}
              {selectedTerminal && (
                <Badge variant="outline" className="text-[10px]">
                  {selectedTerminal.code}
                </Badge>
              )}
              {isPosLocked && (
                <Badge className="text-[10px] bg-emerald-600">POS Locked</Badge>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>
          {operations.map((item) => {
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

          {management.length > 0 && (
            <>
              <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Management
              </p>
              {management.map((item) => {
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
            </>
          )}
        </nav>

        <div className="border-t border-border/50 p-4">
          {isPosLocked ? (
            <Button
              variant="outline"
              className="w-full gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              onClick={() => setExitPosOpen(true)}
            >
              <LockOpen className="h-4 w-4" />
              Exit POS Mode (kailangan PIN)
            </Button>
          ) : (
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
          )}
        </div>
      </aside>

      <ExitPosDialog
        open={exitPosOpen}
        onOpenChange={setExitPosOpen}
        onConfirm={deactivatePosLock}
      />
    </>
  );
}
