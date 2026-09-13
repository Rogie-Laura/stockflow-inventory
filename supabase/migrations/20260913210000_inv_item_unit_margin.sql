-- Product unit and margin (tubo %) for store inventory items

ALTER TABLE public.inv_item
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'pc',
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC(5,2);
