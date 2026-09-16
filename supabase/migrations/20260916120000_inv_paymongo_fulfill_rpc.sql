-- Fulfill pending subscription after PayMongo webhook (anon RPC + shared secret)

CREATE TABLE IF NOT EXISTS public.inv_system_secret (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.inv_system_secret ENABLE ROW LEVEL SECURITY;

INSERT INTO public.inv_system_secret (key, value)
VALUES ('paymongo_fulfill', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.inv_fulfill_paid_checkout(
  p_fulfill_secret text,
  p_reference_number text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected text;
  sub_row public.inv_subscription%ROWTYPE;
  period_end timestamptz;
BEGIN
  SELECT value INTO expected FROM public.inv_system_secret WHERE key = 'paymongo_fulfill';
  IF expected IS NULL OR p_fulfill_secret IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO sub_row
  FROM public.inv_subscription
  WHERE paymongo_reference = p_reference_number AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'pending_not_found');
  END IF;

  UPDATE public.inv_subscription
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = sub_row.user_id AND status = 'active';

  IF sub_row.billing_cycle = 'annual' THEN
    period_end := now() + interval '1 year';
  ELSE
    period_end := now() + interval '1 month';
  END IF;

  UPDATE public.inv_subscription
  SET
    status = 'active',
    current_period_start = now(),
    current_period_end = period_end,
    updated_at = now()
  WHERE id = sub_row.id;

  RETURN jsonb_build_object('ok', true, 'subscription_id', sub_row.id);
END;
$$;

REVOKE ALL ON FUNCTION public.inv_fulfill_paid_checkout(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inv_fulfill_paid_checkout(text, text) TO anon, authenticated, service_role;
