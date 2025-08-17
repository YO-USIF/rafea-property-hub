import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const createNotificationMutation = useMutation({
    mutationFn: async ({ 
      title, 
      message, 
      type = 'info', 
      targetUserId 
    }: {
      title: string;
      message: string;
      type?: string;
      targetUserId?: string;
    }) => {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title,
          message,
          type,
          user_id: targetUserId || user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const sendBulkNotificationsMutation = useMutation({
    mutationFn: async ({ 
      title, 
      message, 
      type = 'info', 
      sendToAll,
      selectedUsers 
    }: {
      title: string;
      message: string;
      type?: string;
      sendToAll: boolean;
      selectedUsers?: string[];
    }) => {
      // استخدام Edge Function لإرسال الإشعارات المتعددة
      const response = await fetch(`https://dwinqajspowvbkvzbbbn.supabase.co/functions/v1/send-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aW5xYWpzcG93dmJrdnpiYmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTE2MTAsImV4cCI6MjA2NzM4NzYxMH0.dhj2iMZ5IfZUzOW5gAUWyGsnmnTJqMDeA1Rzzh7XXjc`
        },
        body: JSON.stringify({
          title,
          message,
          type,
          sendToAll,
          selectedUsers: sendToAll ? [] : selectedUsers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في إرسال الإشعارات');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Helper function to create common notifications based on real data
  const createNotification = {
    taskCompleted: (taskTitle: string, assignedTo: string) => {
      createNotificationMutation.mutate({
        title: 'مهمة مكتملة',
        message: `تم إنجاز المهمة "${taskTitle}" بواسطة ${assignedTo}`,
        type: 'success'
      });
    },
    taskAssigned: (taskTitle: string, assignedTo: string) => {
      createNotificationMutation.mutate({
        title: 'مهمة جديدة',
        message: `تم تعيين مهمة جديدة "${taskTitle}" إلى ${assignedTo}`,
        type: 'info'
      });
    },
    taskOverdue: (taskTitle: string) => {
      createNotificationMutation.mutate({
        title: 'مهمة متأخرة',
        message: `المهمة "${taskTitle}" متأخرة عن موعدها المحدد`,
        type: 'warning'
      });
    },
    projectAdded: (projectName: string) => {
      createNotificationMutation.mutate({
        title: 'مشروع جديد',
        message: `تم إضافة مشروع جديد: ${projectName}`,
        type: 'success'
      });
    },
    saleCompleted: (unitNumber: string, projectName: string) => {
      createNotificationMutation.mutate({
        title: 'عملية بيع جديدة',
        message: `تم بيع الوحدة ${unitNumber} في مشروع ${projectName}`,
        type: 'success'
      });
    },
    maintenanceRequest: (issueType: string, buildingName: string) => {
      createNotificationMutation.mutate({
        title: 'طلب صيانة جديد',
        message: `طلب صيانة ${issueType} في ${buildingName}`,
        type: 'warning'
      });
    },
    invoiceDue: (supplierName: string, amount: number) => {
      createNotificationMutation.mutate({
        title: 'فاتورة مستحقة',
        message: `فاتورة من ${supplierName} بقيمة ${amount} ريال مستحقة الدفع`,
        type: 'warning'
      });
    },
    contractorAdded: (contractorName: string) => {
      createNotificationMutation.mutate({
        title: 'مقاول جديد',
        message: `تم إضافة مقاول جديد: ${contractorName}`,
        type: 'info'
      });
    },
    reportCreated: (reportTitle: string) => {
      createNotificationMutation.mutate({
        title: 'تقرير جديد',
        message: `تم إنشاء تقرير جديد: ${reportTitle}`,
        type: 'info'
      });
    }
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    createNotification,
    createCustomNotification: createNotificationMutation.mutate,
    sendBulkNotifications: sendBulkNotificationsMutation.mutate,
    isSendingBulk: sendBulkNotificationsMutation.isPending
  };
};