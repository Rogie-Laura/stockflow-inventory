"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  Minus,
  PlayCircle,
  Plus,
  ShoppingCart,
  Smartphone,
  Trash2,
} from "lucide-react";
import type { CartItem, PaymentMethod } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TAX_RATE } from "@/context/inventory-context";
import { formatPeso } from "@/lib/currency";

type CheckoutStep = "items" | "payment";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  Icon: typeof Banknote;
}[] = [
  { id: "cash", label: "Cash", Icon: Banknote },
  { id: "ewallet", label: "GCash", Icon: Smartphone },
  { id: "card", label: "Card", Icon: CreditCard },
];

interface CartPanelProps {
  transactionOpen: boolean;
  posSessionActive: boolean;
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  discount: number;
  amountPaid: string;
  checkoutLoading: boolean;
  onStartTransaction: () => void;
  onCancelTransaction: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDiscountChange: (value: number) => void;
  onAmountPaidChange: (value: string) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

function CartLineItems({
  cart,
  editable,
  onUpdateQty,
  onRemove,
}: {
  cart: CartItem[];
  editable: boolean;
  onUpdateQty?: (productId: string, delta: number) => void;
  onRemove?: (productId: string) => void;
}) {
  if (cart.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-muted-foreground">
        <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">Pindutin ang produkto para idagdag</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {cart.map((item) => (
        <li
          key={item.productId}
          className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
        >
          <span className="text-2xl leading-none">{item.image}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{item.productName}</p>
            <p className="text-xs text-muted-foreground">
              {formatPeso(item.unitPrice)} × {item.quantity}
            </p>
          </div>
          {editable && onUpdateQty && onRemove ? (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateQty(item.productId, -1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onUpdateQty(item.productId, 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatPeso(item.subtotal)}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold">{formatPeso(item.subtotal)}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function CartPanel({
  transactionOpen,
  posSessionActive,
  cart,
  paymentMethod,
  discount,
  amountPaid,
  checkoutLoading,
  onStartTransaction,
  onCancelTransaction,
  onPaymentMethodChange,
  onDiscountChange,
  onAmountPaidChange,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  const [step, setStep] = useState<CheckoutStep>("items");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    if (!transactionOpen) setStep("items");
  }, [transactionOpen]);

  const lineCount = cart.length;
  const unitCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;
  const paid = parseFloat(amountPaid);
  const change = Math.max(0, paid - total);

  const cashAmountInvalid =
    paymentMethod === "cash" &&
    (amountPaid.trim() === "" || Number.isNaN(paid) || paid < total);

  function requestCancelTransaction() {
    setCancelConfirmOpen(true);
  }

  function confirmCancel() {
    setCancelConfirmOpen(false);
    setStep("items");
    onCancelTransaction();
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col rounded-xl border border-border/50 bg-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-500" />
            <h2 className="font-semibold">
              {step === "payment" ? "Payment" : "Current Order"}
            </h2>
            {transactionOpen && lineCount > 0 && (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {lineCount} {lineCount === 1 ? "item" : "items"} · {unitCount}{" "}
                pcs
              </span>
            )}
          </div>
          {transactionOpen && step === "items" && cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>

        {!transactionOpen ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingCart className="h-14 w-14 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">
                Walang bukas na transaksyon
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {posSessionActive
                  ? "Simulan muna bago mag-tap ng produkto."
                  : "I-activate ang POS bago mag-benta."}
              </p>
            </div>
            <Button
              size="lg"
              className="h-12 w-full max-w-[260px] bg-gradient-to-r from-emerald-500 to-teal-600 text-base shadow-lg"
              disabled={!posSessionActive}
              onClick={onStartTransaction}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Bagong Transaksyon
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <CartLineItems
                cart={cart}
                editable={step === "items"}
                onUpdateQty={step === "items" ? onUpdateQty : undefined}
                onRemove={step === "items" ? onRemove : undefined}
              />
            </div>

            {cart.length > 0 && step === "items" && (
              <div className="shrink-0 space-y-3 border-t border-border/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPeso(subtotal)}</span>
                </div>
                <Button
                  className="h-12 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-base"
                  onClick={() => setStep("payment")}
                >
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                  onClick={requestCancelTransaction}
                >
                  Cancel Transaction
                </Button>
              </div>
            )}

            {cart.length > 0 && step === "payment" && (
              <div className="shrink-0 space-y-4 border-t border-border/50 p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-mt-1 h-8 px-0 text-muted-foreground"
                  onClick={() => setStep("items")}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to items
                </Button>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Payment method
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => onPaymentMethodChange(pm.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-all",
                          paymentMethod === pm.id
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "border-border/50 hover:bg-muted",
                        )}
                      >
                        <pm.Icon className="h-5 w-5" />
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Discount (₱)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount || ""}
                      onChange={(e) =>
                        onDiscountChange(parseFloat(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>
                  {paymentMethod === "cash" && (
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Binayaran (₱)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => onAmountPaidChange(e.target.value)}
                        className="mt-1"
                        placeholder={formatPeso(total)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPeso(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatPeso(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (12%)</span>
                    <span>{formatPeso(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {formatPeso(total)}
                    </span>
                  </div>
                  {paymentMethod === "cash" && paid >= total && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Change</span>
                      <span>{formatPeso(change)}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="h-12 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-base shadow-lg shadow-indigo-500/25"
                  onClick={onCheckout}
                  disabled={cashAmountInvalid || checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sinesave...
                    </>
                  ) : (
                    <>Complete Transaction — {formatPeso(total)}</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full border-red-500/30 text-red-600 hover:bg-red-500/10"
                  onClick={requestCancelTransaction}
                >
                  Cancel Transaction
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>I-cancel ang transaksyon?</DialogTitle>
            <DialogDescription>
              Mawawala ang lahat ng item sa order na ito. Hindi ito maibabalik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelConfirmOpen(false)}
            >
              Hindi, ituloy
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Oo, i-cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
