"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Printer, XCircle } from "lucide-react";
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
import { printSaleReceipt } from "@/lib/pos-receipt-print";
import { toast } from "sonner";

interface ReceiptDialogProps {
  sale: Sale | null;
  open: boolean;
  onEndTransaction: () => void;
}

function paymentLabel(method: Sale["paymentMethod"]): string {
  if (method === "ewallet") return "GCash";
  return method.charAt(0).toUpperCase() + method.slice(1);
}

export function ReceiptDialog({ sale, open, onEndTransaction }: ReceiptDialogProps) {
  const [printing, setPrinting] = useState(false);

  if (!sale) return null;

  const date = new Date(sale.createdAt);

  async function handlePrint() {
    setPrinting(true);
    try {
      const result = await printSaleReceipt(sale!);
      if (result === "printed") {
        toast.success("Na-send sa printer. Naka-save na ang transaksyon.");
      } else {
        toast.warning(
          "Walang printer na nakita — naka-save na ang transaksyon sa system.",
        );
      }
    } finally {
      setPrinting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onEndTransaction();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <DialogTitle className="text-center">View receipt</DialogTitle>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-dashed border-border/50 bg-muted/30 p-4 font-mono text-sm">
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
            <div
              key={`${item.productId}-${item.quantity}`}
              className="mb-2 flex justify-between gap-2 text-xs"
            >
              <span className="min-w-0 flex-1">
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0">{formatPeso(item.subtotal)}</span>
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
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPeso(sale.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>{formatPeso(sale.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span>{paymentLabel(sale.paymentMethod)}</span>
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
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print receipt
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600"
            onClick={onEndTransaction}
          >
            <XCircle className="mr-2 h-4 w-4" />
            End transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
