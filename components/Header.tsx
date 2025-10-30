import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProduct } from '../contexts/ProductContext';
import { useUserNotifications } from '../hooks/queries/user/useUserDataQuery';
import { useNotificationMutations } from '../hooks/mutations/useNotificationMutations';
import { formatDate } from '../utils/helpers';
import { 
    ShoppingCart, User, Menu, X, Bell, LogOut, Trash2, Info, Calendar, 
    ArrowLeft
} from 'lucide-react';
import { Button } from './ui/Button';


const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'order': return <ShoppingCart className="w-5 h-5 text-blue-500" />;
        case 'booking': return <Calendar className="w-5 h-5 text-purple-500" />;
        default: return <Info className="w-5 h-5 text-gray-500" />;
    }
};

const Header: React.FC = () => {
    const { isLoggedIn, currentUser, hasAdminAccess, signOut } = useAuth();
    const { itemCount } = useCart();
    const { siteBranding } = useProduct();
    const { data: notifications = [] } = useUserNotifications();
    const { markNotificationAsRead, deleteNotification } = useNotificationMutations();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const menusRef = useRef<{ [key: string]: HTMLElement | null }>({});

    const unreadCount = useMemo(() => notifications.filter((n: any) => !n.read).length, [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const clickedInside = Object.values(menusRef.current).some(
                (ref) => (ref as HTMLElement | null)?.contains(event.target as Node)
            );
            if (!clickedInside) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setOpenMenu(null);
    };

    const toggleMenu = (menuKey: string) => {
        setOpenMenu(prev => (prev === menuKey ? null : menuKey));
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation();
        e.preventDefault();
        deleteNotification.mutate({ notificationId });
    };
    
    const { currentNavLinks, headerStyle, sectionTitle } = useMemo(() => {
        const path = location.pathname;
        
        const mainNavLinks = [
            { key: 'home', to: '/', text: 'الرئيسية' },
            { key: 'enha-lak', to: '/enha-lak', text: 'إنها لك' },
            { key: 'creative-writing', to: '/creative-writing', text: 'بداية الرحلة' },
            { key: 'about', to: '/about', text: 'عنا' },
            { key: 'blog', to: '/blog', text: 'المدونة' },
            { key: 'support', to: '/support', text: 'الدعم' },
        ];
        
        const enhaLakNavLinks = [
            { key: 'back', to: '/', text: 'العودة للرئيسية', icon: <ArrowLeft size={16} /> },
            { key: 'enha-lak-home', to: '/enha-lak', text: 'عن المشروع' },
            { key: 'enha-lak-store', to: '/enha-lak/store', text: 'متجر القصص' },
            { key: 'enha-lak-subscription', to: '/enha-lak/subscription', text: 'صندوق الرحلة' },
        ];
        
        const creativeWritingNavLinks = [
            { key: 'back', to: '/', text: 'العودة للرئيسية', icon: <ArrowLeft size={16} /> },
            { key: 'cw-home', to: '/creative-writing', text: 'نظرة عامة' },
            { key: 'cw-packages', to: '/creative-writing/packages', text: 'الباقات' },
            { key: 'cw-about', to: '/creative-writing/about', text: 'فلسفة البرنامج' },
            { key: 'cw-instructors', to: '/creative-writing/instructors', text: 'المدربون' },
            { key: 'cw-services', to: '/creative-writing/services', text: 'الخدمات الإبداعية' },
        ];

        if (path.startsWith('/enha-lak')) {
            return {
                currentNavLinks: enhaLakNavLinks,
                headerStyle: 'border-b-4 border-pink-500',
                sectionTitle: 'إنها لك'
            };
        } else if (path.startsWith('/creative-writing') || path.startsWith('/instructor')) {
            return {
                currentNavLinks: creativeWritingNavLinks,
                headerStyle: 'border-b-4 border-blue-500',
                sectionTitle: 'بداية الرحلة'
            };
        } else {
            return {
                currentNavLinks: mainNavLinks,
                headerStyle: '',
                sectionTitle: null
            };
        }
    }, [location.pathname]);

    const NavItem: React.FC<{ to: string, text: string, icon?: React.ReactNode }> = ({ to, text, icon }) => (
        <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
                `flex items-center gap-2 font-semibold transition-colors ${
                    isActive && to !== '/' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
                }`
            }
            onClick={closeAllMenus}
        >
            {icon}
            <span>{text}</span>
        </NavLink>
    );

    return (
        <header className={`bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 ${headerStyle}`} dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={siteBranding?.logoUrl || "https://i.ibb.co/C0bSJJT/favicon.png"} alt="شعار منصة الرحلة" className="h-12 w-auto" />
                         <div className="hidden sm:flex items-baseline gap-2">
                             <span className="text-xl font-bold text-gray-800">منصة الرحلة</span>
                             {sectionTitle && <span className="text-sm font-semibold text-gray-500">| {sectionTitle}</span>}
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {currentNavLinks.map(link => <NavItem key={link.key} to={link.to} text={link.text} icon={link.icon} />)}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
                            <ShoppingCart />
                            {itemCount > 0 && (
                                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        
                        {isLoggedIn ? (
                            <>
                                {/* Notifications Dropdown */}
                                <div ref={el => (menusRef.current['notifications'] = el)} className="relative">
                                    <button onClick={() => toggleMenu('notifications')} className="relative p-2 text-gray-600 hover:text-blue-600">
                                        <Bell />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {openMenu === 'notifications' && (
                                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fadeIn z-50">
                                            <div className="p-3 border-b font-bold text-sm">الإشعارات</div>
                                            <div className="py-1 max-h-80 overflow-y-auto">
                                                {(notifications as any[]).length > 0 ? (notifications as any[]).map((notif: any) => (
                                                    <Link 
                                                        key={notif.id} 
                                                        to={notif.link} 
                                                        state={notif.link === '/account' ? { defaultTab: 'myLibrary' } : undefined}
                                                        onClick={() => { closeAllMenus(); markNotificationAsRead.mutate({ notificationId: notif.id }); }}
                                                        className={`flex items-start gap-3 p-3 text-sm hover:bg-gray-100 ${!notif.read ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <NotificationIcon type={notif.type} />
                                                        <div className="flex-grow">
                                                            <p className="text-gray-700">{notif.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{formatDate(notif.created_at)}</p>
                                                        </div>
                                                        <button onClick={(e) => handleDeleteNotification(e, notif.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                                    </Link>
                                                )) : (
                                                    <p className="p-4 text-center text-sm text-gray-500">لا توجد إشعارات.</p>
                                                )}
                                            </div>
                                            <Link to="/account" state={{ defaultTab: 'notifications' }} onClick={closeAllMenus} className="block text-center p-2 border-t text-sm font-semibold text-blue-600 hover:bg-gray-50">
                                                عرض كل الإشعارات
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                
                                 {/* User Menu Dropdown */}
                                <div ref={el => (menusRef.current['user'] = el)} className="relative">
                                    <button onClick={() => toggleMenu('user')} className="p-2 text-gray-600 hover:text-blue-600">
                                        <User />
                                    </button>
                                    {openMenu === 'user' && (
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fadeIn z-50">
                                            <div className="p-4 border-b">
                                                <p className="text-sm font-semibold">مرحباً، {currentUser?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Link to="/account" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">حسابي</Link>
                                                {hasAdminAccess && <Link to="/admin" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">لوحة التحكم</Link>}
                                            </div>
                                            <div className="py-1 border-t">
                                                <button onClick={() => { signOut(); closeAllMenus(); }} className="w-full text-right flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <LogOut size={16} /> تسجيل الخروج
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Button asChild size="sm" className="hidden lg:inline-flex"><Link to="/account">تسجيل الدخول</Link></Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t">
                    <nav className="flex flex-col items-center gap-6 p-6">
                        {currentNavLinks.map(link => (
                            <NavItem key={link.key} to={link.to} text={link.text} icon={link.icon} />
                        ))}
                         {!isLoggedIn && (
                             <Button asChild size="md"><Link to="/account" onClick={closeAllMenus}>تسجيل الدخول</Link></Button>
                         )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;