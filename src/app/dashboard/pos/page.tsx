"use client";

import { useEffect, useState } from "react";
import { Monitor, Store } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import { TerminalPicker } from "@/components/pos/terminal-picker";
import { useInventory } from "@/context/inventory-context";
import { useStore } from "@/context/store-context";
import type { CartItem, PaymentMethod, Product, Sale } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function POSPage() {
  const { products, categories, completeSale } = useInventory();
  const { selectedTerminal, role, terminals } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [terminalPickerOpen, setTerminalPickerOpen] = useState(false);

  useEffect(() => {
    if (!selectedTerminal && terminals.length > 0) {
      setTerminalPickerOpen(true);
    }
  }, [selectedTerminal, terminals.length]);

  function addToCart(product: Product) {
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
    if (!selectedTerminal) {
      setTerminalPickerOpen(true);
      toast.error("Piliin muna ang POS terminal");
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
      paymentMethod === "cash" ? parseFloat(amountPaid) || total : total;

    if (paymentMethod === "cash" && paid < total) {
      toast.error("Insufficient payment amount");
      return;
    }

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
      toast.success("Sale completed!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete sale"
      );
    }
  }

  return (
    <>
      <Header
        title="Point of Sale"
        subtitle={
          selectedTerminal
            ? `${selectedTerminal.code} · ${selectedTerminal.name}`
            : "Piliin ang terminal"
        }
      />

      <main className="flex flex-1 flex-col overflow-hidden p-4 lg:flex-row lg:gap-4 lg:p-6">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="h-4 w-4" />
            {selectedTerminal?.code ?? "POS Terminal"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTerminalPickerOpen(true)}
            >
              Switch POS
            </Button>
            {role !== "cashier" && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/monitor">
                  <Monitor className="mr-1 h-4 w-4" />
                  Monitor
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mb-3 hidden items-center gap-2 lg:flex">
          {selectedTerminal && (
            <Badge variant="outline" className="text-emerald-600">
              {selectedTerminal.code} · {selectedTerminal.name}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setTerminalPickerOpen(true)}
          >
            Palitan ang terminal
          </Button>
        </div>

        <div className="flex-1 overflow-hidden lg:pr-0">
          <ProductGrid
            products={products}
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            onScanSubmit={handleScanSku}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
          />
        </div>

        <div className="mt-4 h-[420px] shrink-0 lg:mt-0 lg:h-auto lg:w-[380px]">
          <CartPanel
            cart={cart}
            paymentMethod={paymentMethod}
            discount={discount}
            amountPaid={amountPaid}
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

      <TerminalPicker
        open={terminalPickerOpen}
        onOpenChange={setTerminalPickerOpen}
      />

      <ReceiptDialog
        sale={completedSale}
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setCompletedSale(null);
        }}
      />
    </>
  );
}
