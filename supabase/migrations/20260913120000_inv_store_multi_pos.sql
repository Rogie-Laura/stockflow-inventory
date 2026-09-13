-- Multi-store / multi-POS: inv_store, members, terminals, store-scoped inventory

CREATE TABLE IF NOT EXISTS public.inv_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inv_store ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.inv_store_member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.inv_store(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('store_admin', 'supervisor', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

CREATE INDEX IF NOT EXISTS inv_store_member_user_idx ON public.inv_store_member (user_id);

ALTER TABLE public.inv_store_member ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.inv_pos_terminal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.inv_store(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS inv_pos_terminal_store_idx ON public.inv_pos_terminal (store_id);

ALTER TABLE public.inv_pos_terminal ENABLE ROW LEVEL SECURITY;

-- Add store scope to inventory tables
ALTER TABLE public.inv_category ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;
ALTER TABLE public.inv_supplier ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;
ALTER TABLE public.inv_item ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;
ALTER TABLE public.inv_activity ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;
ALTER TABLE public.inv_subscription ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;

ALTER TABLE public.inv_sale ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.inv_store(id) ON DELETE CASCADE;
ALTER TABLE public.inv_sale ADD COLUMN IF NOT EXISTS terminal_id UUID REFERENCES public.inv_pos_terminal(id) ON DELETE SET NULL;
ALTER TABLE public.inv_sale ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill store_id from legacy user_id rows
DO $$
DECLARE
  r RECORD;
  v_store_id UUID;
BEGIN
  FOR r IN
    SELECT DISTINCT user_id FROM public.inv_category
    UNION
    SELECT DISTINCT user_id FROM public.inv_supplier
    UNION
    SELECT id AS user_id FROM public.inv_profile
  LOOP
    IF r.user_id IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.inv_store_member WHERE user_id = r.user_id) THEN
      INSERT INTO public.inv_store (name, owner_id)
      SELECT COALESCE(p.full_name, 'My Store') || '''s Store', r.user_id
      FROM public.inv_profile p
      WHERE p.id = r.user_id
      RETURNING id INTO v_store_id;

      IF v_store_id IS NULL THEN
        INSERT INTO public.inv_store (name, owner_id)
        VALUES ('My Store', r.user_id)
        RETURNING id INTO v_store_id;
      END IF;

      INSERT INTO public.inv_store_member (store_id, user_id, role)
      VALUES (v_store_id, r.user_id, 'store_admin');

      INSERT INTO public.inv_pos_terminal (store_id, code, name) VALUES
        (v_store_id, 'POS-01', 'Counter 1'),
        (v_store_id, 'POS-02', 'Counter 2'),
        (v_store_id, 'POS-03', 'Counter 3')
      ON CONFLICT DO NOTHING;
    ELSE
      SELECT store_id INTO v_store_id
      FROM public.inv_store_member
      WHERE user_id = r.user_id
      LIMIT 1;
    END IF;

    UPDATE public.inv_category SET store_id = v_store_id WHERE user_id = r.user_id AND store_id IS NULL;
    UPDATE public.inv_supplier SET store_id = v_store_id WHERE user_id = r.user_id AND store_id IS NULL;
    UPDATE public.inv_item SET store_id = v_store_id WHERE user_id = r.user_id AND store_id IS NULL;
    UPDATE public.inv_activity SET store_id = v_store_id WHERE user_id = r.user_id AND store_id IS NULL;
    UPDATE public.inv_sale SET store_id = v_store_id, cashier_id = user_id WHERE user_id = r.user_id AND store_id IS NULL;
    UPDATE public.inv_subscription SET store_id = v_store_id WHERE user_id = r.user_id AND store_id IS NULL;
  END LOOP;
END $$;

-- Demo: demo1 = store_admin, demo2 = cashier on demo1 store
DO $$
DECLARE
  v_demo1 UUID;
  v_demo2 UUID;
  v_store UUID;
BEGIN
  SELECT id INTO v_demo1 FROM auth.users WHERE email = 'demo1@pinoystock.ph';
  SELECT id INTO v_demo2 FROM auth.users WHERE email = 'demo2@pinoystock.ph';

  IF v_demo1 IS NOT NULL THEN
    SELECT store_id INTO v_store FROM public.inv_store_member WHERE user_id = v_demo1 LIMIT 1;

    IF v_store IS NOT NULL THEN
      UPDATE public.inv_store SET name = 'PinoyStock Demo Store' WHERE id = v_store;

      IF v_demo2 IS NOT NULL THEN
        INSERT INTO public.inv_store_member (store_id, user_id, role)
        VALUES (v_store, v_demo2, 'cashier')
        ON CONFLICT (store_id, user_id) DO UPDATE SET role = 'cashier';

        DELETE FROM public.inv_store_member sm
        USING public.inv_store s
        WHERE sm.store_id = s.id
          AND sm.user_id = v_demo2
          AND sm.role = 'store_admin'
          AND s.owner_id = v_demo2
          AND s.id <> v_store;

        DELETE FROM public.inv_pos_terminal t
        USING public.inv_store s
        WHERE t.store_id = s.id AND s.owner_id = v_demo2 AND s.id <> v_store;

        DELETE FROM public.inv_store s
        WHERE s.owner_id = v_demo2 AND s.id <> v_store;
      END IF;
    END IF;
  END IF;
END $$;

-- RLS helpers
CREATE OR REPLACE FUNCTION public.inv_my_store_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT store_id FROM public.inv_store_member WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.inv_is_store_admin(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.inv_store_member
    WHERE user_id = auth.uid() AND store_id = p_store_id AND role = 'store_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.inv_is_store_member(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.inv_store_member
    WHERE user_id = auth.uid() AND store_id = p_store_id
  );
$$;

-- Atomic stock decrement for concurrent POS
CREATE OR REPLACE FUNCTION public.inv_decrement_stock(p_item_id UUID, p_qty INTEGER)
RETURNS public.inv_item
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item public.inv_item;
BEGIN
  UPDATE public.inv_item
  SET quantity = quantity - p_qty
  WHERE id = p_item_id
    AND quantity >= p_qty
    AND store_id IN (SELECT public.inv_my_store_ids())
  RETURNING * INTO v_item;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for item %', p_item_id;
  END IF;

  RETURN v_item;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inv_decrement_stock(UUID, INTEGER) TO authenticated;

-- Bootstrap store for new users
CREATE OR REPLACE FUNCTION public.inv_bootstrap_store(p_user_id UUID, p_full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_store_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.inv_store_member WHERE user_id = p_user_id) THEN
    SELECT store_id INTO v_store_id FROM public.inv_store_member WHERE user_id = p_user_id LIMIT 1;
    RETURN v_store_id;
  END IF;

  INSERT INTO public.inv_store (name, owner_id)
  VALUES (COALESCE(NULLIF(p_full_name, ''), 'My Store') || '''s Store', p_user_id)
  RETURNING id INTO v_store_id;

  INSERT INTO public.inv_store_member (store_id, user_id, role)
  VALUES (v_store_id, p_user_id, 'store_admin');

  INSERT INTO public.inv_pos_terminal (store_id, code, name) VALUES
    (v_store_id, 'POS-01', 'Counter 1'),
    (v_store_id, 'POS-02', 'Counter 2'),
    (v_store_id, 'POS-03', 'Counter 3');

  INSERT INTO public.inv_category (user_id, store_id, name, description, color) VALUES
    (p_user_id, v_store_id, 'Electronics', 'Gadgets and devices', '#6366f1'),
    (p_user_id, v_store_id, 'Clothing', 'Apparel and fashion', '#8b5cf6'),
    (p_user_id, v_store_id, 'Food & Beverage', 'Consumables', '#06b6d4'),
    (p_user_id, v_store_id, 'Office Supplies', 'Stationery', '#10b981'),
    (p_user_id, v_store_id, 'Home & Garden', 'Furniture and decor', '#f59e0b');

  INSERT INTO public.inv_supplier (user_id, store_id, name, email, phone, address, rating) VALUES
    (p_user_id, v_store_id, 'TechGlobal Inc.', 'orders@techglobal.com', '+63 912 345 6789', 'Manila, PH', 4.8),
    (p_user_id, v_store_id, 'FreshMart Supply', 'supply@freshmart.com', '+63 917 234 5678', 'Cebu, PH', 4.5);

  RETURN v_store_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.inv_seed_user_inventory()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.inv_bootstrap_store(NEW.id, NEW.full_name);
  RETURN NEW;
END;
$$;

-- Drop legacy user_id-only policies and replace with store membership policies
DROP POLICY IF EXISTS "inv_category_all" ON public.inv_category;
DROP POLICY IF EXISTS "inv_supplier_all" ON public.inv_supplier;
DROP POLICY IF EXISTS "inv_item_all" ON public.inv_item;
DROP POLICY IF EXISTS "inv_sale_select" ON public.inv_sale;
DROP POLICY IF EXISTS "inv_sale_insert" ON public.inv_sale;
DROP POLICY IF EXISTS "inv_sale_update" ON public.inv_sale;
DROP POLICY IF EXISTS "inv_sale_item_select" ON public.inv_sale_item;
DROP POLICY IF EXISTS "inv_sale_item_insert" ON public.inv_sale_item;
DROP POLICY IF EXISTS "inv_activity_select" ON public.inv_activity;
DROP POLICY IF EXISTS "inv_activity_insert" ON public.inv_activity;
DROP POLICY IF EXISTS "inv_subscription_select" ON public.inv_subscription;
DROP POLICY IF EXISTS "inv_subscription_insert" ON public.inv_subscription;
DROP POLICY IF EXISTS "inv_subscription_update" ON public.inv_subscription;

CREATE POLICY "inv_store_select" ON public.inv_store FOR SELECT
  USING (id IN (SELECT public.inv_my_store_ids()) OR owner_id = auth.uid());

CREATE POLICY "inv_store_member_select" ON public.inv_store_member FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));

CREATE POLICY "inv_store_member_admin_write" ON public.inv_store_member FOR ALL
  USING (public.inv_is_store_admin(store_id))
  WITH CHECK (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_pos_terminal_select" ON public.inv_pos_terminal FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));

CREATE POLICY "inv_pos_terminal_admin_write" ON public.inv_pos_terminal FOR ALL
  USING (public.inv_is_store_admin(store_id))
  WITH CHECK (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_category_select" ON public.inv_category FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_category_admin_write" ON public.inv_category FOR ALL
  USING (public.inv_is_store_admin(store_id))
  WITH CHECK (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_supplier_select" ON public.inv_supplier FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_supplier_admin_write" ON public.inv_supplier FOR ALL
  USING (public.inv_is_store_admin(store_id))
  WITH CHECK (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_item_select" ON public.inv_item FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_item_admin_write" ON public.inv_item FOR ALL
  USING (public.inv_is_store_admin(store_id))
  WITH CHECK (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_sale_select" ON public.inv_sale FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_sale_insert" ON public.inv_sale FOR INSERT
  WITH CHECK (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_sale_update" ON public.inv_sale FOR UPDATE
  USING (public.inv_is_store_admin(store_id));

CREATE POLICY "inv_sale_item_select" ON public.inv_sale_item FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.inv_sale s
    WHERE s.id = inv_sale_item.sale_id AND s.store_id IN (SELECT public.inv_my_store_ids())
  ));
CREATE POLICY "inv_sale_item_insert" ON public.inv_sale_item FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.inv_sale s
    WHERE s.id = inv_sale_item.sale_id AND s.store_id IN (SELECT public.inv_my_store_ids())
  ));

CREATE POLICY "inv_activity_select" ON public.inv_activity FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()));
CREATE POLICY "inv_activity_insert" ON public.inv_activity FOR INSERT
  WITH CHECK (store_id IN (SELECT public.inv_my_store_ids()));

CREATE POLICY "inv_subscription_select" ON public.inv_subscription FOR SELECT
  USING (store_id IN (SELECT public.inv_my_store_ids()) OR user_id = auth.uid());
CREATE POLICY "inv_subscription_insert" ON public.inv_subscription FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "inv_subscription_update" ON public.inv_subscription FOR UPDATE
  USING (public.inv_is_store_admin(store_id) OR user_id = auth.uid());
