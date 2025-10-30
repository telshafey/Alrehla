import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, Settings, ShoppingBag, Gift, Edit, MessageSquare, UserPlus,
    BookOpen, UserCheck, FileText, Star, Truck, UserCog, ShieldQuestion,
    Calendar, Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isCollapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, isCollapsed }) => {
    const { permissions, currentUser } = useAuth();

    const mainLinks = [
        { to: '/admin', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, permission: permissions.canViewDashboard },
    ];
    
    const platformManagementLinks = [
        { to: '/admin/users', label: 'المستخدمون', icon: <Users size={20} />, permission: permissions.canManageUsers },
        { to: '/admin/settings', label: 'الإعدادات العامة', icon: <Settings size={20} />, permission: permissions.canManageSettings },
        { to: '/admin/shipping', label: 'إعدادات الشحن', icon: <Truck size={20} />, permission: permissions.canManageShipping },
    ];
    
    const enhaLakLinks = [
        { to: '/admin/orders', label: 'الطلبات', icon: <ShoppingBag size={20} />, permission: permissions.canManageEnhaLakOrders },
        { to: '/admin/subscriptions', label: 'المشتركون', icon: <Users size={20} />, permission: permissions.canManageEnhaLakSubscriptions },
        { to: '/admin/subscription-box', label: 'إدارة صندوق الرحلة', icon: <Star size={20} />, permission: permissions.canManageEnhaLakProducts },
        { to: '/admin/personalized-products', label: 'المنتجات', icon: <Gift size={20} />, permission: permissions.canManageEnhaLakProducts },
    ];

    const creativeWritingLinks = [
        { to: '/admin/creative-writing', label: 'الحجوزات', icon: <BookOpen size={20} />, permission: permissions.canManageCreativeWritingBookings },
        { to: '/admin/service-orders', label: 'طلبات الخدمات', icon: <Sparkles size={20} />, permission: permissions.canManageCreativeWritingBookings },
        { to: '/admin/scheduled-sessions', label: 'الجلسات المجدولة', icon: <Calendar size={20} />, permission: permissions.canManageSchedules },
        { to: '/admin/instructors', label: 'المدربون', icon: <UserCheck size={20} />, permission: permissions.canManageCreativeWritingInstructors },
        { to: '/admin/creative-writing-settings', label: 'إعدادات القسم', icon: <UserCog size={20} />, permission: permissions.canManageCreativeWritingSettings },
    ];
    
    const contentManagementLinks = [
         { to: '/admin/content-management', label: 'محتوى الصفحات', icon: <FileText size={20} />, permission: permissions.canManageContent },
         { to: '/admin/blog', label: 'المدونة', icon: <Edit size={20} />, permission: permissions.canManageBlog },
    ];
    
    const communicationLinks = [
         { to: '/admin/support', label: 'رسائل الدعم', icon: <MessageSquare size={20} />, permission: permissions.canManageSupportTickets },
         { to: '/admin/join-requests', label: 'طلبات الانضمام', icon: <UserPlus size={20} />, permission: permissions.canManageJoinRequests },
         { to: '/admin/support-requests', label: 'دعم المدربين', icon: <ShieldQuestion size={20} />, permission: permissions.canManageSupportRequests },
    ];

    const LinkItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
        <NavLink
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`
            }
            onClick={() => setIsOpen(false)}
        >
            {icon}
            {!isCollapsed && <span className="font-semibold">{label}</span>}
        </NavLink>
    );

    const Section: React.FC<{title: string, links: any[]}> = ({title, links}) => {
        const visibleLinks = links.filter(link => link.permission);
        if(visibleLinks.length === 0) return null;
        return (
            <div>
                {!isCollapsed && <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">{title}</h3>}
                {visibleLinks.map(link => <LinkItem key={link.to} {...link} />)}
            </div>
        );
    }
    
    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <Link to="/" className="flex items-center gap-3">
                    <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار الرحلة" className="h-10 w-auto"/>
                    {!isCollapsed && <span className="text-xl font-bold text-gray-800">منصة الرحلة</span>}
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {currentUser?.role === 'instructor' ? (
                     <LinkItem to="/admin" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" />
                ) : (
                    <>
                        <Section title="رئيسية" links={mainLinks} />
                        <Section title="إدارة المنصة" links={platformManagementLinks} />
                        <Section title="قسم إنها لك" links={enhaLakLinks} />
                        <Section title="قسم بداية الرحلة" links={creativeWritingLinks} />
                        <Section title="إدارة المحتوى" links={contentManagementLinks} />
                        <Section title="التواصل والدعم" links={communicationLinks} />
                    </>
                )}
            </nav>
        </div>
    );
    
    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 right-0 h-full bg-gray-50 border-l z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {sidebarContent}
            </aside>
        </>
    );
};

export default AdminSidebar;