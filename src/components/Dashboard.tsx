
import React from 'react';
import { 
  Building, 
  Home, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  FileText,
  Wrench,
  Bell,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { getDisplayName } from '@/lib/userDisplayNames';

const Dashboard = () => {
  const { user } = useAuth();
  const { isLoading, stats, recentActivities } = useDashboardData();
  const { notifications, markAsRead } = useNotifications();
  const userNotifications = (notifications || []).slice(0, 6);
  const isSystemAdmin = user?.email === 'wwork9575@gmail.com';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ريال`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K ريال`;
    }
    return `${value} ريال`;
  };

  const statsDisplay = [
    {
      title: 'إجمالي المشاريع',
      value: stats.totalProjects.toString(),
      change: stats.totalProjects > 0 ? 'مشاريع نشطة' : 'لا توجد مشاريع',
      icon: Building,
      gradient: 'gradient-real-estate',
      changePositive: true
    },
    {
      title: 'الشقق المباعة',
      value: stats.soldUnits.toString(),
      change: stats.soldUnits > 0 ? 'وحدات مباعة' : 'لا توجد مبيعات',
      icon: Home,
      gradient: 'gradient-gold',
      changePositive: true
    },
    ...(isSystemAdmin ? [{
      title: 'إجمالي الإيرادات',
      value: formatCurrency(stats.totalRevenue),
      change: stats.totalRevenue > 0 ? 'إيرادات متوقعة' : 'لا توجد إيرادات',
      icon: DollarSign,
      gradient: 'gradient-navy',
      changePositive: true
    }] : []),
    {
      title: 'المتعاونون النشطون',
      value: stats.activeContractors.toString(),
      change: stats.activeContractors > 0 ? 'متعاونون نشطون' : 'لا يوجد متعاونون',
      icon: Users,
      gradient: 'gradient-real-estate',
      changePositive: true
    }
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">جارٍ تحميل البيانات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً، {getDisplayName(user?.email)} 👋
        </h1>
        <p className="text-gray-600">
          نظرة شاملة على أداء شركة سهيل طيبة للتطوير العقاري
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className={`w-4 h-4 ${stat.changePositive ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className={`text-xs ${stat.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">الأنشطة الأخيرة</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 space-x-reverse p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد أنشطة حديثة</p>
                <p className="text-xs mt-1">قم بإضافة مشاريع أو طلبات صيانة لرؤية الأنشطة</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              الإشعارات
            </h2>
          </div>
          <div className="space-y-3">
            {userNotifications.length > 0 ? (
              userNotifications.map((n) => {
                const Icon = n.type === 'warning' ? AlertTriangle : n.type === 'success' ? CheckCircle : Info;
                const color = n.type === 'warning' ? 'text-yellow-500' : n.type === 'success' ? 'text-green-500' : 'text-blue-500';
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      n.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد إشعارات</p>
                <p className="text-xs mt-1">ستظهر إشعاراتك هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
