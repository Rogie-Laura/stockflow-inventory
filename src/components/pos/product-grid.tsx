"use client";

import { Search } from "lucide-react";
import type { Category, Product } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
}: ProductGridProps) {
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory && p.quantity > 0;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or scan SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
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

      <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => onAddToCart(product)}
            className="group flex flex-col rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]"
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
              ${product.price.toFixed(2)}
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No products available
          </div>
        )}
      </div>
    </div>
  );
}
