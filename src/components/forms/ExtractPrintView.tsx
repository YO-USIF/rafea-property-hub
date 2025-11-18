import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface ExtractPrintViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extract: any;
}

const ExtractPrintView = ({ open, onOpenChange, extract }: ExtractPrintViewProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useCompanySettings();

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!extract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:overflow-visible print:max-h-none">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span>طباعة المستخلص</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} size="sm">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={() => onOpenChange(false)} size="sm" variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="print:p-8">
          {/* Header - Company Info */}
          <div className="text-center mb-8 pb-6 border-b-2 border-primary">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {settings?.company_name || 'شركة رافع للتطوير العقاري'}
            </h1>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{settings?.company_address || 'الرياض، المملكة العربية السعودية'}</p>
              <p>
                هاتف: {settings?.company_phone || '+966 11 234 5678'} | 
                البريد الإلكتروني: {settings?.company_email || 'info@rafaa.com'}
              </p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">مستخلص أعمال</h2>
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-lg">
              <p className="text-lg font-semibold">رقم المستخلص: {extract.extract_number}</p>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-6 bg-muted/30 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">المشروع:</span>
                <span className="font-bold">{extract.project_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">المقاول:</span>
                <span className="font-bold">{extract.contractor_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">التاريخ:</span>
                <span className="font-bold">{formatDate(extract.extract_date)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">نسبة الإنجاز:</span>
                <span className="font-bold">{extract.percentage_completed || 0}%</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">الحالة:</span>
                <span className={`font-bold ${
                  extract.status === 'معتمد' ? 'text-green-600' : 
                  extract.status === 'مرفوض' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {extract.status}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">المبلغ السابق:</span>
                <span className="font-bold">{formatCurrency(extract.previous_amount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="mb-6 border-2 border-primary/20 rounded-lg overflow-hidden">
            <div className="bg-primary/10 px-6 py-3">
              <h3 className="text-lg font-bold">التفاصيل المالية</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-lg font-semibold">المبلغ الحالي:</span>
                <span className="text-xl font-bold">{formatCurrency(extract.current_amount || 0)}</span>
              </div>

              {extract.tax_included && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900">تفاصيل ضريبة القيمة المضافة (15%)</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-muted-foreground">المبلغ قبل الضريبة:</span>
                      <span className="font-bold text-lg">{formatCurrency(extract.amount_before_tax || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-muted-foreground">قيمة الضريبة (15%):</span>
                      <span className="font-bold text-lg text-blue-700">{formatCurrency(extract.tax_amount || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-blue-300">
                      <span className="text-lg font-bold text-blue-900">المبلغ شامل الضريبة:</span>
                      <span className="text-2xl font-bold text-blue-900">{formatCurrency(extract.amount || 0)}</span>
                    </div>
                  </div>
                </>
              )}

              {!extract.tax_included && (
                <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                  <span className="text-lg font-bold">المبلغ الإجمالي:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(extract.amount || 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {extract.description && (
            <div className="mb-6 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-bold mb-3">الوصف:</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {extract.description}
              </p>
            </div>
          )}

          {/* Footer - Signatures */}
          <div className="mt-12 pt-8 border-t-2 border-muted">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <p className="font-semibold">المدير المالي</p>
                <div className="border-t-2 border-muted-foreground pt-2 mt-12">
                  <p className="text-sm text-muted-foreground">التوقيع</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-semibold">مدير المشروع</p>
                <div className="border-t-2 border-muted-foreground pt-2 mt-12">
                  <p className="text-sm text-muted-foreground">التوقيع</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-semibold">المدير العام</p>
                <div className="border-t-2 border-muted-foreground pt-2 mt-12">
                  <p className="text-sm text-muted-foreground">التوقيع</p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>تم الطباعة بتاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
            <p className="mt-1">هذا المستند تم إنشاؤه إلكترونياً ولا يحتاج لتوقيع أو ختم</p>
          </div>
        </div>
      </DialogContent>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print\\:p-8,
          .print\\:p-8 * {
            visibility: visible;
          }
          
          .print\\:p-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
};

export default ExtractPrintView;
