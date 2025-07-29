import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Plus,
  BookOpen,
  BarChart3,
  Download,
  Eye,
  DollarSign
} from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

const AccountingPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<'income' | 'balance' | 'cashflow'>('income');
  
  const { user } = useAuth();
  const { 
    chartOfAccounts, 
    journalEntries, 
    isLoadingAccounts, 
    isLoadingEntries,
    createJournalEntry,
    generateIncomeStatement 
  } = useAccounting();
  
  const { toast } = useToast();

  // جلب الإيرادات مباشرة من المبيعات
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ['sales-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('price, status')
        .eq('status', 'مباع');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب المصروفات مباشرة من الفواتير
  const { data: invoicesData = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount, status');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب المستخلصات كمصروفات
  const { data: extractsData = [], isLoading: isLoadingExtracts } = useQuery({
    queryKey: ['extracts-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('extracts')
        .select('amount, status');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // إحصائيات سريعة مع useMemo لمنع إعادة الحساب
  const { totalRevenue, totalExpenses, netIncome } = useMemo(() => {
    if (isLoadingSales || isLoadingInvoices || isLoadingExtracts) {
      return { totalRevenue: 0, totalExpenses: 0, netIncome: 0 };
    }

    // حساب الإيرادات من المبيعات المباعة
    const revenue = salesData.reduce((sum, sale) => sum + (sale.price || 0), 0);
    
    // حساب المصروفات من الفواتير والمستخلصات
    const invoiceExpenses = invoicesData.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const extractExpenses = extractsData.reduce((sum, extract) => sum + (extract.amount || 0), 0);
    const expenses = invoiceExpenses + extractExpenses;

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome: revenue - expenses
    };
  }, [salesData, invoicesData, extractsData, isLoadingSales, isLoadingInvoices, isLoadingExtracts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleGenerateIncomeReport = () => handleGenerateReport('income');
  const handleGenerateBalanceReport = () => handleGenerateReport('balance');
  const handleGenerateCashFlowReport = () => handleGenerateReport('cashflow');

  const handleGenerateReport = async (reportType: 'income' | 'balance' | 'cashflow' = 'income') => {
    try {
      setSelectedReportType(reportType);
      
      if (reportType === 'income') {
        const result = await generateIncomeStatement.mutateAsync(selectedPeriod);
        setCurrentReport(result);
      } else if (reportType === 'balance') {
        const balanceSheet = await generateBalanceSheet();
        setCurrentReport(balanceSheet);
      } else if (reportType === 'cashflow') {
        const cashFlow = await generateCashFlowStatement();
        setCurrentReport(cashFlow);
      }
      
      setShowReportDialog(true);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({ title: "خطأ في إنشاء التقرير", variant: "destructive" });
    }
  };

  const generateBalanceSheet = async () => {
    // جلب بيانات الأصول من المبيعات والنقد
    const { data: salesAssets } = await supabase
      .from('sales')
      .select('price, remaining_amount, status')
      .eq('status', 'مباع');

    // جلب الخصوم من الفواتير والمستخلصات المستحقة
    const { data: invoiceLiabilities } = await supabase
      .from('invoices')
      .select('amount, status')
      .eq('status', 'غير مدفوع');

    const { data: extractLiabilities } = await supabase
      .from('extracts')
      .select('amount, status');

    // حساب الأصول
    const totalCash = salesAssets?.reduce((sum, sale) => sum + ((sale.price || 0) - (sale.remaining_amount || 0)), 0) || 0;
    const accountsReceivable = salesAssets?.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0) || 0;
    const totalAssets = totalCash + accountsReceivable;

    // حساب الخصوم
    const accountsPayable = invoiceLiabilities?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
    const contractorPayables = extractLiabilities?.reduce((sum, extract) => sum + (extract.amount || 0), 0) || 0;
    const totalLiabilities = accountsPayable + contractorPayables;

    // حقوق الملكية
    const equity = totalAssets - totalLiabilities;

    return {
      assets: {
        cash: totalCash,
        accountsReceivable: accountsReceivable,
        total: totalAssets
      },
      liabilities: {
        accountsPayable: accountsPayable,
        contractorPayables: contractorPayables,
        total: totalLiabilities
      },
      equity: equity,
      totalLiabilitiesAndEquity: totalLiabilities + equity
    };
  };

  const generateCashFlowStatement = async () => {
    // التدفقات النقدية من الأنشطة التشغيلية
    const { data: salesCashFlow } = await supabase
      .from('sales')
      .select('price, remaining_amount, sale_date, status')
      .eq('status', 'مباع')
      .gte('sale_date', selectedPeriod.startDate)
      .lte('sale_date', selectedPeriod.endDate);

    const { data: invoicePayments } = await supabase
      .from('invoices')
      .select('amount, invoice_date, status')
      .gte('invoice_date', selectedPeriod.startDate)
      .lte('invoice_date', selectedPeriod.endDate);

    const { data: extractPayments } = await supabase
      .from('extracts')
      .select('amount, extract_date')
      .gte('extract_date', selectedPeriod.startDate)
      .lte('extract_date', selectedPeriod.endDate);

    // التدفقات النقدية الداخلة
    const cashInflows = salesCashFlow?.reduce((sum, sale) => sum + ((sale.price || 0) - (sale.remaining_amount || 0)), 0) || 0;

    // التدفقات النقدية الخارجة
    const invoiceOutflows = invoicePayments?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
    const extractOutflows = extractPayments?.reduce((sum, extract) => sum + (extract.amount || 0), 0) || 0;
    const cashOutflows = invoiceOutflows + extractOutflows;

    // صافي التدفق النقدي
    const netCashFlow = cashInflows - cashOutflows;

    return {
      operatingActivities: {
        cashInflows: cashInflows,
        cashOutflows: cashOutflows,
        netOperatingCashFlow: netCashFlow
      },
      investingActivities: {
        cashInflows: 0,
        cashOutflows: 0,
        netInvestingCashFlow: 0
      },
      financingActivities: {
        cashInflows: 0,
        cashOutflows: 0,
        netFinancingCashFlow: 0
      },
      netCashFlow: netCashFlow,
      beginningCash: 0,
      endingCash: netCashFlow
    };
  };

  const quickStats = [
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'إجمالي المصروفات',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'صافي الربح/الخسارة',
      value: formatCurrency(netIncome),
      icon: Calculator,
      color: netIncome >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'عدد القيود',
      value: journalEntries?.length || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const accountTypeGroups = {
    'أصول': chartOfAccounts.filter(acc => acc.account_type === 'أصول'),
    'خصوم': chartOfAccounts.filter(acc => acc.account_type === 'خصوم'),
    'حقوق الملكية': chartOfAccounts.filter(acc => acc.account_type === 'حقوق الملكية'),
    'إيرادات': chartOfAccounts.filter(acc => acc.account_type === 'إيرادات'),
    'مصروفات': chartOfAccounts.filter(acc => acc.account_type === 'مصروفات')
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">النظام المحاسبي</h1>
          <p className="text-gray-600 mt-2">إدارة الحسابات والتقارير المالية</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleGenerateIncomeReport}>
            <BarChart3 className="w-4 h-4 ml-2" />
            إنشاء تقرير
          </Button>
          <Button onClick={() => setShowNewEntryDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>فترة التقرير</CardTitle>
          <CardDescription>اختر الفترة الزمنية للتقارير المالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="startDate">من تاريخ</Label>
              <Input
                id="startDate"
                type="date"
                value={selectedPeriod.startDate}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">إلى تاريخ</Label>
              <Input
                id="endDate"
                type="date"
                value={selectedPeriod.endDate}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button onClick={handleGenerateIncomeReport} className="mt-6">
              تحديث التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">القيود اليومية</TabsTrigger>
          <TabsTrigger value="accounts">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
        </TabsList>

        {/* Journal Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>القيود اليومية الحديثة</CardTitle>
              <CardDescription>آخر العمليات المحاسبية المسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? (
                <div className="text-center py-8">جارٍ التحميل...</div>
              ) : journalEntries.length > 0 ? (
                <div className="space-y-4">
                  {journalEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{entry.entry_number}</div>
                          <div className="text-sm text-gray-500">{entry.description}</div>
                          <div className="text-xs text-gray-400">{entry.transaction_date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                            {entry.status === 'posted' ? 'مرحل' : 'مسودة'}
                          </Badge>
                          <div className="text-sm">
                            <div>مدين: {formatCurrency(entry.total_debit)}</div>
                            <div>دائن: {formatCurrency(entry.total_credit)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {entry.journal_entry_lines && entry.journal_entry_lines.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          {entry.journal_entry_lines.map((line) => (
                            <div key={line.id} className="flex justify-between text-sm py-1">
                              <span>{line.account?.account_name} ({line.account?.account_code})</span>
                              <span>
                                {line.debit_amount > 0 && `مدين: ${formatCurrency(line.debit_amount)}`}
                                {line.credit_amount > 0 && `دائن: ${formatCurrency(line.credit_amount)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد قيود مسجلة</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart of Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {Object.entries(accountTypeGroups).map(([type, accounts]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle>{type}</CardTitle>
                <CardDescription>{accounts.length} حساب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-3">
                      <div className="font-medium">{account.account_code}</div>
                      <div className="text-sm text-gray-600">{account.account_name}</div>
                      {account.description && (
                        <div className="text-xs text-gray-500 mt-1">{account.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGenerateIncomeReport}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <CardTitle>قائمة الدخل</CardTitle>
                    <CardDescription>الإيرادات والمصروفات</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(netIncome)}</div>
                <p className="text-sm text-gray-500">صافي الربح/الخسارة</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGenerateBalanceReport}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle>الميزانية العمومية</CardTitle>
                    <CardDescription>الأصول والخصوم</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue - totalExpenses)}</div>
                <p className="text-sm text-gray-500">صافي حقوق الملكية</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGenerateCashFlowReport}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <div>
                    <CardTitle>التدفقات النقدية</CardTitle>
                    <CardDescription>حركة الأموال</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue - totalExpenses)}</div>
                <p className="text-sm text-gray-500">صافي التدفق النقدي</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Viewer Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReportType === 'income' && 'قائمة الدخل'}
              {selectedReportType === 'balance' && 'الميزانية العمومية'}
              {selectedReportType === 'cashflow' && 'قائمة التدفقات النقدية'}
            </DialogTitle>
            <DialogDescription>
              من {selectedPeriod.startDate} إلى {selectedPeriod.endDate}
            </DialogDescription>
          </DialogHeader>
          
          {currentReport && selectedReportType === 'income' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentReport.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(currentReport.totalExpenses)}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي المصروفات</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className={`text-2xl font-bold ${currentReport.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(currentReport.netIncome)}
                  </div>
                  <div className="text-sm text-gray-600">صافي الربح/الخسارة</div>
                </div>
              </div>
            </div>
          )}

          {currentReport && selectedReportType === 'balance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الأصول */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">الأصول</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>النقد والنقد المعادل</span>
                      <span className="font-bold">{formatCurrency(currentReport.assets.cash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العملاء والمدينون</span>
                      <span className="font-bold">{formatCurrency(currentReport.assets.accountsReceivable)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>إجمالي الأصول</span>
                      <span className="text-green-600">{formatCurrency(currentReport.assets.total)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* الخصوم وحقوق الملكية */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">الخصوم وحقوق الملكية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>الموردون والدائنون</span>
                      <span className="font-bold">{formatCurrency(currentReport.liabilities.accountsPayable)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مستحقات المقاولين</span>
                      <span className="font-bold">{formatCurrency(currentReport.liabilities.contractorPayables)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>إجمالي الخصوم</span>
                      <span>{formatCurrency(currentReport.liabilities.total)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 font-bold">
                      <span>حقوق الملكية</span>
                      <span>{formatCurrency(currentReport.equity)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>إجمالي الخصوم وحقوق الملكية</span>
                      <span>{formatCurrency(currentReport.totalLiabilitiesAndEquity)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentReport && selectedReportType === 'cashflow' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>الأنشطة التشغيلية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>التدفقات النقدية الداخلة</span>
                    <span className="font-bold text-green-600">{formatCurrency(currentReport.operatingActivities.cashInflows)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التدفقات النقدية الخارجة</span>
                    <span className="font-bold text-red-600">({formatCurrency(currentReport.operatingActivities.cashOutflows)})</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>صافي التدفق النقدي من الأنشطة التشغيلية</span>
                    <span className={currentReport.operatingActivities.netOperatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(currentReport.operatingActivities.netOperatingCashFlow)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(currentReport.beginningCash)}
                  </div>
                  <div className="text-sm text-gray-600">الرصيد في بداية الفترة</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className={`text-2xl font-bold ${currentReport.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(currentReport.netCashFlow)}
                  </div>
                  <div className="text-sm text-gray-600">صافي التدفق النقدي</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentReport.endingCash)}
                  </div>
                  <div className="text-sm text-gray-600">الرصيد في نهاية الفترة</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              إغلاق
            </Button>
            <Button onClick={() => toast({ title: "جاري التحميل", description: "سيتم إضافة خاصية التحميل قريباً" })}>
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingPage;