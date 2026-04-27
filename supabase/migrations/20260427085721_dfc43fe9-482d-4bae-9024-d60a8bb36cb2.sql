ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by uuid NULL,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone NULL;