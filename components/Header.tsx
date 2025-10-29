import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProduct } from '../contexts/ProductContext';
import { useUserNotifications } from '../hooks/queries/user/useUserDataQuery';
import { useNotificationMutations } from '../hooks/mutations/useNotificationMutations';
import { formatDate } from '../utils/helpers';
import { ShoppingCart, User, Menu, X, Shield, ChevronDown, Bell, LogOut, Trash2, Info, Calendar } from 'lucide-react';
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
    const { data: notifications = [], isLoading: notificationsLoading } = useUserNotifications();
    const { markNotificationAsRead, deleteNotification } = useNotificationMutations();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const unreadCount = useMemo(() => notifications.filter((n: any) => !n.read).length, [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeAllMenus = () => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation();
        e.preventDefault();
        deleteNotification.mutate({ notificationId });
    };

    const navLinks = [
        { to: '/', text: 'الرئيسية' },
        { 
            to: '/enha-lak', 
            text: 'إنها لك',
            subLinks: [
                { to: '/enha-lak', text: 'عن المشروع' },
                { to: '/enha-lak/store', text: 'متجر القصص' },
                { to: '/enha-lak/subscription', text: 'صندوق الرحلة الشهري' },
                { to: '/enha-lak/store', text: 'اطلب قصتك الآن', isCta: true },
            ]
        },
        { 
            to: '/creative-writing', 
            text: 'بداية الرحلة',
            subLinks: [
                { to: '/creative-writing/about', text: 'عن البرنامج' },
                { to: '/creative-writing/curriculum', text: 'خريطة الرحلة' },
                { to: '/creative-writing/instructors', text: 'المدربون' },
                { to: '/creative-writing/booking', text: 'احجز جلستك', isCta: true },
            ]
        },
        { to: '/about', text: 'عنا' },
        { to: '/blog', text: 'المدونة' },
        { to: '/support', text: 'الدعم' },
    ];

    const NavItem: React.FC<{ to: string, text: string }> = ({ to, text }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `font-semibold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`
            }
            onClick={closeAllMenus}
        >
            {text}
        </NavLink>
    );
    
    const DropdownNavItem: React.FC<{ to: string, text: string, subLinks: any[] }> = ({ to, text, subLinks }) => {
        const [isOpen, setIsOpen] = useState(false);
        const timeoutRef = useRef<number | null>(null);

        const handleMouseEnter = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
        };
        const handleMouseLeave = () => {
            timeoutRef.current = window.setTimeout(() => setIsOpen(false), 200);
        };
        
        return (
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                 <NavLink
                    to={to}
                    className={({ isActive, isPending }) =>
                        `flex items-center gap-1 font-semibold transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`
                    }
                >
                    {text}
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </NavLink>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fadeIn z-50">
                        <div className="py-1">
                            {subLinks.map(subLink => (
                                <NavLink
                                    key={subLink.to}
                                    to={subLink.to}
                                    onClick={() => {setIsOpen(false); closeAllMenus();}}
                                    className={({ isActive }) => `block px-4 py-2 text-sm ${
                                        subLink.isCta 
                                        ? 'font-bold text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                        : isActive 
                                        ? 'text-blue-600' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {subLink.text}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40" dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={siteBranding?.logoUrl || "https://i.ibb.co/C0bSJJT/favicon.png"} alt="شعار منصة الرحلة" className="h-12 w-auto" />
                        <span className="text-xl font-bold text-gray-800 hidden sm:block">منصة الرحلة</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => link.subLinks ? <DropdownNavItem key={link.to} to={link.to} text={link.text} subLinks={link.subLinks} /> : <NavItem key={link.to} to={link.to} text={link.text} />)}
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
                                <div ref={notificationsRef} className="relative">
                                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 text-gray-600 hover:text-blue-600">
                                        <Bell />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {isNotificationsOpen && (
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
                                <div ref={userMenuRef} className="relative">
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 text-gray-600 hover:text-blue-600">
                                        <User />
                                    </button>
                                    {isUserMenuOpen && (
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
                        {navLinks.map(link => (
                            <div key={link.to} className="w-full text-center">
                                <NavItem to={link.to} text={link.text} />
                                {link.subLinks && (
                                    <div className="mt-2 flex flex-col items-center gap-2 border-r-2 border-blue-100 pr-4">
                                        {link.subLinks.map(subLink => (
                                            <NavLink
                                                key={subLink.to}
                                                to={subLink.to}
                                                className={({ isActive }) => `text-sm ${isActive ? 'font-bold text-blue-500' : 'text-gray-500'}`}
                                                onClick={closeAllMenus}
                                            >
                                                {subLink.text}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
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