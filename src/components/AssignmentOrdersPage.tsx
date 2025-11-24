import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  FileText, 
  Calculator,
  TrendingUp,
  DollarSign,
  Download,
  Filter,
  Calendar,
  Printer,
  Trash2
} from 'lucide-react';
import { useAssignmentOrders } from '@/hooks/useAssignmentOrders';
import { useAuth } from '@/hooks/useAuth';
import AssignmentOrderForm from '@/components/forms/AssignmentOrderForm';
import AssignmentOrderPrintView from '@/components/forms/AssignmentOrderPrintView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AssignmentOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  
  const { user } = useAuth();
  const { assignmentOrders, isLoading, deleteAssignmentOrder } = useAssignmentOrders();

  const filteredOrders = assignmentOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.contractor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = assignmentOrders.length;
  const totalAmount = assignmentOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const completedOrders = assignmentOrders.filter(order => order.status === 'مكتمل').length;
  const activeOrders = assignmentOrders.filter(order => order.status === 'قيد التنفيذ').length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'قيد التنفيذ': { variant: 'secondary', label: 'قيد التنفيذ' },
      'مكتمل': { variant: 'default', label: 'مكتمل' },
      'ملغي': { variant: 'destructive', label: 'ملغي' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
  };

  const handleDelete = async () => {
    if (deletingOrder) {
      await deleteAssignmentOrder.mutateAsync(deletingOrder.id);
      setDeletingOrder(null);
    }
  };

  const quickStats = [
    {
      title: 'إجمالي أوامر التكليف',
      value: totalOrders,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'المكتملة',
      value: completedOrders,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'قيد التنفيذ',
      value: activeOrders,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'إجمالي المبالغ',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>يجب تسجيل الدخول لعرض أوامر التكليف</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">أوامر التكليف</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة أوامر التكليف للأعمال اليومية</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة أمر تكليف
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في أوامر التكليف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 ml-2" />
                تصفية
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة أوامر التكليف</CardTitle>
          <CardDescription>
            عرض جميع أوامر التكليف ({filteredOrders.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الأمر</TableHead>
                  <TableHead>المشروع</TableHead>
                  <TableHead>المقاول</TableHead>
                  <TableHead>نوع العمل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المدة (أيام)</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
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
                    <TableCell>{order.duration_days || '-'}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(order.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(order)}
                          title="طباعة أمر التكليف"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {order.attached_file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={order.attached_file_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(order)}
                          title="تعديل أمر التكليف"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingOrder(order)}
                          title="حذف أمر التكليف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أوامر تكليف مسجلة'}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignmentOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        order={editingOrder}
        onSuccess={handleFormSuccess}
      />

      <AssignmentOrderPrintView
        open={!!printingOrder}
        onOpenChange={(open) => !open && setPrintingOrder(null)}
        order={printingOrder}
      />

      <AlertDialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف أمر التكليف رقم {deletingOrder?.order_number} نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssignmentOrdersPage;
