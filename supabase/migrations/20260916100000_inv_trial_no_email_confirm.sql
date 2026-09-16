-- Auto-confirm email on signup + 3-day free trial for new store owners

CREATE OR REPLACE FUNCTION public.inv_auto_confirm_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inv_auto_confirm_on_signup ON auth.users;
CREATE TRIGGER inv_auto_confirm_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.inv_auto_confirm_email();

ALTER TABLE public.inv_subscription
  DROP CONSTRAINT IF EXISTS inv_subscription_status_check;
ALTER TABLE public.inv_subscription
  ADD CONSTRAINT inv_subscription_status_check
  CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'trialing'));

ALTER TABLE public.inv_subscription
  DROP CONSTRAINT IF EXISTS inv_subscription_billing_cycle_check;
ALTER TABLE public.inv_subscription
  ADD CONSTRAINT inv_subscription_billing_cycle_check
  CHECK (billing_cycle IN ('monthly', 'annual', 'trial'));

CREATE OR REPLACE FUNCTION public.inv_start_free_trial(p_user_id UUID, p_store_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.inv_subscription
    WHERE user_id = p_user_id AND status IN ('active', 'trialing')
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.inv_subscription (
    user_id,
    store_id,
    plan_id,
    billing_cycle,
    status,
    amount_paid,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    p_store_id,
    'standard',
    'trial',
    'trialing',
    0,
    NOW(),
    NOW() + INTERVAL '3 days'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.inv_expire_trials_for_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.inv_subscription
  SET status = 'expired', updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'trialing'
    AND current_period_end IS NOT NULL
    AND current_period_end < NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.inv_bootstrap_store(p_user_id UUID, p_full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.inv_store_member WHERE user_id = p_user_id) THEN
    SELECT store_id INTO v_store_id FROM public.inv_store_member WHERE user_id = p_user_id LIMIT 1;
    PERFORM public.inv_start_free_trial(p_user_id, v_store_id);
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

  PERFORM public.inv_start_free_trial(p_user_id, v_store_id);

  RETURN v_store_id;
END;
$$;

-- Backfill trial for store owners without any subscription
INSERT INTO public.inv_subscription (
  user_id,
  store_id,
  plan_id,
  billing_cycle,
  status,
  amount_paid,
  current_period_start,
  current_period_end
)
SELECT
  s.owner_id,
  s.id,
  'standard',
  'trial',
  'trialing',
  0,
  NOW(),
  NOW() + INTERVAL '3 days'
FROM public.inv_store s
WHERE NOT EXISTS (
  SELECT 1 FROM public.inv_subscription sub
  WHERE sub.user_id = s.owner_id
    AND sub.status IN ('active', 'trialing', 'pending')
);

GRANT EXECUTE ON FUNCTION public.inv_expire_trials_for_user(UUID) TO authenticated;
