
import React, { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  sidebarCollapsed: boolean;
  setActiveTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, setActiveTab }) => {
  const { user, signOut } = useAuth();
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchOptions = [
    { label: 'لوحة التحكم', tab: 'dashboard', keywords: ['لوحة', 'تحكم', 'رئيسية', 'dashboard'] },
    { label: 'المشاريع', tab: 'projects', keywords: ['مشاريع', 'مشروع', 'projects'] },
    { label: 'المبيعات', tab: 'sales', keywords: ['مبيعات', 'بيع', 'sales'] },
    { label: 'المشتريات', tab: 'purchases', keywords: ['مشتريات', 'شراء', 'purchases'] },
    { label: 'المستخلصات', tab: 'extracts', keywords: ['مستخلصات', 'مستخلص', 'extracts'] },
    { label: 'أوامر التكليف', tab: 'assignment_orders', keywords: ['تكليف', 'أوامر', 'assignment'] },
    { label: 'الفواتير', tab: 'invoices', keywords: ['فواتير', 'فاتورة', 'invoices'] },
    { label: 'المقاولين', tab: 'contractors', keywords: ['مقاولين', 'مقاول', 'contractors'] },
    { label: 'الموردين', tab: 'suppliers', keywords: ['موردين', 'مورد', 'suppliers'] },
    { label: 'المستودع', tab: 'warehouse', keywords: ['مستودع', 'مخزن', 'warehouse'] },
    { label: 'المهام', tab: 'tasks', keywords: ['مهام', 'مهمة', 'tasks'] },
    { label: 'الصيانة', tab: 'maintenance', keywords: ['صيانة', 'maintenance'] },
    { label: 'التقارير', tab: 'reports', keywords: ['تقارير', 'تقرير', 'reports'] },
    { label: 'المحاسبة', tab: 'accounting', keywords: ['محاسبة', 'حسابات', 'accounting'] },
    { label: 'الإشعارات', tab: 'notifications', keywords: ['إشعارات', 'تنبيهات', 'notifications'] },
    { label: 'الصلاحيات', tab: 'permissions', keywords: ['صلاحيات', 'أذونات', 'permissions'] },
    { label: 'الإعدادات', tab: 'settings', keywords: ['إعدادات', 'ضبط', 'settings'] },
  ];

  const filteredOptions = searchQuery.trim() 
    ? searchOptions.filter(option => 
        option.label.includes(searchQuery) || 
        option.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSearch = (tab: string) => {
    setActiveTab?.(tab);
    setSearchQuery('');
  };

  const handleRefresh = () => {
    toast({
      title: "جارٍ تحديث التطبيق",
      description: "سيتم إعادة تحميل التطبيق لضمان أحدث التحديثات",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <header 
      className={`
        fixed top-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-40 transition-all duration-300
        ${sidebarCollapsed ? 'right-16 left-0' : 'right-64 left-0'}
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في النظام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-foreground"
            />
            {filteredOptions.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <button
                    key={option.tab}
                    onClick={() => handleSearch(option.tab)}
                    className="w-full text-right px-4 py-2 hover:bg-muted transition-colors text-foreground"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <NotificationPanel 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>

          {/* Refresh */}
          <button 
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="تحديث التطبيق"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Settings - Only for System Admin */}
          {userRole === 'مدير النظام' && (
            <button 
              onClick={() => setActiveTab?.('settings')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="الإعدادات"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Logout */}
          <button 
            onClick={signOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 space-x-reverse px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 bg-gradient-real-estate rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.email?.split('@')[0] || 'مستخدم'}</p>
              <p className="text-gray-500">{userRole || 'موظف'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
