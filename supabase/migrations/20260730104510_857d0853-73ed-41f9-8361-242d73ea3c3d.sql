ALTER TABLE public.extracts
  ADD COLUMN IF NOT EXISTS attached_file_url_2 text,
  ADD COLUMN IF NOT EXISTS attached_file_name_2 text;

ALTER TABLE public.assignment_orders
  ADD COLUMN IF NOT EXISTS attached_file_url_2 text,
  ADD COLUMN IF NOT EXISTS attached_file_name_2 text;