import React, { useState } from 'react';
import { escapeHtml } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';

interface MaintenancePrintViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
}

const MaintenancePrintView = ({ open, onOpenChange, request }: MaintenancePrintViewProps) => {
  const [selectedCompany, setSelectedCompany] = useState<'suhail' | 'tamlik'>('suhail');

  const companyInfo = {
    suhail: {
      name: 'شركة سهيل للمقاولات',
      nameEn: 'Suhail Contracting Company',
      cr: '١١٠٢٠٤٤٣٠٣',
      vat: '٣٠٠٢٨٩٨٨٥٢٠٠٠٠٣',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966 XX XXX XXXX',
      email: 'info@suhail.sa'
    },
    tamlik: {
      name: 'شركة تمليك للتطوير العقاري',
      nameEn: 'Tamlik Real Estate Development Company',
      cr: '١١٠٣٢٥٧٩٨١',
      vat: '٣١١٣٨١٧٥٤٠٠٠٠٣',
      address: 'الرياض، المملكة العربية السعودية',
      phone: '+966 XX XXX XXXX',
      email: 'info@tamlik.sa'
    }
  };

  const company = companyInfo[selectedCompany];

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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return '#22c55e';
      case 'قيد التنفيذ': return '#3b82f6';
      case 'جديد': return '#eab308';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالية': return '#ef4444';
      case 'متوسطة': return '#eab308';
      case 'منخفضة': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أمر تكاليف صيانة - #${escapeHtml(request.id.slice(0, 8))}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            padding: 15px;
            background: white;
            font-size: 13px;
          }
          .container { max-width: 210mm; margin: 0 auto; background: white; }
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: start;
          }
          .company-info { text-align: right; }
          .company-name { font-size: 18px; font-weight: bold; color: #3b82f6; margin-bottom: 3px; }
          .company-name-en { font-size: 11px; color: #6b7280; margin-bottom: 6px; }
          .company-details { font-size: 10px; color: #6b7280; line-height: 1.4; }
          .logo { height: 60px; width: 60px; object-fit: contain; }
          .title { text-align: center; margin-bottom: 15px; }
          .title h1 { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 3px; }
          .title p { font-size: 14px; color: #6b7280; }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 6px;
            font-size: 12px;
          }
          .detail-label { font-weight: 600; color: #374151; }
          .detail-value { color: #1f2937; }
          .detail-value.primary { color: #3b82f6; font-weight: bold; }
          .section { margin-bottom: 15px; }
          .section-title {
            font-size: 15px;
            font-weight: bold;
            color: #3b82f6;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          .description-box {
            background: #f9fafb;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            line-height: 1.5;
          }
          .financial-box {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 12px;
            border-radius: 6px;
          }
          .financial-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            color: #374151;
            font-size: 13px;
          }
          .financial-row.total {
            border-top: 2px solid #3b82f6;
            padding-top: 8px;
            margin-top: 8px;
          }
          .financial-label { font-weight: 600; }
          .financial-value { font-size: 15px; }
          .financial-row.total .financial-label { font-size: 16px; font-weight: bold; color: #3b82f6; }
          .financial-row.total .financial-value { font-size: 20px; font-weight: bold; color: #3b82f6; }
          .status-box {
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 15px;
            font-size: 12px;
            margin-left: 10px;
          }
          .status-label { font-weight: 600; color: #374151; margin-left: 6px; }
          .status-value { font-size: 14px; font-weight: bold; }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          .signature-box { text-align: center; }
          .signature-line {
            border-top: 1px solid #9ca3af;
            padding-top: 6px;
            margin-top: 35px;
            font-size: 12px;
          }
          .signature-title { font-weight: 600; color: #374151; }
          .signature-title-en { font-size: 10px; color: #9ca3af; margin-top: 2px; }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            line-height: 1.4;
          }
          @media print {
            body { padding: 0; }
            @page { size: A4; margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <div class="company-name">${escapeHtml(company.name)}</div>
              <div class="company-name-en">${escapeHtml(company.nameEn)}</div>
              <div class="company-details">
                <div>السجل التجاري: ${escapeHtml(company.cr)}</div>
                <div>الرقم الضريبي: ${escapeHtml(company.vat)}</div>
                <div>${escapeHtml(company.address)}</div>
                <div>هاتف: ${escapeHtml(company.phone)} | بريد: ${escapeHtml(company.email)}</div>
              </div>
            </div>
            ${selectedCompany === 'suhail' ? `
            <div>
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="Company Logo" class="logo" />
            </div>
            ` : ''}
          </div>

          <div class="title">
            <h1>أمر تكاليف صيانة</h1>
            <p>Maintenance Cost Order</p>
          </div>

          <div class="details-grid">
            <div>
              <div class="detail-row">
                <span class="detail-label">رقم الطلب:</span>
                <span class="detail-value primary">#${escapeHtml(request.id.slice(0, 8))}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">تاريخ الإبلاغ:</span>
                <span class="detail-value">${formatDate(request.reported_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">اسم المبنى:</span>
                <span class="detail-value">${escapeHtml(request.building_name)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الوحدة:</span>
                <span class="detail-value">${escapeHtml(request.unit)}</span>
              </div>
            </div>
            <div>
              <div class="detail-row">
                <span class="detail-label">نوع العطل:</span>
                <span class="detail-value">${escapeHtml(request.issue_type)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الأولوية:</span>
                <span class="detail-value" style="color: ${getPriorityColor(request.priority)}; font-weight: bold;">${escapeHtml(request.priority)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">المسؤول:</span>
                <span class="detail-value">${escapeHtml(request.assigned_to || 'غير محدد')}</span>
              </div>
            </div>
          </div>

          ${request.description ? `
          <div class="section">
            <div class="section-title">وصف العطل</div>
            <div class="description-box">${escapeHtml(request.description).replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">التفاصيل المالية</div>
            <div class="financial-box">
              <div class="financial-row total">
                <span class="financial-label">التكلفة المقدرة:</span>
                <span class="financial-value">${formatCurrency(request.estimated_cost || 0)}</span>
              </div>
            </div>
          </div>

          <div>
            <div class="status-box">
              <span class="status-label">حالة الطلب:</span>
              <span class="status-value" style="color: ${getStatusColor(request.status)}">${escapeHtml(request.status)}</span>
            </div>
            <div class="status-box">
              <span class="status-label">الأولوية:</span>
              <span class="status-value" style="color: ${getPriorityColor(request.priority)}">${escapeHtml(request.priority)}</span>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">المُعد</div>
                <div class="signature-title-en">Preparer</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">فني الصيانة</div>
                <div class="signature-title-en">Maintenance Technician</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">المُعتمد</div>
                <div class="signature-title-en">Approver</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>هذا المستند تم إنشاؤه إلكترونياً ولا يتطلب ختماً أو توقيعاً</div>
            <div>This document was generated electronically and does not require a stamp or signature</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>طباعة أمر تكاليف صيانة</span>
            <div className="flex items-center gap-2">
              <Label>اختر الشركة:</Label>
              <Select value={selectedCompany} onValueChange={(value: 'suhail' | 'tamlik') => setSelectedCompany(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suhail">شركة سهيل</SelectItem>
                  <SelectItem value="tamlik">شركة تمليك</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handlePrint}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="bg-white p-8 border rounded-lg">
          <div className="border-b-2 border-primary pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-primary mb-1">{company.name}</h1>
                <p className="text-sm text-muted-foreground mb-2">{company.nameEn}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>السجل التجاري: {company.cr}</p>
                  <p>الرقم الضريبي: {company.vat}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary">أمر تكاليف صيانة</h2>
            <p className="text-sm text-muted-foreground">Maintenance Cost Order</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">رقم الطلب:</span>
                <span className="text-primary font-bold">#{request.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">تاريخ الإبلاغ:</span>
                <span>{formatDate(request.reported_date)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">اسم المبنى:</span>
                <span>{request.building_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">الوحدة:</span>
                <span>{request.unit}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">نوع العطل:</span>
                <span>{request.issue_type}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">الأولوية:</span>
                <span className="font-bold" style={{ color: getPriorityColor(request.priority) }}>{request.priority}</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-sm">
                <span className="font-semibold">المسؤول:</span>
                <span>{request.assigned_to || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          {request.description && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-primary border-b-2 border-primary pb-1 mb-2">وصف العطل</h3>
              <div className="bg-muted/50 p-3 rounded text-sm">{request.description}</div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-base font-bold text-primary border-b-2 border-primary pb-1 mb-2">التفاصيل المالية</h3>
            <div className="bg-blue-50 p-4 rounded">
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>التكلفة المقدرة:</span>
                <span>{formatCurrency(request.estimated_cost || 0)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Badge variant="outline" className="text-sm px-3 py-1">
              الحالة: <span className="font-bold mr-1" style={{ color: getStatusColor(request.status) }}>{request.status}</span>
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              الأولوية: <span className="font-bold mr-1" style={{ color: getPriorityColor(request.priority) }}>{request.priority}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-4 border-t">
            <div className="text-center">
              <div className="border-t mt-10 pt-2 text-sm font-semibold">المُعد</div>
              <div className="text-xs text-muted-foreground">Preparer</div>
            </div>
            <div className="text-center">
              <div className="border-t mt-10 pt-2 text-sm font-semibold">فني الصيانة</div>
              <div className="text-xs text-muted-foreground">Maintenance Technician</div>
            </div>
            <div className="text-center">
              <div className="border-t mt-10 pt-2 text-sm font-semibold">المُعتمد</div>
              <div className="text-xs text-muted-foreground">Approver</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenancePrintView;
