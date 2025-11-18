import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Shield, Bell, Database, Key, Users, Mail, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useBackupLogs, useSecuritySettings } from '@/hooks/useSystemSettings';
import UserForm from '@/components/forms/UserForm';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();
  const { profiles, loading: profilesLoading, updateProfile, updateUserRole, deleteProfile } = useProfiles();
  const { settings, loading: settingsLoading, updateSettings } = useCompanySettings();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotificationSettings();
  const { logs: backupLogs, createBackup } = useBackupLogs();
  const { settings: securitySettings, updateSettings: updateSecuritySettings } = useSecuritySettings();

  const settingsTabs = [
    { id: 'general', name: 'الإعدادات العامة', icon: Settings },
    { id: 'users', name: 'إدارة المستخدمين', icon: Users },
    { id: 'permissions', name: 'الصلاحيات', icon: Shield },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database },
    { id: 'security', name: 'الأمان', icon: Key }
  ];

  const handleSaveCompanySettings = async (formData: FormData) => {
    if (!settings) return;
    
    const updatedSettings = {
      company_name: formData.get('company-name') as string,
      company_email: formData.get('company-email') as string,
      company_phone: formData.get('company-phone') as string,
      company_address: formData.get('company-address') as string,
      currency: formData.get('currency') as string,
      timezone: formData.get('timezone') as string,
      language: formData.get('language') as string,
      date_format: formData.get('date-format') as string,
    };
    
    await updateSettings(updatedSettings);
  };

  const handleUserSubmit = async (userData: any) => {
    if (selectedUser) {
      await updateProfile(selectedUser.id, userData);
    }
    setSelectedUser(null);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await deleteProfile(userId);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة</CardTitle>
          <CardDescription>إعدادات الشركة الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCompanySettings(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">اسم الشركة</Label>
                <Input 
                  id="company-name" 
                  name="company-name"
                  defaultValue={settings?.company_name || ''} 
                />
              </div>
              <div>
                <Label htmlFor="company-email">البريد الإلكتروني</Label>
                <Input 
                  id="company-email" 
                  name="company-email"
                  defaultValue={settings?.company_email || ''} 
                />
              </div>
              <div>
                <Label htmlFor="company-phone">رقم الهاتف</Label>
                <Input 
                  id="company-phone" 
                  name="company-phone"
                  defaultValue={settings?.company_phone || ''} 
                />
              </div>
              <div>
                <Label htmlFor="company-address">العنوان</Label>
                <Input 
                  id="company-address" 
                  name="company-address"
                  defaultValue={settings?.company_address || ''} 
                />
              </div>
            </div>
            <Button type="submit" disabled={settingsLoading}>
              حفظ التغييرات
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
          <CardDescription>تخصيص سلوك النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveCompanySettings(new FormData(e.currentTarget)); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">العملة الافتراضية</Label>
                <Input 
                  id="currency" 
                  name="currency"
                  defaultValue={settings?.currency || ''} 
                />
              </div>
              <div>
                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                <Input 
                  id="timezone" 
                  name="timezone"
                  defaultValue={settings?.timezone || ''} 
                />
              </div>
              <div>
                <Label htmlFor="language">لغة النظام</Label>
                <Input 
                  id="language" 
                  name="language"
                  defaultValue={settings?.language || ''} 
                />
              </div>
              <div>
                <Label htmlFor="date-format">تنسيق التاريخ</Label>
                <Input 
                  id="date-format" 
                  name="date-format"
                  defaultValue={settings?.date_format || ''} 
                />
              </div>
            </div>
            <Button type="submit" disabled={settingsLoading}>
              حفظ الإعدادات
            </Button>
          </form>
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
            <Button onClick={() => setIsUserFormOpen(true)}>
              <User className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <div className="text-center py-8">جارٍ تحميل البيانات...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Select
                        value={profile.roles?.[0] || 'موظف'}
                        onValueChange={(value) => handleRoleChange(profile.user_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                          <SelectItem value="مدير">مدير</SelectItem>
                          <SelectItem value="مدير مشروع">مدير مشروع</SelectItem>
                          <SelectItem value="موظف مبيعات">موظف مبيعات</SelectItem>
                          <SelectItem value="محاسب">محاسب</SelectItem>
                          <SelectItem value="موظف">موظف</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{profile.department}</TableCell>
                    <TableCell>
                      <Badge variant={profile.status === 'نشط' ? 'default' : 'secondary'}>
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUser(profile)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteUser(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab('users')}>
                <Users className="w-4 h-4 ml-2" />
                إدارة أدوار المستخدمين
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'مدير النظام', permissions: ['قراءة', 'كتابة', 'حذف', 'إدارة المستخدمين', 'إدارة النظام'], usersCount: profiles.filter(p => p.roles?.includes('مدير النظام')).length, color: 'bg-red-100 text-red-800' },
              { name: 'مدير', permissions: ['قراءة جميع البيانات', 'كتابة', 'التقارير', 'إدارة الفرق'], usersCount: profiles.filter(p => p.roles?.includes('مدير')).length, color: 'bg-blue-100 text-blue-800' },
              { name: 'موظف مبيعات', permissions: ['قراءة الشقق', 'كتابة العقود', 'متابعة العملاء'], usersCount: profiles.filter(p => p.roles?.includes('موظف مبيعات')).length, color: 'bg-green-100 text-green-800' },
              { name: 'محاسب', permissions: ['قراءة المالية', 'كتابة الفواتير', 'التقارير المالية'], usersCount: profiles.filter(p => p.roles?.includes('محاسب')).length, color: 'bg-yellow-100 text-yellow-800' },
              { name: 'موظف', permissions: ['قراءة البيانات الخاصة', 'كتابة محدودة'], usersCount: profiles.filter(p => p.roles?.includes('موظف')).length, color: 'bg-gray-100 text-gray-800' }
            ].map((role, index) => (
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>تخصيص تفضيلات الإشعارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
              <input
                type="checkbox"
                id="email-notifications"
                checked={notificationSettings?.email_notifications || false}
                onChange={(e) => updateNotificationSettings({ email_notifications: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">إشعارات الرسائل النصية</Label>
              <input
                type="checkbox"
                id="sms-notifications"
                checked={notificationSettings?.sms_notifications || false}
                onChange={(e) => updateNotificationSettings({ sms_notifications: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">الإشعارات المنبثقة</Label>
              <input
                type="checkbox"
                id="push-notifications"
                checked={notificationSettings?.push_notifications || false}
                onChange={(e) => updateNotificationSettings({ push_notifications: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-summary">ملخص يومي</Label>
              <input
                type="checkbox"
                id="daily-summary"
                checked={notificationSettings?.daily_summary || false}
                onChange={(e) => updateNotificationSettings({ daily_summary: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-report">تقرير أسبوعي</Label>
              <input
                type="checkbox"
                id="weekly-report"
                checked={notificationSettings?.weekly_report || false}
                onChange={(e) => updateNotificationSettings({ weekly_report: e.target.checked })}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>النسخ الاحتياطي</CardTitle>
              <CardDescription>إدارة النسخ الاحتياطية للنظام</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createBackup('قاعدة البيانات')}>
                <Database className="w-4 h-4 ml-2" />
                نسخة احتياطية للبيانات
              </Button>
              <Button variant="outline" onClick={() => createBackup('ملفات النظام')}>
                نسخة احتياطية للملفات
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium">سجل النسخ الاحتياطية الأخيرة:</h4>
            <div className="space-y-2">
              {backupLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{log.backup_type}</p>
                    <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString('ar-SA')}</p>
                  </div>
                  <Badge variant={log.status === 'مكتمل' ? 'default' : log.status === 'في التقدم' ? 'secondary' : 'destructive'}>
                    {log.status}
                  </Badge>
                </div>
              ))}
              {backupLogs.length === 0 && (
                <p className="text-center text-gray-500 py-4">لا توجد نسخ احتياطية</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الأمان</CardTitle>
          <CardDescription>تكوين سياسات الأمان والحماية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password-length">الحد الأدنى لطول كلمة المرور</Label>
              <Input
                id="password-length"
                type="number"
                value={securitySettings?.password_min_length || 8}
                onChange={(e) => updateSecuritySettings({ password_min_length: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">انتهاء الجلسة (بالدقائق)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={securitySettings?.session_timeout || 30}
                onChange={(e) => updateSecuritySettings({ session_timeout: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max-attempts">أقصى عدد محاولات تسجيل الدخول</Label>
              <Input
                id="max-attempts"
                type="number"
                value={securitySettings?.max_login_attempts || 5}
                onChange={(e) => updateSecuritySettings({ max_login_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">متطلبات كلمة المرور:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="require-uppercase">يجب أن تحتوي على حروف كبيرة</Label>
                <input
                  type="checkbox"
                  id="require-uppercase"
                  checked={securitySettings?.require_uppercase || false}
                  onChange={(e) => updateSecuritySettings({ require_uppercase: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-lowercase">يجب أن تحتوي على حروف صغيرة</Label>
                <input
                  type="checkbox"
                  id="require-lowercase"
                  checked={securitySettings?.require_lowercase || false}
                  onChange={(e) => updateSecuritySettings({ require_lowercase: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-numbers">يجب أن تحتوي على أرقام</Label>
                <input
                  type="checkbox"
                  id="require-numbers"
                  checked={securitySettings?.require_numbers || false}
                  onChange={(e) => updateSecuritySettings({ require_numbers: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="require-special">يجب أن تحتوي على رموز خاصة</Label>
                <input
                  type="checkbox"
                  id="require-special"
                  checked={securitySettings?.require_special_chars || false}
                  onChange={(e) => updateSecuritySettings({ require_special_chars: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">المصادقة الثنائية</Label>
                <input
                  type="checkbox"
                  id="two-factor"
                  checked={securitySettings?.two_factor_enabled || false}
                  onChange={(e) => updateSecuritySettings({ two_factor_enabled: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
            </div>
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
        return renderNotifications();
      case 'backup':
        return renderBackup();
      case 'security':
        return renderSecurity();
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

      {/* User Form Dialog */}
      <UserForm
        user={selectedUser}
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
};

export default SettingsPage;