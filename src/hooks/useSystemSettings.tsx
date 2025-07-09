import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BackupLog {
  id: string;
  backup_type: string;
  status: string;
  file_path: string | null;
  file_size: number | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SecuritySettings {
  id: string;
  password_min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  session_timeout: number;
  max_login_attempts: number;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useBackupLogs = () => {
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('backup_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching backup logs:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب سجلات النسخ الاحتياطي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupType: string) => {
    try {
      const { error } = await supabase
        .from('backup_logs')
        .insert({
          backup_type: backupType,
          status: 'في التقدم',
        });

      if (error) throw error;

      toast({
        title: "تم بدء النسخ الاحتياطي",
        description: `تم بدء نسخة احتياطية من نوع ${backupType}`,
      });

      fetchLogs();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    fetchLogs,
    createBackup,
  };
};

export const useSecuritySettings = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      setSettings(data);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب إعدادات الأمان",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SecuritySettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('security_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الأمان بنجاح",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث إعدادات الأمان",
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