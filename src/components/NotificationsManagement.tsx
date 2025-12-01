import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationForm from './forms/NotificationForm';
import { Send, Bell, Users, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationsManagement: React.FC = () => {
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const { isAdmin } = useUserRole();
  const { notifications, isLoading } = useNotifications();

  // إحصائيات الإشعارات
  const stats = {
    total: notifications?.length || 0,
    unread: notifications?.filter(n => !n.read).length || 0,
    byType: {
      info: notifications?.filter(n => n.type === 'info').length || 0,
      success: notifications?.filter(n => n.type === 'success').length || 0,
      warning: notifications?.filter(n => n.type === 'warning').length || 0,
      error: notifications?.filter(n => n.type === 'error').length || 0,
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">غير مسموح</h3>
          <p className="text-muted-foreground">هذه الصفحة متاحة لمديري النظام فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإشعارات</h1>
          <p className="text-muted-foreground">إرسال وإدارة إشعارات النظام</p>
        </div>
        <Button 
          onClick={() => setShowNotificationForm(true)}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          إرسال إشعار جديد
        </Button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإشعارات</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">غير مقروءة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نجحت</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.byType.success}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.byType.warning}</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإشعارات الأخيرة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            الإشعارات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">جارٍ التحميل...</p>
              </div>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                          {notification.type === 'info' && 'معلومات'}
                          {notification.type === 'success' && 'نجاح'}
                          {notification.type === 'warning' && 'تحذير'}
                          {notification.type === 'error' && 'خطأ'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(notification.created_at).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          notification.read 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {notification.read ? 'مقروء' : 'غير مقروء'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد إشعارات</h3>
              <p className="text-muted-foreground">لم يتم إرسال أي إشعارات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نموذج إرسال الإشعارات */}
      <NotificationForm
        open={showNotificationForm}
        onOpenChange={setShowNotificationForm}
        onSuccess={() => {
          // يمكن إضافة تحديث للبيانات هنا إذا لزم الأمر
        }}
      />
    </div>
  );
};

export default NotificationsManagement;