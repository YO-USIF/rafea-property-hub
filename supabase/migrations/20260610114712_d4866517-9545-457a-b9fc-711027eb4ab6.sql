DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.proname AS fn_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM anon, public, authenticated;', fn.fn_name, fn.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role;', fn.fn_name, fn.args);
  END LOOP;
END $$;

-- Functions invoked directly by the app or needed for RLS evaluation by signed-in users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_customer_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_permission(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_customer_access(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_low_stock_items() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_extract_journal_entry(uuid, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sale_journal_entry(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invoice_journal_entry(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_project_stats(uuid) TO authenticated;