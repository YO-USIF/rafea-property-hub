GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_permission(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_customer_data() TO authenticated;