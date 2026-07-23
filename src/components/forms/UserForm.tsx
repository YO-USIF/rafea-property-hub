import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Profile } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const userSchema = z.object({
  full_name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().optional(),
  department: z.string().min(1, 'القسم مطلوب'),
  status: z.string().min(1, 'الحالة مطلوبة'),
  password: z.string().optional().refine(
    (v) => !v || v.length >= 6,
    { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  ),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UserFormData, 'password'>) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      status: user?.status || 'نشط',
      password: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        status: user?.status || 'نشط',
        password: '',
      });
      setShowPassword(false);
    }
  }, [user, isOpen]);

  const handleSubmit = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      const { password, ...profileData } = data;
      onSubmit(profileData);

      if (user && password && password.length > 0) {
        const { error } = await supabase.functions.invoke('admin-update-user', {
          body: { userId: user.user_id, password },
        });
        if (error) throw error;
        toast({ title: 'تم تحديث كلمة المرور بنجاح' });
      }

      onClose();
      form.reset();
    } catch (e: any) {
      toast({
        title: 'خطأ في تحديث كلمة المرور',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="الإدارة">الإدارة</SelectItem>
                      <SelectItem value="المبيعات">المبيعات</SelectItem>
                      <SelectItem value="المحاسبة">المحاسبة</SelectItem>
                      <SelectItem value="التسويق">التسويق</SelectItem>
                      <SelectItem value="الصيانة">الصيانة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="غير نشط">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {user ? 'تحديث' : 'إضافة'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;