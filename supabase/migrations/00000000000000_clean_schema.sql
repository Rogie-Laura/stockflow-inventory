-- StockFlow: Clean database schema (transaction-first)
-- Drops all app tables and recreates from scratch

-- Drop triggers
DROP TRIGGER IF EXISTS on_profile_created_seed ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.seed_user_inventory();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables (dependency order)
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_all" ON public.categories FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  rating NUMERIC(2,1) DEFAULT 4.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_all" ON public.suppliers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  price NUMERIC(10,2) DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '📦',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_all" ON public.products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sales (Transactions) — core table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_no TEXT NOT NULL,
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'ewallet')),
  amount_paid NUMERIC(10,2) DEFAULT 0,
  change_amount NUMERIC(10,2) DEFAULT 0,
  cashier_name TEXT DEFAULT '',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'void')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX sales_user_created_idx ON public.sales (user_id, created_at DESC);
CREATE INDEX sales_receipt_idx ON public.sales (receipt_no);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_select" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sales_insert" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sales_update" ON public.sales FOR UPDATE USING (auth.uid() = user_id);

-- Sale items (transaction line items)
CREATE TABLE public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  image TEXT DEFAULT '📦',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX sale_items_sale_idx ON public.sale_items (sale_id);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_items_select" ON public.sale_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "sale_items_insert" ON public.sale_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));

-- Activities (audit log)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'product_added', 'low_stock', 'sale_completed')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_select" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default data for new users
CREATE OR REPLACE FUNCTION public.seed_user_inventory()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, description, color) VALUES
    (NEW.id, 'Electronics', 'Gadgets and devices', '#6366f1'),
    (NEW.id, 'Clothing', 'Apparel and fashion', '#8b5cf6'),
    (NEW.id, 'Food & Beverage', 'Consumables', '#06b6d4'),
    (NEW.id, 'Office Supplies', 'Stationery', '#10b981'),
    (NEW.id, 'Home & Garden', 'Furniture and decor', '#f59e0b');

  INSERT INTO public.suppliers (user_id, name, email, phone, address, rating) VALUES
    (NEW.id, 'TechGlobal Inc.', 'orders@techglobal.com', '+63 912 345 6789', 'Manila, PH', 4.8),
    (NEW.id, 'FreshMart Supply', 'supply@freshmart.com', '+63 917 234 5678', 'Cebu, PH', 4.5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_seed
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_user_inventory();
