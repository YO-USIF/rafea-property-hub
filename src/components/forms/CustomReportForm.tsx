import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectDetailedReport } from '@/components/reports/ProjectDetailedReport';
import { Printer, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import suhailLogo from '@/assets/suhail-logo.jpeg';

interface CustomReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CustomReportForm = ({ open, onOpenChange, onSuccess }: CustomReportFormProps) => {
  const { toast } = useToast();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // جلب بيانات المبيعات
  const { data: salesData = [] } = useQuery({
    queryKey: ['sales-custom-report', selectedProjectId, startDate, endDate],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      let query = supabase
        .from('sales')
        .select('*')
        .eq('project_id', selectedProjectId);
      
      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching sales:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!selectedProjectId && showReport,
  });

  // جلب بيانات الفواتير
  const { data: invoicesData = [] } = useQuery({
    queryKey: ['invoices-custom-report', selectedProjectId, startDate, endDate],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('project_id', selectedProjectId);
      
      if (startDate) query = query.gte('invoice_date', startDate);
      if (endDate) query = query.lte('invoice_date', endDate);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProjectId && showReport,
  });

  // جلب بيانات المستخلصات
  const { data: extractsData = [] } = useQuery({
    queryKey: ['extracts-custom-report', selectedProjectId, startDate, endDate],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      let query = supabase
        .from('extracts')
        .select('*')
        .eq('project_id', selectedProjectId);
      
      if (startDate) query = query.gte('extract_date', startDate);
      if (endDate) query = query.lte('extract_date', endDate);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedProjectId && showReport,
  });

  const handleGenerateReport = () => {
    if (!selectedProjectId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار المشروع",
        variant: "destructive"
      });
      return;
    }

    setShowReport(true);
    toast({
      title: "تم إنشاء التقرير",
      description: "يمكنك الآن مشاهدة التقرير وطباعته"
    });
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=842,width=595');
      
      if (printWindow) {
        printWindow.document.write('<!DOCTYPE html><html><head><title>تقرير تفصيلي - ' + (selectedProject?.name || '') + '</title>');
        printWindow.document.write('<meta charset="utf-8">');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          
          body { 
            font-family: 'Arial', 'Segoe UI', Tahoma, sans-serif;
            direction: rtl;
            padding: 0;
            background: white;
            color: #1a1a1a;
            line-height: 1.4;
            font-size: 11px;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          
          .company-logo {
            width: 80px;
            height: auto;
            margin: 0 auto 10px;
            display: block;
          }
          
          .print-header h1 {
            font-size: 18px;
            color: #1e40af;
            margin-bottom: 5px;
            font-weight: bold;
          }
          
          .print-header h2 {
            font-size: 16px;
            color: #374151;
            margin-bottom: 8px;
          }
          
          .print-header p {
            font-size: 10px;
            color: #6b7280;
            margin: 2px 0;
            line-height: 1.3;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 12px 0;
            font-size: 10px;
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          th, td { 
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            text-align: right;
          }
          
          th { 
            background-color: #f3f4f6;
            font-weight: bold;
            color: #1f2937;
            font-size: 10px;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .page-break { 
            page-break-after: always; 
          }
          
          .summary-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px;
            margin: 12px 0;
            page-break-inside: avoid;
          }
          
          .summary-card h3 {
            font-size: 13px;
            color: #1f2937;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 12px 0;
            page-break-inside: avoid;
          }
          
          .stat-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 8px;
            text-align: center;
          }
          
          .stat-label {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 4px;
            line-height: 1.2;
          }
          
          .stat-value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            line-height: 1.2;
          }
          
          .profit { color: #059669; }
          .loss { color: #dc2626; }
          .income { color: #2563eb; }
          .expense { color: #ea580c; }
          
          @media print {
            body { 
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .no-print { 
              display: none !important; 
            }
            
            .page-break {
              page-break-after: always;
            }
            
            table {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            thead {
              display: table-header-group;
            }
            
            tfoot {
              display: table-footer-group;
            }
          }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // إعداد بيانات التقرير
  const reportData = selectedProject ? [{
    id: selectedProject.id,
    name: selectedProject.name,
    totalSales: salesData.reduce((sum, sale) => sum + (sale.price || 0), 0),
    salesCount: salesData.length,
    totalInvoices: invoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    invoicesCount: invoicesData.length,
    totalExtracts: extractsData.reduce((sum, ext) => sum + (ext.amount || 0), 0),
    extractsCount: extractsData.length,
    netProfit: 0,
    profitMargin: 0
  }] : [];

  if (reportData.length > 0) {
    const expenses = reportData[0].totalInvoices + reportData[0].totalExtracts;
    reportData[0].netProfit = reportData[0].totalSales - expenses;
    reportData[0].profitMargin = reportData[0].totalSales > 0 
      ? (reportData[0].netProfit / reportData[0].totalSales) * 100 
      : 0;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء تقرير مخصص للمشروع</DialogTitle>
          <DialogDescription>
            اختر المشروع والفترة الزمنية لإنشاء تقرير تفصيلي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* نموذج اختيار المشروع والفترة */}
          <Card className="no-print">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                إعدادات التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">المشروع *</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">من تاريخ</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">إلى تاريخ</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="اختياري"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    onClick={handleGenerateReport}
                    className="flex-1"
                    disabled={!selectedProjectId}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض التقرير
                  </Button>
                  
                  {showReport && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrint}
                    >
                      <Printer className="w-4 h-4 ml-2" />
                      طباعة
                    </Button>
                  )}
                </div>
              </div>

              {startDate && endDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <strong>فترة التقرير:</strong> من {new Date(startDate).toLocaleDateString('ar-SA')} إلى {new Date(endDate).toLocaleDateString('ar-SA')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* عرض التقرير */}
          {showReport && selectedProject && (
            <div ref={printRef} className="space-y-4">
              <div className="text-center mb-6 print-header">
                <img 
                  src={suhailLogo} 
                  alt="شعار شركة سهيل طيبة" 
                  className="company-logo"
                />
                <h1 className="text-2xl font-bold mb-2 text-primary">تقرير تفصيلي عن المشروع</h1>
                <h2 className="text-xl text-gray-700 font-semibold">{selectedProject.name}</h2>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="font-medium">شركة سهيل طيبة للتطوير العقاري</p>
                  {startDate && endDate && (
                    <p className="mt-2">
                      <span className="font-semibold">فترة التقرير:</span> من {new Date(startDate).toLocaleDateString('ar-SA')} إلى {new Date(endDate).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                  {!startDate && !endDate && (
                    <p className="mt-2">
                      <span className="font-semibold">فترة التقرير:</span> جميع الفترات
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <ProjectDetailedReport 
                data={reportData} 
                period="custom"
              />

              <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
                <p>© {new Date().getFullYear()} شركة سهيل طيبة للتطوير العقاري - جميع الحقوق محفوظة</p>
              </div>
            </div>
          )}

          {!showReport && (
            <div className="text-center py-12 text-gray-400">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>اختر المشروع واضغط على "عرض التقرير" لإنشاء التقرير التفصيلي</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomReportForm;