import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/lib/db-tables";
import { formatPeso } from "@/lib/currency";
import type {
  Activity,
  Category,
  Product,
  ProductStatus,
  Sale,
  SaleItem,
  Supplier,
} from "@/types/inventory";

function getStatus(quantity: number, minStock: number): ProductStatus {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= minStock) return "low_stock";
  return "in_stock";
}

export async function fetchInventory(supabase: SupabaseClient) {
  const [productsRes, categoriesRes, suppliersRes, activitiesRes, salesRes] =
    await Promise.all([
      supabase.from(TABLES.item).select("*").order("created_at", { ascending: false }),
      supabase.from(TABLES.category).select("*").order("name"),
      supabase.from(TABLES.supplier).select("*").order("name"),
      supabase
        .from(TABLES.activity)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from(TABLES.sale)
        .select(`*, ${TABLES.saleItem}(*), ${TABLES.posTerminal}(code, name)`)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const categories: Category[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    color: c.color ?? "#6366f1",
    productCount: 0,
  }));

  const suppliers: Supplier[] = (suppliersRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email ?? "",
    phone: s.phone ?? "",
    address: s.address ?? "",
    rating: Number(s.rating) || 0,
    productCount: 0,
  }));

  const products: Product[] = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    categoryId: p.category_id ?? "",
    supplierId: p.supplier_id ?? "",
    price: Number(p.price),
    cost: Number(p.cost),
    quantity: p.quantity,
    minStock: p.min_stock,
    status: getStatus(p.quantity, p.min_stock),
    description: p.description ?? "",
    image: p.image ?? "📦",
    createdAt: p.created_at?.split("T")[0] ?? "",
  }));

  for (const product of products) {
    const cat = categories.find((c) => c.id === product.categoryId);
    if (cat) cat.productCount++;
    const sup = suppliers.find((s) => s.id === product.supplierId);
    if (sup) sup.productCount++;
  }

  const activities: Activity[] = (activitiesRes.data ?? []).map((a) => ({
    id: a.id,
    type: a.type as Activity["type"],
    message: a.message,
    timestamp: a.created_at,
  }));

  const sales: Sale[] = (salesRes.data ?? []).map((s) => {
    const lineItems = (s[TABLES.saleItem] ?? s.inv_sale_item ?? []) as {
      product_id: string;
      product_name: string;
      sku: string;
      image: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[];

    const terminal = (s[TABLES.posTerminal] ?? s.inv_pos_terminal) as
      | { code: string; name: string }
      | null
      | undefined;

    return {
      id: s.id,
      receiptNo: s.receipt_no,
      items: lineItems.map(
        (item): SaleItem => ({
          productId: item.product_id,
          productName: item.product_name,
          sku: item.sku,
          image: item.image ?? "📦",
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          subtotal: Number(item.subtotal),
        })
      ),
      subtotal: Number(s.subtotal),
      tax: Number(s.tax),
      discount: Number(s.discount),
      total: Number(s.total),
      paymentMethod: s.payment_method,
      amountPaid: Number(s.amount_paid),
      change: Number(s.change_amount),
      cashierName: s.cashier_name,
      terminalId: s.terminal_id ?? undefined,
      terminalCode: terminal?.code,
      terminalName: terminal?.name,
      cashierId: s.cashier_id ?? s.user_id ?? undefined,
      storeId: s.store_id ?? undefined,
      createdAt: s.created_at,
    };
  });

  return { products, categories, suppliers, activities, sales };
}

export interface InsertSaleParams {
  storeId: string;
  terminalId: string;
  cashierId: string;
  cashierName: string;
}

export async function insertSale(
  supabase: SupabaseClient,
  params: InsertSaleParams,
  sale: Sale
) {
  const { data: saleData, error: saleError } = await supabase
    .from(TABLES.sale)
    .insert({
      user_id: params.cashierId,
      store_id: params.storeId,
      terminal_id: params.terminalId,
      cashier_id: params.cashierId,
      receipt_no: sale.receiptNo,
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      payment_method: sale.paymentMethod,
      amount_paid: sale.amountPaid,
      change_amount: sale.change,
      cashier_name: params.cashierName,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  const saleItems = sale.items.map((item) => ({
    sale_id: saleData.id,
    product_id: item.productId,
    product_name: item.productName,
    sku: item.sku,
    image: item.image,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from(TABLES.saleItem)
    .insert(saleItems);

  if (itemsError) throw itemsError;

  for (const item of sale.items) {
    const { error: stockError } = await supabase.rpc("inv_decrement_stock", {
      p_item_id: item.productId,
      p_qty: item.quantity,
    });
    if (stockError) throw stockError;
  }

  await supabase.from(TABLES.activity).insert({
    user_id: params.cashierId,
    store_id: params.storeId,
    type: "sale_completed",
    message: `Sale ${sale.receiptNo} — ${formatPeso(sale.total)} via ${sale.paymentMethod}`,
  });

  return sale;
}

export async function insertProduct(
  supabase: SupabaseClient,
  userId: string,
  storeId: string,
  product: Omit<Product, "id" | "status" | "createdAt">
) {
  const { data, error } = await supabase
    .from(TABLES.item)
    .insert({
      user_id: userId,
      store_id: storeId,
      name: product.name,
      sku: product.sku,
      category_id: product.categoryId || null,
      supplier_id: product.supplierId || null,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      min_stock: product.minStock,
      description: product.description,
      image: product.image,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from(TABLES.activity).insert({
    user_id: userId,
    store_id: storeId,
    type: "product_added",
    message: `New product "${product.name}" added to inventory`,
  });

  return data;
}

export async function deleteProductDb(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase.from(TABLES.item).delete().eq("id", id);
  if (error) throw error;
}

export async function insertCategory(
  supabase: SupabaseClient,
  userId: string,
  storeId: string,
  category: Omit<Category, "id" | "productCount">
) {
  const { data, error } = await supabase
    .from(TABLES.category)
    .insert({
      user_id: userId,
      store_id: storeId,
      name: category.name,
      description: category.description,
      color: category.color,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategoryDb(
  supabase: SupabaseClient,
  id: string
) {
  const { error } = await supabase.from(TABLES.category).delete().eq("id", id);
  if (error) throw error;
}
