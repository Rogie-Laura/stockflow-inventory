"use client";

import { CheckCircle2, Printer } from "lucide-react";
import type { Sale } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatPeso } from "@/lib/currency";

interface ReceiptDialogProps {
  sale: Sale | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptDialog({ sale, open, onClose }: ReceiptDialogProps) {
  if (!sale) return null;

  const date = new Date(sale.createdAt);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <DialogTitle className="text-center">Sale Complete!</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-4 font-mono text-sm">
          <div className="text-center">
            <p className="font-bold">PinoyStock POS</p>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </p>
            <p className="mt-1 text-xs">Receipt: {sale.receiptNo}</p>
            {sale.terminalCode && (
              <p className="text-xs">Terminal: {sale.terminalCode}</p>
            )}
            <p className="text-xs">Cashier: {sale.cashierName}</p>
          </div>

          <Separator className="my-3" />

          {sale.items.map((item) => (
            <div key={item.productId} className="mb-2 flex justify-between text-xs">
              <span>
                {item.productName} x{item.quantity}
              </span>
              <span>{formatPeso(item.subtotal)}</span>
            </div>
          ))}

          <Separator className="my-3" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPeso(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatPeso(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPeso(sale.tax)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatPeso(sale.total)}</span>
            </div>
            <div className="flex justify-between capitalize">
              <span>Payment</span>
              <span>{sale.paymentMethod}</span>
            </div>
            {sale.paymentMethod === "cash" && (
              <>
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>{formatPeso(sale.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change</span>
                  <span>{formatPeso(sale.change)}</span>
                </div>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Salamat sa pagbili! Mabuhay ang Pinoy negosyo!
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600"
            onClick={onClose}
          >
            New Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
