"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen, Monitor, Receipt } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import { PosActivateModal } from "@/components/pos/pos-activate-modal";
import { ExitPosDialog } from "@/components/pos/exit-pos-dialog";
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import type { CartItem, PaymentMethod, Product, Sale } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function POSPage() {
  const { products, categories, completeSale } = useInventory();
  const {
    selectedTerminal,
    posOperatorName,
    isPosSessionActive,
    isPosLocked,
    role,
    terminals,
    displayName,
    activatePosSession,
    deactivatePosLock,
    refresh,
  } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [exitPosOpen, setExitPosOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (activateOpen) {
      refresh();
    }
  }, [activateOpen, refresh]);

  useEffect(() => {
    if (!isPosSessionActive) {
      setTransactionOpen(false);
      setCart([]);
      setDiscount(0);
      setAmountPaid("");
    }
  }, [isPosSessionActive]);

  function startTransaction() {
    if (!isPosSessionActive) {
      setActivateOpen(true);
      toast.error("I-activate muna ang POS.");
      return;
    }
    setCart([]);
    setDiscount(0);
    setAmountPaid("");
    setPaymentMethod("cash");
    setTransactionOpen(true);
    toast.success("Naka-open na ang transaksyon — puwede nang mag-add ng item.");
  }

  function cancelTransaction() {
    setCart([]);
    setDiscount(0);
    setAmountPaid("");
    setTransactionOpen(false);
    toast.info("Na-cancel ang transaksyon.");
  }

  function addToCart(product: Product) {
    if (!transactionOpen) {
      toast.info("Pindutin muna ang Bagong Transaksyon.");
      return;
    }
    if (product.quantity <= 0) {
      toast.error("Product out of stock");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error("Not enough stock");
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          image: product.image,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
        },
      ];
    });
  }

  function handleScanSku(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!transactionOpen) {
      toast.info("Pindutin muna ang Bagong Transaksyon bago mag-scan.");
      return;
    }

    const product = products.find(
      (p) => p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (product) {
      addToCart(product);
      setSearch("");
      toast.success(`Added: ${product.name}`);
    } else {
      toast.error(`No product found for SKU: ${trimmed}`);
    }
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const product = products.find((p) => p.id === productId);
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (product && newQty > product.quantity) {
            toast.error("Not enough stock");
            return item;
          }
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleCheckout() {
    if (!isPosSessionActive) {
      setActivateOpen(true);
      toast.error("I-activate muna ang POS bago mag-checkout.");
      return;
    }

    if (!transactionOpen) {
      toast.error("Walang bukas na transaksyon.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
    const tax = (subtotal - discount) * 0.12;
    const total = subtotal - discount + tax;
    const paid =
      paymentMethod === "cash" ? parseFloat(amountPaid) : total;

    if (paymentMethod === "cash") {
      if (amountPaid.trim() === "" || Number.isNaN(paid) || paid < total) {
        toast.error("Kulang o walang laman ang binayaran.");
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const sale = await completeSale({
        items: cart,
        paymentMethod,
        amountPaid: paid,
        discount,
      });

      setCompletedSale(sale);
      setReceiptOpen(true);
      setCart([]);
      setDiscount(0);
      setAmountPaid("");
      setTransactionOpen(false);
      toast.success("Na-save ang transaksyon.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete sale"
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  function endTransaction() {
    setReceiptOpen(false);
    setCompletedSale(null);
  }

  const subtitle = isPosSessionActive
    ? `${selectedTerminal?.code} · ${posOperatorName}`
    : "I-activate ang POS para magsimula";

  return (
    <>
      <Header title="Point of Sale" subtitle={subtitle} />

      {!isPosSessionActive && (
        <div className="mx-3 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 lg:mx-4">
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              POS hindi pa activated sa device na ito
            </p>
            <p className="text-xs text-muted-foreground">
              Piliin ang terminal, ilagay ang pangalan ng cashier, at ang POS PIN.
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
            onClick={() => setActivateOpen(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Activate POS
          </Button>
        </div>
      )}

      {isPosLocked && (
        <div className="flex items-center justify-end gap-2 border-b border-border/50 px-3 py-2 lg:px-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/transactions">
              <Receipt className="mr-1 h-4 w-4" />
              Transactions
            </Link>
          </Button>
          {role !== "cashier" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/monitor">
                <Monitor className="mr-1 h-4 w-4" />
                Monitor
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            onClick={() => setExitPosOpen(true)}
          >
            <LockOpen className="mr-1 h-4 w-4" />
            Exit POS
          </Button>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-hidden p-3 lg:flex-row lg:gap-3 lg:p-4">
        <div className="flex-1 overflow-hidden">
          <ProductGrid
            products={products}
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            onScanSubmit={handleScanSku}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            transactionOpen={transactionOpen}
            onAddToCart={addToCart}
            onRequestStartTransaction={() =>
              toast.info("Pindutin ang Bagong Transaksyon sa panel sa kanan.")
            }
          />
        </div>

        <div className="mt-3 flex h-[min(70vh,640px)] shrink-0 flex-col lg:mt-0 lg:h-auto lg:min-h-[480px] lg:w-[360px]">
          <CartPanel
            transactionOpen={transactionOpen}
            posSessionActive={isPosSessionActive}
            cart={cart}
            paymentMethod={paymentMethod}
            discount={discount}
            amountPaid={amountPaid}
            checkoutLoading={checkoutLoading}
            onStartTransaction={startTransaction}
            onCancelTransaction={cancelTransaction}
            onPaymentMethodChange={setPaymentMethod}
            onDiscountChange={setDiscount}
            onAmountPaidChange={setAmountPaid}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
            onCheckout={handleCheckout}
          />
        </div>
      </main>

      <PosActivateModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        terminals={terminals}
        defaultOperatorName={displayName}
        onActivate={activatePosSession}
      />

      <ExitPosDialog
        open={exitPosOpen}
        onOpenChange={setExitPosOpen}
        onConfirm={deactivatePosLock}
      />

      <ReceiptDialog
        sale={completedSale}
        open={receiptOpen}
        onEndTransaction={endTransaction}
      />
    </>
  );
}
