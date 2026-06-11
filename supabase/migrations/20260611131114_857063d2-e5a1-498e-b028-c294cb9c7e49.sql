CREATE TABLE public.contractor_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contractor_id uuid,
  contractor_name text,
  company text NOT NULL DEFAULT 'suhail',
  contract_number text NOT NULL,
  contract_date date NOT NULL DEFAULT CURRENT_DATE,
  project_name text,
  start_date date,
  end_date date,
  duration_days integer,
  payment_terms text,
  terms text,
  vat_enabled boolean NOT NULL DEFAULT true,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'مسودة',
  approved boolean NOT NULL DEFAULT false,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractor_contracts TO authenticated;
GRANT ALL ON public.contractor_contracts TO service_role;

ALTER TABLE public.contractor_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on contracts based on permissions"
  ON public.contractor_contracts FOR SELECT TO authenticated
  USING (is_admin() OR check_user_permission(auth.uid(), 'contractors', 'view'));

CREATE POLICY "Allow INSERT on contracts based on permissions"
  ON public.contractor_contracts FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR check_user_permission(auth.uid(), 'contractors', 'create'));

CREATE POLICY "Allow UPDATE on contracts based on permissions"
  ON public.contractor_contracts FOR UPDATE TO authenticated
  USING (is_admin() OR check_user_permission(auth.uid(), 'contractors', 'edit'));

CREATE POLICY "Allow DELETE on contracts based on permissions"
  ON public.contractor_contracts FOR DELETE TO authenticated
  USING (is_admin() OR check_user_permission(auth.uid(), 'contractors', 'delete'));

CREATE TRIGGER update_contractor_contracts_updated_at
  BEFORE UPDATE ON public.contractor_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();