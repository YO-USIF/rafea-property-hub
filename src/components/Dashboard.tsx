
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
  Wrench
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useZoneCosts } from '@/hooks/useZoneCosts';
import { getDisplayName } from '@/lib/userDisplayNames';

const Dashboard = () => {
  const { user } = useAuth();
  const { isLoading, stats, recentActivities, upcomingTasks } = useDashboardData();
  const { createNotification } = useNotifications();
  const { data: zoneCosts } = useZoneCosts();

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
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(stats.totalRevenue),
      change: stats.totalRevenue > 0 ? 'إيرادات متوقعة' : 'لا توجد إيرادات',
      icon: DollarSign,
      gradient: 'gradient-navy',
      changePositive: true
    },
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

      {/* Zone Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-r-blue-500 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">تكلفة ZONE 1</h3>
            <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">النطاق الأول</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(zoneCosts?.ZONE1 || 0)}</p>
          <p className="text-xs text-gray-500 mt-1">مستخلصات + فواتير + أوامر تكليف</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-r-purple-500 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">تكلفة ZONE 2</h3>
            <span className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700">النطاق الثاني</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(zoneCosts?.ZONE2 || 0)}</p>
          <p className="text-xs text-gray-500 mt-1">مستخلصات + فواتير + أوامر تكليف</p>
        </div>
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

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">المهام القادمة</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              إضافة مهمة
            </button>
          </div>
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.due}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد مهام عاجلة</p>
                <p className="text-xs mt-1">المهام العاجلة ستظهر هنا</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
