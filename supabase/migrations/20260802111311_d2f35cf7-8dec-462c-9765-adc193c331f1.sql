REVOKE ALL ON FUNCTION public.get_user_display_name(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_display_name(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_assignment_order_journal_entry(uuid, numeric, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_assignment_order_journal_entry(uuid, numeric, text, uuid) TO authenticated, service_role;