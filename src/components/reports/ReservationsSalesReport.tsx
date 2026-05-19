import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarCheck, Home, TrendingUp, Users, Building2, DollarSign } from 'lucide-react';

interface Props {
  sales: any[];
  period?: string;
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d?: string | null) => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('en-GB');
  } catch {
    return d as string;
  }
};

const ReservationsSalesReport: React.FC<Props> = ({ sales = [] }) => {
  const reserved = useMemo(() => sales.filter((s) => s.status === 'محجوز'), [sales]);
  const sold = useMemo(() => sales.filter((s) => s.status === 'مباع'), [sales]);
  const available = useMemo(() => sales.filter((s) => s.status === 'متاح'), [sales]);

  const totalReservedValue = reserved.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const totalSoldValue = sold.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const totalRemaining = sold.reduce((sum, s) => sum + (Number(s.remaining_amount) || 0), 0);
  const totalCollected = totalSoldValue - totalRemaining;

  // Per project breakdown
  const byProject = useMemo(() => {
    const map: Record<string, { name: string; reserved: number; sold: number; reservedValue: number; soldValue: number }> = {};
    sales.forEach((s) => {
      const key = s.project_name || 'بدون مشروع';
      if (!map[key]) map[key] = { name: key, reserved: 0, sold: 0, reservedValue: 0, soldValue: 0 };
      if (s.status === 'محجوز') {
        map[key].reserved += 1;
        map[key].reservedValue += Number(s.price) || 0;
      } else if (s.status === 'مباع') {
        map[key].sold += 1;
        map[key].soldValue += Number(s.price) || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.soldValue + b.reservedValue - (a.soldValue + a.reservedValue));
  }, [sales]);

  // Top marketers
  const topMarketers = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    [...reserved, ...sold].forEach((s) => {
      const name = (s.marketer_name || '').trim();
      if (!name) return;
      if (!map[name]) map[name] = { name, count: 0, total: 0 };
      map[name].count += 1;
      map[name].total += Number(s.price) || 0;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [reserved, sold]);

  // Monthly trend (last 6 months) of sales
  const monthly = useMemo(() => {
    const map: Record<string, { label: string; reserved: number; sold: number; value: number }> = {};
    sales.forEach((s) => {
      const dateStr = s.sale_date || s.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { label: key, reserved: 0, sold: 0, value: 0 };
      if (s.status === 'محجوز') map[key].reserved += 1;
      if (s.status === 'مباع') {
        map[key].sold += 1;
        map[key].value += Number(s.price) || 0;
      }
    });
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label)).slice(-6);
  }, [sales]);

  const conversionRate = reserved.length + sold.length > 0
    ? Math.round((sold.length / (reserved.length + sold.length)) * 100)
    : 0;

  return (
    <div id="report-print-content" dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold">تقرير الحجوزات والمبيعات</h2>
        <p className="text-sm text-muted-foreground mt-1">
          تاريخ التقرير: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <CalendarCheck className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-700">{reserved.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">وحدات محجوزة</p>
            <p className="text-sm font-semibold mt-1 text-amber-600">{fmtCurrency(totalReservedValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <Home className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-700">{sold.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">وحدات مباعة</p>
            <p className="text-sm font-semibold mt-1 text-emerald-600">{fmtCurrency(totalSoldValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">{fmtCurrency(totalCollected)}</span>
            </div>
            <p className="text-xs text-muted-foreground">المحصّل من المبيعات</p>
            <p className="text-sm font-semibold mt-1 text-red-600">متبقي: {fmtCurrency(totalRemaining)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">{conversionRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">معدّل تحويل الحجز إلى بيع</p>
            <p className="text-sm font-semibold mt-1">متاح: {available.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per project */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            تفصيل حسب المشروع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-right">المشروع</TableHead>
                <TableHead className="text-center">محجوزة</TableHead>
                <TableHead className="text-center">مباعة</TableHead>
                <TableHead className="text-right">قيمة الحجوزات</TableHead>
                <TableHead className="text-right">قيمة المبيعات</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byProject.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{p.reserved}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{p.sold}</Badge>
                  </TableCell>
                  <TableCell>{fmtCurrency(p.reservedValue)}</TableCell>
                  <TableCell>{fmtCurrency(p.soldValue)}</TableCell>
                  <TableCell className="font-semibold">{fmtCurrency(p.reservedValue + p.soldValue)}</TableCell>
                </TableRow>
              ))}
              {byProject.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monthly trend */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              الاتجاه الشهري (آخر 6 أشهر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-right">الشهر</TableHead>
                  <TableHead className="text-center">محجوزة</TableHead>
                  <TableHead className="text-center">مباعة</TableHead>
                  <TableHead className="text-right">قيمة المبيعات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.label}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="text-center">{m.reserved}</TableCell>
                    <TableCell className="text-center">{m.sold}</TableCell>
                    <TableCell>{fmtCurrency(m.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Top marketers */}
      {topMarketers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              أفضل المسوّقين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-right">المسوّق</TableHead>
                  <TableHead className="text-center">عدد الصفقات</TableHead>
                  <TableHead className="text-right">إجمالي القيمة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMarketers.map((m) => (
                  <TableRow key={m.name}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-center">{m.count}</TableCell>
                    <TableCell className="font-semibold">{fmtCurrency(m.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed reservations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-600" />
            تفاصيل الحجوزات ({reserved.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">الوحدة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">تاريخ الحجز</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reserved.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.project_name || '-'}</TableCell>
                    <TableCell className="font-semibold">{s.unit_number || '-'}</TableCell>
                    <TableCell>{s.customer_name || '-'}</TableCell>
                    <TableCell dir="ltr" className="text-right">{s.customer_phone || '-'}</TableCell>
                    <TableCell>{fmtDate(s.sale_date || s.created_at)}</TableCell>
                    <TableCell>{fmtCurrency(Number(s.price) || 0)}</TableCell>
                  </TableRow>
                ))}
                {reserved.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      لا توجد حجوزات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed sales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            تفاصيل المبيعات ({sold.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-right">المشروع</TableHead>
                  <TableHead className="text-right">الوحدة</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المسوّق</TableHead>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">المتبقي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sold.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.project_name || '-'}</TableCell>
                    <TableCell className="font-semibold">{s.unit_number || '-'}</TableCell>
                    <TableCell>{s.customer_name || '-'}</TableCell>
                    <TableCell>{s.marketer_name || '-'}</TableCell>
                    <TableCell>{fmtDate(s.sale_date || s.created_at)}</TableCell>
                    <TableCell>{fmtCurrency(Number(s.price) || 0)}</TableCell>
                    <TableCell className="text-red-600">{fmtCurrency(Number(s.remaining_amount) || 0)}</TableCell>
                  </TableRow>
                ))}
                {sold.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      لا توجد مبيعات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer totals */}
      <Card className="border-2 border-primary/30">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الوحدات</p>
              <p className="text-xl font-bold">{sales.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">قيمة الحجوزات</p>
              <p className="text-xl font-bold text-amber-700">{fmtCurrency(totalReservedValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">قيمة المبيعات</p>
              <p className="text-xl font-bold text-emerald-700">{fmtCurrency(totalSoldValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الإجمالي العام</p>
              <p className="text-xl font-bold text-primary">{fmtCurrency(totalReservedValue + totalSoldValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationsSalesReport;
