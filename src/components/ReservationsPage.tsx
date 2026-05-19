import { useMemo, useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CalendarCheck, Clock, Search, Building2, Phone, User, Plus, CheckCircle2, XCircle,
} from 'lucide-react';
import SaleForm from '@/components/forms/SaleForm';
import { PermissionButton } from '@/components/PermissionButton';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';

const formatDate = (d?: string | null) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('en-GB');
  } catch {
    return d;
  }
};

const formatPrice = (p?: number | null) =>
  typeof p === 'number' && p > 0 ? p.toLocaleString('en-US') + ' ر.س' : '-';

export const ReservationsPage = () => {
  const { sales, isLoading, updateSale } = useSales();
  const { checkPermission } = usePermissions();
  const { isAdmin } = useUserRole();
  const canConvert = isAdmin || checkPermission('reservations', 'edit');

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [convertTarget, setConvertTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  // Reservations page only deals with reserved units
  const reservedUnits = useMemo(
    () => (Array.isArray(sales) ? sales : []).filter((u: any) => u.status === 'محجوز'),
    [sales]
  );

  const projects = useMemo(() => {
    const set = new Set<string>();
    reservedUnits.forEach((u: any) => u?.project_name && set.add(u.project_name));
    return Array.from(set);
  }, [reservedUnits]);

  const filtered = useMemo(() => {
    return reservedUnits.filter((u: any) => {
      if (projectFilter !== 'all' && u.project_name !== projectFilter) return false;
      if (search) {
        const t = search.toLowerCase();
        const hay = [
          u.unit_number, u.unit_type, u.project_name,
          u.customer_name, u.customer_phone, u.customer_id_number,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [reservedUnits, projectFilter, search]);

  const totalReservedValue = useMemo(
    () => filtered.reduce((sum, u: any) => sum + (Number(u.price) || 0), 0),
    [filtered]
  );

  // Group by project
  const groupedByProject = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((u: any) => {
      const key = u.project_name || 'بدون مشروع';
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    });
    return groups;
  }, [filtered]);

  const handleConvertToSold = async () => {
    if (!convertTarget) return;
    await updateSale.mutateAsync({
      id: convertTarget.id,
      ...convertTarget,
      status: 'مباع',
      sale_date: convertTarget.sale_date || new Date().toISOString().split('T')[0],
    });
    setConvertTarget(null);
  };

  const handleCancelReservation = async () => {
    if (!cancelTarget) return;
    await updateSale.mutateAsync({
      id: cancelTarget.id,
      ...cancelTarget,
      status: 'متاح',
      customer_id: null,
      customer_name: '',
      customer_phone: '',
      customer_id_number: '',
      sale_date: null,
    });
    setCancelTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">جارٍ تحميل الحجوزات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <CalendarCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة الحجوزات</h1>
            <p className="text-sm text-muted-foreground">
              الشقق المحجوزة فقط — عند إتمام البيع تنتقل تلقائياً إلى صفحة مبيعات الشقق
            </p>
          </div>
        </div>
        <PermissionButton
          pageName="reservations"
          requirePermission="create"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة حجز
        </PermissionButton>
      </div>

      <SaleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultStatus="محجوز"
        title="إضافة حجز جديد"
        description="أدخل بيانات العميل والوحدة المراد حجزها"
        onSuccess={() => setIsFormOpen(false)}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{reservedUnits.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي الوحدات المحجوزة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">مشاريع بها حجوزات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{formatPrice(totalReservedValue)}</p>
              <p className="text-xs text-muted-foreground">إجمالي قيمة الحجوزات</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="كل المشاريع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المشاريع</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث برقم الوحدة، العميل، الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <CalendarCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد حجوزات حالياً</p>
            <p className="text-sm mt-2">اضغط "إضافة حجز" لإنشاء حجز جديد</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByProject).map(([projectName, list]) => (
          <Card key={projectName}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {projectName}
                </CardTitle>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  {list.length} حجز
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-right">رقم الوحدة</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المساحة</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">رقم الهوية</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">تاريخ الحجز</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-center">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-semibold">{u.unit_number || '-'}</TableCell>
                        <TableCell>{u.unit_type || '-'}</TableCell>
                        <TableCell>{u.area ? `${u.area} م²` : '-'}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {u.customer_name || '-'}
                          </span>
                        </TableCell>
                        <TableCell dir="ltr" className="text-right">{u.customer_id_number || '-'}</TableCell>
                        <TableCell>
                          {u.customer_phone ? (
                            <span className="flex items-center gap-1" dir="ltr">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {u.customer_phone}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{formatDate(u.sale_date)}</TableCell>
                        <TableCell className="font-medium">{formatPrice(u.price)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canConvert && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => setConvertTarget(u)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                تحويل إلى مبيع
                              </Button>
                            )}
                            {canConvert && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                                onClick={() => setCancelTarget(u)}
                              >
                                <XCircle className="w-4 h-4" />
                                إلغاء الحجز
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Confirm convert */}
      <AlertDialog open={!!convertTarget} onOpenChange={(open) => !open && setConvertTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إتمام البيع</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تحويل حجز الوحدة <strong>{convertTarget?.unit_number}</strong> في مشروع{' '}
              <strong>{convertTarget?.project_name}</strong> إلى حالة "مباع"، وستظهر تلقائياً في صفحة مبيعات الشقق.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToSold} className="bg-emerald-600 hover:bg-emerald-700">
              تأكيد البيع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm cancel reservation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء الحجز</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إلغاء حجز الوحدة <strong>{cancelTarget?.unit_number}</strong> في مشروع{' '}
              <strong>{cancelTarget?.project_name}</strong> وستصبح متاحة للحجز مرة أخرى.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelReservation} className="bg-red-600 hover:bg-red-700">
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReservationsPage;
