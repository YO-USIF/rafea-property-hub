import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printingHandover, setPrintingHandover] = useState<any>(null);
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

  const printHandover = (h: any, company: 'suhail' | 'rafea') => {
    const escapeHtml = (str: string) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    const checkMark = (v: boolean) => v ? '✅' : '❌';
    const isSuhail = company === 'suhail';
    const companyName = isSuhail ? 'شركة سهيل طيبة للتطوير العقاري' : 'شركة رافع للتطوير العقاري';
    const logoUrl = isSuhail ? '/logos/suhail-tayba-logo.png' : '/logos/rafea-logo.jpeg';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>إقرار تسليم وحدة سكنية</title>
    <style>
    @page{size:A4;margin:15mm 15mm 15mm 15mm}
    body{font-family:Arial,sans-serif;padding:0;margin:0;direction:rtl;font-size:12px;color:#333}
    .page{padding:15mm;box-sizing:border-box}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a365d;padding-bottom:10px;margin-bottom:12px}
    .header-logo img{width:90px;height:90px;object-fit:contain;border-radius:8px}
    .header-title{text-align:center;flex:1}
    .header-title h1{font-size:18px;color:#1a365d;margin:0 0 4px}
    .header-title h2{font-size:13px;color:#555;margin:0;font-weight:normal}
    .header-company{font-size:11px;color:#777;text-align:left}
    .section{margin:8px 0;border:1px solid #ddd;padding:10px 12px;border-radius:6px}
    .section h3{margin:0 0 6px;color:#1a56db;border-bottom:1px solid #eee;padding-bottom:4px;font-size:13px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
    .field{margin:3px 0;font-size:12px}
    .field label{font-weight:bold;color:#555}
    .field span{margin-right:4px}
    .check-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;font-size:12px}
    .page-break{page-break-before:always}
    .declaration{background:#f9fafb;border:2px solid #1a56db;padding:18px;border-radius:8px;margin-top:10px}
    .declaration h3{text-align:center;color:#1a56db;font-size:15px;margin:0 0 12px;border:none}
    .declaration p{text-align:justify;line-height:1.9;font-size:12.5px;color:#333;margin:0 0 8px}
    .signature{margin-top:35px;display:flex;justify-content:space-between}
    .signature div{text-align:center;width:45%;border-top:1px solid #333;padding-top:8px}
    .footer-date{text-align:center;margin-top:15px;font-size:11px;color:#888}
    @media print{body{padding:0}.page{padding:0}}
    </style></head><body>

    <!-- الصفحة الأولى: بيانات الوحدة والفحص -->
    <div class="page">
    <div class="header">
    <div class="header-logo"><img src="${logoUrl}" alt="${escapeHtml(companyName)}" /></div>
    <div class="header-title"><h1>إقرار تسليم وحدة سكنية</h1><h2>${escapeHtml(companyName)}</h2></div>
    <div class="header-company"></div>
    </div>

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

    ${h.notes ? '<div class="section"><h3>ملاحظات</h3><p style="margin:0;font-size:12px">' + escapeHtml(h.notes) + '</p></div>' : ''}
    </div>

    <!-- الصفحة الثانية: الإقرار والتوقيعات -->
    <div class="page page-break" style="display:flex;flex-direction:column;min-height:calc(297mm - 30mm)">
    <div class="header">
    <div class="header-logo"><img src="${logoUrl}" alt="${escapeHtml(companyName)}" /></div>
    <div class="header-title"><h1 style="border:none;padding:0;margin:0 0 4px">إقرار المشتري</h1><h2>${escapeHtml(companyName)}</h2></div>
    <div class="header-company"></div>
    </div>

    <div style="margin:10px 0;padding:10px 15px;background:#f0f4ff;border-radius:8px;font-size:12px;border:1px solid #d0d9f0">
    <strong>المشروع:</strong> ${escapeHtml(h.project_name)} &nbsp;|&nbsp;
    <strong>الوحدة:</strong> ${escapeHtml(h.unit_number)} &nbsp;|&nbsp;
    <strong>العميل:</strong> ${escapeHtml(h.customer_name)} &nbsp;|&nbsp;
    <strong>التاريخ:</strong> ${escapeHtml(h.handover_date)}
    </div>

    <div class="declaration" style="flex:1;display:flex;flex-direction:column;justify-content:center">
    <h3>إقرار المشتري</h3>
    <p>
    هذا وأقر بتوقيعي أنا المشتري على هذا المحضر أنني قد استلمت الوحدة وشهادات الضمان المتعلقة بالوحدة، وذلك بعد أن تعرفت ووقفت على الوحدة وعاينتها وصفاً وحدوداً ومساحةً ومعالماً، المعاينة التامة النافية لكل جهالة أو غرر شرعي أو نظامي، وأقر بأنني وجدت الوحدة المباعة ومحتوياتها وتجهيزاتها خالية من العيوب وبحالة جيدة وصالحة، كما أقر أنه ليس لدي أي تحفظات في هذا الخصوص، وأن توقيعي على هذا المحضر هو إقرار مني أنا المشتري بقبول الوحدة وضماناتها ومحتوياتها بحالتها الراهنة دون أن يحق لي الرجوع على المالك مستقبلاً بأي إدّعاء يخالف ذلك أو مطالبات من أي نوع فيما يتعلق بالوحدة المباعة أو تجهيزاتها الداخلية والخارجية أمام أي جهة عامة أو خاصة أو قضائية.
    </p>
    <p>
    كما أقر أنا المشتري باعتباري مسؤولاً من وقت وتاريخ التوقيع على هذا المحضر المسؤولية المدنية والجنائية الكاملة عن الوحدة المباعة ومحتوياتها وتجهيزاتها، وعن أي تلف أو نقص أو ضرر من أي نوع قد يلحق بالوحدة أو العقار أو المساحات المشتركة بالعقار أو بالملّاك أو المستأجرين الآخرين في العقار أو الغير يرجع إلى خطأ أو إهمال أو امتناع صادر مني أو من أحد تابعي، هذا وأخلي مسؤولية المالك الكاملة من تاريخ ووقت التوقيع على هذا المحضر من أي مسؤولية أو مطالبة أو مصروفات أو غرامات أو خلافه قد تلحق بالوحدة المباعة أو ما يتعلق بها.
    </p>
    </div>

    <div style="margin-top:auto">
    <div class="signature">
    <div><p>توقيع المشتري (المستلم)</p><p>${escapeHtml(h.customer_name)}</p><p style="margin-top:25px">_______________</p></div>
    <div><p>توقيع المالك (المسلّم)</p><p style="margin-top:25px">_______________</p></div>
    </div>
    <div class="footer-date">تاريخ التوقيع: ${escapeHtml(h.handover_date)}</div>
    </div>
    </div>

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
                        <Button variant="outline" size="sm" onClick={() => { setPrintingHandover(h); setPrintDialogOpen(true); }}><Printer className="w-4 h-4" /></Button>
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
