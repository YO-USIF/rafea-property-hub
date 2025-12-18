import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import suhailLogo from '@/assets/suhail-logo.jpeg';
import adminSignature from '@/assets/admin-signature.jpeg';
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
      logo: suhailLogo
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
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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

        <div ref={printRef} className="print:p-6 bg-background">
          {/* Header - Company Info with Professional Design */}
          <div className="mb-4 pb-3 border-b-2 border-primary/30">
            <div className="text-center">
              {/* Company Logo */}
              <div className="w-24 h-24 mx-auto mb-2">
                {selectedCompany === 'suhail' ? (
                  <img src={companyInfo[selectedCompany].logo} alt="Suhail Taybah Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-primary">{companyInfo[selectedCompany].logo}</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-primary mb-1 tracking-wide">
                {companyInfo[selectedCompany].name}
              </h1>
              
              {companyInfo[selectedCompany].taxNumber && (
                <p className="text-xs font-semibold text-foreground/70 mb-1">
                  الرقم الضريبي: {companyInfo[selectedCompany].taxNumber}
                </p>
              )}
              
              <div className="text-[10px] text-foreground/70 font-medium">
                <p>المدينة المنورة - المملكة العربية السعودية</p>
                <div className="flex justify-center gap-3 mt-0.5">
                  <span>✉️ {settings?.company_email || 'info@company.com'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Title with Modern Badge */}
          <div className="text-center mb-3">
            <div className="inline-block bg-gradient-to-r from-primary/15 via-primary/25 to-primary/15 px-4 py-2 rounded-lg shadow-md border border-primary/30">
              <h2 className="text-xl font-bold text-primary mb-0.5">مستخلص أعمال</h2>
              <div className="bg-background/80 px-3 py-0.5 rounded">
                <p className="text-base font-bold text-foreground">رقم المستخلص: {extract.extract_number}</p>
              </div>
            </div>
          </div>

          {/* Main Information Grid - Enhanced */}
          <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20 rounded-lg shadow-sm border border-muted-foreground/20">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-xs">المشروع:</span>
                <span className="font-bold text-primary text-xs">{extract.project_name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-xs">المقاول:</span>
                <span className="font-bold text-primary text-xs">{extract.contractor_name}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-xs">التاريخ:</span>
                <span className="font-bold text-foreground text-xs">{formatDate(extract.extract_date)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                <span className="font-bold text-foreground/80 text-xs">الحالة:</span>
                <span className="font-bold text-primary text-xs">{extract.status}</span>
              </div>
              {extract.percentage_completed !== null && extract.percentage_completed !== undefined && (
                <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                  <span className="font-bold text-foreground/80 text-xs">نسبة الإنجاز:</span>
                  <span className="font-bold text-primary text-base">{extract.percentage_completed}%</span>
                </div>
              )}
              {extract.previous_amount !== null && extract.previous_amount !== undefined && (
                <div className="flex justify-between items-center pb-1.5 border-b border-primary/30">
                  <span className="font-bold text-foreground/80 text-xs">المبلغ السابق:</span>
                  <span className="font-bold text-foreground text-xs">{formatCurrency(extract.previous_amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown - Premium Design */}
          <div className="mb-3 p-3 bg-gradient-to-br from-primary/15 via-primary/10 to-background rounded-lg shadow-md border-2 border-primary/30">
            <h3 className="text-base font-bold mb-2 text-primary text-center pb-1.5 border-b border-primary/40">التفاصيل المالية</h3>
            
            <div className="space-y-1.5">
              {extract.previous_amount !== null && extract.previous_amount !== undefined && extract.previous_amount > 0 && (
                <div className="flex justify-between items-center p-1.5 bg-background/60 rounded border border-muted">
                  <span className="text-xs font-bold text-foreground/80">المبلغ المدفوع سابقاً:</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(extract.previous_amount)}</span>
                </div>
              )}
              
              {extract.current_amount !== null && extract.current_amount !== undefined && (
                <div className="flex justify-between items-center p-1.5 bg-background/60 rounded border border-muted">
                  <span className="text-xs font-bold text-foreground/80">قيمة المستخلص الحالي:</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(extract.current_amount)}</span>
                </div>
              )}
              
              {extract.tax_included && (
                <>
                  {(() => {
                    // حساب المبالغ ديناميكياً لضمان الدقة
                    const amountBeforeTax = (extract.previous_amount || 0) + (extract.current_amount || 0);
                    const taxAmount = amountBeforeTax * 0.15;
                    const totalWithTax = amountBeforeTax + taxAmount;
                    return (
                      <>
                        <div className="flex justify-between items-center p-1.5 bg-primary/10 rounded border border-primary/30">
                          <span className="text-xs font-bold text-foreground/80">إجمالي المبلغ قبل الضريبة:</span>
                          <span className="text-sm font-bold text-foreground">{formatCurrency(amountBeforeTax)}</span>
                        </div>
                        <div className="flex justify-between items-center p-1.5 bg-background/60 rounded border border-muted">
                          <span className="text-xs font-bold text-foreground/80">ضريبة القيمة المضافة (15%):</span>
                          <span className="text-sm font-bold text-foreground">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-primary/20 to-primary/30 rounded border-2 border-primary/50 shadow-sm mt-1">
                          <span className="text-sm font-bold text-primary">إجمالي المبلغ شامل الضريبة:</span>
                          <span className="text-lg font-bold text-primary">{formatCurrency(totalWithTax)}</span>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
              
              {!extract.tax_included && (
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-primary/20 to-primary/30 rounded border-2 border-primary/50 shadow-sm mt-1">
                  <span className="text-sm font-bold text-primary">إجمالي المبلغ:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(extract.amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          {extract.description && (
            <div className="mb-3 p-2.5 bg-muted/40 rounded-lg border border-muted-foreground/20">
              <h3 className="text-sm font-bold mb-1.5 text-primary border-b border-primary/30 pb-1">الوصف:</h3>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{extract.description}</p>
            </div>
          )}

          {/* Signatures Section - Professional Layout */}
          <div className="grid grid-cols-3 gap-3 mb-3 mt-4">
            <div className="text-center p-2 bg-muted/30 rounded border border-muted-foreground/20">
              <p className="font-bold text-xs text-primary mb-1">{extract.created_by_name || 'غير معروف'}</p>
              <div className="h-10 border-b border-foreground/30 mb-1.5"></div>
              <p className="font-bold text-xs text-foreground">المُعد</p>
              <p className="text-[10px] text-foreground/60 mt-0.5">التوقيع</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded border border-muted-foreground/20">
              <p className="font-bold text-xs text-primary mb-1">المراجع</p>
              <div className="h-10 border-b border-foreground/30 mb-1.5"></div>
              <p className="font-bold text-xs text-foreground">المراجع</p>
              <p className="text-[10px] text-foreground/60 mt-0.5">التوقيع</p>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded border border-muted-foreground/20">
              <p className="font-bold text-xs text-primary mb-1">{extract.approver_name || 'مدير النظام'}</p>
              <div className="h-12 flex items-center justify-center mb-1.5">
                <img src={adminSignature} alt="توقيع المعتمد" className="h-10 object-contain" />
              </div>
              <p className="font-bold text-xs text-foreground">المُعتمد</p>
              <p className="text-[10px] text-foreground/60 mt-0.5">التوقيع</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-muted-foreground/30">
            <p className="text-[10px] text-foreground/60 font-medium">
              هذا المستند تم إنشاؤه إلكترونياً وهو صالح بدون توقيع أو ختم
            </p>
            <p className="text-[10px] text-foreground/50 mt-0.5">
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
              margin: 0.8cm;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:p-6 {
              padding: 1rem !important;
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
