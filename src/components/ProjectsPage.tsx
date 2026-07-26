import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Building, MapPin, Calendar, TrendingUp, Edit, Trash2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProjectForm from './forms/ProjectForm';
import { PermissionButton } from '@/components/PermissionButton';

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  total_units: number;
  sold_units: number;
  total_cost: number; // الحقل الأساسي في قاعدة البيانات
  total_sales: number; // إجمالي المبيعات (محسوب)
  total_expenses: number; // التكلفة الإجمالية من المصروفات (محسوب)
  progress: number;
  start_date: string;
  expected_completion: string;
  status: string;
  zone?: string | null;
}

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [minCost, setMinCost] = useState<string>('');
  const [maxCost, setMaxCost] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [zoneTotals, setZoneTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // جلب بيانات المشاريع
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // جلب بيانات المبيعات
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('project_id, price, status');

      if (salesError) throw salesError;

      // جلب بيانات المستخلصات
      const { data: extractsData, error: extractsError } = await supabase
        .from('extracts')
        .select('project_id, amount, zone');

      if (extractsError) throw extractsError;

      // جلب بيانات الفواتير
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('project_id, amount, zone');

      if (invoicesError) throw invoicesError;

      // جلب بيانات أوامر التكليف
      const { data: assignmentOrdersData, error: assignmentOrdersError } = await supabase
        .from('assignment_orders')
        .select('project_id, amount');

      if (assignmentOrdersError) throw assignmentOrdersError;

      // حساب إجمالي مبيعات كل مشروع
      const salesByProject = salesData?.reduce((acc: any, sale: any) => {
        if (sale.status === 'مباع' && sale.project_id) {
          if (!acc[sale.project_id]) {
            acc[sale.project_id] = 0;
          }
          acc[sale.project_id] += Number(sale.price) || 0;
        }
        return acc;
      }, {});

      // حساب إجمالي المصروفات لكل مشروع (مستخلصات + فواتير + أوامر تكليف)
      const expensesByProject: any = {};

      // إضافة المستخلصات
      extractsData?.forEach((extract: any) => {
        if (extract.project_id) {
          if (!expensesByProject[extract.project_id]) {
            expensesByProject[extract.project_id] = 0;
          }
          expensesByProject[extract.project_id] += Number(extract.amount) || 0;
        }
      });

      // إضافة الفواتير
      invoicesData?.forEach((invoice: any) => {
        if (invoice.project_id) {
          if (!expensesByProject[invoice.project_id]) {
            expensesByProject[invoice.project_id] = 0;
          }
          expensesByProject[invoice.project_id] += Number(invoice.amount) || 0;
        }
      });

      // إضافة أوامر التكليف
      assignmentOrdersData?.forEach((order: any) => {
        if (order.project_id) {
          if (!expensesByProject[order.project_id]) {
            expensesByProject[order.project_id] = 0;
          }
          expensesByProject[order.project_id] += Number(order.amount) || 0;
        }
      });

      // حساب إجمالي تكلفة كل نطاق (Zone)
      const projectZoneMap: Record<string, string | null> = {};
      (projectsData || []).forEach((p: any) => { projectZoneMap[p.id] = p.zone; });
      const zoneTotalsCalc: Record<string, number> = {};
      const addZone = (zone: string | null | undefined, amount: number) => {
        const n = Number(amount) || 0;
        const key = (zone || '').trim();
        if (!key) return;
        zoneTotalsCalc[key] = (zoneTotalsCalc[key] || 0) + n;
      };
      (extractsData || []).forEach((e: any) => addZone(e.zone || (e.project_id ? projectZoneMap[e.project_id] : null), e.amount));
      (invoicesData || []).forEach((i: any) => addZone(i.zone || (i.project_id ? projectZoneMap[i.project_id] : null), i.amount));
      (assignmentOrdersData || []).forEach((a: any) => addZone(a.project_id ? projectZoneMap[a.project_id] : null, a.amount));
      setZoneTotals(zoneTotalsCalc);

      // تحديث بيانات كل مشروع:
      // - المشاريع التي لها نطاق (Zone) تعرض التكلفة الإجمالية للنطاق (مشتركة)
      // - المشاريع بدون نطاق تعرض تكلفتها الخاصة فقط
      const updatedProjects = projectsData?.map((project: any) => {
        const zoneKey = (project.zone || '').trim();
        const totalExpenses = zoneKey
          ? (zoneTotalsCalc[zoneKey] || 0)
          : (expensesByProject?.[project.id] || 0);
        return {
          ...project,
          total_sales: salesByProject?.[project.id] || 0,
          total_expenses: totalExpenses,
        };
      });

      setProjects(updatedProjects || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل المشاريع",
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
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "تم حذف المشروع بنجاح" });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "خطأ في حذف المشروع",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProject(undefined);
  };

  const availableZones = Array.from(new Set(projects.map(p => p.zone).filter(Boolean) as string[])).sort();

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.trim().toLowerCase();
    const matchesText = !term ||
      project.name.toLowerCase().includes(term) ||
      project.location.toLowerCase().includes(term) ||
      (project.zone?.toLowerCase() || '').includes(term) ||
      project.total_expenses.toString().includes(term) ||
      project.total_sales.toString().includes(term);
    const matchesZone = zoneFilter === 'all' || (project.zone || '') === zoneFilter;
    const min = minCost === '' ? -Infinity : Number(minCost);
    const max = maxCost === '' ? Infinity : Number(maxCost);
    const matchesCost = project.total_expenses >= min && project.total_expenses <= max;
    return matchesText && matchesZone && matchesCost;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مكتمل':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مكتمل</Badge>;
      case 'قيد التنفيذ':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">قيد التنفيذ</Badge>;
      case 'متوقف':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">متوقف</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'قيد التنفيذ').length;
  const completedProjects = projects.filter(p => p.status === 'مكتمل').length;
  const totalSales = projects.reduce((sum, p) => sum + p.total_sales, 0);
  // تجنّب ازدواج التكلفة: المشاريع ذات النطاق تُحسب مرة واحدة لكل نطاق، والباقي لكل مشروع
  const countedZones = new Set<string>();
  const totalExpenses = projects.reduce((sum, p) => {
    const zoneKey = (p.zone || '').trim();
    if (zoneKey) {
      if (countedZones.has(zoneKey)) return sum;
      countedZones.add(zoneKey);
      return sum + (zoneTotals[zoneKey] || 0);
    }
    return sum + p.total_expenses;
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">جارٍ تحميل المشاريع...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المشاريع</h1>
          <p className="text-gray-600 mt-2">متابعة وإدارة جميع المشاريع العقارية</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مشروع جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">مشروع نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">مشروع جاري</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">مشروع منجز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(totalSales / 1000000).toFixed(1)}م</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{(totalExpenses / 1000000).toFixed(1)}م</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

      {/* Zone Costs Cards - dynamic per zone */}
      {Object.keys(zoneTotals).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(zoneTotals)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([zone, total]) => (
              <Card key={zone} className="border-r-4 border-r-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">تكلفة {zone}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{total.toLocaleString()} ر.س</div>
                  <p className="text-xs text-muted-foreground">إجمالي المستخلصات والفواتير وأوامر التكليف لهذا النطاق</p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المشاريع</CardTitle>
          <CardDescription>جميع المشاريع العقارية وحالة تطويرها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6 items-end">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالاسم / الموقع / النطاق / المبلغ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="w-[160px]">
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="النطاق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل النطاقات</SelectItem>
                  {availableZones.map(z => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              placeholder="أدنى تكلفة"
              value={minCost}
              onChange={(e) => setMinCost(e.target.value)}
              className="w-[140px]"
            />
            <Input
              type="number"
              placeholder="أعلى تكلفة"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-[140px]"
            />
            {(searchTerm || zoneFilter !== 'all' || minCost || maxCost) && (
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setZoneFilter('all'); setMinCost(''); setMaxCost(''); }}>
                مسح الفلاتر
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              const headers = "اسم المشروع,النطاق,النوع,الموقع,الوحدات المباعة,إجمالي الوحدات,نسبة الإنجاز,إجمالي المبيعات,التكلفة الإجمالية,الحالة,تاريخ الانتهاء المتوقع\n";
              const csvContent = headers + 
                filteredProjects.map(project => 
                  `${project.name},${project.zone || ''},${project.type},${project.location},${project.sold_units},${project.total_units},${project.progress}%,${project.total_sales},${project.total_expenses},${project.status},${project.expected_completion}`
                ).join("\n");
              
              // إضافة BOM للتعامل مع الترميز العربي بشكل صحيح
              const BOM = '\uFEFF';
              const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'projects.csv';
              link.click();
            }}>تصدير</Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المشروع</TableHead>
                  <TableHead className="text-right">النطاق</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الموقع</TableHead>
                  <TableHead className="text-right">الوحدات</TableHead>
                  <TableHead className="text-right">نسبة الإنجاز</TableHead>
                  <TableHead className="text-right">إجمالي المبيعات</TableHead>
                  <TableHead className="text-right">التكلفة الإجمالية</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء المتوقع</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.zone || '-'}</TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.sold_units}/{project.total_units}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">{project.total_sales.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {project.total_expenses.toLocaleString()} ر.س
                      {project.zone ? (
                        <div className="text-[10px] text-muted-foreground font-normal">مشتركة لنطاق {project.zone}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{project.expected_completion}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <PermissionButton
                              pageName="projects"
                              requirePermission="delete"
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </PermissionButton>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف المشروع "{project.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(project.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
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

      <ProjectForm
        open={formOpen}
        onOpenChange={handleFormClose}
        project={editingProject}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;