import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SalesReportProps {
  data: any[];
  period: string;
}

const SalesReport: React.FC<SalesReportProps> = ({ data, period }) => {
  // حساب الإحصائيات
  const totalSales = data.length;
  const completedSales = data.filter(sale => sale.status === 'مباع').length;
  const totalRevenue = data.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const averageSalePrice = totalRevenue / totalSales || 0;
  const remainingAmount = data.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0);

  // إعداد بيانات الرسم البياني - المبيعات حسب نوع الوحدة
  const salesByUnitType = data.reduce((acc: any, sale) => {
    const type = sale.unit_type || 'غير محدد';
    if (!acc[type]) {
      acc[type] = { name: type, count: 0, revenue: 0 };
    }
    acc[type].count += 1;
    acc[type].revenue += sale.price || 0;
    return acc;
  }, {});

  const unitTypeChartData = Object.values(salesByUnitType);

  // إعداد بيانات المبيعات حسب المشروع
  const salesByProject = data.reduce((acc: any, sale) => {
    const project = sale.project_name || 'غير محدد';
    if (!acc[project]) {
      acc[project] = { name: project, count: 0, revenue: 0 };
    }
    acc[project].count += 1;
    acc[project].revenue += sale.price || 0;
    return acc;
  }, {});

  const projectChartData = Object.values(salesByProject);

  // بيانات الرسم الدائري - حالة المبيعات
  const statusData = data.reduce((acc: any, sale) => {
    const status = sale.status || 'غير محدد';
    if (!acc[status]) {
      acc[status] = { name: status, value: 0 };
    }
    acc[status].value += 1;
    return acc;
  }, {});

  const statusChartData = Object.values(statusData);
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
            <CardTitle className="text-sm text-gray-600">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
            <p className="text-xs text-gray-500">وحدة مباعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">المبيعات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSales}</div>
            <p className="text-xs text-gray-500">معاملة مكتملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500">إجمالي المبيعات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">متوسط سعر الوحدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(averageSalePrice)}</div>
            <p className="text-xs text-gray-500">متوسط السعر</p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المبيعات حسب نوع الوحدة */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات حسب نوع الوحدة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unitTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(Number(value)),
                  name === 'count' ? 'عدد الوحدات' : 'الإيرادات'
                ]} />
                <Bar dataKey="count" fill="#8884d8" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* حالة المبيعات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالة المبيعات</CardTitle>
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

      {/* المبيعات حسب المشروع */}
      <Card>
        <CardHeader>
          <CardTitle>المبيعات حسب المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'count' ? value : formatCurrency(Number(value)),
                name === 'count' ? 'عدد الوحدات' : 'الإيرادات'
              ]} />
              <Bar dataKey="revenue" fill="#82ca9d" name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول تفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العميل</TableHead>
                <TableHead>المشروع</TableHead>
                <TableHead>نوع الوحدة</TableHead>
                <TableHead>رقم الوحدة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المبلغ المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ البيع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{sale.project_name}</TableCell>
                  <TableCell>{sale.unit_type}</TableCell>
                  <TableCell>{sale.unit_number}</TableCell>
                  <TableCell>{formatCurrency(sale.price)}</TableCell>
                  <TableCell>{formatCurrency(sale.remaining_amount || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'مباع' ? 'default' : 'secondary'}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.sale_date || 'غير محدد'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ملخص المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-green-700">المبلغ المحصل</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue - remainingAmount)}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">المبلغ المتبقي</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(remainingAmount)}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">نسبة التحصيل</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalRevenue > 0 ? Math.round(((totalRevenue - remainingAmount) / totalRevenue) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReport;