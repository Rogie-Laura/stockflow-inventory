-- POS activation PIN per store (device lock to POS-only mode)

ALTER TABLE public.inv_store ADD COLUMN IF NOT EXISTS pos_pin TEXT;

CREATE OR REPLACE FUNCTION public.inv_verify_pos_pin(p_store_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_stored TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.inv_store_member
    WHERE user_id = auth.uid() AND store_id = p_store_id
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT pos_pin INTO v_stored FROM public.inv_store WHERE id = p_store_id;

  IF v_stored IS NULL OR length(v_stored) < 4 THEN
    RETURN FALSE;
  END IF;

  RETURN v_stored = p_pin;
END;
$$;

CREATE OR REPLACE FUNCTION public.inv_set_pos_pin(p_store_id UUID, p_pin TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.inv_is_store_admin(p_store_id) THEN
    RAISE EXCEPTION 'Only store admin can set POS PIN';
  END IF;

  IF p_pin IS NULL OR length(p_pin) < 4 OR length(p_pin) > 8 THEN
    RAISE EXCEPTION 'POS PIN must be 4-8 characters';
  END IF;

  UPDATE public.inv_store SET pos_pin = p_pin WHERE id = p_store_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inv_verify_pos_pin(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inv_set_pos_pin(UUID, TEXT) TO authenticated;

-- Demo store default PIN: 1234
UPDATE public.inv_store
SET pos_pin = '1234'
WHERE name = 'PinoyStock Demo Store' AND pos_pin IS NULL;
