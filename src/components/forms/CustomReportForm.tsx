import { useState, useRef, useMemo } from 'react';
import { escapeHtml } from '@/lib/utils';
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
import { Printer, Eye, Calendar, FileText, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import suhailLogo from '@/assets/suhail-logo.jpeg';

interface CustomReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CustomReportForm = ({ open, onOpenChange, onSuccess }: CustomReportFormProps) => {
  const { toast } = useToast();
  const { projects } = useProjects();
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const availableZones = Array.from(
    new Set((projects || []).map((p: any) => p.zone).filter(Boolean))
  ) as string[];

  const filteredProjects = selectedZone === 'all'
    ? projects
    : (projects || []).filter((p: any) => p.zone === selectedZone);

  // المشاريع المستهدفة: إما مشروع واحد أو كل مشاريع النطاق
  const targetProjects = useMemo(() => {
    if (selectedProjectId) return (projects || []).filter((p: any) => p.id === selectedProjectId);
    if (selectedZone !== 'all') return filteredProjects;
    return [];
  }, [selectedProjectId, selectedZone, projects, filteredProjects]);

  const targetProjectIds = targetProjects.map((p: any) => p.id);
  const projectIdKey = targetProjectIds.slice().sort().join(',');

  const isZoneMode = !selectedProjectId && selectedZone !== 'all';

  const canGenerate = !!selectedProjectId || selectedZone !== 'all';

  // جلب بيانات المبيعات
  const { data: salesData = [] } = useQuery({
    queryKey: ['sales-custom-report', projectIdKey, startDate, endDate],
    queryFn: async () => {
      if (targetProjectIds.length === 0) return [];
      let query = supabase.from('sales').select('*').in('project_id', targetProjectIds);
      if (startDate) query = query.gte('sale_date', startDate);
      if (endDate) query = query.lte('sale_date', endDate);
      const { data, error } = await query;
      if (error) { console.error('Error fetching sales:', error); return []; }
      return data || [];
    },
    enabled: targetProjectIds.length > 0 && showReport,
  });

  // جلب بيانات الفواتير
  const { data: invoicesData = [] } = useQuery({
    queryKey: ['invoices-custom-report', projectIdKey, startDate, endDate],
    queryFn: async () => {
      if (targetProjectIds.length === 0) return [];
      let query = supabase.from('invoices').select('*').in('project_id', targetProjectIds);
      if (startDate) query = query.gte('invoice_date', startDate);
      if (endDate) query = query.lte('invoice_date', endDate);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: targetProjectIds.length > 0 && showReport,
  });

  // جلب بيانات المستخلصات
  const { data: extractsData = [] } = useQuery({
    queryKey: ['extracts-custom-report', projectIdKey, startDate, endDate],
    queryFn: async () => {
      if (targetProjectIds.length === 0) return [];
      let query = supabase.from('extracts').select('*').in('project_id', targetProjectIds);
      if (startDate) query = query.gte('extract_date', startDate);
      if (endDate) query = query.lte('extract_date', endDate);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: targetProjectIds.length > 0 && showReport,
  });

  // جلب أوامر التكليف (للنطاق أيضاً)
  const { data: assignmentOrdersData = [] } = useQuery({
    queryKey: ['ao-custom-report', projectIdKey, startDate, endDate],
    queryFn: async () => {
      if (targetProjectIds.length === 0) return [];
      let query = supabase.from('assignment_orders').select('*').in('project_id', targetProjectIds);
      if (startDate) query = query.gte('order_date', startDate);
      if (endDate) query = query.lte('order_date', endDate);
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    },
    enabled: targetProjectIds.length > 0 && showReport,
  });

  const handleGenerateReport = () => {
    if (!canGenerate) {
      toast({ title: "خطأ", description: "الرجاء اختيار النطاق أو المشروع", variant: "destructive" });
      return;
    }
    setShowReport(true);
    toast({ title: "تم إنشاء التقرير", description: "يمكنك الآن مشاهدة التقرير وطباعته" });
  };

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    const title = isZoneMode ? `تقرير النطاق - ${selectedZone}` : `تقرير تفصيلي - ${selectedProject?.name || ''}`;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>${escapeHtml(title)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>@font-face{font-family:'saudi_riyal';src:url('https://cdn.jsdelivr.net/npm/@emran-alhaddad/saudi-riyal-font/fonts/regular/saudi_riyal.woff2') format('woff2');}
            @page { size: A4; margin: 15mm; }
            body { font-family: system-ui, -apple-system, sans-serif, 'saudi_riyal'; }
            .no-print { display: none !important; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (projects || []).forEach((p: any) => { map[p.id] = p.name; });
    return map;
  }, [projects]);

  // إعداد بيانات التقرير: صف لكل مشروع مستهدف
  const reportData = targetProjects.map((project: any) => {
    const projSales = salesData.filter((s: any) => s.project_id === project.id);
    const projInvoices = invoicesData.filter((i: any) => i.project_id === project.id);
    const projExtracts = extractsData.filter((e: any) => e.project_id === project.id);
    const totalSales = projSales.reduce((sum: number, s: any) => sum + (s.price || 0), 0);
    const totalInvoices = projInvoices.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
    const totalExtracts = projExtracts.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const expenses = totalInvoices + totalExtracts;
    const netProfit = totalSales - expenses;
    return {
      id: project.id,
      name: project.name,
      totalSales,
      salesCount: projSales.length,
      totalInvoices,
      invoicesCount: projInvoices.length,
      totalExtracts,
      extractsCount: projExtracts.length,
      netProfit,
      profitMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0,
    };
  });

  // بيان الصرف الشامل للنطاق (فواتير + مستخلصات + أوامر تكليف)
  const expenseBreakdown = useMemo(() => {
    const rows: Array<{ date: string; type: string; ref: string; party: string; project: string; amount: number }> = [];
    invoicesData.forEach((i: any) => rows.push({
      date: i.invoice_date, type: 'فاتورة', ref: i.invoice_number || '-',
      party: i.supplier_name || '-', project: projectNameById[i.project_id] || '-', amount: Number(i.amount) || 0,
    }));
    extractsData.forEach((e: any) => rows.push({
      date: e.extract_date, type: 'مستخلص', ref: e.extract_number || '-',
      party: e.contractor_name || '-', project: projectNameById[e.project_id] || '-', amount: Number(e.amount) || 0,
    }));
    assignmentOrdersData.forEach((a: any) => rows.push({
      date: a.order_date, type: 'أمر تكليف', ref: a.order_number || '-',
      party: a.contractor_name || a.recipient_name || '-', project: projectNameById[a.project_id] || '-', amount: Number(a.amount) || 0,
    }));
    return rows.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [invoicesData, extractsData, assignmentOrdersData, projectNameById]);

  const totalExpensesAll = expenseBreakdown.reduce((s, r) => s + r.amount, 0);

  const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const reportTitle = isZoneMode ? `تقرير النطاق: ${selectedZone}` : `تقرير تفصيلي عن المشروع`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            إنشاء تقرير مخصص
          </DialogTitle>
          <DialogDescription>
            حدّد النطاق (للحصول على تقرير كامل عنه) أو اختر مشروعاً محدداً، والفترة الزمنية لإنشاء تقرير احترافي جاهز للطباعة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="no-print border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  إعدادات التقرير
                </span>
                {(selectedProject?.zone || (isZoneMode && selectedZone)) && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" /> {selectedProject?.zone || selectedZone}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableZones.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> النطاق
                    </Label>
                    <Select
                      value={selectedZone}
                      onValueChange={(v) => { setSelectedZone(v); setSelectedProjectId(''); setShowReport(false); }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع النطاقات</SelectItem>
                        {availableZones.map(z => (
                          <SelectItem key={z} value={z}>{z}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="project" className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> المشروع {isZoneMode ? '(اختياري)' : '*'}
                  </Label>
                  <Select
                    value={selectedProjectId || '__all__'}
                    onValueChange={(v) => setSelectedProjectId(v === '__all__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isZoneMode ? 'كل مشاريع النطاق' : 'اختر المشروع'} />
                    </SelectTrigger>
                    <SelectContent>
                      {isZoneMode && (
                        <SelectItem value="__all__">كل مشاريع النطاق</SelectItem>
                      )}
                      {filteredProjects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}{project.zone ? ` — ${project.zone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">من تاريخ</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">إلى تاريخ</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t">
                <Button type="button" onClick={handleGenerateReport} disabled={!canGenerate}>
                  <Eye className="w-4 h-4 ml-2" />
                  عرض التقرير
                </Button>
                {showReport && (
                  <Button type="button" variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة التقرير
                  </Button>
                )}
                {(startDate || endDate || selectedZone !== 'all' || selectedProjectId) && (
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => { setStartDate(''); setEndDate(''); setSelectedZone('all'); setSelectedProjectId(''); setShowReport(false); }}
                  >
                    مسح الفلاتر
                  </Button>
                )}
                {startDate && endDate && (
                  <div className="mr-auto text-xs text-muted-foreground">
                    <strong>الفترة:</strong> {new Date(startDate).toLocaleDateString('en-GB')} — {new Date(endDate).toLocaleDateString('en-GB')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showReport && targetProjects.length > 0 && (
            <div ref={printRef} className="space-y-6">
              <div className="text-center mb-6">
                <img src={suhailLogo} alt="شعار شركة سهيل طيبة" className="w-20 h-20 mx-auto mb-4 rounded-full" />
                <h1 className="text-2xl font-bold mb-2 text-primary">{reportTitle}</h1>
                {!isZoneMode && selectedProject && (
                  <h2 className="text-xl text-foreground font-semibold mb-3">{selectedProject.name}</h2>
                )}
                {isZoneMode && (
                  <h2 className="text-lg text-foreground font-semibold mb-3">
                    عدد المشاريع في النطاق: {targetProjects.length}
                  </h2>
                )}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">شركة سهيل طيبة للتطوير العقاري</p>
                  <p>
                    <span className="font-semibold">فترة التقرير:</span>{' '}
                    {startDate && endDate
                      ? `من ${new Date(startDate).toLocaleDateString('en-GB')} إلى ${new Date(endDate).toLocaleDateString('en-GB')}`
                      : 'جميع الفترات'}
                  </p>
                  <p className="text-xs">
                    تاريخ الإصدار: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <ProjectDetailedReport data={reportData} period="custom" />

              {/* بيان صرف مصروفات النطاق */}
              {isZoneMode && expenseBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>بيان صرف مصروفات النطاق</span>
                      <Badge variant="secondary">الإجمالي: {fmt(totalExpensesAll)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>الرقم</TableHead>
                          <TableHead>الجهة</TableHead>
                          <TableHead>المشروع</TableHead>
                          <TableHead className="text-right">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseBreakdown.map((r, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{r.date ? new Date(r.date).toLocaleDateString('en-GB') : '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{r.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                            <TableCell>{r.party}</TableCell>
                            <TableCell>{r.project}</TableCell>
                            <TableCell className="text-right font-semibold">{fmt(r.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={5} className="text-right">الإجمالي</TableCell>
                          <TableCell className="text-right text-red-600">{fmt(totalExpensesAll)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                <p>© {new Date().getFullYear()} شركة سهيل طيبة للتطوير العقاري - جميع الحقوق محفوظة</p>
                <p className="mt-1">المدينة المنورة - المملكة العربية السعودية</p>
              </div>
            </div>
          )}

          {!showReport && (
            <div className="text-center py-12 text-gray-400">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>اختر النطاق أو المشروع واضغط "عرض التقرير" لإنشاء التقرير التفصيلي</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomReportForm;
