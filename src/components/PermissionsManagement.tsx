import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermissions } from "@/hooks/usePermissions";
import { useProfiles } from "@/hooks/useProfiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Edit, Trash2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// قائمة الصفحات المتاحة
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

export const PermissionsManagement = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { allPermissions, isLoadingAll, upsertPermission, deletePermission } = usePermissions();
  const { profiles, loading: profilesLoading } = useProfiles();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any>(null);
  const [deletingPermission, setDeletingPermission] = useState<any>(null);
  
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [permissions, setPermissions] = useState({
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
  });

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

  const handleSubmit = () => {
    if (!selectedUser || !selectedPage) {
      return;
    }

    upsertPermission.mutate(
      {
        user_id: selectedUser,
        page_name: selectedPage,
        ...permissions,
      },
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
        {
          userId: deletingPermission.user_id,
          pageName: deletingPermission.page_name,
        },
        {
          onSuccess: () => setDeletingPermission(null),
        }
      );
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setSelectedPage("");
    setPermissions({
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    });
  };

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || profile?.email || "مستخدم غير معروف";
  };

  const getPageLabel = (pageName: string) => {
    return AVAILABLE_PAGES.find(p => p.name === pageName)?.label || pageName;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">إدارة الصلاحيات</h1>
            <p className="text-muted-foreground">تحكم في صلاحيات المستخدمين لكل صفحة</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen || !!editingPermission} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingPermission(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة صلاحية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "تعديل الصلاحيات" : "إضافة صلاحيات جديدة"}
              </DialogTitle>
              <DialogDescription>
                حدد المستخدم والصفحة والصلاحيات المطلوبة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>المستخدم</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!!editingPermission}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصفحة" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PAGES.map((page) => (
                      <SelectItem key={page.name} value={page.name}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>الصلاحيات</Label>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="can_view"
                    checked={permissions.can_view}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, can_view: checked as boolean })
                    }
                  />
                  <Label htmlFor="can_view" className="cursor-pointer">
                    العرض
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="can_create"
                    checked={permissions.can_create}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, can_create: checked as boolean })
                    }
                  />
                  <Label htmlFor="can_create" className="cursor-pointer">
                    الإضافة
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="can_edit"
                    checked={permissions.can_edit}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, can_edit: checked as boolean })
                    }
                  />
                  <Label htmlFor="can_edit" className="cursor-pointer">
                    التعديل
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="can_delete"
                    checked={permissions.can_delete}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, can_delete: checked as boolean })
                    }
                  />
                  <Label htmlFor="can_delete" className="cursor-pointer">
                    الحذف
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingPermission(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedUser || !selectedPage}>
                {editingPermission ? "تحديث" : "حفظ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>صلاحيات المستخدمين</CardTitle>
          <CardDescription>
            قائمة بجميع الصلاحيات المخصصة للمستخدمين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPermissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>لا توجد صلاحيات مخصصة حالياً</p>
              <p className="text-sm mt-2">ابدأ بإضافة صلاحيات للمستخدمين</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الصفحة</TableHead>
                    <TableHead>العرض</TableHead>
                    <TableHead>الإضافة</TableHead>
                    <TableHead>التعديل</TableHead>
                    <TableHead>الحذف</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {getUserName(permission.user_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPageLabel(permission.page_name)}</Badge>
                      </TableCell>
                      <TableCell>
                        {permission.can_view ? (
                          <Badge className="bg-green-500">نعم</Badge>
                        ) : (
                          <Badge variant="secondary">لا</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.can_create ? (
                          <Badge className="bg-green-500">نعم</Badge>
                        ) : (
                          <Badge variant="secondary">لا</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.can_edit ? (
                          <Badge className="bg-green-500">نعم</Badge>
                        ) : (
                          <Badge variant="secondary">لا</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {permission.can_delete ? (
                          <Badge className="bg-green-500">نعم</Badge>
                        ) : (
                          <Badge variant="secondary">لا</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingPermission(permission)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingPermission} onOpenChange={(open) => !open && setDeletingPermission(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف صلاحيات {getUserName(deletingPermission?.user_id)} على صفحة{" "}
              {getPageLabel(deletingPermission?.page_name)}. سيعود المستخدم للصلاحيات الافتراضية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center text-sm text-muted-foreground py-4 border-t">
        <p>© {new Date().getFullYear()} شركة سهيل طيبة للتطوير العقاري. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};
