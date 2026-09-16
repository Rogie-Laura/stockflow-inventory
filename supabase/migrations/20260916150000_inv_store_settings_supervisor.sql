-- Allow store_admin or supervisor to update pricing/VAT settings

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
  IF NOT EXISTS (
    SELECT 1 FROM public.inv_store_member
    WHERE store_id = p_store_id
      AND user_id = auth.uid()
      AND role IN ('store_admin', 'supervisor')
  ) THEN
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
