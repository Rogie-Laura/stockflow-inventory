-- Enable Supabase Realtime for new sales (live analytics across POS terminals)

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inv_sale;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
