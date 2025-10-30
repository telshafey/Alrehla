import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, Settings, ShoppingBag, BookOpen, MessageSquare, Edit,
  Truck, Star, Gift, UserCheck, ShieldQuestion, CalendarCheck, Package, Sparkles, UserPlus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/admin'}
    className={({ isActive }) => cn(
      'flex items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      isCollapsed && 'justify-center'
    )}
  >
    {icon}
    {!isCollapsed && <span>{label}</span>}
  </NavLink>
);

const SectionTitle: React.FC<{ children: React.ReactNode; isCollapsed: boolean }> = ({ children, isCollapsed }) => {
    if (isCollapsed) {
        return <hr className="my-4 border-border" />;
    }
    return <h3 className="px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-6 mb-2">{children}</h3>
};

const AdminSidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void; isCollapsed: boolean; }> = ({ isOpen, setIsOpen, isCollapsed }) => {
  const { permissions, currentUser } = useAuth();

  const handleClose = () => setIsOpen(false);
  
  const sidebarContent = (
    <>
      <div className="flex items-center justify-center h-16 border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="Logo" className="h-8 w-auto" />
          {!isCollapsed && <span>منصة الرحلة</span>}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {permissions.canViewDashboard && (
            <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        
        {currentUser?.role === 'instructor' && (
            <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" isCollapsed={isCollapsed} onClick={handleClose} />
        )}

        {(permissions.canManageEnhaLakOrders || permissions.canManageEnhaLakProducts) && (
            <SectionTitle isCollapsed={isCollapsed}>إنها لك</SectionTitle>
        )}
        {permissions.canManageEnhaLakOrders && (
            <NavItem to="/admin/orders" icon={<ShoppingBag size={20} />} label="الطلبات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageEnhaLakSubscriptions && (
            <NavItem to="/admin/subscriptions" icon={<Star size={20} />} label="الاشتراكات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageEnhaLakProducts && (
            <NavItem to="/admin/personalized-products" icon={<Gift size={20} />} label="المنتجات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageShipping && (
            <NavItem to="/admin/shipping" icon={<Truck size={20} />} label="الشحن" isCollapsed={isCollapsed} onClick={handleClose} />
        )}

        {(permissions.canManageCreativeWritingBookings || permissions.canManageCreativeWritingInstructors) && (
            <SectionTitle isCollapsed={isCollapsed}>بداية الرحلة</SectionTitle>
        )}
        {permissions.canManageCreativeWritingBookings && (
            <NavItem to="/admin/creative-writing" icon={<BookOpen size={20} />} label="الحجوزات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageCreativeWritingBookings && (
            <NavItem to="/admin/service-orders" icon={<Sparkles size={20} />} label="طلبات الخدمات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
         {permissions.canManageSchedules && (
            <NavItem to="/admin/scheduled-sessions" icon={<CalendarCheck size={20} />} label="الجلسات المجدولة" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageSchedules && (
            <NavItem to="/admin/introductory-sessions" icon={<Star size={20} />} label="الجلسات التعريفية" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageCreativeWritingInstructors && (
            <NavItem to="/admin/instructors" icon={<UserCheck size={20} />} label="المدربون" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
         {permissions.canManageCreativeWritingSettings && (
            <NavItem to="/admin/creative-writing-packages" icon={<Package size={20} />} label="إدارة الباقات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageCreativeWritingSettings && (
            <NavItem to="/admin/creative-writing-services" icon={<Sparkles size={20} />} label="إدارة الخدمات" isCollapsed={isCollapsed} onClick={handleClose} />
        )}

        {(permissions.canManageUsers || permissions.canManageSettings) && (
             <SectionTitle isCollapsed={isCollapsed}>الإدارة</SectionTitle>
        )}
        {permissions.canManageUsers && (
            <NavItem to="/admin/users" icon={<Users size={20} />} label="المستخدمون" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageContent && (
             <NavItem to="/admin/content-management" icon={<Edit size={20} />} label="المحتوى" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageSettings && (
            <NavItem to="/admin/settings" icon={<Settings size={20} />} label="الإعدادات العامة" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        
        {(permissions.canManageSupportTickets || permissions.canManageJoinRequests) && (
             <SectionTitle isCollapsed={isCollapsed}>التواصل</SectionTitle>
        )}
        {permissions.canManageSupportTickets && (
            <NavItem to="/admin/support" icon={<MessageSquare size={20} />} label="رسائل الدعم" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageJoinRequests && (
            <NavItem to="/admin/join-requests" icon={<UserPlus size={20} />} label="طلبات الانضمام" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
        {permissions.canManageSupportRequests && (
            <NavItem to="/admin/support-requests" icon={<ShieldQuestion size={20} />} label="جلسات الدعم" isCollapsed={isCollapsed} onClick={handleClose} />
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 md:hidden',
          isOpen ? 'block' : 'hidden'
        )}
        onClick={handleClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-background transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:fixed md:inset-y-0 md:right-0 md:z-30 md:flex md:flex-col bg-background border-l transition-all duration-300 rtl:border-l-0 rtl:border-r',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AdminSidebar;