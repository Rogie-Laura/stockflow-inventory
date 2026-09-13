-- PinoyStock inventory schema (inv_ prefix for project-PATROLLERS)

CREATE TABLE IF NOT EXISTS public.inv_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inv_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inv_profile_select" ON public.inv_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "inv_profile_update" ON public.inv_profile FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "inv_profile_insert" ON public.inv_profile FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.inv_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inv_category ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_category_all" ON public.inv_category FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.inv_supplier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  rating NUMERIC(2,1) DEFAULT 4.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inv_supplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_supplier_all" ON public.inv_supplier FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.inv_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.inv_category(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.inv_supplier(id) ON DELETE SET NULL,
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

ALTER TABLE public.inv_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_item_all" ON public.inv_item FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.inv_sale (
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

CREATE INDEX IF NOT EXISTS inv_sale_user_created_idx ON public.inv_sale (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inv_sale_receipt_idx ON public.inv_sale (receipt_no);

ALTER TABLE public.inv_sale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_sale_select" ON public.inv_sale FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inv_sale_insert" ON public.inv_sale FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inv_sale_update" ON public.inv_sale FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.inv_sale_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.inv_sale(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.inv_item(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT DEFAULT '',
  image TEXT DEFAULT '📦',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS inv_sale_item_sale_idx ON public.inv_sale_item (sale_id);

ALTER TABLE public.inv_sale_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_sale_item_select" ON public.inv_sale_item FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.inv_sale WHERE inv_sale.id = inv_sale_item.sale_id AND inv_sale.user_id = auth.uid()));
CREATE POLICY "inv_sale_item_insert" ON public.inv_sale_item FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.inv_sale WHERE inv_sale.id = inv_sale_item.sale_id AND inv_sale.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.inv_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'product_added', 'low_stock', 'sale_completed')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inv_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_activity_select" ON public.inv_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inv_activity_insert" ON public.inv_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.inv_subscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('standard', 'enterprise', 'enterprise_a_plus')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  amount_paid NUMERIC(10,2) DEFAULT 0,
  paymongo_session_id TEXT,
  paymongo_reference TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inv_subscription_user_status_idx ON public.inv_subscription (user_id, status);
CREATE INDEX IF NOT EXISTS inv_subscription_reference_idx ON public.inv_subscription (paymongo_reference);

ALTER TABLE public.inv_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_subscription_select" ON public.inv_subscription FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inv_subscription_insert" ON public.inv_subscription FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inv_subscription_update" ON public.inv_subscription FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.inv_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.inv_profile (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inv_on_auth_user_created ON auth.users;
CREATE TRIGGER inv_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.inv_handle_new_user();

CREATE OR REPLACE FUNCTION public.inv_seed_user_inventory()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.inv_category (user_id, name, description, color) VALUES
    (NEW.id, 'Electronics', 'Gadgets and devices', '#6366f1'),
    (NEW.id, 'Clothing', 'Apparel and fashion', '#8b5cf6'),
    (NEW.id, 'Food & Beverage', 'Consumables', '#06b6d4'),
    (NEW.id, 'Office Supplies', 'Stationery', '#10b981'),
    (NEW.id, 'Home & Garden', 'Furniture and decor', '#f59e0b');

  INSERT INTO public.inv_supplier (user_id, name, email, phone, address, rating) VALUES
    (NEW.id, 'TechGlobal Inc.', 'orders@techglobal.com', '+63 912 345 6789', 'Manila, PH', 4.8),
    (NEW.id, 'FreshMart Supply', 'supply@freshmart.com', '+63 917 234 5678', 'Cebu, PH', 4.5);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inv_on_profile_created_seed ON public.inv_profile;
CREATE TRIGGER inv_on_profile_created_seed
  AFTER INSERT ON public.inv_profile
  FOR EACH ROW EXECUTE FUNCTION public.inv_seed_user_inventory();
