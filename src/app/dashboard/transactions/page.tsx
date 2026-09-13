"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CreditCard,
  Eye,
  Receipt,
  Search,
  Smartphone,
  Store,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { useInventory } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";
import type { PaymentMethod, Sale } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const paymentConfig: Record<
  PaymentMethod,
  { label: string; icon: typeof Banknote }
> = {
  cash: { label: "Cash", icon: Banknote },
  card: { label: "Card", icon: CreditCard },
  ewallet: { label: "E-Wallet", icon: Smartphone },
};

function TransactionDetail({ sale }: { sale: Sale }) {
  const date = new Date(sale.createdAt);
  const pm = paymentConfig[sale.paymentMethod];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Receipt No.</p>
          <p className="font-mono font-medium">{sale.receiptNo}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Date & Time</p>
          <p className="font-medium">{date.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Cashier</p>
          <p className="font-medium">{sale.cashierName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Payment</p>
          <p className="flex items-center gap-1 font-medium capitalize">
            <pm.icon className="h-4 w-4" />
            {pm.label}
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        {sale.items.map((item) => (
          <div
            key={`${item.productId}-${item.sku}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span>{item.image}</span>
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPeso(item.unitPrice)}
                </p>
              </div>
            </div>
            <span className="font-medium">{formatPeso(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPeso(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatPeso(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPeso(sale.tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPeso(sale.total)}</span>
        </div>
        {sale.paymentMethod === "cash" && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{formatPeso(sale.amountPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Change</span>
              <span>{formatPeso(sale.change)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { sales } = useInventory();
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        s.cashierName.toLowerCase().includes(search.toLowerCase()) ||
        s.items.some((i) =>
          i.productName.toLowerCase().includes(search.toLowerCase())
        );
      const matchesPayment =
        paymentFilter === "all" || s.paymentMethod === paymentFilter;
      return matchesSearch && matchesPayment;
    });
  }, [sales, search, paymentFilter]);

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(today));
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <>
      <Header
        title="Transactions"
        subtitle="All sales and POS transactions"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 flex justify-end">
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <Link href="/dashboard/pos">
              <Store className="mr-2 h-4 w-4" />
              New Sale
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={sales.length.toString()}
            icon={Receipt}
            gradient="from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Total Revenue"
            value={formatPeso(totalRevenue)}
            icon={Banknote}
            gradient="from-violet-500 to-violet-600"
          />
          <StatCard
            title="Today's Sales"
            value={formatPeso(todayRevenue)}
            icon={CreditCard}
            gradient="from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Today's Count"
            value={todaySales.length.toString()}
            icon={Receipt}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>

        <Card className="mt-6 border-border/50">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-border/50 p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search receipt, cashier, product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden lg:table-cell">Terminal</TableHead>
                    <TableHead className="hidden lg:table-cell">Cashier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sale) => {
                    const pm = paymentConfig[sale.paymentMethod];
                    const itemCount = sale.items.reduce(
                      (s, i) => s + i.quantity,
                      0
                    );
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-xs">
                          {sale.receiptNo}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(sale.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{itemCount} items</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell capitalize">
                          <span className="flex items-center gap-1">
                            <pm.icon className="h-3.5 w-3.5" />
                            {pm.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-mono text-xs">
                          {sale.terminalCode ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {sale.cashierName}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatPeso(sale.total)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedSale(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No transactions found.{" "}
                        <Link
                          href="/dashboard/pos"
                          className="text-indigo-500 underline"
                        >
                          Create a sale
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={!!selectedSale}
        onOpenChange={() => setSelectedSale(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedSale && <TransactionDetail sale={selectedSale} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
