
DROP POLICY IF EXISTS "System can insert access logs" ON public.customer_access_logs;

CREATE POLICY "Users can only log their own access"
ON public.customer_access_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
