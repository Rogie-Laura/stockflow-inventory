-- New stores: VAT off by default (0%). Existing rows unchanged.

ALTER TABLE public.inv_store
  ALTER COLUMN pos_vat_enabled SET DEFAULT false;

ALTER TABLE public.inv_store
  ALTER COLUMN pos_vat_percent SET DEFAULT 0;
