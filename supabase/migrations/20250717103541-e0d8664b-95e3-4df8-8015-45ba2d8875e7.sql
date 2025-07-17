-- إضافة جدول تقارير المهام للمسؤولين
CREATE TABLE public.task_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.task_reports ENABLE ROW LEVEL SECURITY;

-- سياسة للمسؤولين لإنشاء التقارير
CREATE POLICY "Admins can create task reports" 
ON public.task_reports 
FOR INSERT 
USING (is_admin() OR is_manager_or_admin());

-- سياسة لجميع المستخدمين لقراءة التقارير
CREATE POLICY "Users can view task reports" 
ON public.task_reports 
FOR SELECT 
USING (true);

-- سياسة للمسؤولين لتحديث التقارير
CREATE POLICY "Admins can update task reports" 
ON public.task_reports 
FOR UPDATE 
USING (is_admin() OR is_manager_or_admin());

-- سياسة للمسؤولين لحذف التقارير
CREATE POLICY "Admins can delete task reports" 
ON public.task_reports 
FOR DELETE 
USING (is_admin() OR is_manager_or_admin());

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_task_reports_updated_at
BEFORE UPDATE ON public.task_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();