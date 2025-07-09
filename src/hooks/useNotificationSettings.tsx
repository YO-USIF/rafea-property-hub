import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب إعدادات الإشعارات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      if (!settings) {
        // Create new settings - include user_id from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { error } = await supabase
          .from('notification_settings')
          .insert({ ...updates, user_id: user.id });

        if (error) throw error;
      } else {
        // Update existing settings
        const { error } = await supabase
          .from('notification_settings')
          .update(updates)
          .eq('id', settings.id);

        if (error) throw error;
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الإشعارات بنجاح",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث إعدادات الإشعارات",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings,
  };
};