import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ProjectDetailedReportProps {
  data: Array<{
    id: string;
    name: string;
    totalSales: number;
    salesCount: number;
    totalInvoices: number;
    invoicesCount: number;
    totalExtracts: number;
    extractsCount: number;
    netProfit: number;
    profitMargin: number;
  }>;
  period: string;
}

export const ProjectDetailedReport: React.FC<ProjectDetailedReportProps> = ({ data, period }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalSales = data.reduce((sum, project) => sum + project.totalSales, 0);
  const totalExpenses = data.reduce((sum, project) => sum + project.totalInvoices + project.totalExtracts, 0);
  const totalProfit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      {/* ملخص عام */}
      <Card>
        <CardHeader>
          <CardTitle>الملخص التنفيذي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">إجمالي المصروفات</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${totalProfit >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="text-sm text-gray-600 mb-1">صافي الربح/الخسارة</div>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(totalProfit)}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">عدد المشاريع</div>
              <div className="text-2xl font-bold text-purple-600">{data.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل المشاريع */}
      {data.map((project) => {
        const projectExpenses = project.totalInvoices + project.totalExtracts;
        const projectProfit = project.totalSales - projectExpenses;
        const isProfitable = projectProfit >= 0;

        return (
          <Card key={project.id} className="border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={isProfitable ? "default" : "destructive"}>
                      {isProfitable ? (
                        <><TrendingUp className="w-3 h-3 ml-1" /> مربح</>
                      ) : (
                        <><TrendingDown className="w-3 h-3 ml-1" /> خاسر</>
                      )}
                    </Badge>
                    {project.profitMargin !== 0 && (
                      <Badge variant="outline">
                        هامش الربح: {project.profitMargin.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-600">صافي الربح/الخسارة</div>
                  <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(projectProfit)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* المبيعات */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-700">💰 المبيعات</h4>
                    <Badge variant="outline">{project.salesCount} عملية</Badge>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">إجمالي المبيعات</div>
                    <div className="text-xl font-bold text-green-600 mt-1">
                      {formatCurrency(project.totalSales)}
                    </div>
                  </div>
                </div>

                {/* الفواتير */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-red-700">📄 الفواتير</h4>
                    <Badge variant="outline">{project.invoicesCount} فاتورة</Badge>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">إجمالي الفواتير</div>
                    <div className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(project.totalInvoices)}
                    </div>
                  </div>
                </div>

                {/* المستخلصات */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-orange-700">📋 المستخلصات</h4>
                    <Badge variant="outline">{project.extractsCount} مستخلص</Badge>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">إجمالي المستخلصات</div>
                    <div className="text-xl font-bold text-orange-600 mt-1">
                      {formatCurrency(project.totalExtracts)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ملخص التكاليف */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">إجمالي الإيرادات (المبيعات)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(project.totalSales)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">إجمالي المصروفات (فواتير + مستخلصات)</span>
                  <span className="font-semibold text-red-600">{formatCurrency(projectExpenses)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">صافي الربح/الخسارة</span>
                    <span className={`text-xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(projectProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* تحذير إذا لم توجد مبيعات */}
              {project.salesCount === 0 && (
                <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">لا توجد مبيعات مسجلة لهذا المشروع</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* جدول ملخص جميع المشاريع */}
      <Card>
        <CardHeader>
          <CardTitle>جدول ملخص المشاريع</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المشروع</TableHead>
                <TableHead className="text-right">المبيعات</TableHead>
                <TableHead className="text-right">الفواتير</TableHead>
                <TableHead className="text-right">المستخلصات</TableHead>
                <TableHead className="text-right">إجمالي المصروفات</TableHead>
                <TableHead className="text-right">صافي الربح</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((project) => {
                const expenses = project.totalInvoices + project.totalExtracts;
                const profit = project.totalSales - expenses;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {formatCurrency(project.totalSales)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(project.totalInvoices)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {formatCurrency(project.totalExtracts)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      {formatCurrency(expenses)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={profit >= 0 ? "default" : "destructive"}>
                        {profit >= 0 ? 'مربح' : 'خاسر'}
                      </Badge>
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
