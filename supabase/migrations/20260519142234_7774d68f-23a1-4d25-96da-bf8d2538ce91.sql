
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;

CREATE POLICY "Authenticated users can create customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.set_customer_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_customer_created_by_trigger ON public.customers;
CREATE TRIGGER set_customer_created_by_trigger
BEFORE INSERT ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.set_customer_created_by();
