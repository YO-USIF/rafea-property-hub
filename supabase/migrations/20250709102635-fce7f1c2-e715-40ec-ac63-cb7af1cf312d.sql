-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin users can create notifications" ON public.notifications 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their own notifications" ON public.notifications 
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for notification_settings
CREATE POLICY "Users can view their own notification settings" ON public.notification_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON public.notification_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON public.notification_settings 
FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for backup_logs
CREATE POLICY "Admin users can view backup logs" ON public.backup_logs 
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin users can create backup logs" ON public.backup_logs 
FOR INSERT WITH CHECK (public.is_admin());

-- Create RLS policies for security_settings
CREATE POLICY "Admin users can view security settings" ON public.security_settings 
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin users can update security settings" ON public.security_settings 
FOR UPDATE USING (public.is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();