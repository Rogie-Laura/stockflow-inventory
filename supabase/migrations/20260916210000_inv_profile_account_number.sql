-- Monitor app login: unique account number per user (shown in web avatar menu).

ALTER TABLE public.inv_profile
  ADD COLUMN IF NOT EXISTS account_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS inv_profile_account_number_key
  ON public.inv_profile (account_number)
  WHERE account_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.inv_generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate TEXT;
  v_tries INT := 0;
BEGIN
  LOOP
    v_tries := v_tries + 1;
    v_candidate := lpad(
      (floor(random() * 90000000) + 10000000)::bigint::text,
      8,
      '0'
    );
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.inv_profile WHERE account_number = v_candidate
    );
    IF v_tries > 50 THEN
      RAISE EXCEPTION 'could not generate account number';
    END IF;
  END LOOP;
  RETURN v_candidate;
END;
$$;

UPDATE public.inv_profile
SET account_number = public.inv_generate_account_number()
WHERE account_number IS NULL;

ALTER TABLE public.inv_profile
  ALTER COLUMN account_number SET NOT NULL;

CREATE OR REPLACE FUNCTION public.inv_profile_assign_account_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
    NEW.account_number := public.inv_generate_account_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inv_profile_account_number ON public.inv_profile;
CREATE TRIGGER inv_profile_account_number
  BEFORE INSERT ON public.inv_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.inv_profile_assign_account_number();

-- Mobile login: resolve email from account number (monitor roles only).
CREATE OR REPLACE FUNCTION public.inv_lookup_monitor_login(p_account_number TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.email::TEXT
  FROM public.inv_profile p
  INNER JOIN auth.users u ON u.id = p.id
  INNER JOIN public.inv_store_member m ON m.user_id = p.id
  WHERE p.account_number = trim(p_account_number)
    AND m.role IN ('store_admin', 'supervisor')
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.inv_lookup_monitor_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inv_lookup_monitor_login(TEXT) TO anon, authenticated;
