
ALTER TABLE public.assignment_orders 
ADD COLUMN approved boolean NOT NULL DEFAULT false,
ADD COLUMN approved_by uuid NULL,
ADD COLUMN approved_at timestamp with time zone NULL;
