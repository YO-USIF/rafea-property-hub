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
  const [downloading, setDownloading] = useState(false);
  const [downloadingAttachments, setDownloadingAttachments] = useState(false);
  const [uploadingToDrive, setUploadingToDrive] = useState(false);
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
      toast({ title: "خطأ", description: "حدث خطأ أثناء جلب سجلات النسخ الاحتياطي", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupType: string) => {
    try {
      const { error } = await supabase
        .from('backup_logs')
        .insert({ backup_type: backupType, status: 'في التقدم' });
      if (error) throw error;
      toast({ title: "تم بدء النسخ الاحتياطي", description: `تم بدء نسخة احتياطية من نوع ${backupType}` });
      fetchLogs();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية", variant: "destructive" });
    }
  };

  const downloadBackup = async () => {
    try {
      setDownloading(true);
      toast({ title: "جارٍ إنشاء النسخة الاحتياطية", description: "يرجى الانتظار..." });
      const { data, error } = await supabase.functions.invoke('create-backup');
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await supabase.from('backup_logs').insert({
        backup_type: 'قاعدة البيانات',
        status: 'مكتمل',
        file_size: blob.size,
        completed_at: new Date().toISOString(),
      });

      toast({ title: "تم تحميل النسخة الاحتياطية", description: "تم تنزيل ملف قاعدة البيانات بنجاح" });
      fetchLogs();
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحميل النسخة الاحتياطية", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const downloadAttachments = async () => {
    try {
      setDownloadingAttachments(true);
      toast({ title: "جارٍ تجهيز نسخة المرفقات", description: "قد يستغرق ذلك دقائق حسب حجم الملفات..." });

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-attachments`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'فشل تحميل المرفقات');
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `attachments-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);

      toast({ title: "تم تحميل المرفقات", description: "تم تنزيل ملف ZIP للمرفقات بنجاح" });
      fetchLogs();
    } catch (error: any) {
      console.error('Error downloading attachments:', error);
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء تحميل المرفقات", variant: "destructive" });
    } finally {
      setDownloadingAttachments(false);
    }
  };

  const backupToGoogleDrive = async (silent = false) => {
    try {
      setUploadingToDrive(true);
      if (!silent) toast({ title: "جارٍ الرفع إلى Google Drive", description: "قد يستغرق ذلك عدة دقائق..." });
      const { data, error } = await supabase.functions.invoke('backup-to-gdrive');
      if (error) throw error;
      if (!silent) toast({ title: "تم الرفع بنجاح", description: `تم رفع النسختين إلى مجلد ${data?.folder || 'Google Drive'}` });
      fetchLogs();
      return true;
    } catch (error: any) {
      console.error('Error backing up to Drive:', error);
      if (!silent) toast({ title: "خطأ في الرفع", description: error.message || "تعذر الرفع إلى Google Drive", variant: "destructive" });
      return false;
    } finally {
      setUploadingToDrive(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return {
    logs,
    loading,
    downloading,
    downloadingAttachments,
    uploadingToDrive,
    fetchLogs,
    createBackup,
    downloadBackup,
    downloadAttachments,
    backupToGoogleDrive,
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