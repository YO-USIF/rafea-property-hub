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
  const [selectedCompany, setSelectedCompany] = React.useState<'suhail' | 'tamlik'>('suhail');

  const companyInfo = {
    suhail: {
      name: 'شركة سهيل طيبة للتطوير العقاري',
      taxNumber: null,
      logo: 'س ط'
    },
    tamlik: {
      name: 'شركة تمليك الغامدي للمقاولات',
      taxNumber: '311411107300003',
      logo: 'ت غ'
    }
  };

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

        {/* Company Selection - Hidden on print */}
        <div className="mb-4 p-4 bg-muted/30 rounded-lg print:hidden">
          <label className="block text-sm font-bold mb-3">اختر الشركة للطباعة:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="company"
                value="suhail"
                checked={selectedCompany === 'suhail'}
                onChange={(e) => setSelectedCompany(e.target.value as 'suhail' | 'tamlik')}
                className="w-4 h-4"
              />
              <span className="font-medium">شركة سهيل طيبة للتطوير العقاري</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="company"
                value="tamlik"
                checked={selectedCompany === 'tamlik'}
                onChange={(e) => setSelectedCompany(e.target.value as 'suhail' | 'tamlik')}
                className="w-4 h-4"
              />
              <span className="font-medium">شركة تمليك الغامدي للمقاولات</span>
            </label>
          </div>
        </div>

        <div ref={printRef} className="print:p-8 bg-background">
          {/* Header - Company Info with Professional Design */}
          <div className="mb-6 pb-4 border-b-2 border-primary/30">
            <div className="text-center">
              {/* Company Logo Placeholder */}
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-primary">{companyInfo[selectedCompany].logo}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-primary mb-2 tracking-wide">
                {companyInfo[selectedCompany].name}
              </h1>
              
              {companyInfo[selectedCompany].taxNumber && (
                <p className="text-sm font-semibold text-foreground/70 mb-2">
                  الرقم الضريبي: {companyInfo[selectedCompany].taxNumber}
                </p>
              )}
              
              <div className="text-xs text-foreground/70 space-y-1 font-medium">
                <p>{settings?.company_address || 'المملكة العربية السعودية'}</p>
                <div className="flex justify-center gap-4 mt-1 text-xs">
                  <span>📞 {settings?.company_phone || '+966 XX XXX XXXX'}</span>
                  <span className="border-r border-muted-foreground/30"></span>
                  <span>✉️ {settings?.company_email || 'info@company.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title with Modern Badge */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-primary/15 via-primary/25 to-primary/15 px-6 py-3 rounded-xl shadow-lg border border-primary/30">
              <h2 className="text-2xl font-bold text-primary mb-1">مستخلص أعمال</h2>
              <div className="bg-background/80 px-4 py-1 rounded-lg">
                <p className="text-lg font-bold text-foreground">رقم المستخلص: {extract.extract_number}</p>
              </div>
            </div>
          </div>

          {/* Main Information Grid - Enhanced */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20 rounded-xl shadow-md border border-muted-foreground/20">
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-sm">المشروع:</span>
                <span className="font-bold text-primary text-sm">{extract.project_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-sm">المقاول:</span>
                <span className="font-bold text-primary text-sm">{extract.contractor_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-sm">التاريخ:</span>
                <span className="font-bold text-foreground text-sm">{formatDate(extract.extract_date)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-sm">الحالة:</span>
                <span className="font-bold text-primary text-sm">{extract.status}</span>
              </div>
              {extract.percentage_completed !== null && extract.percentage_completed !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                  <span className="font-bold text-foreground/80 text-sm">نسبة الإنجاز:</span>
                  <span className="font-bold text-primary text-lg">{extract.percentage_completed}%</span>
                </div>
              )}
              {extract.previous_amount !== null && extract.previous_amount !== undefined && (
                <div className="flex justify-between items-center pb-2 border-b border-primary/30">
                  <span className="font-bold text-foreground/80 text-sm">المبلغ السابق:</span>
                  <span className="font-bold text-foreground text-sm">{formatCurrency(extract.previous_amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown - Premium Design */}
          <div className="mb-6 p-4 bg-gradient-to-br from-primary/15 via-primary/10 to-background rounded-xl shadow-lg border-2 border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-primary text-center pb-2 border-b border-primary/40">التفاصيل المالية</h3>
            
            <div className="space-y-2">
              {extract.current_amount !== null && extract.current_amount !== undefined && (
                <div className="flex justify-between items-center p-2 bg-background/60 rounded-lg border border-muted">
                  <span className="text-sm font-bold text-foreground/80">المبلغ الحالي:</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(extract.current_amount)}</span>
                </div>
              )}
              
              {extract.tax_included && extract.amount_before_tax && (
                <>
                  <div className="flex justify-between items-center p-2 bg-background/60 rounded-lg border border-muted">
                    <span className="text-sm font-bold text-foreground/80">المبلغ قبل الضريبة:</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(extract.amount_before_tax)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-background/60 rounded-lg border border-muted">
                    <span className="text-sm font-bold text-foreground/80">ضريبة القيمة المضافة (15%):</span>
                    <span className="text-lg font-bold text-foreground">{formatCurrency(extract.tax_amount || 0)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/20 to-primary/30 rounded-lg border-2 border-primary/50 shadow-md mt-2">
                <span className="text-lg font-bold text-primary">إجمالي المبلغ المستحق:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(extract.amount)}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {extract.description && (
            <div className="mb-6 p-4 bg-muted/40 rounded-xl border border-muted-foreground/20">
              <h3 className="text-lg font-bold mb-2 text-primary border-b border-primary/30 pb-2">الوصف:</h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{extract.description}</p>
            </div>
          )}

          {/* Signatures Section - Professional Layout */}
          <div className="grid grid-cols-3 gap-4 mb-6 mt-8">
            <div className="text-center p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
              <div className="h-16 border-b border-foreground/30 mb-2"></div>
              <p className="font-bold text-sm text-foreground">المعد</p>
              <p className="text-xs text-foreground/60 mt-1">الاسم والتوقيع</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
              <div className="h-16 border-b border-foreground/30 mb-2"></div>
              <p className="font-bold text-sm text-foreground">المراجع</p>
              <p className="text-xs text-foreground/60 mt-1">الاسم والتوقيع</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
              <div className="h-16 border-b border-foreground/30 mb-2"></div>
              <p className="font-bold text-sm text-foreground">المعتمد</p>
              <p className="text-xs text-foreground/60 mt-1">الاسم والتوقيع</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-muted-foreground/30">
            <p className="text-xs text-foreground/60 font-medium">
              هذا المستند تم إنشاؤه إلكترونياً وهو صالح بدون توقيع أو ختم
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              {companyInfo[selectedCompany].name} - جميع الحقوق محفوظة © {new Date().getFullYear()}
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
              margin: 1cm;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:p-8 {
              padding: 1.5rem !important;
            }
            .print\\:overflow-visible {
              overflow: visible !important;
            }
            .print\\:max-h-none {
              max-height: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default ExtractPrintView;
