import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ProfitLossReportProps {
  salesData: any[];
  invoicesData: any[];
  purchasesData: any[];
  extractsData: any[];
  period: string;
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({ 
  salesData, 
  invoicesData, 
  purchasesData, 
  extractsData, 
  period 
}) => {
  // حساب الإيرادات
  const totalSalesRevenue = salesData.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const collectedRevenue = salesData.reduce((sum, sale) => sum + ((sale.price || 0) - (sale.remaining_amount || 0)), 0);
  const uncollectedRevenue = salesData.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0);

  // حساب المصروفات
  const totalInvoicesExpenses = invoicesData.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const totalPurchasesExpenses = purchasesData.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
  const totalExtractsExpenses = extractsData.reduce((sum, extract) => sum + (extract.amount || 0), 0);
  
  const totalExpenses = totalInvoicesExpenses + totalPurchasesExpenses + totalExtractsExpenses;

  // حساب الأرباح والخسائر
  const grossProfit = totalSalesRevenue - totalExpenses;
  const netProfit = collectedRevenue - totalExpenses;
  const profitMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;
  const collectionRate = totalSalesRevenue > 0 ? (collectedRevenue / totalSalesRevenue) * 100 : 0;

  // إعداد بيانات الرسم البياني - الإيرادات مقابل المصروفات
  const revenueVsExpenses = [
    { name: 'الإيرادات المحصلة', amount: collectedRevenue, type: 'revenue' },
    { name: 'إجمالي الإيرادات', amount: totalSalesRevenue, type: 'revenue' },
    { name: 'الفواتير', amount: totalInvoicesExpenses, type: 'expense' },
    { name: 'المشتريات', amount: totalPurchasesExpenses, type: 'expense' },
    { name: 'المستخلصات', amount: totalExtractsExpenses, type: 'expense' }
  ];

  // إعداد بيانات توزيع المصروفات
  const expenseDistribution = [
    { name: 'فواتير الموردين', value: totalInvoicesExpenses, percentage: totalExpenses > 0 ? (totalInvoicesExpenses / totalExpenses) * 100 : 0 },
    { name: 'مشتريات المشاريع', value: totalPurchasesExpenses, percentage: totalExpenses > 0 ? (totalPurchasesExpenses / totalExpenses) * 100 : 0 },
    { name: 'مستخلصات المقاولين', value: totalExtractsExpenses, percentage: totalExpenses > 0 ? (totalExtractsExpenses / totalExpenses) * 100 : 0 }
  ].filter(item => item.value > 0);

  // إعداد بيانات الربحية حسب المشروع
  const profitabilityByProject = salesData.reduce((acc: any, sale) => {
    const project = sale.project_name || 'غير محدد';
    if (!acc[project]) {
      acc[project] = { 
        name: project, 
        revenue: 0, 
        expenses: 0, 
        profit: 0, 
        margin: 0 
      };
    }
    acc[project].revenue += sale.price || 0;
    return acc;
  }, {});

  // إضافة المصروفات لكل مشروع
  [...invoicesData, ...purchasesData, ...extractsData].forEach(expense => {
    const project = expense.project_name || 'غير محدد';
    if (profitabilityByProject[project]) {
      const amount = expense.amount || expense.total_amount || 0;
      profitabilityByProject[project].expenses += amount;
    }
  });

  // حساب الربح والهامش لكل مشروع
  Object.values(profitabilityByProject).forEach((project: any) => {
    project.profit = project.revenue - project.expenses;
    project.margin = project.revenue > 0 ? (project.profit / project.revenue) * 100 : 0;
  });

  const projectProfitabilityData = Object.values(profitabilityByProject);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* الملخص التنفيذي */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl text-center">ملخص الأرباح والخسائر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalesRevenue)}</div>
              <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <div className="text-sm text-gray-600">إجمالي المصروفات</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(grossProfit)}
              </div>
              <div className="text-sm text-gray-600">صافي الربح/الخسارة</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">هامش الربح</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">الإيرادات المحصلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(collectedRevenue)}</div>
            <p className="text-xs text-gray-500">{collectionRate.toFixed(1)}% من الإجمالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">الإيرادات غير المحصلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{formatCurrency(uncollectedRevenue)}</div>
            <p className="text-xs text-gray-500">{(100 - collectionRate).toFixed(1)}% من الإجمالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">الربح النقدي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-gray-500">الربح المحصل فعلياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">معدل التحصيل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">من إجمالي المبيعات</p>
          </CardContent>
        </Card>
      </div>

      {/* الإيرادات مقابل المصروفات */}
      <Card>
        <CardHeader>
          <CardTitle>الإيرادات مقابل المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* توزيع المصروفات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseDistribution.map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium">{expense.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(expense.value)}</div>
                    <div className="text-sm text-gray-500">{expense.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الربحية حسب المشروع */}
      <Card>
        <CardHeader>
          <CardTitle>الربحية حسب المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={projectProfitabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === 'revenue' ? 'الإيرادات' : name === 'expenses' ? 'المصروفات' : 'صافي الربح'
              ]} />
              <Bar dataKey="revenue" fill="#10b981" name="revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="expenses" />
              <Bar dataKey="profit" fill="#6366f1" name="profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول تفصيلي للربحية حسب المشروع */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الربحية حسب المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المشروع</TableHead>
                <TableHead>الإيرادات</TableHead>
                <TableHead>المصروفات</TableHead>
                <TableHead>صافي الربح</TableHead>
                <TableHead>هامش الربح</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectProfitabilityData.map((project: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{formatCurrency(project.revenue)}</TableCell>
                  <TableCell>{formatCurrency(project.expenses)}</TableCell>
                  <TableCell className={project.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(project.profit)}
                  </TableCell>
                  <TableCell className={project.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {project.margin.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.profit >= 0 ? 'default' : 'destructive'}>
                      {project.profit >= 0 ? 'مربح' : 'خاسر'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;