
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Home, 
  Building, 
  ShoppingCart, 
  Users, 
  Truck, 
  FileText, 
  Settings, 
  Wrench,
  ClipboardList,
  BarChart3,
  Bell,
  Menu,
  X,
  LogOut,
  Calculator,
  Receipt,
  Package
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const { isAdmin } = useUserRole();

  const menuItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: Home },
    { id: 'projects', name: 'إدارة المشاريع', icon: Building },
    { id: 'sales', name: 'مبيعات الشقق', icon: ShoppingCart },
    { id: 'contractors', name: 'المقاولون', icon: Users },
    { id: 'suppliers', name: 'الموردون', icon: Truck },
    { id: 'purchases', name: 'المشتريات', icon: FileText },
    { id: 'warehouse', name: 'المستودع', icon: Package },
    { id: 'extracts', name: 'المستخصات', icon: Receipt },
    { id: 'invoices', name: 'الفواتير', icon: Receipt },
    { id: 'accounting', name: 'النظام المحاسبي', icon: Calculator },
    { id: 'maintenance', name: 'الصيانة', icon: Wrench },
    { id: 'tasks', name: 'المهام اليومية', icon: ClipboardList },
    { id: 'reports', name: 'التقارير', icon: BarChart3 },
    { id: 'notifications', name: 'إدارة الإشعارات', icon: Bell, adminOnly: true },
    { id: 'settings', name: 'الإعدادات', icon: Settings },
  ];

  // تصفية العناصر بناءً على الصلاحيات
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div 
      className={`
        fixed right-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50
        ${isCollapsed ? 'w-16' : 'w-64'}
        border-l border-sidebar-border shadow-xl
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-real-estate rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">سهيل طيبة</h1>
              <p className="text-xs text-sidebar-foreground/70">للتطوير العقاري</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {filteredMenuItems
            .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                      : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground'
                    }
                    ${isCollapsed ? 'justify-center' : 'justify-start space-x-3 space-x-reverse'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section and logout */}
      <div className="absolute bottom-4 left-0 right-0 px-3">
        {!isCollapsed && user && (
          <div className="mb-3 p-3 bg-sidebar-accent rounded-lg">
            <p className="text-sm text-sidebar-foreground/70">مسجل باسم:</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={`
            w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
            hover:bg-red-500/10 text-red-500 hover:text-red-600
            ${isCollapsed ? 'justify-center' : 'justify-start space-x-3 space-x-reverse'}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium">تسجيل الخروج</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
