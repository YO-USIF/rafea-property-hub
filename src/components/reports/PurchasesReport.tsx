import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface PurchasesReportProps {
  data: any[];
  period: string;
}

const PurchasesReport: React.FC<PurchasesReportProps> = ({ data, period }) => {
  // حساب الإحصائيات
  const totalPurchases = data.length;
  const approvedPurchases = data.filter(purchase => purchase.status === 'معتمد').length;
  const pendingPurchases = data.filter(purchase => purchase.status === 'في انتظار الموافقة').length;
  const totalAmount = data.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
  const averagePurchaseAmount = totalAmount / totalPurchases || 0;

  // إعداد بيانات الرسم البياني - المشتريات حسب المورد
  const purchasesBySupplier = data.reduce((acc: any, purchase) => {
    const supplier = purchase.supplier_name || 'غير محدد';
    if (!acc[supplier]) {
      acc[supplier] = { name: supplier, amount: 0, count: 0 };
    }
    acc[supplier].amount += purchase.total_amount || 0;
    acc[supplier].count += 1;
    return acc;
  }, {});

  const supplierChartData = Object.values(purchasesBySupplier);

  // إعداد بيانات المشتريات حسب المشروع
  const purchasesByProject = data.reduce((acc: any, purchase) => {
    const project = purchase.project_name || 'غير محدد';
    if (!acc[project]) {
      acc[project] = { name: project, amount: 0, count: 0 };
    }
    acc[project].amount += purchase.total_amount || 0;
    acc[project].count += 1;
    return acc;
  }, {});

  const projectChartData = Object.values(purchasesByProject);

  // بيانات حالة المشتريات
  const statusData = data.reduce((acc: any, purchase) => {
    const status = purchase.status || 'غير محدد';
    if (!acc[status]) {
      acc[status] = { name: status, value: 0, amount: 0 };
    }
    acc[status].value += 1;
    acc[status].amount += purchase.total_amount || 0;
    return acc;
  }, {});

  const statusChartData = Object.values(statusData);

  // بيانات حالة التسليم
  const deliveryStatusData = data.reduce((acc: any, purchase) => {
    const status = purchase.delivery_status || 'غير محدد';
    if (!acc[status]) {
      acc[status] = { name: status, value: 0 };
    }
    acc[status].value += 1;
    return acc;
  }, {});

  const deliveryChartData = Object.values(deliveryStatusData);
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
            <CardTitle className="text-sm text-gray-600">إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchases}</div>
            <p className="text-xs text-gray-500">طلب شراء</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">المشتريات المعتمدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedPurchases}</div>
            <p className="text-xs text-gray-500">طلب معتمد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">إجمالي التكلفة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-gray-500">إجمالي المشتريات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">متوسط قيمة الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(averagePurchaseAmount)}</div>
            <p className="text-xs text-gray-500">متوسط الطلب</p>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المشتريات حسب المورد */}
        <Card>
          <CardHeader>
            <CardTitle>المشتريات حسب المورد</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(Number(value)),
                  name === 'count' ? 'عدد الطلبات' : 'إجمالي المبلغ'
                ]} />
                <Bar dataKey="amount" fill="#8884d8" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* حالة المشتريات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالة المشتريات</CardTitle>
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

      {/* المشتريات حسب المشروع */}
      <Card>
        <CardHeader>
          <CardTitle>المشتريات حسب المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'count' ? value : formatCurrency(Number(value)),
                name === 'count' ? 'عدد الطلبات' : 'إجمالي المبلغ'
              ]} />
              <Bar dataKey="amount" fill="#82ca9d" name="amount" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* حالة التسليم */}
      <Card>
        <CardHeader>
          <CardTitle>حالة التسليم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deliveryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {deliveryChartData.map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول تفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المشتريات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المشروع</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>تاريخ الطلب</TableHead>
                <TableHead>التسليم المتوقع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>حالة التسليم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.order_number}</TableCell>
                  <TableCell>{purchase.supplier_name}</TableCell>
                  <TableCell>{purchase.project_name}</TableCell>
                  <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>{purchase.order_date}</TableCell>
                  <TableCell>{purchase.expected_delivery}</TableCell>
                  <TableCell>
                    <Badge variant={purchase.status === 'معتمد' ? 'default' : 'secondary'}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={purchase.delivery_status === 'تم التسليم' ? 'default' : 'outline'}>
                      {purchase.delivery_status}
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

export default PurchasesReport;