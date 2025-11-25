import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';

interface AssignmentOrderPrintViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

const AssignmentOrderPrintView = ({ open, onOpenChange, order }: AssignmentOrderPrintViewProps) => {
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>أمر تكليف - ${order.order_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            padding: 20px;
            background: white;
          }
          .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: start;
          }
          .company-info {
            text-align: right;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .company-name-en {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          .company-details {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.6;
          }
          .logo {
            height: 80px;
            width: 80px;
            object-fit: contain;
          }
          .title {
            text-align: center;
            margin-bottom: 30px;
          }
          .title h1 {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .title p {
            font-size: 18px;
            color: #6b7280;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
          }
          .detail-value.primary {
            color: #3b82f6;
            font-weight: bold;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .description-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
          }
          .financial-box {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 25px;
            border-radius: 8px;
          }
          .financial-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            color: #374151;
          }
          .financial-row.total {
            border-top: 2px solid #3b82f6;
            padding-top: 12px;
            margin-top: 12px;
          }
          .financial-label {
            font-weight: 600;
          }
          .financial-value {
            font-size: 20px;
          }
          .financial-row.total .financial-label {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
          }
          .financial-row.total .financial-value {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
          }
          .status-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            display: inline-block;
            margin-bottom: 30px;
          }
          .status-label {
            font-weight: 600;
            color: #374151;
            margin-left: 8px;
          }
          .status-value {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 30px;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #9ca3af;
            padding-top: 8px;
            margin-top: 60px;
          }
          .signature-title {
            font-weight: 600;
            color: #374151;
          }
          .signature-title-en {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 4px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <div class="company-name">${company.name}</div>
              <div class="company-name-en">${company.nameEn}</div>
              <div class="company-details">
                <div>السجل التجاري: ${company.cr}</div>
                <div>الرقم الضريبي: ${company.vat}</div>
                <div>${company.address}</div>
                <div>هاتف: ${company.phone} | بريد: ${company.email}</div>
              </div>
            </div>
            <div>
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="Company Logo" class="logo" />
            </div>
          </div>

          <div class="title">
            <h1>أمر تكليف</h1>
            <p>Work Assignment Order</p>
          </div>

          <div class="details-grid">
            <div>
              <div class="detail-row">
                <span class="detail-label">رقم الأمر:</span>
                <span class="detail-value primary">${order.order_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span class="detail-value">${formatDate(order.order_date)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">اسم المقاول:</span>
                <span class="detail-value">${order.contractor_name}</span>
              </div>
            </div>
            <div>
              <div class="detail-row">
                <span class="detail-label">المشروع:</span>
                <span class="detail-value">${order.project_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">نوع العمل:</span>
                <span class="detail-value">${order.work_type || '-'}</span>
              </div>
              ${order.duration_days ? `
              <div class="detail-row">
                <span class="detail-label">مدة العمل:</span>
                <span class="detail-value">${order.duration_days} يوم</span>
              </div>
              ` : ''}
            </div>
          </div>

          ${order.description ? `
          <div class="section">
            <div class="section-title">وصف الأعمال</div>
            <div class="description-box">${order.description.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">التفاصيل المالية</div>
            <div class="financial-box">
              ${order.tax_included ? `
              <div class="financial-row">
                <span class="financial-label">المبلغ قبل الضريبة:</span>
                <span class="financial-value">${formatCurrency(order.amount_before_tax || 0)}</span>
              </div>
              <div class="financial-row">
                <span class="financial-label">ضريبة القيمة المضافة (15%):</span>
                <span class="financial-value">${formatCurrency(order.tax_amount || 0)}</span>
              </div>
              <div class="financial-row total">
                <span class="financial-label">المبلغ الإجمالي:</span>
                <span class="financial-value">${formatCurrency(order.amount)}</span>
              </div>
              ` : `
              <div class="financial-row total">
                <span class="financial-label">إجمالي المبلغ:</span>
                <span class="financial-value">${formatCurrency(order.amount)}</span>
              </div>
              `}
            </div>
          </div>

          <div class="status-box">
            <span class="status-label">حالة الأمر:</span>
            <span class="status-value">${order.status}</span>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">مدير المشروع</div>
                <div class="signature-title-en">Project Manager</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">المقاول</div>
                <div class="signature-title-en">Contractor</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-title">المدير التنفيذي</div>
                <div class="signature-title-en">Executive Manager</div>
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

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>طباعة أمر التكليف</span>
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

        <div className="bg-white p-8">
          {/* Preview content */}
          <div className="border-b-2 border-primary pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-primary mb-1">{company.name}</h1>
                <p className="text-sm text-gray-600 mb-2">{company.nameEn}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>السجل التجاري: {company.cr}</p>
                  <p>الرقم الضريبي: {company.vat}</p>
                </div>
              </div>
              <div className="text-left">
                <img 
                  src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" 
                  alt="Company Logo" 
                  className="h-20 w-20 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">أمر تكليف</h2>
            <p className="text-lg text-gray-600">Work Assignment Order</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">رقم الأمر:</span>
                <span className="text-primary font-bold">{order.order_number}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">التاريخ:</span>
                <span>{formatDate(order.order_date)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">اسم المقاول:</span>
                <span>{order.contractor_name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">المشروع:</span>
                <span>{order.project_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">نوع العمل:</span>
                <span>{order.work_type || '-'}</span>
              </div>
              {order.duration_days && (
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">مدة العمل:</span>
                  <span>{order.duration_days} يوم</span>
                </div>
              )}
            </div>
          </div>

          {order.description && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-primary mb-3 border-b-2 border-primary pb-2">
                وصف الأعمال
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {order.description}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-bold text-primary mb-3 border-b-2 border-primary pb-2">
              التفاصيل المالية
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
              {order.tax_included ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">المبلغ قبل الضريبة:</span>
                    <span className="text-xl">{formatCurrency(order.amount_before_tax || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">ضريبة القيمة المضافة (15%):</span>
                    <span className="text-xl">{formatCurrency(order.tax_amount || 0)}</span>
                  </div>
                  <div className="border-t-2 border-primary pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">المبلغ الإجمالي:</span>
                      <span className="text-3xl font-bold text-primary">{formatCurrency(order.amount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-primary">إجمالي المبلغ:</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(order.amount)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <span className="font-semibold text-gray-700 ml-2">حالة الأمر:</span>
              <span className="text-lg font-bold text-primary">{order.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t-2">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-16">
                <p className="font-semibold text-gray-700">مدير المشروع</p>
                <p className="text-sm text-gray-500">Project Manager</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-16">
                <p className="font-semibold text-gray-700">المقاول</p>
                <p className="text-sm text-gray-500">Contractor</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mt-16">
                <p className="font-semibold text-gray-700">المدير التنفيذي</p>
                <p className="text-sm text-gray-500">Executive Manager</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
            <p>هذا المستند تم إنشاؤه إلكترونياً ولا يتطلب ختماً أو توقيعاً</p>
            <p className="mt-1">This document was generated electronically and does not require a stamp or signature</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentOrderPrintView;
