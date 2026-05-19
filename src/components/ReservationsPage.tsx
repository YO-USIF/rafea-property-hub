import { useMemo, useState } from 'react';
import { useSales } from '@/hooks/useSales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CalendarCheck, CheckCircle2, Clock, Home, Search, Building2, Phone, User, Plus,
} from 'lucide-react';
import SaleForm from '@/components/forms/SaleForm';
import { PermissionButton } from '@/components/PermissionButton';

const statusBadge = (status: string) => {
  switch (status) {
    case 'مباع':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1"><CheckCircle2 className="w-3 h-3" />مباع</Badge>;
    case 'محجوز':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><Clock className="w-3 h-3" />محجوز</Badge>;
    case 'متاح':
      return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 gap-1"><Home className="w-3 h-3" />متاح</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

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
  const { sales, isLoading } = useSales();
  const [filter, setFilter] = useState<'all' | 'متاح' | 'محجوز' | 'مباع'>('all');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const units = useMemo(() => (Array.isArray(sales) ? sales : []), [sales]);

  const projects = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u: any) => u?.project_name && set.add(u.project_name));
    return Array.from(set);
  }, [units]);

  const filtered = useMemo(() => {
    return units.filter((u: any) => {
      if (filter !== 'all' && u.status !== filter) return false;
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
  }, [units, filter, projectFilter, search]);

  const stats = useMemo(() => {
    const scope = projectFilter === 'all'
      ? units
      : units.filter((u: any) => u.project_name === projectFilter);
    return {
      total: scope.length,
      available: scope.filter((u: any) => u.status === 'متاح').length,
      reserved: scope.filter((u: any) => u.status === 'محجوز').length,
      sold: scope.filter((u: any) => u.status === 'مباع').length,
    };
  }, [units, projectFilter]);

  // Group filtered by project for the gallery view
  const groupedByProject = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((u: any) => {
      const key = u.project_name || 'بدون مشروع';
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    });
    return groups;
  }, [filtered]);

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
            <p className="text-sm text-muted-foreground">عرض الشقق المتاحة والمحجوزة والمباعة لكل مشروع</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">إجمالي الوحدات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-sky-100"><Home className="h-5 w-5 text-sky-600" /></div>
            <div>
              <p className="text-2xl font-bold text-sky-700">{stats.available}</p>
              <p className="text-xs text-muted-foreground">متاحة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats.reserved}</p>
              <p className="text-xs text-muted-foreground">محجوزة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats.sold}</p>
              <p className="text-xs text-muted-foreground">مباعة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full lg:w-auto">
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="متاح">المتاحة</TabsTrigger>
              <TabsTrigger value="محجوز">المحجوزة</TabsTrigger>
              <TabsTrigger value="مباع">المباعة</TabsTrigger>
            </TabsList>
          </Tabs>

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
            <p>لا توجد وحدات مطابقة للبحث</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByProject).map(([projectName, list]) => {
          const pStats = {
            available: list.filter((u: any) => u.status === 'متاح').length,
            reserved: list.filter((u: any) => u.status === 'محجوز').length,
            sold: list.filter((u: any) => u.status === 'مباع').length,
          };
          return (
            <Card key={projectName}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {projectName}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">متاح: {pStats.available}</Badge>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">محجوز: {pStats.reserved}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">مباع: {pStats.sold}</Badge>
                  </div>
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
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">الهاتف</TableHead>
                        <TableHead className="text-right">تاريخ الحجز/البيع</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-semibold">{u.unit_number || '-'}</TableCell>
                          <TableCell>{u.unit_type || '-'}</TableCell>
                          <TableCell>{u.area ? `${u.area} م²` : '-'}</TableCell>
                          <TableCell>{statusBadge(u.status)}</TableCell>
                          <TableCell>
                            {u.status === 'متاح' ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {u.customer_name || '-'}
                              </span>
                            )}
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ReservationsPage;
