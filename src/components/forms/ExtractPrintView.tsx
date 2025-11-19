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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:overflow-visible print:max-h-none">
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

        <div ref={printRef} className="print:p-12 bg-background">
          {/* Header - Company Info with Professional Design */}
          <div className="mb-10 pb-8 border-b-4 border-primary/30">
            <div className="text-center">
              {/* Company Logo Placeholder */}
              <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-primary">س ط</span>
              </div>
              
              <h1 className="text-4xl font-bold text-primary mb-4 tracking-wide">
                {settings?.company_name || 'شركة سهيل طيبة للتطوير العقاري'}
              </h1>
              
              <div className="text-sm text-foreground/70 space-y-2 font-medium">
                <p className="text-base">{settings?.company_address || 'المملكة العربية السعودية'}</p>
                <div className="flex justify-center gap-8 mt-3 text-base">
                  <span>📞 {settings?.company_phone || '+966 XX XXX XXXX'}</span>
                  <span className="border-r-2 border-muted-foreground/30"></span>
                  <span>✉️ {settings?.company_email || 'info@suhail-taiba.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title with Modern Badge */}
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-primary/15 via-primary/25 to-primary/15 px-10 py-5 rounded-2xl shadow-xl border-2 border-primary/30">
              <h2 className="text-3xl font-bold text-primary mb-3">مستخلص أعمال</h2>
              <div className="bg-background/80 px-6 py-2 rounded-lg">
                <p className="text-xl font-bold text-foreground">رقم المستخلص: {extract.extract_number}</p>
              </div>
            </div>
          </div>

          {/* Main Information Grid - Enhanced */}
          <div className="grid grid-cols-2 gap-8 mb-10 p-8 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20 rounded-2xl shadow-lg border-2 border-muted-foreground/20">
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                <span className="font-bold text-foreground/80 text-lg">المشروع:</span>
                <span className="font-bold text-primary text-lg">{extract.project_name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                <span className="font-bold text-foreground/80 text-lg">المقاول:</span>
                <span className="font-bold text-primary text-lg">{extract.contractor_name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                <span className="font-bold text-foreground/80 text-lg">التاريخ:</span>
                <span className="font-bold text-foreground text-lg">{formatDate(extract.extract_date)}</span>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                <span className="font-bold text-foreground/80 text-lg">الحالة:</span>
                <span className="font-bold text-primary text-lg">{extract.status}</span>
              </div>
              {extract.percentage_completed !== null && extract.percentage_completed !== undefined && (
                <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                  <span className="font-bold text-foreground/80 text-lg">نسبة الإنجاز:</span>
                  <span className="font-bold text-primary text-2xl">{extract.percentage_completed}%</span>
                </div>
              )}
              {extract.previous_amount !== null && extract.previous_amount !== undefined && (
                <div className="flex justify-between items-center pb-3 border-b-2 border-primary/30">
                  <span className="font-bold text-foreground/80 text-lg">المبلغ السابق:</span>
                  <span className="font-bold text-foreground text-lg">{formatCurrency(extract.previous_amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown - Premium Design */}
          <div className="mb-10 p-8 bg-gradient-to-br from-primary/15 via-primary/10 to-background rounded-2xl shadow-2xl border-4 border-primary/30">
            <h3 className="text-3xl font-bold mb-8 text-primary text-center pb-5 border-b-2 border-primary/40">التفاصيل المالية</h3>
            
            <div className="space-y-5">
              {extract.current_amount !== null && extract.current_amount !== undefined && (
                <div className="flex justify-between items-center p-5 bg-background/60 rounded-xl border-2 border-muted">
                  <span className="text-lg font-bold text-foreground/80">المبلغ الحالي:</span>
                  <span className="text-2xl font-bold text-foreground">{formatCurrency(extract.current_amount)}</span>
                </div>
              )}
              
              {extract.tax_included && extract.amount_before_tax && (
                <>
                  <div className="flex justify-between items-center p-5 bg-background/60 rounded-xl border-2 border-muted">
                    <span className="text-lg font-bold text-foreground/80">المبلغ قبل الضريبة:</span>
                    <span className="text-2xl font-bold text-foreground">{formatCurrency(extract.amount_before_tax)}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-background/60 rounded-xl border-2 border-muted">
                    <span className="text-lg font-bold text-foreground/80">ضريبة القيمة المضافة (15%):</span>
                    <span className="text-2xl font-bold text-foreground">{formatCurrency(extract.tax_amount || 0)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-primary/20 to-primary/30 rounded-xl border-4 border-primary/50 shadow-lg mt-6">
                <span className="text-2xl font-bold text-primary">إجمالي المبلغ المستحق:</span>
                <span className="text-3xl font-bold text-primary">{formatCurrency(extract.amount)}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {extract.description && (
            <div className="mb-10 p-8 bg-muted/40 rounded-2xl border-2 border-muted-foreground/20">
              <h3 className="text-2xl font-bold mb-5 text-primary border-b-2 border-primary/30 pb-3">الوصف:</h3>
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{extract.description}</p>
            </div>
          )}

          {/* Signatures Section - Professional Layout */}
          <div className="grid grid-cols-3 gap-8 mb-10 mt-16">
            <div className="text-center p-6 bg-muted/30 rounded-xl border-2 border-muted-foreground/20">
              <div className="h-24 border-b-2 border-foreground/30 mb-4"></div>
              <p className="font-bold text-lg text-foreground">المعد</p>
              <p className="text-sm text-foreground/60 mt-2">الاسم والتوقيع</p>
            </div>
            <div className="text-center p-6 bg-muted/30 rounded-xl border-2 border-muted-foreground/20">
              <div className="h-24 border-b-2 border-foreground/30 mb-4"></div>
              <p className="font-bold text-lg text-foreground">المراجع</p>
              <p className="text-sm text-foreground/60 mt-2">الاسم والتوقيع</p>
            </div>
            <div className="text-center p-6 bg-muted/30 rounded-xl border-2 border-muted-foreground/20">
              <div className="h-24 border-b-2 border-foreground/30 mb-4"></div>
              <p className="font-bold text-lg text-foreground">المعتمد</p>
              <p className="text-sm text-foreground/60 mt-2">الاسم والتوقيع</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t-2 border-muted-foreground/30 print:mt-8">
            <p className="text-sm text-foreground/60 font-medium">
              هذا المستند تم إنشاؤه إلكترونياً وهو صالح بدون توقيع أو ختم
            </p>
            <p className="text-xs text-foreground/50 mt-2">
              {settings?.company_name || 'شركة سهيل طيبة للتطوير العقاري'} - جميع الحقوق محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:p-12 {
              padding: 3rem !important;
            }
            .print\\:overflow-visible {
              overflow: visible !important;
            }
            .print\\:max-h-none {
              max-height: none !important;
            }
            .print\\:mt-8 {
              margin-top: 2rem !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractPrintView;
