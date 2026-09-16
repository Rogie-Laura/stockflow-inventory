-- Monitor login: 10-character alphanumeric account numbers (letters + digits).

CREATE OR REPLACE FUNCTION public.inv_generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_candidate TEXT;
  v_i INT;
  v_tries INT := 0;
BEGIN
  LOOP
    v_tries := v_tries + 1;
    v_candidate := '';
    FOR v_i IN 1..10 LOOP
      v_candidate := v_candidate || substr(
        v_chars,
        (floor(random() * length(v_chars)) + 1)::INT,
        1
      );
    END LOOP;

    EXIT WHEN v_candidate ~ '[A-Z]' AND v_candidate ~ '[2-9]'
      AND NOT EXISTS (
        SELECT 1 FROM public.inv_profile WHERE account_number = v_candidate
      );

    IF v_tries > 200 THEN
      RAISE EXCEPTION 'could not generate account number';
    END IF;
  END LOOP;
  RETURN v_candidate;
END;
$$;

UPDATE public.inv_profile
SET account_number = public.inv_generate_account_number();

ALTER TABLE public.inv_profile
  DROP CONSTRAINT IF EXISTS inv_profile_account_number_format;

ALTER TABLE public.inv_profile
  ADD CONSTRAINT inv_profile_account_number_format
  CHECK (account_number ~ '^[A-Z0-9]{10}$');

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
  WHERE p.account_number = upper(trim(p_account_number))
    AND m.role IN ('store_admin', 'supervisor')
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.inv_lookup_monitor_login(TEXT) FROM anon;
