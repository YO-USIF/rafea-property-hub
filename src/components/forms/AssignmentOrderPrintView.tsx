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
            padding: 15px;
            background: white;
            font-size: 13px;
          }
          .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: start;
          }
          .company-info {
            text-align: right;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 3px;
          }
          .company-name-en {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 6px;
          }
          .company-details {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.4;
          }
          .logo {
            height: 60px;
            width: 60px;
            object-fit: contain;
          }
          .title {
            text-align: center;
            margin-bottom: 15px;
          }
          .title h1 {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 3px;
          }
          .title p {
            font-size: 14px;
            color: #6b7280;
          }
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
            margin-bottom: 15px;
          }
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
          .financial-label {
            font-weight: 600;
          }
          .financial-value {
            font-size: 15px;
          }
          .financial-row.total .financial-label {
            font-size: 16px;
            font-weight: bold;
            color: #3b82f6;
          }
          .financial-row.total .financial-value {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
          }
          .status-box {
            background: #f3f4f6;
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            margin-bottom: 15px;
            font-size: 12px;
          }
          .status-label {
            font-weight: 600;
            color: #374151;
            margin-left: 6px;
          }
          .status-value {
            font-size: 14px;
            font-weight: bold;
            color: #3b82f6;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #9ca3af;
            padding-top: 6px;
            margin-top: 35px;
            font-size: 12px;
          }
          .signature-title {
            font-weight: 600;
            color: #374151;
          }
          .signature-title-en {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 2px;
          }
          .signature-name {
            font-size: 13px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 4px;
          }
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
            body {
              padding: 0;
            }
            @page {
              size: A4;
              margin: 12mm;
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
            ${selectedCompany === 'suhail' ? `
            <div>
              <img src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" alt="Company Logo" class="logo" />
            </div>
            ` : ''}
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
              <div class="signature-name">${order.created_by_name || 'غير معروف'}</div>
              <div class="signature-line">
                <div class="signature-title">المُعد</div>
                <div class="signature-title-en">Preparer</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-name">${order.contractor_name}</div>
              <div class="signature-line">
                <div class="signature-title">المقاول</div>
                <div class="signature-title-en">Contractor</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-name">${order.approver_name || 'مدير النظام'}</div>
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
            {selectedCompany === 'suhail' && (
              <div className="text-left">
                <img 
                  src="/lovable-uploads/c6fbcf40-7e64-42f0-b1da-d735b0b632c8.png" 
                  alt="Company Logo" 
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}
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
              <p className="font-bold text-primary mb-2">{order.created_by_name || 'غير معروف'}</p>
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold text-gray-700">المُعد</p>
                <p className="text-sm text-gray-500">Preparer</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-primary mb-2">{order.contractor_name}</p>
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold text-gray-700">المقاول</p>
                <p className="text-sm text-gray-500">Contractor</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-primary mb-2">{order.approver_name || 'مدير النظام'}</p>
              <div className="border-t-2 border-gray-400 pt-2 mt-12">
                <p className="font-semibold text-gray-700">المُعتمد</p>
                <p className="text-sm text-gray-500">Approver</p>
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
