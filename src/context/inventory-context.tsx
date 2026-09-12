"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  activities as initialActivities,
  categories as initialCategories,
  products as initialProducts,
  sales as initialSales,
  suppliers as initialSuppliers,
} from "@/lib/mock-data";
import {
  deleteCategoryDb,
  deleteProductDb,
  fetchInventory,
  insertCategory,
  insertProduct,
  insertSale,
} from "@/lib/inventory-db";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  Activity,
  CartItem,
  Category,
  PaymentMethod,
  Product,
  ProductStatus,
  Sale,
  Supplier,
} from "@/types/inventory";
import { toast } from "sonner";

const TAX_RATE = 0.12;

function getStatus(quantity: number, minStock: number): ProductStatus {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= minStock) return "low_stock";
  return "in_stock";
}

function generateReceiptNo() {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `SF-${dateStr}-${seq}`;
}

interface CompleteSaleInput {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  amountPaid: number;
  discount: number;
  cashierName: string;
}

interface InventoryContextValue {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  activities: Activity[];
  sales: Sale[];
  loading: boolean;
  isDemoMode: boolean;
  addProduct: (
    product: Omit<Product, "id" | "status" | "createdAt">
  ) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (
    category: Omit<Category, "id" | "productCount">
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  completeSale: (input: CompleteSaleInput) => Promise<Sale>;
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const isDemoMode = !isSupabaseConfigured();

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const data = await fetchInventory(supabase);
      setProducts(data.products);
      setCategories(data.categories);
      setSuppliers(data.suppliers);
      setActivities(data.activities);
      setSales(data.sales);
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addActivity = useCallback((activity: Omit<Activity, "id">) => {
    setActivities((prev) => [
      { ...activity, id: `act-${Date.now()}` },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const completeSale = useCallback(
    async (input: CompleteSaleInput): Promise<Sale> => {
      const subtotal = input.items.reduce((sum, i) => sum + i.subtotal, 0);
      const tax = (subtotal - input.discount) * TAX_RATE;
      const total = subtotal - input.discount + tax;
      const change = Math.max(0, input.amountPaid - total);

      const sale: Sale = {
        id: `sale-${Date.now()}`,
        receiptNo: generateReceiptNo(),
        items: input.items,
        subtotal,
        tax,
        discount: input.discount,
        total,
        paymentMethod: input.paymentMethod,
        amountPaid: input.amountPaid,
        change,
        cashierName: input.cashierName,
        createdAt: new Date().toISOString(),
      };

      if (isDemoMode) {
        setSales((prev) => [sale, ...prev]);

        for (const item of input.items) {
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id !== item.productId) return p;
              const newQty = Math.max(0, p.quantity - item.quantity);
              const status = getStatus(newQty, p.minStock);
              return { ...p, quantity: newQty, status };
            })
          );
        }

        addActivity({
          type: "sale_completed",
          message: `Sale ${sale.receiptNo} — $${total.toFixed(2)} via ${input.paymentMethod}`,
          timestamp: sale.createdAt,
        });

        return sale;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const saved = await insertSale(supabase, user.id, sale);
      await refresh();
      return saved;
    },
    [isDemoMode, addActivity, refresh]
  );

  const addProduct = useCallback(
    async (product: Omit<Product, "id" | "status" | "createdAt">) => {
      if (isDemoMode) {
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`,
          status: getStatus(product.quantity, product.minStock),
          createdAt: new Date().toISOString().split("T")[0],
        };
        setProducts((prev) => [newProduct, ...prev]);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === product.categoryId
              ? { ...c, productCount: c.productCount + 1 }
              : c
          )
        );
        addActivity({
          type: "product_added",
          message: `New product "${product.name}" added to inventory`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await insertProduct(supabase, user.id, product);
      await refresh();
    },
    [isDemoMode, addActivity, refresh]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates };
          updated.status = getStatus(updated.quantity, updated.minStock);
          return updated;
        })
      );
    },
    []
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (isDemoMode) {
        setProducts((prev) => {
          const product = prev.find((p) => p.id === id);
          if (product) {
            setCategories((cats) =>
              cats.map((c) =>
                c.id === product.categoryId
                  ? { ...c, productCount: Math.max(0, c.productCount - 1) }
                  : c
              )
            );
          }
          return prev.filter((p) => p.id !== id);
        });
        return;
      }

      const supabase = createClient();
      await deleteProductDb(supabase, id);
      await refresh();
    },
    [isDemoMode, refresh]
  );

  const addCategory = useCallback(
    async (category: Omit<Category, "id" | "productCount">) => {
      if (isDemoMode) {
        setCategories((prev) => [
          ...prev,
          { ...category, id: `cat-${Date.now()}`, productCount: 0 },
        ]);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await insertCategory(supabase, user.id, category);
      await refresh();
    },
    [isDemoMode, refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (isDemoMode) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return;
      }

      const supabase = createClient();
      await deleteCategoryDb(supabase, id);
      await refresh();
    },
    [isDemoMode, refresh]
  );

  const value = useMemo(
    () => ({
      products,
      categories,
      suppliers,
      activities,
      sales,
      loading,
      isDemoMode,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      completeSale,
      refresh,
    }),
    [
      products,
      categories,
      suppliers,
      activities,
      sales,
      loading,
      isDemoMode,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory,
      completeSale,
      refresh,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}

export { TAX_RATE };
