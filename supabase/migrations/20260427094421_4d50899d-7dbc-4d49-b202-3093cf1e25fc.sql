
-- Fix: RLS Policy Always True on notifications INSERT
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications for themselves"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications for any user"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Fix: Revoke EXECUTE from anon/authenticated on SECURITY DEFINER functions
-- These functions are intended for internal use (RLS helpers, triggers, internal operations)
-- and should not be callable directly via the PostgREST API.

REVOKE EXECUTE ON FUNCTION public.can_access_customer_data() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_low_stock_and_notify() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_user_permission(uuid, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_extract_journal_entry(uuid, numeric, text, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_invoice_journal_entry(uuid, numeric, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_sale_journal_entry(uuid, numeric, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_assignment_order_number() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_extract_number() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_low_stock_items() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_manager_or_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_customer_access(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.trigger_update_project_stats() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_inventory_quantity() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_project_stats(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_journal_entry_balance() FROM anon, authenticated, public;
