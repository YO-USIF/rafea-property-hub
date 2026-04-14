import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF, salesColumns } from '@/lib/reportExport';

interface SalesReportProps {
  data: any[];
  period: string;
}

const SalesReport: React.FC<SalesReportProps> = ({ data, period }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects
  const projects = [...new Set(data.map(s => s.project_name).filter(Boolean))];

  // Filter data by project
  const filteredData = selectedProject === 'all' ? data : data.filter(s => s.project_name === selectedProject);

  const totalSales = filteredData.length;
  const completedSales = filteredData.filter(sale => sale.status === 'مباع').length;
  const totalRevenue = filteredData.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const averageSalePrice = totalRevenue / totalSales || 0;
  const remainingAmount = filteredData.reduce((sum, sale) => sum + (sale.remaining_amount || 0), 0);

  const salesByUnitType = filteredData.reduce((acc: any, sale) => {
    const type = sale.unit_type || 'غير محدد';
    if (!acc[type]) acc[type] = { name: type, count: 0, revenue: 0 };
    acc[type].count += 1;
    acc[type].revenue += sale.price || 0;
    return acc;
  }, {});
  const unitTypeChartData = Object.values(salesByUnitType);

  const statusData = filteredData.reduce((acc: any, sale) => {
    const status = sale.status || 'غير محدد';
    if (!acc[status]) acc[status] = { name: status, value: 0 };
    acc[status].value += 1;
    return acc;
  }, {});
  const statusChartData = Object.values(statusData);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const projectLabel = selectedProject === 'all' ? 'جميع المشاريع' : selectedProject;

  return (
    <div className="space-y-6">
      {/* فلتر المشروع + أزرار التحميل */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              {projects.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportToExcel(filteredData, salesColumns, `تقرير_المبيعات_${projectLabel}`)}>
          <FileSpreadsheet className="w-4 h-4 ml-1" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToPDF('report-print-content', `تقرير المبيعات - ${projectLabel}`)}>
          <FileText className="w-4 h-4 ml-1" />
          PDF
        </Button>
      </div>

      <div id="report-print-content">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي المبيعات</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{totalSales}</div><p className="text-xs text-muted-foreground">وحدة</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">المبيعات المكتملة</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{completedSales}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي الإيرادات</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">متوسط سعر الوحدة</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{formatCurrency(averageSalePrice)}</div></CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>المبيعات حسب نوع الوحدة</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={unitTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="عدد الوحدات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>توزيع حالة المبيعات</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} dataKey="value">
                    {statusChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* جدول تفصيلي */}
        <Card>
          <CardHeader><CardTitle>تفاصيل المبيعات - {projectLabel}</CardTitle></CardHeader>
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
                {filteredData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell>{sale.project_name}</TableCell>
                    <TableCell>{sale.unit_type}</TableCell>
                    <TableCell>{sale.unit_number}</TableCell>
                    <TableCell>{formatCurrency(sale.price)}</TableCell>
                    <TableCell>{formatCurrency(sale.remaining_amount || 0)}</TableCell>
                    <TableCell><Badge variant={sale.status === 'مباع' ? 'default' : 'secondary'}>{sale.status}</Badge></TableCell>
                    <TableCell>{sale.sale_date || 'غير محدد'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ملخص المدفوعات */}
        <Card className="mt-4">
          <CardHeader><CardTitle>ملخص المدفوعات</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-green-700">المبلغ المحصل</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue - remainingAmount)}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-yellow-700">المبلغ المتبقي</div>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(remainingAmount)}</div>
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
    </div>
  );
};

export default SalesReport;
