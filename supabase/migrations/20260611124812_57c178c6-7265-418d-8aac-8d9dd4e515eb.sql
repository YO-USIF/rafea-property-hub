ALTER TABLE public.contractors ADD COLUMN commercial_registration TEXT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractors TO authenticated;
GRANT ALL ON public.contractors TO service_role;