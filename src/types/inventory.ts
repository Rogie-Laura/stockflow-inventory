export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export type PaymentMethod = "cash" | "card" | "ewallet";

export type ActivityType =
  | "stock_in"
  | "stock_out"
  | "product_added"
  | "low_stock"
  | "sale_completed";

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  color: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  status: ProductStatus;
  description: string;
  image: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierName: string;
  terminalId?: string;
  terminalCode?: string;
  terminalName?: string;
  cashierId?: string;
  storeId?: string;
  createdAt: string;
}

export interface CartItem extends SaleItem {}

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStock: number;
  monthlyRevenue: number;
  revenueChange: number;
}

export interface MonitoringMetrics {
  todaySales: number;
  todayTransactions: number;
  avgOrderValue: number;
  itemsSoldToday: number;
  salesChange: number;
}
