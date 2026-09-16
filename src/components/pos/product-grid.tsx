"use client";

import { Search } from "lucide-react";
import type { Category, Product } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPeso } from "@/lib/currency";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (value: string) => void;
  onScanSubmit?: (code: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  transactionOpen: boolean;
  onAddToCart: (product: Product) => void;
  onRequestStartTransaction?: () => void;
}

export function ProductGrid({
  products,
  categories,
  search,
  onSearchChange,
  onScanSubmit,
  selectedCategory,
  onCategoryChange,
  transactionOpen,
  onAddToCart,
  onRequestStartTransaction,
}: ProductGridProps) {
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && p.quantity > 0;
  });

  function handleProductClick(product: Product) {
    if (!transactionOpen) {
      onRequestStartTransaction?.();
      return;
    }
    onAddToCart(product);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or scan SKU / QR..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onScanSubmit) {
                e.preventDefault();
                onScanSubmit(search);
              }
            }}
            className="pl-9"
            autoFocus
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              !selectedCategory
                ? "bg-indigo-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === cat.id
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={
                selectedCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
      <div className="grid h-full auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            disabled={!transactionOpen}
            className={cn(
              "group flex flex-col rounded-xl border border-border/50 bg-card p-4 text-left transition-all",
              transactionOpen
                ? "hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]"
                : "cursor-not-allowed opacity-60"
            )}
          >
            <div className="mb-3 flex items-start justify-between">
              <span className="text-3xl">{product.image}</span>
              <Badge variant="outline" className="text-[10px]">
                {product.quantity} left
              </Badge>
            </div>
            <p className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {product.name}
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              {product.sku}
            </p>
            <p className="mt-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatPeso(product.price)}
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No products available
          </div>
        )}
      </div>

      {!transactionOpen && (
        <div
          className="absolute inset-0 z-10 flex items-end justify-center bg-background/50 p-6 pb-16 backdrop-blur-[2px] sm:items-center sm:pb-6"
          aria-hidden
        >
          <div className="max-w-sm rounded-2xl border border-border/60 bg-card p-5 text-center shadow-xl">
            <p className="font-semibold">Simulan ang transaksyon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pindutin ang <strong>Bagong Transaksyon</strong> sa kanan bago mag-add ng item.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
