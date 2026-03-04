import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Users, DollarSign, Edit, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const HOAManagementTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [feeFormOpen, setFeeFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(undefined);
  const [editingFee, setEditingFee] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);

  const [memberForm, setMemberForm] = useState({
    project_name: '', member_name: '', phone: '', email: '', unit_number: '', building_name: '', membership_date: new Date().toISOString().split('T')[0], status: 'نشط', notes: ''
  });

  const [feeForm, setFeeForm] = useState({
    member_id: '', fee_type: 'صيانة شهرية', amount: 0, due_date: new Date().toISOString().split('T')[0], payment_date: '', payment_status: 'غير مدفوع', period: '', notes: ''
  });

  useEffect(() => { if (user) { fetchMembers(); fetchFees(); } }, [user]);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('hoa_members').select('*').order('created_at', { ascending: false });
    if (!error) setMembers(data || []);
  };

  const fetchFees = async () => {
    const { data, error } = await supabase.from('hoa_fees').select('*, hoa_members(member_name, unit_number, building_name)').order('created_at', { ascending: false });
    if (!error) setFees(data || []);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = { ...memberForm, user_id: user.id };
      if (editingMember?.id) {
        const { error } = await supabase.from('hoa_members').update(data).eq('id', editingMember.id);
        if (error) throw error;
        toast({ title: "تم تحديث بيانات العضو" });
      } else {
        const { error } = await supabase.from('hoa_members').insert([data]);
        if (error) throw error;
        toast({ title: "تم إضافة العضو بنجاح" });
      }
      setMemberFormOpen(false);
      setEditingMember(undefined);
      fetchMembers();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const data = { ...feeForm, user_id: user.id, payment_date: feeForm.payment_date || null };
      if (editingFee?.id) {
        const { error } = await supabase.from('hoa_fees').update(data).eq('id', editingFee.id);
        if (error) throw error;
        toast({ title: "تم تحديث الرسوم" });
      } else {
        const { error } = await supabase.from('hoa_fees').insert([data]);
        if (error) throw error;
        toast({ title: "تم إضافة الرسوم بنجاح" });
      }
      setFeeFormOpen(false);
      setEditingFee(undefined);
      fetchFees();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('hoa_members').delete().eq('id', id);
    if (!error) { toast({ title: "تم حذف العضو" }); fetchMembers(); fetchFees(); }
  };

  const deleteFee = async (id: string) => {
    const { error } = await supabase.from('hoa_fees').delete().eq('id', id);
    if (!error) { toast({ title: "تم حذف الرسوم" }); fetchFees(); }
  };

  const openEditMember = (m: any) => {
    setEditingMember(m);
    setMemberForm({ project_name: m.project_name, member_name: m.member_name, phone: m.phone || '', email: m.email || '', unit_number: m.unit_number, building_name: m.building_name, membership_date: m.membership_date, status: m.status, notes: m.notes || '' });
    setMemberFormOpen(true);
  };

  const openEditFee = (f: any) => {
    setEditingFee(f);
    setFeeForm({ member_id: f.member_id, fee_type: f.fee_type, amount: f.amount, due_date: f.due_date, payment_date: f.payment_date || '', payment_status: f.payment_status, period: f.period || '', notes: f.notes || '' });
    setFeeFormOpen(true);
  };

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'نشط').length;
  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = fees.filter(f => f.payment_status === 'مدفوع').reduce((s, f) => s + f.amount, 0);

  const filteredMembers = members.filter(m => m.member_name?.includes(searchTerm) || m.unit_number?.includes(searchTerm) || m.building_name?.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">اتحاد الملاك</h2>
          <p className="text-muted-foreground mt-1">إدارة أعضاء اتحاد الملاك والرسوم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditingFee(undefined); setFeeForm({ member_id: '', fee_type: 'صيانة شهرية', amount: 0, due_date: new Date().toISOString().split('T')[0], payment_date: '', payment_status: 'غير مدفوع', period: '', notes: '' }); setFeeFormOpen(true); }}>
            <CreditCard className="w-4 h-4 ml-2" />إضافة رسوم
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditingMember(undefined); setMemberForm({ project_name: '', member_name: '', phone: '', email: '', unit_number: '', building_name: '', membership_date: new Date().toISOString().split('T')[0], status: 'نشط', notes: '' }); setMemberFormOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" />إضافة عضو
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalMembers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">أعضاء نشطون</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeMembers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">إجمالي الرسوم</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalFees.toLocaleString()} ر.س</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">المحصل</CardTitle><DollarSign className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{paidFees.toLocaleString()} ر.س</div></CardContent></Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader><CardTitle>الأعضاء</CardTitle><CardDescription>قائمة أعضاء اتحاد الملاك</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="البحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المشروع</TableHead>
                <TableHead className="text-right">المبنى</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">الجوال</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredMembers.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.member_name}</TableCell>
                    <TableCell>{m.project_name}</TableCell>
                    <TableCell>{m.building_name}</TableCell>
                    <TableCell>{m.unit_number}</TableCell>
                    <TableCell>{m.phone || '-'}</TableCell>
                    <TableCell><Badge className={m.status === 'نشط' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>{m.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditMember(m)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>سيتم حذف العضو وجميع الرسوم المرتبطة به</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteMember(m.id)}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد بيانات</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card>
        <CardHeader><CardTitle>الرسوم والمدفوعات</CardTitle><CardDescription>تتبع رسوم اتحاد الملاك</CardDescription></CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-right">العضو</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">نوع الرسوم</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {fees.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>{(f.hoa_members as any)?.member_name || '-'}</TableCell>
                    <TableCell>{(f.hoa_members as any)?.unit_number || '-'}</TableCell>
                    <TableCell>{f.fee_type}</TableCell>
                    <TableCell>{f.amount?.toLocaleString()} ر.س</TableCell>
                    <TableCell>{f.due_date}</TableCell>
                    <TableCell><Badge className={f.payment_status === 'مدفوع' ? 'bg-green-100 text-green-800 hover:bg-green-100' : f.payment_status === 'متأخر' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>{f.payment_status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditFee(f)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد؟</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteFee(f.id)}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {fees.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد رسوم</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Member Form Dialog */}
      <Dialog open={memberFormOpen} onOpenChange={(o) => { setMemberFormOpen(o); if (!o) setEditingMember(undefined); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingMember ? 'تعديل عضو' : 'إضافة عضو جديد'}</DialogTitle><DialogDescription>بيانات عضو اتحاد الملاك</DialogDescription></DialogHeader>
          <form onSubmit={handleMemberSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>اسم العضو</Label><Input value={memberForm.member_name} onChange={e => setMemberForm(p => ({...p, member_name: e.target.value}))} required /></div>
              <div className="space-y-2"><Label>المشروع</Label><Input value={memberForm.project_name} onChange={e => setMemberForm(p => ({...p, project_name: e.target.value}))} required /></div>
              <div className="space-y-2"><Label>المبنى</Label><Input value={memberForm.building_name} onChange={e => setMemberForm(p => ({...p, building_name: e.target.value}))} required /></div>
              <div className="space-y-2"><Label>رقم الوحدة</Label><Input value={memberForm.unit_number} onChange={e => setMemberForm(p => ({...p, unit_number: e.target.value}))} required /></div>
              <div className="space-y-2"><Label>الجوال</Label><Input value={memberForm.phone} onChange={e => setMemberForm(p => ({...p, phone: e.target.value}))} /></div>
              <div className="space-y-2"><Label>البريد الإلكتروني</Label><Input value={memberForm.email} onChange={e => setMemberForm(p => ({...p, email: e.target.value}))} /></div>
              <div className="space-y-2"><Label>تاريخ العضوية</Label><Input type="date" value={memberForm.membership_date} onChange={e => setMemberForm(p => ({...p, membership_date: e.target.value}))} /></div>
              <div className="space-y-2"><Label>الحالة</Label>
                <Select value={memberForm.status} onValueChange={v => setMemberForm(p => ({...p, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="نشط">نشط</SelectItem><SelectItem value="غير نشط">غير نشط</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={memberForm.notes} onChange={e => setMemberForm(p => ({...p, notes: e.target.value}))} rows={2} /></div>
            <div className="flex justify-end space-x-2 space-x-reverse"><Button type="button" variant="outline" onClick={() => setMemberFormOpen(false)}>إلغاء</Button><Button type="submit" disabled={loading}>{loading ? 'جارٍ الحفظ...' : (editingMember ? 'تحديث' : 'إضافة')}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fee Form Dialog */}
      <Dialog open={feeFormOpen} onOpenChange={(o) => { setFeeFormOpen(o); if (!o) setEditingFee(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingFee ? 'تعديل رسوم' : 'إضافة رسوم جديدة'}</DialogTitle><DialogDescription>بيانات رسوم اتحاد الملاك</DialogDescription></DialogHeader>
          <form onSubmit={handleFeeSubmit} className="space-y-4">
            <div className="space-y-2"><Label>العضو</Label>
              <Select value={feeForm.member_id} onValueChange={v => setFeeForm(p => ({...p, member_id: v}))}><SelectTrigger><SelectValue placeholder="اختر العضو" /></SelectTrigger>
              <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.member_name} - {m.unit_number}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>نوع الرسوم</Label>
                <Select value={feeForm.fee_type} onValueChange={v => setFeeForm(p => ({...p, fee_type: v}))}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="صيانة شهرية">صيانة شهرية</SelectItem><SelectItem value="صيانة سنوية">صيانة سنوية</SelectItem><SelectItem value="رسوم خدمات">رسوم خدمات</SelectItem><SelectItem value="رسوم طوارئ">رسوم طوارئ</SelectItem><SelectItem value="أخرى">أخرى</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>المبلغ (ر.س)</Label><Input type="number" min="0" value={feeForm.amount} onChange={e => setFeeForm(p => ({...p, amount: parseFloat(e.target.value) || 0}))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>تاريخ الاستحقاق</Label><Input type="date" value={feeForm.due_date} onChange={e => setFeeForm(p => ({...p, due_date: e.target.value}))} required /></div>
              <div className="space-y-2"><Label>تاريخ الدفع</Label><Input type="date" value={feeForm.payment_date} onChange={e => setFeeForm(p => ({...p, payment_date: e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>حالة الدفع</Label>
                <Select value={feeForm.payment_status} onValueChange={v => setFeeForm(p => ({...p, payment_status: v}))}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="غير مدفوع">غير مدفوع</SelectItem><SelectItem value="مدفوع">مدفوع</SelectItem><SelectItem value="متأخر">متأخر</SelectItem><SelectItem value="جزئي">جزئي</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>الفترة</Label><Input value={feeForm.period} onChange={e => setFeeForm(p => ({...p, period: e.target.value}))} placeholder="مثال: يناير 2024" /></div>
            </div>
            <div className="space-y-2"><Label>ملاحظات</Label><Textarea value={feeForm.notes} onChange={e => setFeeForm(p => ({...p, notes: e.target.value}))} rows={2} /></div>
            <div className="flex justify-end space-x-2 space-x-reverse"><Button type="button" variant="outline" onClick={() => setFeeFormOpen(false)}>إلغاء</Button><Button type="submit" disabled={loading}>{loading ? 'جارٍ الحفظ...' : (editingFee ? 'تحديث' : 'إضافة')}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HOAManagementTab;
