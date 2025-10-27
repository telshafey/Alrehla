import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, ShoppingBag, Heart, LogOut, ShoppingCart, Bell } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useUserNotifications } from '../hooks/userQueries';
import { formatDate } from '../utils/helpers';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const { siteBranding, loading: brandingLoading } = useProduct();
    const { isLoggedIn, hasAdminAccess, signOut } = useAuth();
    const { itemCount } = useCart();
    const location = useLocation();
    const accountMenuRef = useRef<HTMLDivElement>(null);
    const notificationMenuRef = useRef<HTMLDivElement>(null);

    const { data: notifications, isLoading: notificationsLoading } = useUserNotifications();
    const hasUnreadNotifications = useMemo(() => notifications?.some((n: any) => !n.read), [notifications]);
    const recentNotifications = useMemo(() => notifications?.slice(0, 5) || [], [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
                setIsNotificationMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsAccountMenuOpen(false);
        setIsNotificationMenuOpen(false);
    }, [location.pathname]);

    const getCurrentSection = (pathname: string) => {
        if (pathname === '/') return 'portal';
        if (pathname.startsWith('/creative-writing') || pathname.startsWith('/instructor') || pathname.startsWith('/session')) return 'creative-writing';
        if (pathname.startsWith('/enha-lak')) return 'enha-lak';
        return 'portal';
    };

    const currentSection = getCurrentSection(location.pathname);

    const { logoUrl, logoAlt } = useMemo(() => {
        if (brandingLoading || !siteBranding) return { logoUrl: '', logoAlt: 'شعار منصة الرحلة' };
        if (currentSection === 'creative-writing') return { logoUrl: siteBranding.creativeWritingLogoUrl, logoAlt: 'شعار برنامج بداية الرحلة' };
        return { logoUrl: siteBranding.logoUrl, logoAlt: 'شعار منصة إنها لك' };
    }, [currentSection, siteBranding, brandingLoading]);

    const navLinks = useMemo(() => {
        if (currentSection === 'creative-writing') return [
            { path: "/creative-writing", label: "رئيسية البرنامج" },
            { path: "/creative-writing/about", label: "عن البرنامج" },
            { path: "/creative-writing/curriculum", label: "المنهج" },
            { path: "/creative-writing/instructors", label: "المدربون" },
            { path: "/creative-writing/booking", label: "الباقات والحجز" },
        ];
        if (currentSection === 'enha-lak') return [
            { path: "/enha-lak", label: "عن المشروع" },
            { path: "/enha-lak/store", label: 'المتجر' },
            { path: "/enha-lak/subscription", label: "الاشتراك الشهري" },
        ];
        return [
            { path: "/enha-lak", label: 'قصص "إنها لك"' },
            { path: "/creative-writing", label: "برنامج 'بداية الرحلة'" },
            { path: "/about", label: "عنا" },
            { path: "/blog", label: "المدونة" },
        ];
    }, [currentSection]);

    const NavLinksComponent: React.FC<{className?: string}> = ({ className }) => (
         <nav className={className}>
            {navLinks.map(link => (
                <NavLink key={link.path} to={link.path} className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
    
    const NotificationMenu = () => (
        <div className="absolute left-0 mt-2 w-80 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
            <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">الإشعارات</h3>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto">
                {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
                ) : recentNotifications.length > 0 ? (
                    recentNotifications.map((notif: any) => (
                        <Link key={notif.id} to="/account" state={{ defaultTab: 'notifications' }} className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <p className={`${!notif.read ? 'font-bold' : ''}`}>{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                        </Link>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">لا توجد إشعارات.</div>
                )}
            </div>
            <div className="border-t">
                <Link to="/account" state={{ defaultTab: 'notifications' }} className="block w-full text-center px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-gray-100">
                    عرض كل الإشعارات
                </Link>
            </div>
        </div>
    );

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <div className="flex-shrink-0">
                        <Link to="/">
                            {brandingLoading || !siteBranding ? <div className="h-12 w-24 bg-gray-200 rounded animate-pulse"></div> : <img className="h-12 w-auto" src={logoUrl || ''} alt={logoAlt || 'شعار المنصة'} />}
                        </Link>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-2 rtl:md:space-x-reverse">
                       <NavLinksComponent className="flex items-center space-x-2 rtl:space-x-reverse"/>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                        <Link to="/cart" className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600">
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        
                        {isLoggedIn && (
                             <div className="relative" ref={notificationMenuRef}>
                                <button onClick={() => setIsNotificationMenuOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600">
                                    <Bell size={22} />
                                    {hasUnreadNotifications && (
                                        <span className="absolute top-1 right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </button>
                                {isNotificationMenuOpen && <NotificationMenu />}
                            </div>
                        )}

                        {isLoggedIn ? (
                             <div className="relative" ref={accountMenuRef}>
                                <button onClick={() => setIsAccountMenuOpen(prev => !prev)} className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                                   <User size={16} />
                                   <span>حسابي</span>
                                </button>
                                {isAccountMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
                                        <div className="py-1">
                                            {hasAdminAccess && (
                                                <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                                                    <LayoutDashboard size={16} /> لوحة التحكم
                                                </Link>
                                            )}
                                            <Link to="/account" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <ShoppingBag size={16} /> الطلبات والحجوزات
                                            </Link>
                                             <Link to="/account" state={{ defaultTab: 'profile' }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <Heart size={16} /> الملف الشخصي
                                            </Link>
                                            <div className="border-t my-1"></div>
                                            <button onClick={signOut} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <LogOut size={16} /> تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                )}
                             </div>
                        ) : (
                            <Link to="/account" className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                               <User size={16} />
                               <span>تسجيل الدخول</span>
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <Link to="/cart" className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600">
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                        {isLoggedIn && (
                             <div className="relative" ref={notificationMenuRef}>
                                <button onClick={() => setIsNotificationMenuOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600">
                                    <Bell size={22} />
                                    {hasUnreadNotifications && (
                                        <span className="absolute top-1 right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </button>
                                {isNotificationMenuOpen && <NotificationMenu />}
                            </div>
                        )}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLinksComponent className="flex flex-col space-y-1"/>
                        <Link to={isLoggedIn && hasAdminAccess ? '/admin' : '/account'} onClick={() => setIsMenuOpen(false)} className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                            <User size={16}/>
                            <span>{isLoggedIn ? 'حسابي' : 'تسجيل الدخول'}</span>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default React.memo(Header);