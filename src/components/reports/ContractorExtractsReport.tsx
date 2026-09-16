import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Search, ArrowRight, Users } from 'lucide-react';
import { printContractorReport } from '@/lib/extractPrint';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extracts: any[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const netOf = (e: any) =>
  Math.max(0, (Number(e.current_amount) || 0) - (Number(e.previous_amount) || 0));

export const ContractorExtractsReport = ({ open, onOpenChange, extracts }: Props) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [project, setProject] = useState('');
  const [works, setWorks] = useState('');

  const inRange = (e: any) => {
    const d = e.extract_date;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const matches = (e: any) => {
    if (!inRange(e)) return false;
    if (project && (e.project_name || 'غير محدد') !== project) return false;
    if (works && !(e.description || '').toLowerCase().includes(works.trim().toLowerCase())) return false;
    return true;
  };

  const projects = useMemo(
    () =>
      Array.from(new Set(extracts.map((e) => e.project_name || 'غير محدد'))).sort((a, b) => a.localeCompare(b, 'ar')),
    [extracts]
  );

  const contractors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number; net: number; approved: number; projects: Set<string> }>();
    extracts.filter(matches).forEach((e) => {
      const name = e.contractor_name || 'غير محدد';
      const row = map.get(name) || { name, count: 0, total: 0, net: 0, approved: 0, projects: new Set<string>() };
      row.count += 1;
      row.total += Number(e.amount) || 0;
      row.net += netOf(e);
      if (e.approved) row.approved += 1;
      if (e.project_name) row.projects.add(e.project_name);
      map.set(name, row);
    });
    return Array.from(map.values())
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.total - a.total);
  }, [extracts, search, from, to, project, works]);

  const details = useMemo(
    () => extracts.filter((e) => (e.contractor_name || 'غير محدد') === selected && matches(e)),
    [extracts, selected, from, to, project, works]
  );

  const totals = useMemo(() => {
    return details.reduce(
      (acc, e) => {
        acc.total += Number(e.amount) || 0;
        acc.net += netOf(e);
        acc.previous += Number(e.previous_amount) || 0;
        acc.current += Number(e.current_amount) || 0;
        return acc;
      },
      { total: 0, net: 0, previous: 0, current: 0 }
    );
  }, [details]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {selected ? `تقرير أعمال المقاول: ${selected}` : 'تقارير المقاولين'}
          </DialogTitle>
        </DialogHeader>

        {/* الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث باسم المقاول..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold whitespace-nowrap">من</span>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold whitespace-nowrap">إلى</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">كل المشاريع</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Input
            placeholder="بيان الأعمال..."
            value={works}
            onChange={(e) => setWorks(e.target.value)}
          />
        </div>

        {!selected ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">قائمة المقاولين ({contractors.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>المقاول</TableHead>
                      <TableHead>عدد المستخلصات</TableHead>
                      <TableHead>المشاريع</TableHead>
                      <TableHead>المعتمدة</TableHead>
                      <TableHead>صافي الأعمال</TableHead>
                      <TableHead>إجمالي المبالغ</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractors.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-bold">{c.name}</TableCell>
                        <TableCell>{c.count}</TableCell>
                        <TableCell className="max-w-[240px] truncate" title={Array.from(c.projects).join('، ')}>
                          {Array.from(c.projects).join('، ') || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.approved === c.count ? 'default' : 'secondary'}>
                            {c.approved} / {c.count}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">{formatCurrency(c.net)}</TableCell>
                        <TableCell className="font-bold text-green-600">{formatCurrency(c.total)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelected(c.name)}>
                              عرض التقرير
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="طباعة"
                              onClick={() =>
                                printContractorReport(
                                  c.name,
                                  extracts.filter((e) => (e.contractor_name || 'غير محدد') === c.name && matches(e)),
                                  { from, to, project }
                                )
                              }
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {contractors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                <ArrowRight className="w-4 h-4 ml-2" />
                رجوع لقائمة المقاولين
              </Button>
              <Button size="sm" onClick={() => printContractorReport(selected, details, { from, to, project })}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة التقرير
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: 'عدد المستخلصات', v: details.length },
                { l: 'إجمالي المدفوع سابقاً', v: formatCurrency(totals.previous) },
                { l: 'صافي الأعمال', v: formatCurrency(totals.net) },
                { l: 'إجمالي المبالغ', v: formatCurrency(totals.total) },
              ].map((s) => (
                <Card key={s.l}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{s.l}</p>
                    <p className="text-lg font-bold text-primary">{s.v}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم المستخلص</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>وصف الأعمال</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإنجاز</TableHead>
                    <TableHead>مدفوع سابقاً</TableHead>
                    <TableHead>قيمة المستخلص</TableHead>
                    <TableHead>الصافي</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>التعميد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.extract_number}</TableCell>
                      <TableCell>{e.project_name}</TableCell>
                      <TableCell className="max-w-[220px] truncate" title={e.description || '-'}>
                        {e.description || '-'}
                      </TableCell>
                      <TableCell>{new Date(e.extract_date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{e.percentage_completed ?? 0}%</TableCell>
                      <TableCell>{formatCurrency(e.previous_amount || 0)}</TableCell>
                      <TableCell>{formatCurrency(e.current_amount || 0)}</TableCell>
                      <TableCell className="font-semibold text-blue-600">{formatCurrency(netOf(e))}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(e.amount || 0)}</TableCell>
                      <TableCell>
                        {e.approved ? (
                          <Badge className="bg-green-600 hover:bg-green-700">معتمد</Badge>
                        ) : (
                          <Badge variant="secondary">بانتظار</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {details.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">لا توجد مستخلصات لهذا المقاول ضمن الفترة</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContractorExtractsReport;
