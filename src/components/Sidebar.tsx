
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';
import { 
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
  ChevronRight,
  ChevronLeft,
  LogOut,
  Calculator,
  Receipt,
  Package,
  Shield,
  Clipboard,
  CreditCard,
  LayoutDashboard,
  FileSignature,
  CalendarCheck,
  X,
  type LucideIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDisplayName } from '@/lib/userDisplayNames';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  managerOnly?: boolean;
  permissionKey?: string;
  group: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { signOut, user, loading: authLoading } = useAuth();
  const { isAdmin, isManager, isProjectManager, loading: roleLoading } = useUserRole();
  const { canAccessPage, isLoadingMy } = usePermissions();
  const isNavLoading = authLoading || roleLoading || isLoadingMy;

  const menuItems: MenuItem[] = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: LayoutDashboard, group: 'main' },
    { id: 'projects', name: 'إدارة المشاريع', icon: Building, group: 'projects' },
    { id: 'sales', name: 'مبيعات الشقق', icon: ShoppingCart, group: 'projects' },
    { id: 'reservations', name: 'الحجوزات', icon: CalendarCheck, group: 'projects' },
    { id: 'contractors', name: 'المقاولون', icon: Users, group: 'operations' },
    { id: 'contracts', name: 'عقود المقاولين', icon: FileSignature, permissionKey: 'contractors', group: 'operations' },
    { id: 'suppliers', name: 'الموردون', icon: Truck, group: 'operations' },
    { id: 'purchases', name: 'المشتريات', icon: CreditCard, group: 'operations' },
    { id: 'warehouse', name: 'المستودع', icon: Package, managerOnly: true, group: 'operations' },
    { id: 'extracts', name: 'المستخلصات', icon: Receipt, group: 'finance' },
    { id: 'assignment_orders', name: 'أوامر التكليف', icon: Clipboard, group: 'finance' },
    { id: 'invoices', name: 'الفواتير', icon: FileText, group: 'finance' },
    { id: 'accounting', name: 'النظام المحاسبي', icon: Calculator, group: 'finance' },
    { id: 'maintenance', name: 'الصيانة', icon: Wrench, group: 'tasks' },
    { id: 'tasks', name: 'المهام اليومية', icon: ClipboardList, group: 'tasks' },
    { id: 'reports', name: 'التقارير', icon: BarChart3, group: 'system' },
    { id: 'notifications', name: 'إدارة الإشعارات', icon: Bell, adminOnly: true, group: 'system' },
    { id: 'permissions', name: 'إدارة الصلاحيات', icon: Shield, adminOnly: true, group: 'system' },
    { id: 'settings', name: 'الإعدادات', icon: Settings, group: 'system' },
  ];

  const groups: Record<string, string> = {
    main: '',
    projects: 'المشاريع والمبيعات',
    operations: 'العمليات',
    finance: 'المالية',
    tasks: 'المهام والصيانة',
    system: 'النظام',
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (isNavLoading) {
      return false;
    }
    if (isProjectManager) {
      return item.id === 'contractors' || item.id === 'extracts';
    }
    if (isAdmin) return true;
    if (item.adminOnly) return false;
    return canAccessPage(item.id);
  });

  const groupedItems = Object.keys(groups).reduce((acc, groupKey) => {
    const items = filteredMenuItems.filter(item => item.group === groupKey);
    if (items.length > 0) acc[groupKey] = items;
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    const button = (
      <button
        onClick={() => handleSelect(item.id)}
        className={`
          group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
          ${isActive 
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/30' 
            : 'hover:bg-sidebar-accent/60 text-sidebar-foreground/70 hover:text-sidebar-foreground'
          }
          ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
        `}
      >
        <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
        <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
        {isActive && (
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary-foreground/50 rounded-l-full ${isCollapsed ? 'lg:hidden' : ''}`} />
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="left" className="font-medium hidden lg:block">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <React.Fragment key={item.id}>{button}</React.Fragment>;
  };

  return (
    <TooltipProvider>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div 
        className={`
          fixed right-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col
          w-64 ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          border-l border-sidebar-border
        `}
        dir="rtl"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div className={`flex items-center p-4 border-b border-sidebar-border/50 ${isCollapsed ? 'lg:justify-center' : 'gap-3'}`}>
          <div className={`flex items-center gap-3 flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-sidebar-foreground truncate leading-tight">سهيل طيبة</h1>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">للتطوير العقاري</p>
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 hover:bg-sidebar-accent/60 rounded-lg transition-colors shrink-0"
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 hover:bg-sidebar-accent/60 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <div className={`space-y-4 px-3 ${isCollapsed ? 'lg:px-2' : ''}`}>
            {isNavLoading && (
              <div className={`px-3 py-2 text-sm text-sidebar-foreground/60 ${isCollapsed ? 'lg:hidden' : ''}`}>جارٍ تحميل الصلاحيات...</div>
            )}
            {Object.entries(groupedItems).map(([groupKey, items]) => (
              <div key={groupKey}>
                {groups[groupKey] && (
                  <p className={`text-[11px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2 px-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    {groups[groupKey]}
                  </p>
                )}
                {isCollapsed && groups[groupKey] && (
                  <div className="hidden lg:block h-px bg-sidebar-border/40 mx-1 mb-2" />
                )}
                <div className="space-y-0.5">
                  {items.map(renderMenuItem)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User & Logout */}
        <div className="border-t border-sidebar-border/50 p-3 space-y-2">
          {user && (
            <div className={`px-3 py-2 rounded-lg bg-sidebar-accent/40 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-[11px] text-sidebar-foreground/40">مسجل باسم</p>
              <p className="text-xs font-medium text-sidebar-foreground/80 truncate">{getDisplayName(user.email)}</p>
            </div>
          )}
          {isCollapsed ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-xl transition-colors hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">تسجيل الخروج</TooltipContent>
              </Tooltip>
              <button
                onClick={signOut}
                className="lg:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-destructive/10 text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">تسجيل الخروج</span>
              </button>
            </>
          ) : (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-destructive/10 text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
