-- Track which POS terminal is in use and by whom

ALTER TABLE public.inv_pos_terminal
  ADD COLUMN IF NOT EXISTS active_operator TEXT,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.inv_claim_pos_terminal(
  p_terminal_id UUID,
  p_operator_name TEXT,
  p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_store_id UUID;
  v_active TEXT;
  v_at TIMESTAMPTZ;
BEGIN
  SELECT store_id, active_operator, activated_at
  INTO v_store_id, v_active, v_at
  FROM public.inv_pos_terminal
  WHERE id = p_terminal_id;

  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Terminal not found';
  END IF;

  IF NOT public.inv_verify_pos_pin(v_store_id, p_pin) THEN
    RETURN FALSE;
  END IF;

  IF p_operator_name IS NULL OR length(trim(p_operator_name)) < 2 THEN
    RAISE EXCEPTION 'Operator name required';
  END IF;

  IF v_active IS NOT NULL AND v_at IS NOT NULL
     AND v_at > (NOW() - INTERVAL '8 hours') THEN
    RAISE EXCEPTION 'Terminal in use by %', v_active;
  END IF;

  UPDATE public.inv_pos_terminal
  SET active_operator = trim(p_operator_name), activated_at = NOW()
  WHERE id = p_terminal_id;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.inv_release_pos_terminal(
  p_terminal_id UUID,
  p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_store_id UUID;
BEGIN
  SELECT store_id INTO v_store_id FROM public.inv_pos_terminal WHERE id = p_terminal_id;
  IF v_store_id IS NULL THEN RETURN FALSE; END IF;
  IF NOT public.inv_verify_pos_pin(v_store_id, p_pin) THEN RETURN FALSE; END IF;

  UPDATE public.inv_pos_terminal
  SET active_operator = NULL, activated_at = NULL
  WHERE id = p_terminal_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inv_claim_pos_terminal(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inv_release_pos_terminal(UUID, TEXT) TO authenticated;
