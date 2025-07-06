
import React from 'react';
import { 
  Building, 
  Home, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'إجمالي المشاريع',
      value: '24',
      change: '+3 هذا الشهر',
      icon: Building,
      gradient: 'gradient-real-estate',
      changePositive: true
    },
    {
      title: 'الشقق المباعة',
      value: '186',
      change: '+12 هذا الأسبوع',
      icon: Home,
      gradient: 'gradient-gold',
      changePositive: true
    },
    {
      title: 'إجمالي الإيرادات',
      value: '2.4M ريال',
      change: '+8.2% من الشهر السابق',
      icon: DollarSign,
      gradient: 'gradient-navy',
      changePositive: true
    },
    {
      title: 'العملاء النشطين',
      value: '142',
      change: '+6 عملاء جدد',
      icon: Users,
      gradient: 'gradient-real-estate',
      changePositive: true
    }
  ];

  const recentActivities = [
    { id: 1, title: 'بيع شقة في مشروع الواحة الخضراء', time: 'منذ ساعتين', type: 'sale' },
    { id: 2, title: 'موافقة على مستخلص المقاول الرئيسي', time: 'منذ 3 ساعات', type: 'approval' },
    { id: 3, title: 'إضافة مشروع جديد: برج النخيل', time: 'منذ 5 ساعات', type: 'project' },
    { id: 4, title: 'دفع مستحقات المورد الأساسي', time: 'أمس', type: 'payment' },
  ];

  const upcomingTasks = [
    { id: 1, title: 'مراجعة تقرير المبيعات الشهرية', due: 'غداً', priority: 'high' },
    { id: 2, title: 'اجتماع مع فريق التطوير', due: 'بعد غد', priority: 'medium' },
    { id: 3, title: 'زيارة موقع مشروع الواحة', due: 'الأحد', priority: 'high' },
    { id: 4, title: 'مراجعة عقود الموردين', due: 'الإثنين', priority: 'low' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً، أحمد محمد 👋
        </h1>
        <p className="text-gray-600">
          نظرة شاملة على أداء شركة رافع للتطوير العقاري
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
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
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 space-x-reverse p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
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
            {upcomingTasks.map((task) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 gradient-real-estate rounded-lg flex items-center justify-center mb-3">
              <Building className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">مشروع جديد</span>
          </button>
          <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 gradient-gold rounded-lg flex items-center justify-center mb-3">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">بيع شقة</span>
          </button>
          <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 gradient-navy rounded-lg flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">عميل جديد</span>
          </button>
          <button className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-12 h-12 gradient-real-estate rounded-lg flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">جدولة مهمة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
