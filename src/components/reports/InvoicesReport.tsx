import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface InvoicesReportProps {
  data: any[];
  period: string;
}

const InvoicesReport: React.FC<InvoicesReportProps> = ({ data, period }) => {
  // حساب الإحصائيات
  const totalInvoices = data.length;
  const paidInvoices = data.filter(invoice => invoice.status === 'مدفوع').length;
  const unpaidInvoices = data.filter(invoice => invoice.status === 'غير مدفوع').length;
  const overdueInvoices = data.filter(invoice => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return invoice.status === 'غير مدفوع' && dueDate < today;
  }).length;
  
  const totalAmount = data.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const paidAmount = data.filter(inv => inv.status === 'مدفوع').reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;
  const averageInvoiceAmount = totalAmount / totalInvoices || 0;

  // إعداد بيانات الرسم البياني - الفواتير حسب المورد
  const invoicesBySupplier = data.reduce((acc: any, invoice) => {
    const supplier = invoice.supplier_name || 'غير محدد';
    if (!acc[supplier]) {
      acc[supplier] = { name: supplier, amount: 0, count: 0 };
    }
    acc[supplier].amount += invoice.amount || 0;
    acc[supplier].count += 1;
    return acc;
  }, {});

  const supplierChartData = Object.values(invoicesBySupplier);

  // إعداد بيانات الفواتير حسب المشروع
  const invoicesByProject = data.reduce((acc: any, invoice) => {
    const project = invoice.project_name || 'غير محدد';
    if (!acc[project]) {
      acc[project] = { name: project, amount: 0, count: 0 };
    }
    acc[project].amount += invoice.amount || 0;
    acc[project].count += 1;
    return acc;
  }, {});

  const projectChartData = Object.values(invoicesByProject);

  // بيانات حالة الفواتير
  const statusData = data.reduce((acc: any, invoice) => {
    const status = invoice.status || 'غير محدد';
    if (!acc[status]) {
      acc[status] = { name: status, value: 0, amount: 0 };
    }
    acc[status].value += 1;
    acc[status].amount += invoice.amount || 0;
    return acc;
  }, {});

  const statusChartData = Object.values(statusData);

  // بيانات الفواتير حسب الشهر (افتراضية بناءً على تاريخ الإنشاء)
  const invoicesByMonth = data.reduce((acc: any, invoice) => {
    const date = new Date(invoice.invoice_date || invoice.created_at);
    const month = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
    if (!acc[month]) {
      acc[month] = { name: month, amount: 0, count: 0 };
    }
    acc[month].amount += invoice.amount || 0;
    acc[month].count += 1;
    return acc;
  }, {});

  const monthlyChartData = Object.values(invoicesByMonth).sort((a: any, b: any) => {
    return new Date(a.name).getTime() - new Date(b.name).getTime();
  });

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
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalInvoices}</div>
            <p className="text-xs text-gray-500">فاتورة مسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">الفواتير المدفوعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
            <p className="text-xs text-gray-500">فاتورة مدفوعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">الفواتير المتأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-gray-500">فاتورة متأخرة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي المبلغ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-gray-500">إجمالي الفواتير</p>
          </CardContent>
        </Card>
      </div>

      {/* معلومات الدفع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">المبلغ المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-gray-500">
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">المبلغ غير المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</div>
            <p className="text-xs text-gray-500">
              {totalAmount > 0 ? Math.round((unpaidAmount / totalAmount) * 100) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700">متوسط قيمة الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{formatCurrency(averageInvoiceAmount)}</div>
            <p className="text-xs text-gray-500">متوسط القيمة</p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الفواتير حسب المورد */}
        <Card>
          <CardHeader>
            <CardTitle>الفواتير حسب المورد</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(Number(value)),
                  name === 'count' ? 'عدد الفواتير' : 'إجمالي المبلغ'
                ]} />
                <Bar dataKey="amount" fill="#8884d8" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* حالة الفواتير */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالة الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الفواتير حسب الشهر */}
      <Card>
        <CardHeader>
          <CardTitle>تطور الفواتير الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'count' ? value : formatCurrency(Number(value)),
                name === 'count' ? 'عدد الفواتير' : 'إجمالي المبلغ'
              ]} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" name="amount" />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" name="count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الفواتير حسب المشروع */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير حسب المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'count' ? value : formatCurrency(Number(value)),
                name === 'count' ? 'عدد الفواتير' : 'إجمالي المبلغ'
              ]} />
              <Bar dataKey="amount" fill="#82ca9d" name="amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول تفصيلي للفواتير المتأخرة */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير المتأخرة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>أيام التأخير</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.filter(invoice => {
                const dueDate = new Date(invoice.due_date);
                const today = new Date();
                return invoice.status === 'غير مدفوع' && dueDate < today;
              }).map((invoice) => {
                const dueDate = new Date(invoice.due_date);
                const today = new Date();
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.supplier_name}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{invoice.due_date}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{daysOverdue} يوم</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{invoice.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesReport;