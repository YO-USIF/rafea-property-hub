import { z } from 'zod';

// رسائل الخطأ المخصصة بالعربية
const errorMessages = {
  required: 'هذا الحقل مطلوب',
  invalidEmail: 'البريد الإلكتروني غير صحيح',
  invalidPhone: 'رقم الهاتف غير صحيح',
  positiveNumber: 'يجب أن يكون الرقم أكبر من صفر',
  minLength: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
  maxLength: (max: number) => `يجب أن لا يتجاوز ${max} حرف`,
  invalidDate: 'التاريخ غير صحيح',
};

// نظام التحقق من صحة نموذج المبيعات
export const saleFormSchema = z.object({
  customer_name: z.string()
    .trim()
    .min(2, { message: errorMessages.minLength(2) })
    .max(255, { message: errorMessages.maxLength(255) }),
  
  customer_phone: z.string()
    .trim()
    .regex(/^(05|5)\d{8}$/, { message: errorMessages.invalidPhone })
    .optional()
    .or(z.literal('')),
  
  customer_id_number: z.string()
    .trim()
    .regex(/^\d{10}$/, { message: 'رقم الهوية يجب أن يكون 10 أرقام' })
    .optional()
    .or(z.literal('')),
  
  marketer_name: z.string()
    .trim()
    .max(255, { message: errorMessages.maxLength(255) })
    .optional()
    .or(z.literal('')),
  
  project_id: z.string().optional(),
  
  project_name: z.string()
    .trim()
    .min(2, { message: errorMessages.minLength(2) })
    .max(255, { message: errorMessages.maxLength(255) }),
  
  unit_number: z.string()
    .trim()
    .min(1, { message: errorMessages.required })
    .max(50, { message: errorMessages.maxLength(50) }),
  
  unit_type: z.enum(['شقة', 'فيلا', 'أرض', 'محل تجاري', 'مكتب', 'مستودع'], {
    errorMap: () => ({ message: 'نوع الوحدة غير صحيح' })
  }),
  
  area: z.number()
    .positive({ message: errorMessages.positiveNumber })
    .max(100000, { message: 'المساحة يجب أن تكون أقل من 100,000' }),
  
  price: z.number()
    .positive({ message: errorMessages.positiveNumber })
    .max(1000000000, { message: 'السعر يجب أن يكون أقل من مليار' }),
  
  remaining_amount: z.number()
    .min(0, { message: 'المبلغ المتبقي لا يمكن أن يكون سالباً' })
    .optional(),
  
  status: z.enum(['متاح', 'محجوز', 'مباع'], {
    errorMap: () => ({ message: 'الحالة غير صحيحة' })
  }),
  
  sale_date: z.string().optional().or(z.literal('')),
  
  installment_plan: z.string()
    .max(500, { message: errorMessages.maxLength(500) })
    .optional()
    .or(z.literal('')),
});

// نظام التحقق من صحة نموذج الفواتير
export const invoiceFormSchema = z.object({
  invoice_number: z.string()
    .trim()
    .min(1, { message: errorMessages.required })
    .max(50, { message: errorMessages.maxLength(50) }),
  
  supplier_name: z.string()
    .trim()
    .min(2, { message: errorMessages.minLength(2) })
    .max(255, { message: errorMessages.maxLength(255) }),
  
  project_id: z.string().nullable().optional(),
  
  amount: z.number()
    .positive({ message: errorMessages.positiveNumber })
    .max(1000000000, { message: 'المبلغ يجب أن يكون أقل من مليار' }),
  
  description: z.string()
    .trim()
    .max(1000, { message: errorMessages.maxLength(1000) })
    .optional()
    .or(z.literal('')),
  
  invoice_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: errorMessages.invalidDate }),
  
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: errorMessages.invalidDate }),
  
  status: z.enum(['مدفوع', 'غير مدفوع', 'مدفوع جزئياً'], {
    errorMap: () => ({ message: 'الحالة غير صحيحة' })
  }),
  
  attached_file_url: z.string().optional(),
  attached_file_name: z.string().optional(),
}).refine((data) => {
  // التحقق من أن تاريخ الاستحقاق بعد أو يساوي تاريخ الفاتورة
  if (data.invoice_date && data.due_date) {
    return new Date(data.due_date) >= new Date(data.invoice_date);
  }
  return true;
}, {
  message: 'تاريخ الاستحقاق يجب أن يكون بعد أو يساوي تاريخ الفاتورة',
  path: ['due_date'],
});

// نظام التحقق من صحة نموذج المستخلصات
export const extractFormSchema = z.object({
  extract_number: z.string()
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
  
  extract_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: errorMessages.invalidDate }),
  
  status: z.enum(['قيد المراجعة', 'معتمد', 'مرفوض', 'مدفوع'], {
    errorMap: () => ({ message: 'الحالة غير صحيحة' })
  }),
  
  percentage_completed: z.number()
    .min(0, { message: 'النسبة لا يمكن أن تكون سالبة' })
    .max(100, { message: 'النسبة لا يمكن أن تتجاوز 100%' })
    .optional(),
  
  current_amount: z.number()
    .min(0, { message: 'المبلغ الحالي لا يمكن أن يكون سالباً' })
    .optional(),
  
  previous_amount: z.number()
    .min(0, { message: 'المبلغ السابق لا يمكن أن يكون سالباً' })
    .optional(),
  
  attached_file_url: z.string().optional(),
  attached_file_name: z.string().optional(),
}).refine((data) => {
  // التحقق من أن المبلغ قبل الضريبة + الضريبة = المبلغ الإجمالي (إذا كانت الضريبة مفعلة)
  if (data.tax_included && data.amount_before_tax !== undefined && data.tax_amount !== undefined) {
    const calculatedTotal = data.amount_before_tax + data.tax_amount;
    return Math.abs(calculatedTotal - data.amount) < 0.01; // تسامح صغير للأخطاء العشرية
  }
  return true;
}, {
  message: 'مجموع المبلغ قبل الضريبة والضريبة يجب أن يساوي المبلغ الإجمالي',
  path: ['amount'],
});

export type SaleFormData = z.infer<typeof saleFormSchema>;
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type ExtractFormData = z.infer<typeof extractFormSchema>;
