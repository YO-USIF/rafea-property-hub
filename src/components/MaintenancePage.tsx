
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Printer, Home, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import MaintenanceForm from './forms/MaintenanceForm';
import MaintenancePrintView from './forms/MaintenancePrintView';
import UnitHandoversTab from './UnitHandoversTab';
import HOAManagementTab from './HOAManagementTab';

const MaintenancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(undefined);
  const [printRequest, setPrintRequest] = useState<any>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
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
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل طلبات الصيانة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "تم حذف طلب الصيانة بنجاح" });
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "خطأ في حذف طلب الصيانة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (request: any) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', request.id);
      if (error) throw error;

      // Broadcast notification to all users
      try {
        const { data: allProfiles } = await supabase.from('profiles').select('user_id');
        if (allProfiles) {
          const notifications = allProfiles
            .filter((p) => p.user_id !== user?.id)
            .map((p) => ({
              user_id: p.user_id,
              title: '✅ تم تعميد أمر تكاليف صيانة',
              message: `تم تعميد أمر تكاليف الصيانة رقم #${request.id.slice(0, 8)} - المبنى: ${request.building_name} - الوحدة: ${request.unit}`,
              type: 'info',
            }));
          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        }
      } catch (notifErr) {
        console.warn('Could not send approval notifications:', notifErr);
      }

      toast({ title: 'تم تعميد طلب الصيانة بنجاح' });
      fetchRequests();
    } catch (error: any) {
      toast({ title: 'خطأ في التعميد', description: error.message, variant: 'destructive' });
    }
  };

  const handleRevokeApproval = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ approved: false, approved_by: null, approved_at: null })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'تم إلغاء تعميد طلب الصيانة' });
      fetchRequests();
    } catch (error: any) {
      toast({ title: 'خطأ في إلغاء التعميد', description: error.message, variant: 'destructive' });
    }
  };
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
  const totalCost = requests.reduce((sum, req) => sum + (req.estimated_cost || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">الصيانة والتشغيل</h1>
        <p className="text-muted-foreground mt-2">إدارة الصيانة وتسليم الشقق واتحاد الملاك</p>
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />طلبات الصيانة
          </TabsTrigger>
          <TabsTrigger value="handovers" className="flex items-center gap-2">
            <Home className="w-4 h-4" />تسليم الشقق
          </TabsTrigger>
          <TabsTrigger value="hoa" className="flex items-center gap-2">
            <Users className="w-4 h-4" />اتحاد الملاك
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setFormOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />إضافة طلب صيانة
              </Button>
            </div>

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
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{pendingRequests}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي التكلفة</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCost.toLocaleString()} ر.س</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>طلبات الصيانة</CardTitle>
                <CardDescription>قائمة جميع طلبات الصيانة والأعطال المسجلة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="البحث في طلبات الصيانة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
                  </div>
                  <Button variant="outline" onClick={() => {
                    const headers = "رقم الطلب,المبنى,الوحدة,نوع العطل,الأولوية,الحالة,المسؤول,التكلفة المقدرة,تاريخ الإبلاغ\n";
                    const csvContent = headers + requests.map(request =>
                      `${request.id.slice(0,8)},${request.building_name},${request.unit},${request.issue_type},${request.priority},${request.status},${request.assigned_to || 'غير محدد'},${request.estimated_cost},${request.reported_date}`
                    ).join("\n");
                    const BOM = '\uFEFF';
                    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'maintenance.csv';
                    link.click();
                  }}>تصدير</Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 ml-2" />طباعة
                  </Button>
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
                        <TableHead className="text-right">إجراءات</TableHead>
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
                              <Button variant="outline" size="sm" onClick={() => { setPrintRequest(request); setPrintOpen(true); }} title="طباعة أمر تكاليف صيانة">
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => { setEditingRequest(request); setFormOpen(true); }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(request.id)}>حذف</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {requests.length === 0 && (
                        <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">لا توجد طلبات صيانة</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <MaintenanceForm
              open={formOpen}
              onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingRequest(undefined); }}
              request={editingRequest}
              onSuccess={fetchRequests}
            />

            <MaintenancePrintView
              open={printOpen}
              onOpenChange={setPrintOpen}
              request={printRequest}
            />
          </div>
        </TabsContent>

        <TabsContent value="handovers" className="mt-6">
          <UnitHandoversTab />
        </TabsContent>

        <TabsContent value="hoa" className="mt-6">
          <HOAManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenancePage;
