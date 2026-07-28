
CREATE OR REPLACE FUNCTION public.create_assignment_order_journal_entry(
  order_id uuid,
  order_amount numeric,
  contractor_name text,
  project_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry_id UUID;
  entry_number TEXT;
  sanitized_contractor_name TEXT;
BEGIN
  IF order_amount <= 0 THEN
    RAISE EXCEPTION 'Assignment order amount must be positive';
  END IF;

  IF LENGTH(contractor_name) > 255 THEN
    RAISE EXCEPTION 'Contractor name too long';
  END IF;

  sanitized_contractor_name := regexp_replace(contractor_name, '[^\w\s\u0600-\u06FF-]', '', 'g');
  sanitized_contractor_name := trim(sanitized_contractor_name);
  IF sanitized_contractor_name = '' THEN
    sanitized_contractor_name := 'مقاول غير محدد';
  END IF;

  entry_number := 'JE-AO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;

  INSERT INTO public.journal_entries (
    entry_number, description, reference_type, reference_id, created_by
  ) VALUES (
    entry_number,
    'قيد أمر تكليف - ' || sanitized_contractor_name,
    'assignment_order',
    order_id,
    auth.uid()
  ) RETURNING id INTO entry_id;

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, debit_amount)
  SELECT entry_id, id, 'مستحق مقاول (أمر تكليف) - ' || sanitized_contractor_name, order_amount
  FROM public.chart_of_accounts
  WHERE account_code = '2120'
  LIMIT 1;

  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, description, credit_amount)
  SELECT entry_id, id, 'خصم أمر تكليف من المبيعات - ' || sanitized_contractor_name, order_amount
  FROM public.chart_of_accounts
  WHERE account_code = '4100'
  LIMIT 1;

  IF project_id IS NOT NULL THEN
    UPDATE public.projects
    SET total_cost = COALESCE(total_cost, 0) + order_amount
    WHERE id = project_id;
  END IF;

  RETURN entry_id;
END;
$$;
