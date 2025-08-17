import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Users, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profiles } = useProfiles();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان ونص الإشعار",
        variant: "destructive",
      });
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مستخدمين أو إرسال للجميع",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // استخدام Supabase client بدلاً من fetch مباشر
      const { data: userToken } = await supabase.auth.getSession();
      if (!userToken.session) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      const response = await supabase.functions.invoke('send-notifications', {
        body: {
          title,
          message,
          type,
          sendToAll,
          selectedUsers: sendToAll ? [] : selectedUsers
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'فشل في إرسال الإشعارات');
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: sendToAll 
          ? "تم إرسال الإشعار لجميع المستخدمين" 
          : `تم إرسال الإشعار لـ ${selectedUsers.length} مستخدم`,
      });

      // إعادة تعيين النموذج
      setTitle('');
      setMessage('');
      setType('info');
      setSendToAll(true);
      setSelectedUsers([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الإشعارات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === profiles.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(profiles.map(profile => profile.user_id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            إرسال إشعار جديد
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عنوان الإشعار */}
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الإشعار</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الإشعار"
              required
            />
          </div>

          {/* نص الإشعار */}
          <div className="space-y-2">
            <Label htmlFor="message">نص الإشعار</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="أدخل نص الإشعار"
              rows={4}
              required
            />
          </div>

          {/* نوع الإشعار */}
          <div className="space-y-2">
            <Label htmlFor="type">نوع الإشعار</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">معلومات</SelectItem>
                <SelectItem value="success">نجاح</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* اختيار المستقبلين */}
          <div className="space-y-4">
            <Label>المستقبلون</Label>
            
            {/* إرسال للجميع */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={(checked) => {
                  setSendToAll(checked as boolean);
                  if (checked) {
                    setSelectedUsers([]);
                  }
                }}
              />
              <Label htmlFor="sendToAll" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                إرسال لجميع المستخدمين
              </Label>
            </div>

            {/* اختيار مستخدمين محددين */}
            {!sendToAll && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    اختيار مستخدمين محددين
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedUsers.length === profiles.length ? 'إلغاء الكل' : 'اختيار الكل'}
                  </Button>
                </div>
                
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {profiles.map((profile) => (
                    <div key={profile.user_id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={profile.user_id}
                        checked={selectedUsers.includes(profile.user_id)}
                        onCheckedChange={(checked) => 
                          handleUserSelection(profile.user_id, checked as boolean)
                        }
                      />
                      <Label htmlFor={profile.user_id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>{profile.full_name || profile.email}</span>
                          <span className="text-xs text-muted-foreground">
                            {profile.roles?.[0] || 'موظف'}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedUsers.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    تم اختيار {selectedUsers.length} مستخدم
                  </p>
                )}
              </div>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  جارٍ الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الإشعار
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationForm;