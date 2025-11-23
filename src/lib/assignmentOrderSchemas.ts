import { z } from 'zod';

const errorMessages = {
  required: 'هذا الحقل مطلوب',
  minLength: (min: number) => `يجب أن يحتوي على ${min} حروف على الأقل`,
  maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
  positiveNumber: 'يجب أن يكون رقماً موجباً',
  invalidDate: 'تاريخ غير صحيح',
};

export const assignmentOrderSchema = z.object({
  order_number: z.string()
    .trim()
    .max(50, { message: errorMessages.maxLength(50) })
    .optional()
    .or(z.literal('')),
  
  contractor_name: z.string()
    .trim()
    .min(2, { message: errorMessages.minLength(2) })
    .max(255, { message: errorMessages.maxLength(255) }),
  
  project_name: z.string()
    .trim()
    .min(2, { message: errorMessages.minLength(2) })
    .max(255, { message: errorMessages.maxLength(255) }),
  
  project_id: z.string().nullable().optional(),
  
  amount: z.number()
    .positive({ message: errorMessages.positiveNumber })
    .max(1000000000, { message: 'المبلغ يجب أن يكون أقل من مليار' }),
  
  amount_before_tax: z.number()
    .min(0, { message: 'المبلغ قبل الضريبة لا يمكن أن يكون سالباً' })
    .optional(),
  
  tax_amount: z.number()
    .min(0, { message: 'قيمة الضريبة لا يمكن أن تكون سالبة' })
    .optional(),
  
  tax_included: z.boolean().optional(),
  
  description: z.string()
    .trim()
    .max(1000, { message: errorMessages.maxLength(1000) })
    .optional()
    .or(z.literal('')),
  
  order_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: errorMessages.invalidDate }),
  
  status: z.enum(['قيد التنفيذ', 'مكتمل', 'ملغي'], {
    errorMap: () => ({ message: 'الحالة غير صحيحة' })
  }),
  
  work_type: z.string()
    .trim()
    .max(100, { message: errorMessages.maxLength(100) })
    .optional()
    .or(z.literal('')),
  
  duration_days: z.number()
    .min(0, { message: 'المدة لا يمكن أن تكون سالبة' })
    .optional(),
  
  attached_file_url: z.string().optional(),
  attached_file_name: z.string().optional(),
}).refine((data) => {
  if (data.tax_included && data.amount_before_tax !== undefined && data.tax_amount !== undefined) {
    const calculatedTotal = data.amount_before_tax + data.tax_amount;
    return Math.abs(calculatedTotal - data.amount) < 0.01;
  }
  return true;
}, {
  message: 'مجموع المبلغ قبل الضريبة والضريبة يجب أن يساوي المبلغ الإجمالي',
  path: ['amount'],
});

export type AssignmentOrderFormData = z.infer<typeof assignmentOrderSchema>;
