import React, { useState, useRef } from 'react';
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
  const printRef = useRef<HTMLDivElement>(null);

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

        <div id="printable-content" ref={printRef} className="bg-white p-8 print:p-12">
          {/* Header with Company Info */}
          <div className="border-b-2 border-primary pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-primary mb-1">{company.name}</h1>
                <p className="text-sm text-gray-600 mb-2">{company.nameEn}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>السجل التجاري: {company.cr}</p>
                  <p>الرقم الضريبي: {company.vat}</p>
                  <p>{company.address}</p>
                  <p>هاتف: {company.phone} | بريد: {company.email}</p>
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

          {/* Document Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">أمر تكليف</h2>
            <p className="text-lg text-gray-600">Work Assignment Order</p>
          </div>

          {/* Order Details */}
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

          {/* Description */}
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

          {/* Financial Details */}
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

          {/* Status */}
          <div className="mb-8">
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <span className="font-semibold text-gray-700 ml-2">حالة الأمر:</span>
              <span className="text-lg font-bold text-primary">{order.status}</span>
            </div>
          </div>

          {/* Signatures */}
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

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-xs text-gray-500">
            <p>هذا المستند تم إنشاؤه إلكترونياً ولا يتطلب ختماً أو توقيعاً</p>
            <p className="mt-1">This document was generated electronically and does not require a stamp or signature</p>
          </div>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-content, 
            #printable-content * {
              visibility: visible;
            }
            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentOrderPrintView;
