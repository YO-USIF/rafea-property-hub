CREATE OR REPLACE FUNCTION public.get_user_display_name(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(TRIM(full_name), ''), split_part(email, '@', 1))
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_display_name(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_display_name(uuid) TO authenticated;