-- Ensure logged-in user has profile + store (fixes signup without store / broken triggers).

CREATE OR REPLACE FUNCTION public.inv_ensure_my_store(p_full_name TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_name TEXT;
  v_store_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_name := COALESCE(
    NULLIF(trim(p_full_name), ''),
    (SELECT full_name FROM public.inv_profile WHERE id = v_uid),
    'My Store'
  );

  INSERT INTO public.inv_profile (id, full_name)
  VALUES (v_uid, v_name)
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.inv_profile.full_name);

  v_store_id := public.inv_bootstrap_store(v_uid, v_name);
  RETURN v_store_id;
END;
$$;

REVOKE ALL ON FUNCTION public.inv_ensure_my_store(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inv_ensure_my_store(TEXT) TO authenticated;
