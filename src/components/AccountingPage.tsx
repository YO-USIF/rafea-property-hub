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
import { useMemo } from 'react';

const AccountingPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  
  const { 
    chartOfAccounts, 
    journalEntries, 
    isLoadingAccounts, 
    isLoadingEntries,
    createJournalEntry,
    generateIncomeStatement 
  } = useAccounting();
  
  const { toast } = useToast();

  // إحصائيات سريعة مع useMemo لمنع إعادة الحساب
  const { totalRevenue, totalExpenses, netIncome } = useMemo(() => {
    if (!journalEntries || isLoadingEntries) {
      return { totalRevenue: 0, totalExpenses: 0, netIncome: 0 };
    }

    const revenue = journalEntries
      .filter(entry => entry.journal_entry_lines?.some(line => 
        line.account?.account_code?.startsWith('4') && line.credit_amount > 0
      ))
      .reduce((sum, entry) => {
        const revenueLines = entry.journal_entry_lines?.filter(line => 
          line.account?.account_code?.startsWith('4')
        ) || [];
        return sum + revenueLines.reduce((lineSum, line) => lineSum + (line.credit_amount || 0), 0);
      }, 0);

    const expenses = journalEntries
      .filter(entry => entry.journal_entry_lines?.some(line => 
        line.account?.account_code?.startsWith('5') && line.debit_amount > 0
      ))
      .reduce((sum, entry) => {
        const expenseLines = entry.journal_entry_lines?.filter(line => 
          line.account?.account_code?.startsWith('5')
        ) || [];
        return sum + expenseLines.reduce((lineSum, line) => lineSum + (line.debit_amount || 0), 0);
      }, 0);

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome: revenue - expenses
    };
  }, [journalEntries, isLoadingEntries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleGenerateReport = async () => {
    try {
      const result = await generateIncomeStatement.mutateAsync(selectedPeriod);
      setCurrentReport(result);
      setShowReportDialog(true);
    } catch (error) {
      console.error('Error generating report:', error);
    }
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
          <Button variant="outline" onClick={handleGenerateReport}>
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
            <Button onClick={handleGenerateReport} className="mt-6">
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
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGenerateReport}>
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

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
                <div className="text-2xl font-bold text-blue-600">قريباً</div>
                <p className="text-sm text-gray-500">قيد التطوير</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
                <div className="text-2xl font-bold text-purple-600">قريباً</div>
                <p className="text-sm text-gray-500">قيد التطوير</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Viewer Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>قائمة الدخل</DialogTitle>
            <DialogDescription>
              من {selectedPeriod.startDate} إلى {selectedPeriod.endDate}
            </DialogDescription>
          </DialogHeader>
          
          {currentReport && (
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
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => toast({ title: "جاري التحميل", description: "سيتم إضافة خاصية التحميل قريباً" })}>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountingPage;