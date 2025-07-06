
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, User, Shield, Bell, Database, Key, Users, Mail } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const settingsTabs = [
    { id: 'general', name: 'الإعدادات العامة', icon: Settings },
    { id: 'users', name: 'إدارة المستخدمين', icon: Users },
    { id: 'permissions', name: 'الصلاحيات', icon: Shield },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database },
    { id: 'security', name: 'الأمان', icon: Key }
  ];

  const users = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@rafaa.com',
      role: 'مدير النظام',
      department: 'الإدارة',
      status: 'نشط',
      lastLogin: '2024-01-20 14:30'
    },
    {
      id: 2,
      name: 'سارة أحمد',
      email: 'sara@rafaa.com',
      role: 'موظف مبيعات',
      department: 'المبيعات',
      status: 'نشط',
      lastLogin: '2024-01-20 09:15'
    },
    {
      id: 3,
      name: 'محمد علي',
      email: 'mohammed@rafaa.com',
      role: 'محاسب',
      department: 'المحاسبة',
      status: 'غير نشط',
      lastLogin: '2024-01-18 16:45'
    }
  ];

  const roles = [
    {
      name: 'مدير النظام',
      permissions: ['قراءة', 'كتابة', 'حذف', 'إدارة المستخدمين'],
      usersCount: 2,
      color: 'bg-red-100 text-red-800'
    },
    {
      name: 'مدير',
      permissions: ['قراءة', 'كتابة', 'التقارير'],
      usersCount: 3,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'موظف مبيعات',
      permissions: ['قراءة الشقق', 'كتابة العقود', 'متابعة العملاء'],
      usersCount: 5,
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'محاسب',
      permissions: ['قراءة المالية', 'كتابة الفواتير', 'التقارير المالية'],
      usersCount: 2,
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
          <CardDescription>إعدادات الشركة الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">اسم الشركة</Label>
              <Input id="company-name" defaultValue="شركة رافع للتطوير العقاري" />
            </div>
            <div>
              <Label htmlFor="company-email">البريد الإلكتروني</Label>
              <Input id="company-email" defaultValue="info@rafaa.com" />
            </div>
            <div>
              <Label htmlFor="company-phone">رقم الهاتف</Label>
              <Input id="company-phone" defaultValue="+966 11 234 5678" />
            </div>
            <div>
              <Label htmlFor="company-address">العنوان</Label>
              <Input id="company-address" defaultValue="الرياض، المملكة العربية السعودية" />
            </div>
          </div>
          <Button>حفظ التغييرات</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
          <CardDescription>تخصيص سلوك النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">العملة الافتراضية</Label>
              <Input id="currency" defaultValue="ريال سعودي (SAR)" />
            </div>
            <div>
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Input id="timezone" defaultValue="آسيا/الرياض" />
            </div>
            <div>
              <Label htmlFor="language">لغة النظام</Label>
              <Input id="language" defaultValue="العربية" />
            </div>
            <div>
              <Label htmlFor="date-format">تنسيق التاريخ</Label>
              <Input id="date-format" defaultValue="DD/MM/YYYY" />
            </div>
          </div>
          <Button>حفظ الإعدادات</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>إضافة وإدارة حسابات المستخدمين</CardDescription>
            </div>
            <Button>
              <User className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">آخر دخول</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">تعديل</Button>
                      <Button size="sm" variant="outline">حذف</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة الأدوار والصلاحيات</CardTitle>
              <CardDescription>تحديد صلاحيات المستخدمين حسب الأدوار</CardDescription>
            </div>
            <Button>
              <Shield className="w-4 h-4 ml-2" />
              إضافة دور جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge className={role.color}>{role.usersCount} مستخدم</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">الصلاحيات:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.permissions.map((permission, pIndex) => (
                          <Badge key={pIndex} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">تعديل</Button>
                      <Button size="sm" variant="outline">حذف</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'users':
        return renderUsersManagement();
      case 'permissions':
        return renderPermissions();
      case 'notifications':
        return <div className="text-center py-8 text-gray-500">إعدادات الإشعارات قيد التطوير...</div>;
      case 'backup':
        return <div className="text-center py-8 text-gray-500">إعدادات النسخ الاحتياطي قيد التطوير...</div>;
      case 'security':
        return <div className="text-center py-8 text-gray-500">إعدادات الأمان قيد التطوير...</div>;
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-600 mt-2">إدارة إعدادات النظام والمستخدمين</p>
      </div>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <Card className="w-64 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
