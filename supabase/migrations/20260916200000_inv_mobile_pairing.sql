-- QR pairing: web (logged-in user) creates code; mobile exchanges via server API.
CREATE TABLE IF NOT EXISTS public.inv_mobile_pairing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inv_mobile_pairing_code_idx ON public.inv_mobile_pairing (code);
CREATE INDEX IF NOT EXISTS inv_mobile_pairing_expires_idx ON public.inv_mobile_pairing (expires_at);

ALTER TABLE public.inv_mobile_pairing ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.inv_create_mobile_pairing()
RETURNS TABLE(code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_code TEXT;
  v_expires TIMESTAMPTZ := now() + interval '3 minutes';
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM public.inv_mobile_pairing
  WHERE user_id = v_uid AND used_at IS NULL;

  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.inv_mobile_pairing (code, user_id, expires_at)
  VALUES (v_code, v_uid, v_expires);

  RETURN QUERY SELECT v_code, v_expires;
END;
$$;

REVOKE ALL ON FUNCTION public.inv_create_mobile_pairing() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.inv_create_mobile_pairing() TO authenticated;
