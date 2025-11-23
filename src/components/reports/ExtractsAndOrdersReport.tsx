import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Calendar } from 'lucide-react';
import { useExtracts } from '@/hooks/useExtracts';
import { useAssignmentOrders } from '@/hooks/useAssignmentOrders';

const ExtractsAndOrdersReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  
  const { extracts } = useExtracts();
  const { assignmentOrders } = useAssignmentOrders();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredExtracts = extracts.filter(extract => {
    const extractDate = new Date(extract.extract_date);
    const matchesDate = (!startDate || extractDate >= new Date(startDate)) &&
                       (!endDate || extractDate <= new Date(endDate));
    const matchesProject = selectedProject === 'all' || extract.project_name === selectedProject;
    return matchesDate && matchesProject;
  });

  const filteredOrders = assignmentOrders.filter(order => {
    const orderDate = new Date(order.order_date);
    const matchesDate = (!startDate || orderDate >= new Date(startDate)) &&
                       (!endDate || orderDate <= new Date(endDate));
    const matchesProject = selectedProject === 'all' || order.project_name === selectedProject;
    return matchesDate && matchesProject;
  });

  const totalExtractsAmount = filteredExtracts.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalOrdersAmount = filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const grandTotal = totalExtractsAmount + totalOrdersAmount;

  // الحصول على قائمة المشاريع الفريدة
  const projects = Array.from(new Set([
    ...extracts.map(e => e.project_name),
    ...assignmentOrders.map(o => o.project_name)
  ]));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>تقرير المستخلصات وأوامر التكليف</CardTitle>
          <CardDescription>
            عرض شامل للمستخلصات وأوامر التكليف حسب الفترة والمشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
            <div className="space-y-2">
              <Label htmlFor="start_date">من تاريخ</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">إلى تاريخ</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">المشروع</Label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">جميع المشاريع</option>
                {projects.map((project, index) => (
                  <option key={index} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة التقرير
            </Button>
          </div>

          {/* ملخص التقرير */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخلصات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalExtractsAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  عدد المستخلصات: {filteredExtracts.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي أوامر التكليف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalOrdersAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  عدد الأوامر: {filteredOrders.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">الإجمالي الكلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(grandTotal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  المستخلصات + أوامر التكليف
                </p>
              </CardContent>
            </Card>
          </div>

          {/* جدول المستخلصات */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">المستخلصات</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم المستخص</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>المقاول</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExtracts.map((extract) => (
                    <TableRow key={extract.id}>
                      <TableCell className="font-medium">{extract.extract_number}</TableCell>
                      <TableCell>{extract.project_name}</TableCell>
                      <TableCell>{extract.contractor_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(extract.extract_date).toLocaleDateString('en-GB')}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(extract.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={extract.status === 'معتمد' ? 'default' : 'secondary'}>
                          {extract.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredExtracts.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                لا توجد مستخلصات في هذه الفترة
              </p>
            )}
          </div>

          {/* جدول أوامر التكليف */}
          <div>
            <h3 className="text-lg font-semibold mb-4">أوامر التكليف</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الأمر</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>المقاول</TableHead>
                    <TableHead>نوع العمل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.project_name}</TableCell>
                      <TableCell>{order.contractor_name}</TableCell>
                      <TableCell>{order.work_type || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(order.order_date).toLocaleDateString('en-GB')}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'مكتمل' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredOrders.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                لا توجد أوامر تكليف في هذه الفترة
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractsAndOrdersReport;
