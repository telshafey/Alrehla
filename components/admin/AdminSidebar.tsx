import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, ShoppingBag, BookOpen, UserCog, MessageSquare, UserPlus,
    FileText, Settings, Star, Package, Sparkles, CalendarCheck, Plug, DollarSign, BarChart, History
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Image from '../ui/Image';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => {
    return (
        <NavLink
            to={to}
            end={to === '/admin'}
            className={({ isActive }) => cn(
                "flex items-center p-3 rounded-lg text-sm font-semibold transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50",
                isCollapsed ? "justify-center" : "gap-4"
            )}
        >
            {icon}
            {!isCollapsed && <span>{label}</span>}
        </NavLink>
    );
};


const AdminSidebar: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const { permissions } = useAuth();
    
    // This is the key logic: Is the user ONLY an instructor and not a higher-level admin?
    const isInstructorOnly = permissions.isInstructor && !permissions.canViewGlobalStats;

    // Instructor-specific sidebar
    if (isInstructorOnly) {
        const instructorNav = [
            { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: true },
            { to: '/admin/profile', icon: <UserCog size={20} />, label: 'ملفي الشخصي', permission: permissions.canManageOwnProfile },
            { to: '/admin/schedule', icon: <CalendarCheck size={20} />, label: 'جدولي', permission: permissions.canManageOwnSchedule },
            { to: '/admin/journeys', icon: <BookOpen size={20} />, label: 'رحلات الطلاب', permission: true },
            { to: '/admin/pricing', icon: <DollarSign size={20} />, label: 'التسعير', permission: true },
            { to: '/admin/financials', icon: <DollarSign size={20} />, label: 'الماليات', permission: permissions.canViewOwnFinancials },
        ].filter(item => item.permission);

         return (
             <aside className={cn(
                "hidden md:flex flex-col bg-background border-l rtl:border-l-0 rtl:border-r transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}>
                  <div className="flex items-center justify-center h-16 border-b p-4">
                     <Image src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار" className="h-8 w-8" />
                     {!isCollapsed && <span className="font-bold text-lg mr-2">لوحة المدرب</span>}
                 </div>
                 <nav className="flex-1 p-4 space-y-2">
                    {instructorNav.map(item => <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />)}
                </nav>
            </aside>
        );
    }
    
    // Admin/Supervisor sidebar
    const adminNavGroups = [
        {
            items: [
                { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: permissions.canViewDashboard },
            ]
        },
        // Management
        {
            title: 'الإدارة',
            items: [
                { to: '/admin/users', icon: <Users size={20} />, label: 'المستخدمون', permission: permissions.canManageUsers },
                { to: '/admin/instructors', icon: <UserCog size={20} />, label: 'المدربون', permission: permissions.canManageInstructors },
            ]
        },
        // Financials & Reports
        {
            title: 'الماليات والتقارير',
            items: [
                 { to: '/admin/financials', icon: <DollarSign size={20} />, label: 'الماليات', permission: permissions.canManageFinancials },
                 { to: '/admin/reports', icon: <BarChart size={20} />, label: 'التقارير', permission: permissions.canManageFinancials },
            ]
        },
        // Enha Lak
        {
            title: 'إنها لك',
            items: [
                { to: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات', permission: permissions.canManageEnhaLakOrders },
                { to: '/admin/personalized-products', icon: <Package size={20} />, label: 'المنتجات', permission: permissions.canManageEnhaLakProducts },
                { to: '/admin/subscriptions', icon: <Star size={20} />, label: 'الاشتراكات', permission: permissions.canManageEnhaLakOrders },
            ]
        },
         // Creative Writing
        {
            title: 'بداية الرحلة',
            items: [
                { to: '/admin/creative-writing', icon: <BookOpen size={20} />, label: 'الحجوزات', permission: permissions.canManageCreativeWritingBookings },
                { to: '/admin/service-orders', icon: <Sparkles size={20} />, label: 'طلبات الخدمات', permission: permissions.canManageCreativeWritingBookings },
                { to: '/admin/scheduled-sessions', icon: <CalendarCheck size={20} />, label: 'الجلسات المجدولة', permission: permissions.canManageCreativeWritingBookings },
                { to: '/admin/introductory-sessions', icon: <Star size={20} />, label: 'الجلسات التعريفية', permission: permissions.canManageInstructors },
                { to: '/admin/price-review', icon: <DollarSign size={20} />, label: 'تسعير المدربين', permission: permissions.canManageInstructors },
                { to: '/admin/creative-writing-packages', icon: <Package size={20} />, label: 'إعدادات الباقات', permission: permissions.canManageCreativeWritingSettings },
                { to: '/admin/creative-writing-services', icon: <Sparkles size={20} />, label: 'إعدادات الخدمات', permission: permissions.canManageCreativeWritingSettings },
            ]
        },
         // Content
        {
            title: 'المحتوى والتواصل',
            items: [
                 { to: '/admin/content-management', icon: <FileText size={20} />, label: 'محتوى الموقع', permission: permissions.canManageSiteContent },
                 { to: '/admin/blog', icon: <FileText size={20} />, label: 'المدونة', permission: permissions.canManageBlog },
                 { to: '/admin/support', icon: <MessageSquare size={20} />, label: 'رسائل الدعم', permission: permissions.canManageSupportTickets },
                 { to: '/admin/join-requests', icon: <UserPlus size={20} />, label: 'طلبات الانضمام', permission: permissions.canManageJoinRequests },
            ]
        },
        // Settings
        {
            title: 'الإعدادات',
            items: [
                 { to: '/admin/settings', icon: <Settings size={20} />, label: 'الإعدادات العامة', permission: permissions.canManageSettings },
                 { to: '/admin/shipping', icon: <Settings size={20} />, label: 'إعدادات الشحن', permission: permissions.canManageSettings },
                 { to: '/admin/integrations', icon: <Plug size={20} />, label: 'التكاملات', permission: permissions.canManageSettings },
                 { to: '/admin/audit-log', icon: <History size={20} />, label: 'سجل النشاطات', permission: permissions.canViewAuditLog },
            ]
        },
    ];

    return (
        <aside className={cn(
            "hidden md:flex flex-col bg-background border-l rtl:border-l-0 rtl:border-r transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <Link to="/" className="flex items-center justify-center h-16 border-b p-4 gap-2">
                <Image src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار" className="h-8 w-8" />
                {!isCollapsed && <span className="font-bold text-lg">منصة الرحلة</span>}
            </Link>

            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                {adminNavGroups.map((group, index) => {
                    const filteredItems = group.items.filter(item => item.permission);
                    if (filteredItems.length === 0) return null;
                    return (
                        <div key={index}>
                            {!isCollapsed && group.title && (
                                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</h3>
                            )}
                            <div className="space-y-1">
                                {filteredItems.map(item => <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />)}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default AdminSidebar;