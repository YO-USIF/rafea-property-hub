-- Fix the infinite recursion issue by creating security definer functions
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin users can update company settings" ON public.company_settings;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'مدير النظام'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_role public.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate user_roles policies without recursion
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);

CREATE POLICY "Admin users can insert roles" ON public.user_roles 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update roles" ON public.user_roles 
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin users can delete roles" ON public.user_roles 
FOR DELETE USING (public.is_admin());

-- Recreate company_settings policies without recursion
CREATE POLICY "Admin users can update company settings" ON public.company_settings 
FOR UPDATE USING (public.is_admin());

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  daily_summary BOOLEAN NOT NULL DEFAULT true,
  weekly_report BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backup logs table
CREATE TABLE public.backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_path TEXT,
  file_size BIGINT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create security settings table
CREATE TABLE public.security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_min_length INTEGER NOT NULL DEFAULT 8,
  require_uppercase BOOLEAN NOT NULL DEFAULT true,
  require_lowercase BOOLEAN NOT NULL DEFAULT true,
  require_numbers BOOLEAN NOT NULL DEFAULT true,
  require_special_chars BOOLEAN NOT NULL DEFAULT true,
  session_timeout INTEGER NOT NULL DEFAULT 30,
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default security settings
INSERT INTO public.security_settings (password_min_length) VALUES (8);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

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