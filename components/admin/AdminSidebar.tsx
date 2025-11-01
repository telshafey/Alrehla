import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Permissions } from '../../lib/roles';
import {
  LayoutDashboard, Users, Settings, ShoppingBag, BookOpen, MessageSquare, Edit,
  Truck, Star, Gift, UserCheck, Package, Sparkles, UserPlus,
  DollarSign, Calendar, User
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  type: 'link';
  to: string;
  icon: React.ReactNode;
  label: string;
  permission?: keyof Permissions;
  role?: 'admin' | 'instructor';
}

interface NavSection {
  type: 'section';
  label: string;
  permission?: (keyof Permissions)[];
  role?: 'admin' | 'instructor';
}

type NavConfigItem = NavItem | NavSection;

const navConfig: NavConfigItem[] = [
  // Common / Admin Main
  { type: 'link', to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: 'canViewDashboard', role: 'admin' },
  
  // Enha Lak Section
  { type: 'section', label: 'إنها لك', permission: ['canManageEnhaLakOrders', 'canManageEnhaLakProducts'], role: 'admin' },
  { type: 'link', to: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات', permission: 'canManageEnhaLakOrders', role: 'admin' },
  { type: 'link', to: '/admin/subscriptions', icon: <Star size={20} />, label: 'الاشتراكات', permission: 'canManageEnhaLakSubscriptions', role: 'admin' },
  { type: 'link', to: '/admin/personalized-products', icon: <Gift size={20} />, label: 'المنتجات', permission: 'canManageEnhaLakProducts', role: 'admin' },
  { type: 'link', to: '/admin/shipping', icon: <Truck size={20} />, label: 'الشحن', permission: 'canManageShipping', role: 'admin' },
  
  // Creative Writing Section
  { type: 'section', label: 'بداية الرحلة', permission: ['canManageCreativeWritingBookings', 'canManageCreativeWritingInstructors'], role: 'admin' },
  { type: 'link', to: '/admin/creative-writing', icon: <BookOpen size={20} />, label: 'الحجوزات', permission: 'canManageCreativeWritingBookings', role: 'admin' },
  { type: 'link', to: '/admin/service-orders', icon: <Sparkles size={20} />, label: 'طلبات الخدمات', permission: 'canManageCreativeWritingBookings', role: 'admin' },
  { type: 'link', to: '/admin/scheduled-sessions', icon: <Calendar size={20} />, label: 'إدارة الجلسات', permission: 'canManageSchedules', role: 'admin' },
  { type: 'link', to: '/admin/instructors', icon: <UserCheck size={20} />, label: 'المدربون', permission: 'canManageCreativeWritingInstructors', role: 'admin' },
  { type: 'link', to: '/admin/creative-writing-packages', icon: <Package size={20} />, label: 'إدارة الباقات', permission: 'canManageCreativeWritingSettings', role: 'admin' },
  { type: 'link', to: '/admin/creative-writing-services', icon: <Sparkles size={20} />, label: 'إدارة الخدمات', permission: 'canManageCreativeWritingSettings', role: 'admin' },
  { type: 'link', to: '/admin/pricing-review', icon: <DollarSign size={20} />, label: 'مراجعة التسعير', permission: 'canManagePrices', role: 'admin' },
  
  // Management Section
  { type: 'section', label: 'الإدارة', permission: ['canManageUsers', 'canManageSettings'], role: 'admin' },
  { type: 'link', to: '/admin/users', icon: <Users size={20} />, label: 'المستخدمون', permission: 'canManageUsers', role: 'admin' },
  { type: 'link', to: '/admin/content-management', icon: <Edit size={20} />, label: 'المحتوى', permission: 'canManageContent', role: 'admin' },
  { type: 'link', to: '/admin/settings', icon: <Settings size={20} />, label: 'الإعدادات العامة', permission: 'canManageSettings', role: 'admin' },

  // Communication Section
  { type: 'section', label: 'التواصل', permission: ['canManageSupportTickets', 'canManageJoinRequests'], role: 'admin' },
  { type: 'link', to: '/admin/support', icon: <MessageSquare size={20} />, label: 'رسائل الدعم', permission: 'canManageSupportTickets', role: 'admin' },
  { type: 'link', to: '/admin/join-requests', icon: <UserPlus size={20} />, label: 'طلبات الانضمام', permission: 'canManageJoinRequests', role: 'admin' },

  // Instructor Menu
  { type: 'link', to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', role: 'instructor' },
  { type: 'link', to: '/admin/journeys', icon: <BookOpen size={20} />, label: 'رحلات الطلاب', role: 'instructor' },
  { type: 'link', to: '/admin/financials', icon: <DollarSign size={20} />, label: 'الماليات', role: 'instructor' },
  { type: 'link', to: '/admin/schedule', icon: <Calendar size={20} />, label: 'الجدول', role: 'instructor' },
  { type: 'link', to: '/admin/pricing', icon: <DollarSign size={20} />, label: 'التسعير', role: 'instructor' },
  { type: 'link', to: '/admin/profile', icon: <User size={20} />, label: 'ملفي الشخصي', role: 'instructor' },
];

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; isCollapsed: boolean; onClick?: () => void; }> = ({ to, icon, label, isCollapsed, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/admin'}
    className={({ isActive }) => cn(
      'flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      isCollapsed && 'justify-center'
    )}
  >
    {icon}
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
);

const SectionTitle: React.FC<{ children: React.ReactNode; isCollapsed: boolean }> = ({ children, isCollapsed }) => {
    if (isCollapsed) return <hr className="my-4 border-border" />;
    return <h3 className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-6 mb-2">{children}</h3>
};

const AdminSidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void; isCollapsed: boolean; }> = ({ isOpen, setIsOpen, isCollapsed }) => {
  const { permissions, currentUser } = useAuth();

  const handleClose = () => setIsOpen(false);
  
  const currentRole = currentUser?.role === 'instructor' ? 'instructor' : 'admin';

  const menuItems = navConfig.filter(item => {
    if (item.role && item.role !== currentRole) {
        return false;
    }
    if (item.type === 'link' && item.permission && !permissions[item.permission]) {
        return false;
    }
    if (item.type === 'section' && item.permission && !item.permission.some(p => permissions[p])) {
        return false;
    }
    return true;
  });


  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="Logo" className="h-8 w-auto" />
          {!isCollapsed && <span>منصة الرحلة</span>}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item, index) => {
            if (item.type === 'section') {
                return <SectionTitle key={index} isCollapsed={isCollapsed}>{item.label}</SectionTitle>;
            }
            return <NavItem key={item.to} {...item} isCollapsed={isCollapsed} onClick={handleClose} />;
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn('fixed inset-0 z-40 bg-black/60 md:hidden', isOpen ? 'block' : 'hidden')} onClick={handleClose} />
      <aside className={cn('fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-background transition-transform duration-300 ease-in-out md:hidden', isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full')}>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden md:fixed md:inset-y-0 md:right-0 md:z-30 md:flex md:flex-col bg-background border-l transition-all duration-300 rtl:border-l-0 rtl:border-r', isCollapsed ? 'w-20' : 'w-64')}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;