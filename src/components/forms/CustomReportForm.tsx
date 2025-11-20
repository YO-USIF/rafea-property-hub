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
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body { 
            font-family: 'Tajawal', 'Arial', sans-serif;
            direction: rtl;
            background: white;
            color: #1e293b;
            line-height: 1.6;
          }
          
          .print-header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.15);
          }
          
          .company-logo {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            margin: 0 auto 15px;
            display: block;
            background: white;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .print-header h1 {
            font-size: 22px;
            margin-bottom: 8px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .print-header h2 {
            font-size: 18px;
            margin-bottom: 12px;
            font-weight: 500;
            opacity: 0.95;
          }
          
          .print-header p {
            font-size: 12px;
            opacity: 0.9;
            margin: 3px 0;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          .summary-card {
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            page-break-inside: avoid;
          }
          
          .summary-card h3 {
            font-size: 16px;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3b82f6;
            font-weight: 700;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 15px 0;
          }
          
          .stat-box {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }
          
          .stat-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .profit { 
            color: #059669;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          }
          
          .loss { 
            color: #dc2626;
            background: linear-gradient(135deg, #fee2e2, #fecaca);
          }
          
          .income { 
            color: #2563eb;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          }
          
          .expense { 
            color: #ea580c;
            background: linear-gradient(135deg, #fed7aa, #fdba74);
          }
          
          table { 
            width: 100%; 
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            page-break-inside: auto;
          }
          
          thead {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
          }
          
          th { 
            padding: 12px 15px;
            text-align: right;
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.3px;
          }
          
          td { 
            padding: 12px 15px;
            text-align: right;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          tbody tr {
            background: white;
            transition: background 0.2s;
          }
          
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          tbody tr:hover {
            background: #f1f5f9;
          }
          
          .page-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 10px;
          }
          
          .watermark {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0.05;
            font-size: 80px;
            font-weight: 700;
            color: #1e40af;
            z-index: -1;
          }
          
          @media print {
            body { 
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
            
            .stat-box {
              box-shadow: none;
              border: 2px solid #e2e8f0;
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
              <div className="print-header">
                <img 
                  src={suhailLogo} 
                  alt="شعار شركة سهيل طيبة" 
                  className="company-logo"
                />
                <h1>تقرير تفصيلي عن المشروع</h1>
                <h2>{selectedProject.name}</h2>
                <div style={{ marginTop: '12px' }}>
                  <p>شركة سهيل طيبة للتطوير العقاري</p>
                  {startDate && endDate && (
                    <p style={{ marginTop: '8px' }}>
                      فترة التقرير: من {new Date(startDate).toLocaleDateString('ar-SA')} إلى {new Date(endDate).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                  {!startDate && !endDate && (
                    <p style={{ marginTop: '8px' }}>
                      فترة التقرير: جميع الفترات
                    </p>
                  )}
                  <p style={{ marginTop: '8px', fontSize: '11px', opacity: '0.85' }}>
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

              <div className="page-footer">
                <p>© {new Date().getFullYear()} شركة سهيل طيبة للتطوير العقاري - جميع الحقوق محفوظة</p>
                <p style={{ marginTop: '5px' }}>المدينة المنورة - المملكة العربية السعودية</p>
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