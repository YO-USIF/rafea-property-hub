ALTER TABLE public.maintenance_requests
  ADD COLUMN IF NOT EXISTS attached_file_url text,
  ADD COLUMN IF NOT EXISTS attached_file_name text;