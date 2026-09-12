"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem, PaymentMethod } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TAX_RATE } from "@/context/inventory-context";

const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "ewallet", label: "E-Wallet", icon: "📱" },
];

interface CartPanelProps {
  cart: CartItem[];
  paymentMethod: PaymentMethod;
  discount: number;
  amountPaid: string;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onDiscountChange: (value: number) => void;
  onAmountPaidChange: (value: string) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  cart,
  paymentMethod,
  discount,
  amountPaid,
  onPaymentMethodChange,
  onDiscountChange,
  onAmountPaidChange,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;
  const paid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paid - total);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-500" />
          <h2 className="font-semibold">Current Order</h2>
          <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {cart.length} items
          </span>
        </div>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">Tap products to add to cart</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
            >
              <span className="text-2xl">{item.image}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  ${item.unitPrice.toFixed(2)} each
                </p>
              </div>
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
                  ${item.subtotal.toFixed(2)}
                </p>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-border/50 p-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => onPaymentMethodChange(pm.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-all",
                    paymentMethod === pm.id
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      : "border-border/50 hover:bg-muted"
                  )}
                >
                  <span className="text-lg">{pm.icon}</span>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Discount ($)</label>
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
                  Amount Paid ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => onAmountPaidChange(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (12%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                ${total.toFixed(2)}
              </span>
            </div>
            {paymentMethod === "cash" && paid > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Change</span>
                <span>${change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 text-base shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
            onClick={onCheckout}
            disabled={
              paymentMethod === "cash" && paid < total && paid > 0
            }
          >
            Complete Sale — ${total.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}
