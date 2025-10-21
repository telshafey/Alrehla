import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { 
    LayoutDashboard, Users, Settings, ShoppingBag, Gift, Feather, CheckSquare,
    FileText, MessageSquare, UserPlus, LogOut, X, ChevronLeft, ChevronRight, Star, Truck, FileBarChart, Globe,
} from 'lucide-react';

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
        end
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`
        }
    >
        {icon}
        {!isCollapsed && <span className="mr-4 whitespace-nowrap">{label}</span>}
    </NavLink>
);

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, isCollapsed }) => {
    const { signOut, permissions } = useAuth();
    const navigate = useNavigate();
    
    const handleSignOut = () => {
        signOut();
        navigate('/');
    };
    
    const navLinks = [
        // Super Admin
        permissions.canManageUsers && { to: '/admin/users', icon: <Users size={22} />, label: 'المستخدمون' },
        permissions.canManageSettings && { to: '/admin/settings', icon: <Settings size={22} />, label: 'إعدادات الموقع' },
        
        // Enha Lak Supervisor
        permissions.canManageEnhaLakOrders && { to: '/admin/orders', icon: <ShoppingBag size={22} />, label: 'طلبات "إنها لك"' },
        permissions.canManageEnhaLakSubscriptions && { to: '/admin/subscriptions', icon: <Star size={22} />, label: 'الاشتراكات' },
        permissions.canManageEnhaLakProducts && { to: '/admin/personalized-products', icon: <Gift size={22} />, label: 'منتجات مخصصة' },
        permissions.canManagePrices && { to: '/admin/prices', icon: <FileBarChart size={22} />, label: 'الأسعار' },
        permissions.canManageShipping && { to: '/admin/shipping', icon: <Truck size={22} />, label: 'الشحن' },
        
        // Creative Writing Supervisor
        permissions.canManageCreativeWritingBookings && { to: '/admin/creative-writing', icon: <CheckSquare size={22} />, label: 'حجوزات الكتابة' },
        permissions.canManageCreativeWritingInstructors && { to: '/admin/instructors', icon: <Feather size={22} />, label: 'المدربون' },
        
        // Content Editor
        permissions.canManageContent && { to: '/admin/content-management', icon: <FileText size={22} />, label: 'محتوى الموقع' },
        permissions.canManageBlog && { to: '/admin/blog', icon: <FileText size={22} />, label: 'المدونة' },

        // Support Agent
        permissions.canManageSupportTickets && { to: '/admin/support', icon: <MessageSquare size={22} />, label: 'رسائل الدعم' },
        permissions.canManageJoinRequests && { to: '/admin/join-requests', icon: <UserPlus size={22} />, label: 'طلبات الانضمام' },
    ].filter(Boolean); // Filter out false values for roles without permission


    const sidebarContent = (
        <div className="flex flex-col h-full bg-gray-100 border-l border-gray-200">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-20 border-b`}>
                 {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/C0bSJJT/favicon.png" alt="شعار الرحلة" className="h-10 w-auto"/>
                        <span className="font-bold text-lg">لوحة التحكم</span>
                    </div>
                 )}
                 <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-600">
                     <X size={24} />
                 </button>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <NavItem to="/admin" icon={<LayoutDashboard size={22} />} label="الرئيسية" isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
                <NavItem to="/" icon={<Globe size={22} />} label="العودة للموقع" isCollapsed={isCollapsed} onClick={() => setIsOpen(false)} />
                <div className="my-4 border-t border-gray-200 -mx-3"></div>
                {navLinks.map(link => link && (
                    <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} isCollapsed={isCollapsed} onClick={() => setIsOpen(false)}/>
                ))}
            </nav>

            <div className="px-3 py-4 border-t">
                <button onClick={handleSignOut} className="flex items-center w-full p-3 rounded-lg text-red-500 bg-red-50 hover:bg-red-100">
                    <LogOut size={22} />
                    {!isCollapsed && <span className="mr-4 font-semibold">تسجيل الخروج</span>}
                </button>
            </div>
        </div>
    );
    

    return (
        <>
            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside
                className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {sidebarContent}
            </aside>
            
            {/* Desktop Sidebar */}
            <aside className={`hidden md:block fixed top-0 right-0 h-full z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {sidebarContent}
            </aside>
        </>
    );
};

export default AdminSidebar;