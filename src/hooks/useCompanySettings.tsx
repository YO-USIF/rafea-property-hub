import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CompanySettings {
  id: string;
  company_name: string;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  currency: string | null;
  timezone: string | null;
  language: string | null;
  date_format: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings(data);
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب إعدادات الشركة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('company_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الشركة بنجاح",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث إعدادات الشركة",
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