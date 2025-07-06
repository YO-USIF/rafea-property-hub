
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MaintenanceForm from './forms/MaintenanceForm';

const MaintenancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(undefined);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "خطأ في تحميل طلبات الصيانة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "تم حذف طلب الصيانة بنجاح" });
      fetchRequests();
    } catch (error) {
      toast({
        title: "خطأ في حذف طلب الصيانة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const maintenanceRequests = [
    {
      id: 1,
      buildingName: 'مجمع النخيل السكني',
      unit: 'شقة 205',
      issueType: 'سباكة',
      description: 'تسريب في الحمام الرئيسي',
      priority: 'عالية',
      status: 'قيد التنفيذ',
      reportedDate: '2024-01-15',
      assignedTo: 'أحمد المصلح',
      estimatedCost: 250
    },
    {
      id: 2,
      buildingName: 'برج الياسمين',
      unit: 'مكتب 101',
      issueType: 'كهرباء',
      description: 'انقطاع في الإضاءة',
      priority: 'متوسطة',
      status: 'مكتمل',
      reportedDate: '2024-01-12',
      assignedTo: 'محمد الكهربائي',
      estimatedCost: 180
    },
    {
      id: 3,
      buildingName: 'مجمع الورود',
      unit: 'شقة 302',
      issueType: 'تكييف',
      description: 'عطل في وحدة التكييف المركزي',
      priority: 'عالية',
      status: 'جديد',
      reportedDate: '2024-01-18',
      assignedTo: 'غير محدد',
      estimatedCost: 450
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مكتمل</Badge>;
      case 'قيد التنفيذ':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد التنفيذ</Badge>;
      case 'جديد':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">جديد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'عالية':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'متوسطة':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const totalRequests = requests.length;
  const completedRequests = requests.filter(req => req.status === 'مكتمل').length;
  const pendingRequests = requests.filter(req => req.status !== 'مكتمل').length;
  const totalCost = requests.reduce((sum, req) => sum + req.estimated_cost, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الصيانة والتشغيل</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات الصيانة والأعطال</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة طلب صيانة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">طلب صيانة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">طلب مكتمل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">طلب معلق</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التكلفة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الصيانة</CardTitle>
          <CardDescription>قائمة جميع طلبات الصيانة والأعطال المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في طلبات الصيانة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline">تصفية</Button>
            <Button variant="outline">تصدير</Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">المبنى</TableHead>
                  <TableHead className="text-right">الوحدة</TableHead>
                  <TableHead className="text-right">نوع العطل</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المسؤول</TableHead>
                  <TableHead className="text-right">التكلفة المقدرة</TableHead>
                  <TableHead className="text-right">تاريخ الإبلاغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">#{request.id.slice(0,8)}</TableCell>
                    <TableCell>{request.building_name}</TableCell>
                    <TableCell>{request.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(request.priority)}
                        {request.issue_type}
                      </div>
                    </TableCell>
                    <TableCell>{request.priority}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{request.assigned_to || 'غير محدد'}</TableCell>
                    <TableCell>{request.estimated_cost} ر.س</TableCell>
                    <TableCell>{request.reported_date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRequest(request);
                            setFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا الطلب؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(request.id)}>
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MaintenanceForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingRequest(undefined);
        }}
        request={editingRequest}
        onSuccess={fetchRequests}
      />
    </div>
  );
};

export default MaintenancePage;
