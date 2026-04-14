
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, FileText, Download, Filter, Calendar, TrendingUp, DollarSign, Users, Building2, Eye, FileSpreadsheet, Printer } from 'lucide-react';
import CustomReportForm from '@/components/forms/CustomReportForm';
import SalesReport from '@/components/reports/SalesReport';
import PurchasesReport from '@/components/reports/PurchasesReport';
import InvoicesReport from '@/components/reports/InvoicesReport';
import ProfitLossReport from '@/components/reports/ProfitLossReport';
import { ProjectCostCenterReport } from '@/components/reports/ProjectCostCenterReport';
import { ProjectDetailedReport } from '@/components/reports/ProjectDetailedReport';
import ExtractsAndOrdersReport from '@/components/reports/ExtractsAndOrdersReport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel, exportToPDF, salesColumns, invoiceColumns, purchaseColumns, extractColumns, taskColumns, maintenanceColumns } from '@/lib/reportExport';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showCustomReportForm, setShowCustomReportForm] = useState(false);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const reportCategories = [
    {
      id: 'financial',
      title: 'التقارير المالية',
      description: 'تقارير الإيرادات والمصروفات والأرباح',
      icon: DollarSign,
      reports: [
        { name: 'تقرير الأرباح والخسائر', type: 'profit-loss' },
        { name: 'تقرير الفواتير', type: 'invoices' },
        { name: 'تقرير المصروفات التشغيلية', type: 'expenses' }
      ]
    },
    {
      id: 'projects',
      title: 'تقارير المشاريع',
      description: 'تقارير حالة المشاريع والتقدم',
      icon: Building2,
      reports: [
        { name: 'تقرير تفصيلي عن المشروع', type: 'project-detailed' },
        { name: 'تقرير تقدم المشاريع', type: 'project-progress' },
        { name: 'تقرير مركز تكلفة المشاريع', type: 'project-cost-center' },
        { name: 'تقرير المشاريع المتأخرة', type: 'delayed-projects' },
        { name: 'تقرير المستخلصات وأوامر التكليف', type: 'extracts-orders' }
      ]
    },
    {
      id: 'sales',
      title: 'تقارير المبيعات',
      description: 'تقارير مبيعات الشقق والعقود',
      icon: TrendingUp,
      reports: [
        { name: 'تقرير المبيعات', type: 'sales' },
        { name: 'تقرير المشتريات', type: 'purchases' },
      ]
    },
    {
      id: 'operations',
      title: 'تقارير العمليات',
      description: 'تقارير الصيانة والمهام والموظفين',
      icon: Users,
      reports: [
        { name: 'تقرير الصيانة والأعطال', type: 'maintenance' },
        { name: 'تقرير المهام', type: 'tasks' },
        { name: 'تقرير المهام المكتملة', type: 'completed-tasks' }
      ]
    }
  ];

  // Fetch data
  const dateFilter = (query: any) => {
    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    return query;
  };

  const { data: salesData = [] } = useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('sales').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: invoicesData = [] } = useQuery({
    queryKey: ['invoices-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('invoices').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: purchasesData = [] } = useQuery({
    queryKey: ['purchases-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('purchases').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: extractsData = [] } = useQuery({
    queryKey: ['extracts-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('extracts').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects-report'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: tasksData = [] } = useQuery({
    queryKey: ['tasks-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: maintenanceData = [] } = useQuery({
    queryKey: ['maintenance-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('maintenance_requests').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: assignmentOrdersData = [] } = useQuery({
    queryKey: ['assignment-orders-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase.from('assignment_orders').select('*');
      query = dateFilter(query);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const totalRevenue = salesData.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalExpenses = invoicesData.reduce((sum, i) => sum + (i.amount || 0), 0) +
    purchasesData.reduce((sum, p) => sum + (p.total_amount || 0), 0) +
    extractsData.reduce((sum, e) => sum + (e.amount || 0), 0);

  const quickStats = [
    { title: 'إجمالي المبيعات', value: salesData.length.toString(), description: 'عملية بيع', icon: FileText, color: 'text-blue-600' },
    { title: 'إجمالي الفواتير', value: invoicesData.length.toString(), description: 'فاتورة', icon: Calendar, color: 'text-green-600' },
    { title: 'المشتريات', value: purchasesData.length.toString(), description: 'طلب شراء', icon: BarChart3, color: 'text-purple-600' },
    { title: 'صافي الربح', value: formatCurrency(totalRevenue - totalExpenses), description: 'ريال سعودي', icon: TrendingUp, color: 'text-orange-600' }
  ];

  // Generate project detailed report
  const generateProjectDetailedReport = () => {
    return projectsData.map(project => {
      const pSales = salesData.filter(s => s.project_id === project.id);
      const pInvoices = invoicesData.filter(i => i.project_id === project.id);
      const pExtracts = extractsData.filter(e => e.project_id === project.id);
      const totalS = pSales.reduce((sum, s) => sum + (s.price || 0), 0);
      const totalI = pInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
      const totalE = pExtracts.reduce((sum, e) => sum + (e.amount || 0), 0);
      return {
        id: project.id, name: project.name,
        totalSales: totalS, salesCount: pSales.length,
        totalInvoices: totalI, invoicesCount: pInvoices.length,
        totalExtracts: totalE, extractsCount: pExtracts.length,
        netProfit: totalS - (totalI + totalE),
        profitMargin: totalS > 0 ? ((totalS - (totalI + totalE)) / totalS) * 100 : 0
      };
    });
  };

  const generateProjectCostCenterReport = () => {
    return projectsData.map(project => {
      const pInvoices = invoicesData.filter(i => i.project_id === project.id);
      const pExtracts = extractsData.filter(e => e.project_id === project.id);
      const invoiceCosts = pInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
      const extractCosts = pExtracts.reduce((sum, e) => sum + (e.amount || 0), 0);
      return {
        ...project,
        invoiceDetails: pInvoices, extractDetails: pExtracts,
        invoiceCosts, extractCosts, totalProjectCosts: invoiceCosts + extractCosts,
        invoiceCount: pInvoices.length, extractCount: pExtracts.length
      };
    }).filter(p => p.totalProjectCosts > 0 || p.invoiceCount > 0 || p.extractCount > 0);
  };

  const handleViewReport = (reportType: string, reportName: string, category: string) => {
    let reportData: any = null;

    switch (reportType) {
      case 'sales': reportData = salesData; break;
      case 'invoices': reportData = invoicesData; break;
      case 'purchases': reportData = purchasesData; break;
      case 'profit-loss': reportData = { salesData, invoicesData, purchasesData, extractsData }; break;
      case 'project-detailed': reportData = generateProjectDetailedReport(); break;
      case 'project-cost-center': reportData = generateProjectCostCenterReport(); break;
      case 'expenses':
        reportData = {
          invoices: invoicesData,
          purchases: purchasesData,
          extracts: extractsData,
          assignmentOrders: assignmentOrdersData
        };
        break;
      case 'project-progress': reportData = projectsData; break;
      case 'delayed-projects': reportData = projectsData.filter(p => p.status === 'متأخر' || (p.progress < 50 && new Date(p.expected_completion) < new Date())); break;
      case 'tasks': reportData = tasksData; break;
      case 'completed-tasks': reportData = tasksData.filter(t => t.status === 'مكتملة'); break;
      case 'maintenance': reportData = maintenanceData; break;
      case 'extracts-orders': break;
    }

    setSelectedReport({ name: reportName, category, data: reportData, type: reportType });
    setShowReportViewer(true);
  };

  const handleExcelDownload = (reportType: string) => {
    switch (reportType) {
      case 'sales': exportToExcel(salesData, salesColumns, 'تقرير_المبيعات'); break;
      case 'invoices': exportToExcel(invoicesData, invoiceColumns, 'تقرير_الفواتير'); break;
      case 'purchases': exportToExcel(purchasesData, purchaseColumns, 'تقرير_المشتريات'); break;
      case 'tasks': exportToExcel(tasksData, taskColumns, 'تقرير_المهام'); break;
      case 'completed-tasks': exportToExcel(tasksData.filter(t => t.status === 'مكتملة'), taskColumns, 'تقرير_المهام_المكتملة'); break;
      case 'maintenance': exportToExcel(maintenanceData, maintenanceColumns, 'تقرير_الصيانة'); break;
      default:
        toast({ title: "تحميل Excel", description: "يرجى فتح التقرير أولاً ثم التحميل" });
    }
  };

  // Render report content based on type
  const renderReportContent = () => {
    if (!selectedReport) return null;
    const { type, data } = selectedReport;

    switch (type) {
      case 'sales':
        return <SalesReport data={data} period={selectedPeriod} />;
      case 'invoices':
        return <InvoicesReport data={data} period={selectedPeriod} />;
      case 'purchases':
        return <PurchasesReport data={data} period={selectedPeriod} />;
      case 'profit-loss':
        return <ProfitLossReport salesData={data.salesData} invoicesData={data.invoicesData} purchasesData={data.purchasesData} extractsData={data.extractsData} period={selectedPeriod} />;
      case 'project-detailed':
        return <ProjectDetailedReport data={data} period={selectedPeriod} />;
      case 'project-cost-center':
        return <ProjectCostCenterReport data={data} period={selectedPeriod} />;
      case 'extracts-orders':
        return <ExtractsAndOrdersReport />;
      case 'expenses':
        return renderExpensesReport(data);
      case 'project-progress':
        return renderProjectProgressReport(data);
      case 'delayed-projects':
        return renderDelayedProjectsReport(data);
      case 'tasks':
        return renderTasksReport(data);
      case 'completed-tasks':
        return renderTasksReport(data);
      case 'maintenance':
        return renderMaintenanceReport(data);
      default:
        return <div className="text-center text-muted-foreground p-8">التقرير غير متوفر</div>;
    }
  };

  const renderExpensesReport = (data: any) => (
    <div id="report-print-content" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-red-600">{formatCurrency(data.invoices.reduce((s: number, i: any) => s + (i.amount || 0), 0))}</div>
          <div className="text-sm text-muted-foreground">الفواتير</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.purchases.reduce((s: number, p: any) => s + (p.total_amount || 0), 0))}</div>
          <div className="text-sm text-muted-foreground">المشتريات</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.extracts.reduce((s: number, e: any) => s + (e.amount || 0), 0))}</div>
          <div className="text-sm text-muted-foreground">المستخلصات</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.assignmentOrders.reduce((s: number, a: any) => s + (a.amount || 0), 0))}</div>
          <div className="text-sm text-muted-foreground">أوامر التكليف</div>
        </CardContent></Card>
      </div>
      <Card><CardContent className="pt-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-700">
            {formatCurrency(
              data.invoices.reduce((s: number, i: any) => s + (i.amount || 0), 0) +
              data.purchases.reduce((s: number, p: any) => s + (p.total_amount || 0), 0) +
              data.extracts.reduce((s: number, e: any) => s + (e.amount || 0), 0) +
              data.assignmentOrders.reduce((s: number, a: any) => s + (a.amount || 0), 0)
            )}
          </div>
          <div className="text-muted-foreground">إجمالي المصروفات التشغيلية</div>
        </div>
      </CardContent></Card>
    </div>
  );

  const renderProjectProgressReport = (data: any[]) => (
    <div id="report-print-content" className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المشروع</TableHead>
            <TableHead>الموقع</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>نسبة الإنجاز</TableHead>
            <TableHead>تاريخ البدء</TableHead>
            <TableHead>الانتهاء المتوقع</TableHead>
            <TableHead>الوحدات المباعة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.location}</TableCell>
              <TableCell>{p.type}</TableCell>
              <TableCell><Badge variant={p.status === 'مكتمل' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-sm">{p.progress}%</span>
                </div>
              </TableCell>
              <TableCell>{p.start_date}</TableCell>
              <TableCell>{p.expected_completion}</TableCell>
              <TableCell>{p.sold_units}/{p.total_units}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderDelayedProjectsReport = (data: any[]) => (
    <div id="report-print-content" className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center text-muted-foreground p-8">لا توجد مشاريع متأخرة 🎉</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المشروع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>نسبة الإنجاز</TableHead>
              <TableHead>الانتهاء المتوقع</TableHead>
              <TableHead>التأخير</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p: any) => {
              const daysLate = Math.max(0, Math.ceil((new Date().getTime() - new Date(p.expected_completion).getTime()) / (1000 * 60 * 60 * 24)));
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="destructive">{p.status}</Badge></TableCell>
                  <TableCell>{p.progress}%</TableCell>
                  <TableCell>{p.expected_completion}</TableCell>
                  <TableCell className="text-red-600 font-bold">{daysLate} يوم</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const renderTasksReport = (data: any[]) => (
    <div id="report-print-content" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-muted-foreground">إجمالي المهام</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-green-600">{data.filter(t => t.status === 'مكتملة').length}</div>
          <div className="text-sm text-muted-foreground">مكتملة</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.filter(t => t.status === 'قيد التنفيذ').length}</div>
          <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-red-600">{data.filter(t => t.status === 'متأخرة').length}</div>
          <div className="text-sm text-muted-foreground">متأخرة</div>
        </CardContent></Card>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المهمة</TableHead>
            <TableHead>مسند إلى</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإنجاز</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t: any) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.title}</TableCell>
              <TableCell>{t.assigned_to}</TableCell>
              <TableCell>{t.department}</TableCell>
              <TableCell><Badge variant={t.priority === 'عالية' ? 'destructive' : 'secondary'}>{t.priority}</Badge></TableCell>
              <TableCell><Badge variant={t.status === 'مكتملة' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
              <TableCell>{t.progress}%</TableCell>
              <TableCell>{t.due_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderMaintenanceReport = (data: any[]) => (
    <div id="report-print-content" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-green-600">{data.filter(m => m.status === 'مكتمل').length}</div>
          <div className="text-sm text-muted-foreground">مكتمل</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.filter(m => m.status === 'قيد المعالجة').length}</div>
          <div className="text-sm text-muted-foreground">قيد المعالجة</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-red-600">{formatCurrency(data.reduce((s, m) => s + (m.estimated_cost || 0), 0))}</div>
          <div className="text-sm text-muted-foreground">التكلفة المقدرة</div>
        </CardContent></Card>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المبنى</TableHead>
            <TableHead>الوحدة</TableHead>
            <TableHead>نوع المشكلة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التكلفة المقدرة</TableHead>
            <TableHead>تاريخ البلاغ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.building_name}</TableCell>
              <TableCell>{m.unit}</TableCell>
              <TableCell>{m.issue_type}</TableCell>
              <TableCell><Badge variant={m.priority === 'عاجلة' ? 'destructive' : 'secondary'}>{m.priority}</Badge></TableCell>
              <TableCell><Badge variant={m.status === 'مكتمل' ? 'default' : 'secondary'}>{m.status}</Badge></TableCell>
              <TableCell>{formatCurrency(m.estimated_cost || 0)}</TableCell>
              <TableCell>{m.reported_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground mt-2">إنشاء وإدارة التقارير التفصيلية والتحليلات</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCustomReportForm(true)}>
            <FileText className="w-4 h-4 ml-2" />
            إنشاء تقرير مخصص
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التقارير</CardTitle>
          <CardDescription>اختر الفترة الزمنية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly', 'quarterly'].map(p => (
                <Button key={p} variant={selectedPeriod === p ? 'default' : 'outline'} onClick={() => setSelectedPeriod(p)} size="sm">
                  {p === 'daily' ? 'يومي' : p === 'weekly' ? 'أسبوعي' : p === 'monthly' ? 'شهري' : 'ربع سنوي'}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mr-auto">
              <Input type="date" className="w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="flex items-center text-muted-foreground">إلى</span>
              <Input type="date" className="w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" title="تحميل Excel"
                        onClick={() => handleExcelDownload(report.type)}>
                        <FileSpreadsheet className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleViewReport(report.type, report.name, category.title)}>
                        <Eye className="w-4 h-4 ml-1" />
                        عرض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Viewer Dialog */}
      <Dialog open={showReportViewer} onOpenChange={setShowReportViewer}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
            <DialogDescription>فئة التقرير: {selectedReport?.category}</DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[65vh]">
            {renderReportContent()}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReportViewer(false)}>إغلاق</Button>
            <Button variant="outline" onClick={() => exportToPDF('report-print-content', selectedReport?.name || 'تقرير')}>
              <Printer className="w-4 h-4 ml-1" />
              طباعة PDF
            </Button>
            {selectedReport?.type && (
              <Button onClick={() => handleExcelDownload(selectedReport.type)}>
                <FileSpreadsheet className="w-4 h-4 ml-1" />
                تحميل Excel
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CustomReportForm
        open={showCustomReportForm}
        onOpenChange={setShowCustomReportForm}
        onSuccess={() => setShowCustomReportForm(false)}
      />
    </div>
  );
};

export default ReportsPage;
