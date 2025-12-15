import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendWhatsAppParams {
  to: string;
  message: string;
}

export const useWhatsApp = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendWhatsAppMessage = async ({ to, message }: SendWhatsAppParams) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to, message }
      });

      if (error) {
        console.error('WhatsApp send error:', error);
        toast({
          title: 'خطأ في إرسال الرسالة',
          description: error.message || 'فشل في إرسال رسالة WhatsApp',
          variant: 'destructive',
        });
        return { success: false, error };
      }

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال رسالة WhatsApp بنجاح',
      });
      return { success: true, data };
    } catch (err: any) {
      console.error('WhatsApp error:', err);
      toast({
        title: 'خطأ',
        description: err.message || 'حدث خطأ أثناء إرسال الرسالة',
        variant: 'destructive',
      });
      return { success: false, error: err };
    } finally {
      setIsSending(false);
    }
  };

  const sendToMultipleUsers = async (phoneNumbers: string[], message: string) => {
    setIsSending(true);
    const results = [];
    
    for (const phone of phoneNumbers) {
      if (phone && phone.trim()) {
        const result = await sendWhatsAppMessage({ to: phone, message });
        results.push({ phone, ...result });
      }
    }
    
    setIsSending(false);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    if (successCount > 0) {
      toast({
        title: 'تم الإرسال',
        description: `تم إرسال ${successCount} رسالة بنجاح${failCount > 0 ? ` (${failCount} فشل)` : ''}`,
      });
    }
    
    return results;
  };

  const notifyUserByPhone = async (phone: string, taskTitle: string, assignedBy: string) => {
    const message = `📋 مهمة جديدة مسندة إليك

العنوان: ${taskTitle}
من: ${assignedBy}

يرجى مراجعة التفاصيل في النظام.`;

    return sendWhatsAppMessage({ to: phone, message });
  };

  return {
    sendWhatsAppMessage,
    sendToMultipleUsers,
    notifyUserByPhone,
    isSending,
  };
};
