
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, ShoppingBag, BookOpen, UserCog, MessageSquare, UserPlus,
    FileText, Settings, Star, Package, Sparkles, CalendarCheck, Plug, DollarSign, BarChart, History, X,
    Globe, Home, Info, HelpCircle, Shield, Server, Library, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Image from '../ui/Image';
import { Button } from '../ui/Button';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    isCollapsed: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, onClick }) => {
    return (
        <NavLink
            to={to}
            end={to === '/admin'}
            onClick={onClick}
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

interface AdminSidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, isMobileOpen, onMobileClose }) => {
    const { permissions } = useAuth();
    
    const isInstructorOnly = permissions.isInstructor && !permissions.canViewGlobalStats;
    const isPublisherOnly = permissions.isPublisher && !permissions.canViewGlobalStats;

    const renderNavContent = (navItems: any[]) => (
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
             {navItems.map((group: any, index: number) => {
                if (group.to) {
                     return <NavItem key={group.to} {...group} isCollapsed={isCollapsed} onClick={onMobileClose} />;
                }
                
                const filteredItems = group.items.filter((item: any) => item.permission);
                if (filteredItems.length === 0) return null;
                return (
                    <div key={index} className="mb-4">
                        {!isCollapsed && group.title && (
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</h3>
                        )}
                        <div className="space-y-1">
                            {filteredItems.map((item: any) => <NavItem key={item.to} {...item} isCollapsed={isCollapsed} onClick={onMobileClose} />)}
                        </div>
                    </div>
                );
            })}
        </nav>
    );

    let navigationContent;

    if (isInstructorOnly) {
        const instructorNav = [
            { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: true },
            { to: '/admin/profile', icon: <UserCog size={20} />, label: 'ملفي الشخصي', permission: permissions.canManageOwnProfile },
            { to: '/admin/schedule', icon: <CalendarCheck size={20} />, label: 'جدولي', permission: permissions.canManageOwnSchedule },
            { to: '/admin/journeys', icon: <BookOpen size={20} />, label: 'رحلات الطلاب', permission: true },
            { to: '/admin/pricing', icon: <DollarSign size={20} />, label: 'التسعير', permission: true },
            { to: '/admin/financials', icon: <DollarSign size={20} />, label: 'الماليات', permission: permissions.canViewOwnFinancials },
        ].filter(item => item.permission);
        
        navigationContent = renderNavContent(instructorNav);
    } else if (isPublisherOnly) {
        const publisherNav = [
            { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: true },
            { to: '/admin/publisher-products', icon: <Library size={20} />, label: 'إدارة كتبي', permission: permissions.canManageOwnProducts },
            { to: '/admin/publisher-financials', icon: <Wallet size={20} />, label: 'الماليات', permission: true },
            { to: '/admin/my-profile', icon: <UserCog size={20} />, label: 'إعدادات الحساب', permission: true },
        ].filter(item => item.permission);
        
        navigationContent = renderNavContent(publisherNav);
    } else {
        const adminNavGroups = [
            {
                items: [
                    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم', permission: permissions.canViewDashboard },
                ]
            },
            {
                title: 'الإدارة والطلبات',
                items: [
                    { to: '/admin/users', icon: <Users size={20} />, label: 'المستخدمون', permission: permissions.canManageUsers },
                    { to: '/admin/instructors', icon: <UserCog size={20} />, label: 'المدربون', permission: permissions.canManageInstructors },
                    { to: '/admin/support', icon: <MessageSquare size={20} />, label: 'رسائل الدعم', permission: permissions.canManageSupportTickets },
                    { to: '/admin/join-requests', icon: <UserPlus size={20} />, label: 'طلبات الانضمام', permission: permissions.canManageJoinRequests },
                ]
            },
            {
                title: 'الماليات والتقارير',
                items: [
                     { to: '/admin/financials', icon: <DollarSign size={20} />, label: 'الماليات', permission: permissions.canManageFinancials },
                     { to: '/admin/reports', icon: <BarChart size={20} />, label: 'التقارير', permission: permissions.canManageFinancials },
                ]
            },
            {
                title: 'إنها لك',
                items: [
                    { to: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'الطلبات', permission: permissions.canManageEnhaLakOrders },
                    { to: '/admin/personalized-products', icon: <Package size={20} />, label: 'المنتجات', permission: permissions.canManageEnhaLakProducts },
                    { to: '/admin/subscriptions', icon: <Star size={20} />, label: 'الاشتراكات', permission: permissions.canManageEnhaLakOrders },
                    { to: '/admin/subscription-box', icon: <Settings size={20} />, label: 'إعدادات الصندوق', permission: permissions.canManageEnhaLakProducts },
                ]
            },
            {
                title: 'بداية الرحلة',
                items: [
                    { to: '/admin/creative-writing', icon: <BookOpen size={20} />, label: 'الحجوزات', permission: permissions.canManageCreativeWritingBookings },
                    { to: '/admin/scheduled-sessions', icon: <CalendarCheck size={20} />, label: 'إدارة الجلسات', permission: permissions.canManageCreativeWritingBookings },
                    { to: '/admin/service-orders', icon: <Sparkles size={20} />, label: 'طلبات الخدمات', permission: permissions.canManageCreativeWritingBookings },
                    { to: '/admin/price-review', icon: <DollarSign size={20} />, label: 'مصفوفة الأسعار', permission: permissions.canManageInstructors },
                    { to: '/admin/creative-writing-packages', icon: <Package size={20} />, label: 'إدارة الباقات', permission: permissions.canManageCreativeWritingSettings },
                    { to: '/admin/creative-writing-services', icon: <Sparkles size={20} />, label: 'إدارة الخدمات', permission: permissions.canManageCreativeWritingSettings },
                ]
            },
            {
                title: 'إدارة المحتوى',
                items: [
                     { to: '/admin/content/global', icon: <Globe size={20} />, label: 'عام وتذييل الصفحة', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/legal', icon: <Shield size={20} />, label: 'الصفحات القانونية', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/portalPage', icon: <Home size={20} />, label: 'الصفحة الرئيسية', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/aboutPage', icon: <Info size={20} />, label: 'صفحة رحلتنا', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/enhaLakPage', icon: <ShoppingBag size={20} />, label: 'صفحات إنها لك', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/creativeWritingPage', icon: <BookOpen size={20} />, label: 'صفحات بداية الرحلة', permission: permissions.canManageSiteContent },
                     { to: '/admin/content/supportPage', icon: <HelpCircle size={20} />, label: 'صفحة الدعم', permission: permissions.canManageSiteContent },
                     { to: '/admin/blog', icon: <FileText size={20} />, label: 'المدونة', permission: permissions.canManageBlog },
                ]
            },
            {
                title: 'إعدادات النظام',
                items: [
                     { to: '/admin/settings', icon: <Settings size={20} />, label: 'الإعدادات العامة', permission: permissions.canManageSettings },
                     { to: '/admin/system-config', icon: <Server size={20} />, label: 'تكوين النظام', permission: permissions.canManageSettings },
                     { to: '/admin/audit-log', icon: <History size={20} />, label: 'سجل النشاطات', permission: permissions.canViewAuditLog },
                     { to: '/admin/database-inspector', icon: <Settings size={20} />, label: 'مراقب القاعدة', permission: permissions.canManageSettings },
                     { to: '/admin/integrations', icon: <Plug size={20} />, label: 'التكاملات', permission: permissions.canManageSettings },
                ]
            },
        ];
        navigationContent = renderNavContent(adminNavGroups);
    }

    return (
        <aside className={cn(
            "bg-background border-l rtl:border-l-0 rtl:border-r transition-all duration-300 flex flex-col",
            "fixed inset-y-0 right-0 z-[60] h-full w-64 shadow-2xl transform",
            !isMobileOpen && "translate-x-full", 
            "md:translate-x-0 md:static md:h-auto md:shadow-none md:z-0",
            isCollapsed ? "md:w-20" : "md:w-64"
        )}>
            <div className="flex items-center justify-between h-16 border-b p-4">
                <Link to="/" className="flex items-center gap-2" onClick={onMobileClose}>
                    <div className="h-8 w-8 relative">
                        <Image 
                            src="https://i.ibb.co/C0bSJJT/favicon.png" 
                            alt="شعار" 
                            className="h-full w-full !bg-transparent" 
                            objectFit="contain"
                        />
                    </div>
                    {!isCollapsed && <span className="font-bold text-lg">منصة الرحلة</span>}
                </Link>
                <Button variant="ghost" size="icon" onClick={onMobileClose} className="md:hidden">
                    <X size={20} />
                </Button>
            </div>
            {navigationContent}
        </aside>
    );
};

export default AdminSidebar;
