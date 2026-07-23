
-- 1) Revoke EXECUTE from anon/public on all public SECURITY DEFINER functions; grant to authenticated
DO $$
DECLARE
  r RECORD;
  sig TEXT;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    sig := format('%I.%I(%s)', r.nspname, r.proname, r.args);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
  END LOOP;
END$$;

-- 2) Tighten company_settings and chart_of_accounts SELECT to managers/admins
DROP POLICY IF EXISTS "Authenticated users can view company settings" ON public.company_settings;
CREATE POLICY "Managers and admins can view company settings"
ON public.company_settings
FOR SELECT
TO authenticated
USING (public.is_manager_or_admin());

DROP POLICY IF EXISTS "Authenticated users can view chart of accounts" ON public.chart_of_accounts;
CREATE POLICY "Managers and admins can view chart of accounts"
ON public.chart_of_accounts
FOR SELECT
TO authenticated
USING (public.is_manager_or_admin());

-- 3) Restrict storage.objects policies for 'documents' bucket to authenticated role only
DROP POLICY IF EXISTS "Admins and managers can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete all documents" ON storage.objects;
DROP POLICY IF EXISTS "Managers can update all documents" ON storage.objects;
DROP POLICY IF EXISTS "Managers can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;

CREATE POLICY "Admins and managers can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND public.is_manager_or_admin());

CREATE POLICY "Managers can view all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND public.is_manager_or_admin());

CREATE POLICY "Managers can update all documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND public.is_manager_or_admin());

CREATE POLICY "Managers can delete all documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND public.is_manager_or_admin());

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
