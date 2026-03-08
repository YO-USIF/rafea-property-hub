import { useState, useMemo } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermissions } from "@/hooks/usePermissions";
import { useProfiles } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Edit, Trash2, Lock, Search, Users, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const AVAILABLE_PAGES = [
  { name: "dashboard", label: "لوحة التحكم" },
  { name: "projects", label: "المشاريع" },
  { name: "sales", label: "المبيعات" },
  { name: "purchases", label: "المشتريات" },
  { name: "invoices", label: "الفواتير" },
  { name: "extracts", label: "المستخلصات" },
  { name: "assignment_orders", label: "أوامر التكليف" },
  { name: "contractors", label: "المقاولون" },
  { name: "suppliers", label: "الموردون" },
  { name: "maintenance", label: "الصيانة" },
  { name: "tasks", label: "المهام" },
  { name: "warehouse", label: "المستودع" },
  { name: "accounting", label: "المحاسبة" },
  { name: "reports", label: "التقارير" },
  { name: "notifications", label: "الإشعارات" },
  { name: "settings", label: "الإعدادات" },
];

const PermBadge = ({ allowed }: { allowed: boolean }) => (
  allowed
    ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1"><CheckCircle2 className="w-3 h-3" />نعم</Badge>
    : <Badge variant="secondary" className="gap-1"><XCircle className="w-3 h-3" />لا</Badge>
);

export const PermissionsManagement = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { allPermissions, isLoadingAll, upsertPermission, deletePermission } = usePermissions();
  const { profiles, loading: profilesLoading } = useProfiles();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [deletingPermission, setDeletingPermission] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [permissions, setPermissions] = useState({
    can_view: false, can_create: false, can_edit: false, can_delete: false,
  });

  // Group permissions by user
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, { userId: string; userName: string; email: string; permissions: any[] }> = {};
    allPermissions.forEach((p) => {
      if (!groups[p.user_id]) {
        const profile = profiles.find((pr) => pr.user_id === p.user_id);
        groups[p.user_id] = {
          userId: p.user_id,
          userName: profile?.full_name || "مستخدم غير معروف",
          email: profile?.email || "",
          permissions: [],
        };
      }
      groups[p.user_id].permissions.push(p);
    });
    return Object.values(groups);
  }, [allPermissions, profiles]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedPermissions;
    const term = searchTerm.toLowerCase();
    return groupedPermissions.filter(
      (g) => g.userName.toLowerCase().includes(term) || g.email.toLowerCase().includes(term)
    );
  }, [groupedPermissions, searchTerm]);

  if (roleLoading || isLoadingAll || profilesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-muted-foreground">هذه الصفحة متاحة لمدير النظام فقط</p>
        </div>
      </div>
    );
  }

  const getPageLabel = (pageName: string) =>
    AVAILABLE_PAGES.find((p) => p.name === pageName)?.label || pageName;

  const getUserName = (userId: string) => {
    const profile = profiles.find((p) => p.user_id === userId);
    return profile?.full_name || profile?.email || "مستخدم غير معروف";
  };

  const handleSubmit = () => {
    if (!selectedUser || !selectedPage) return;
    upsertPermission.mutate(
      { user_id: selectedUser, page_name: selectedPage, ...permissions },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setEditingPermission(null);
          resetForm();
        },
      }
    );
  };

  const handleEdit = (permission: any) => {
    setEditingPermission(permission);
    setSelectedUser(permission.user_id);
    setSelectedPage(permission.page_name);
    setPermissions({
      can_view: permission.can_view,
      can_create: permission.can_create,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
    });
  };

  const handleDelete = () => {
    if (deletingPermission) {
      deletePermission.mutate(
        { userId: deletingPermission.user_id, pageName: deletingPermission.page_name },
        { onSuccess: () => setDeletingPermission(null) }
      );
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setSelectedPage("");
    setPermissions({ can_view: false, can_create: false, can_edit: false, can_delete: false });
  };

  const totalUsers = groupedPermissions.length;
  const totalPermissions = allPermissions.length;
  const totalPages = new Set(allPermissions.map((p) => p.page_name)).size;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة الصلاحيات</h1>
            <p className="text-sm text-muted-foreground">تحكم في صلاحيات المستخدمين لكل صفحة</p>
          </div>
        </div>

        <Dialog
          open={isAddDialogOpen || !!editingPermission}
          onOpenChange={(open) => {
            if (!open) { setIsAddDialogOpen(false); setEditingPermission(null); resetForm(); }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />إضافة صلاحية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPermission ? "تعديل الصلاحيات" : "إضافة صلاحيات جديدة"}</DialogTitle>
              <DialogDescription>حدد المستخدم والصفحة والصلاحيات المطلوبة</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>المستخدم</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!!editingPermission}>
                  <SelectTrigger><SelectValue placeholder="اختر المستخدم" /></SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.user_id} value={profile.user_id}>
                        {profile.full_name || profile.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الصفحة</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage} disabled={!!editingPermission}>
                  <SelectTrigger><SelectValue placeholder="اختر الصفحة" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PAGES.map((page) => (
                      <SelectItem key={page.name} value={page.name}>{page.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <Label>الصلاحيات</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "can_view", label: "العرض" },
                    { key: "can_create", label: "الإضافة" },
                    { key: "can_edit", label: "التعديل" },
                    { key: "can_delete", label: "الحذف" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                      <Checkbox
                        id={key}
                        checked={permissions[key as keyof typeof permissions]}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, [key]: checked as boolean })
                        }
                      />
                      <Label htmlFor={key} className="cursor-pointer text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setPermissions({ can_view: true, can_create: true, can_edit: true, can_delete: true })}
                >
                  تحديد الكل
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setEditingPermission(null); resetForm(); }}>
                إلغاء
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedUser || !selectedPage}>
                {editingPermission ? "تحديث" : "حفظ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">مستخدمين لديهم صلاحيات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Shield className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalPermissions}</p>
              <p className="text-xs text-muted-foreground">إجمالي الصلاحيات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 rounded-lg bg-blue-500/10"><CheckCircle2 className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{totalPages}</p>
              <p className="text-xs text-muted-foreground">صفحات مفعّلة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="ابحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Grouped Permissions */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>لا توجد صلاحيات مخصصة حالياً</p>
            <p className="text-sm mt-2">ابدأ بإضافة صلاحيات للمستخدمين</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={filteredGroups.map((g) => g.userId)} className="space-y-3">
          {filteredGroups.map((group) => (
            <AccordionItem key={group.userId} value={group.userId} className="border rounded-lg bg-card shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {group.userName.charAt(0)}
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-semibold text-sm text-foreground">{group.userName}</p>
                    <p className="text-xs text-muted-foreground">{group.email}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    {group.permissions.length} صلاحية
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right">الصفحة</TableHead>
                        <TableHead className="text-center">العرض</TableHead>
                        <TableHead className="text-center">الإضافة</TableHead>
                        <TableHead className="text-center">التعديل</TableHead>
                        <TableHead className="text-center">الحذف</TableHead>
                        <TableHead className="text-center w-24">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.permissions.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell>
                            <Badge variant="outline">{getPageLabel(perm.page_name)}</Badge>
                          </TableCell>
                          <TableCell className="text-center"><PermBadge allowed={perm.can_view} /></TableCell>
                          <TableCell className="text-center"><PermBadge allowed={perm.can_create} /></TableCell>
                          <TableCell className="text-center"><PermBadge allowed={perm.can_edit} /></TableCell>
                          <TableCell className="text-center"><PermBadge allowed={perm.can_delete} /></TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(perm)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeletingPermission(perm)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingPermission} onOpenChange={(open) => !open && setDeletingPermission(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف صلاحيات {getUserName(deletingPermission?.user_id)} على صفحة{" "}
              {getPageLabel(deletingPermission?.page_name)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center text-sm text-muted-foreground py-4 border-t">
        <p>© {new Date().getFullYear()} شركة سهيل طيبة للتطوير العقاري. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};
