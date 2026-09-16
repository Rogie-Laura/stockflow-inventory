-- Store-level pricing & POS VAT settings

ALTER TABLE public.inv_store
  ADD COLUMN IF NOT EXISTS use_margin_pricing BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pos_vat_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pos_vat_percent NUMERIC(5,2) NOT NULL DEFAULT 12;

CREATE OR REPLACE FUNCTION public.inv_update_store_settings(
  p_store_id UUID,
  p_use_margin_pricing BOOLEAN,
  p_pos_vat_enabled BOOLEAN,
  p_pos_vat_percent NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.inv_is_store_admin(p_store_id) THEN
    RAISE EXCEPTION 'Not authorized to update store settings';
  END IF;

  IF p_pos_vat_percent < 0 OR p_pos_vat_percent > 100 THEN
    RAISE EXCEPTION 'VAT percent must be between 0 and 100';
  END IF;

  UPDATE public.inv_store
  SET
    use_margin_pricing = p_use_margin_pricing,
    pos_vat_enabled = p_pos_vat_enabled,
    pos_vat_percent = p_pos_vat_percent
  WHERE id = p_store_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inv_update_store_settings(UUID, BOOLEAN, BOOLEAN, NUMERIC) TO authenticated;
