import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2, Printer, Home, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import UnitHandoverForm from './forms/UnitHandoverForm';

const UnitHandoversTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(undefined);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchHandovers();
  }, [user]);

  const fetchHandovers = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_handovers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHandovers(data || []);
    } catch (error: any) {
      toast({ title: "خطأ في تحميل البيانات", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('unit_handovers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "تم حذف إقرار التسليم بنجاح" });
      fetchHandovers();
    } catch (error: any) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'تم التسليم': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 ml-1" />تم التسليم</Badge>;
      case 'قيد التسليم': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 ml-1" />قيد التسليم</Badge>;
      case 'مرفوض': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 ml-1" />مرفوض</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const printHandover = (h: any) => {
    const escapeHtml = (str: string) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    const checkMark = (v: boolean) => v ? '✅' : '❌';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>إقرار تسليم وحدة سكنية</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;direction:rtl}h1{text-align:center;border-bottom:2px solid #333;padding-bottom:10px}
    .section{margin:20px 0;border:1px solid #ddd;padding:15px;border-radius:8px}
    .section h3{margin:0 0 10px;color:#1a56db;border-bottom:1px solid #eee;padding-bottom:5px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .field{margin:5px 0}.field label{font-weight:bold;color:#555}.field span{margin-right:5px}
    .check-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px}
    .signature{margin-top:40px;display:flex;justify-content:space-between}.signature div{text-align:center;width:45%;border-top:1px solid #333;padding-top:10px}
    @media print{body{padding:15px}}</style></head><body>
    <h1>إقرار تسليم وحدة سكنية</h1>
    <div class="section"><h3>بيانات الوحدة</h3><div class="grid3">
    <div class="field"><label>المشروع:</label> <span>${escapeHtml(h.project_name)}</span></div>
    <div class="field"><label>المبنى:</label> <span>${escapeHtml(h.building_name)}</span></div>
    <div class="field"><label>رقم الوحدة:</label> <span>${escapeHtml(h.unit_number)}</span></div>
    <div class="field"><label>نوع الوحدة:</label> <span>${escapeHtml(h.unit_type)}</span></div>
    <div class="field"><label>الطابق:</label> <span>${escapeHtml(h.floor_number || '-')}</span></div>
    <div class="field"><label>تاريخ التسليم:</label> <span>${escapeHtml(h.handover_date)}</span></div>
    </div></div>
    <div class="section"><h3>بيانات العميل</h3><div class="grid3">
    <div class="field"><label>الاسم:</label> <span>${escapeHtml(h.customer_name)}</span></div>
    <div class="field"><label>الجوال:</label> <span>${escapeHtml(h.customer_phone || '-')}</span></div>
    <div class="field"><label>رقم الهوية:</label> <span>${escapeHtml(h.customer_id_number || '-')}</span></div>
    </div></div>
    <div class="section"><h3>قراءات العدادات</h3><div class="grid">
    <div class="field"><label>عداد الكهرباء:</label> <span>${escapeHtml(h.electricity_meter_reading || '-')}</span></div>
    <div class="field"><label>عداد الماء:</label> <span>${escapeHtml(h.water_meter_reading || '-')}</span></div>
    </div></div>
    <div class="section"><h3>المفاتيح المسلمة</h3><div class="grid">
    <div class="field"><label>العدد:</label> <span>${h.keys_delivered || 0}</span></div>
    <div class="field"><label>التفاصيل:</label> <span>${escapeHtml(h.keys_description || '-')}</span></div>
    </div></div>
    <div class="section"><h3>قائمة الفحص</h3><div class="check-grid">
    <div>${checkMark(h.check_electricity)} الكهرباء</div>
    <div>${checkMark(h.check_plumbing)} السباكة</div>
    <div>${checkMark(h.check_painting)} الدهانات</div>
    <div>${checkMark(h.check_flooring)} الأرضيات</div>
    <div>${checkMark(h.check_doors_windows)} الأبواب والنوافذ</div>
    <div>${checkMark(h.check_ac)} التكييف</div>
    <div>${checkMark(h.check_kitchen)} المطبخ</div>
    <div>${checkMark(h.check_bathrooms)} دورات المياه</div>
    </div></div>
    <div class="section"><h3>الضمانات</h3><div class="grid">
    <div class="field"><label>فترة الضمان:</label> <span>${h.warranty_period_months || 12} شهر</span></div>
    <div class="field"><label>ملاحظات:</label> <span>${escapeHtml(h.warranty_notes || '-')}</span></div>
    </div></div>
    ${h.notes ? `<div class="section"><h3>ملاحظات</h3><p>${escapeHtml(h.notes)}</p></div>` : ''}
    <div class="signature"><div><p>توقيع العميل</p><p>${escapeHtml(h.customer_name)}</p></div><div><p>توقيع المسؤول</p><p>_______________</p></div></div>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = handovers.filter(h =>
    h.customer_name?.includes(searchTerm) || h.unit_number?.includes(searchTerm) || h.building_name?.includes(searchTerm) || h.project_name?.includes(searchTerm)
  );

  const totalHandovers = handovers.length;
  const completed = handovers.filter(h => h.status === 'تم التسليم').length;
  const pending = handovers.filter(h => h.status === 'قيد التسليم').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">تسليم الشقق</h2>
          <p className="text-muted-foreground mt-1">إدارة عمليات تسليم الوحدات السكنية للعملاء</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />إقرار تسليم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسليمات</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalHandovers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم التسليم</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التسليم</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل التسليمات</CardTitle>
          <CardDescription>قائمة جميع إقرارات تسليم الوحدات السكنية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="البحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">المبنى</TableHead>
                  <TableHead className="text-right">الوحدة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">تاريخ التسليم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التوقيع</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.project_name}</TableCell>
                    <TableCell>{h.building_name}</TableCell>
                    <TableCell>{h.unit_number}</TableCell>
                    <TableCell>{h.customer_name}</TableCell>
                    <TableCell>{h.handover_date}</TableCell>
                    <TableCell>{getStatusBadge(h.status)}</TableCell>
                    <TableCell>{h.customer_signature_confirmed ? <Badge className="bg-green-100 text-green-800">موقع</Badge> : <Badge variant="outline">غير موقع</Badge>}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => printHandover(h)}><Printer className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => { setEditing(h); setFormOpen(true); }}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد؟</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(h.id)}>حذف</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد بيانات</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UnitHandoverForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(undefined); }} handover={editing} onSuccess={fetchHandovers} />
    </div>
  );
};

export default UnitHandoversTab;
