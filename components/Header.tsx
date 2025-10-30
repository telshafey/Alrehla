import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProduct } from '../contexts/ProductContext';
import { useUserNotifications } from '../hooks/queries/user/useUserDataQuery';
import { useNotificationMutations } from '../hooks/mutations/useNotificationMutations';
import { formatDate } from '../utils/helpers';
import { 
    ShoppingCart, User, Menu, X, ChevronDown, Bell, LogOut, Trash2, Info, Calendar, 
    BookOpen, ShoppingBag, Box, Map, Users as UsersIcon, Home 
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const menusRef = useRef<{ [key: string]: HTMLElement | null }>({});

    const unreadCount = useMemo(() => notifications.filter((n: any) => !n.read).length, [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // FIX: Corrected type error on 'contains' and fixed logic for detecting outside clicks.
            // The original logic using `every` would incorrectly stop if a menu was not rendered (ref is null).
            // This `some`-based logic correctly checks if the click occurred inside *any* of the rendered menu elements.
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

    const navLinks = [
        { key: 'home', to: '/', text: 'الرئيسية' },
        { 
            key: 'enha-lak',
            to: '/enha-lak', 
            text: 'إنها لك',
            megaMenu: {
                sections: [
                    {
                        title: 'استكشف المشروع',
                        links: [
                            { to: '/enha-lak', text: 'عن المشروع', icon: <Info size={18} /> },
                            { to: '/enha-lak/store', text: 'متجر القصص', icon: <ShoppingBag size={18} /> },
                        ]
                    },
                    {
                        title: 'الاشتراكات',
                        links: [
                             { to: '/enha-lak/subscription', text: 'صندوق الرحلة الشهري', icon: <Box size={18} /> },
                        ]
                    }
                ],
                cta: { to: '/enha-lak/store', text: 'اطلب قصتك الآن', description: 'اجعل طفلك بطل حكايته الخاصة.' }
            }
        },
        { 
            key: 'creative-writing',
            to: '/creative-writing', 
            text: 'بداية الرحلة',
            megaMenu: {
                sections: [
                    {
                        title: 'عن البرنامج',
                        links: [
                            { to: '/creative-writing', text: 'نظرة عامة', icon: <Home size={18} /> },
                            { to: '/creative-writing/about', text: 'فلسفة البرنامج', icon: <BookOpen size={18} /> },
                            { to: '/creative-writing/curriculum', text: 'خريطة الرحلة', icon: <Map size={18} /> },
                            { to: '/creative-writing/instructors', text: 'المدربون', icon: <UsersIcon size={18} /> },
                        ]
                    }
                ],
                 cta: { to: '/creative-writing/booking', text: 'احجز جلستك', description: 'ابدأ رحلة الإبداع مع مدرب متخصص.' }
            }
        },
        { key: 'about', to: '/about', text: 'عنا' },
        { key: 'blog', to: '/blog', text: 'المدونة' },
        { key: 'support', to: '/support', text: 'الدعم' },
    ];
    
    const MegaMenuNavItem: React.FC<{ link: any }> = ({ link }) => {
        const isOpen = openMenu === link.key;
        return (
            <div ref={el => (menusRef.current[link.key] = el)} className="relative">
                <button
                    onClick={() => toggleMenu(link.key)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="flex items-center gap-1 font-semibold text-gray-600 hover:text-blue-500 transition-colors"
                >
                    {link.text}
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-4 w-[480px] bg-white rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 animate-fadeIn z-50 overflow-hidden">
                       <div className="flex">
                            <div className="flex-grow p-6 grid grid-cols-2 gap-6">
                                {link.megaMenu.sections.map((section: any) => (
                                    <div key={section.title}>
                                        <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-3">{section.title}</h3>
                                        <ul className="space-y-2">
                                            {section.links.map((subLink: any) => (
                                                <li key={subLink.to}>
                                                    <NavLink
                                                        to={subLink.to}
                                                        onClick={closeAllMenus}
                                                        className={({ isActive }) => `flex items-center gap-3 p-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100 ${isActive ? 'font-bold text-blue-600 bg-blue-50' : ''}`}
                                                    >
                                                        {subLink.icon}
                                                        <span>{subLink.text}</span>
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="w-48 bg-gray-50 p-6 flex flex-col justify-center items-center text-center">
                                 <h4 className="font-bold text-blue-600">{link.megaMenu.cta.text}</h4>
                                 <p className="text-xs text-gray-500 mt-1 mb-4">{link.megaMenu.cta.description}</p>
                                 <Button asChild size="sm" onClick={closeAllMenus}>
                                    <Link to={link.megaMenu.cta.to}>ابدأ الآن</Link>
                                 </Button>
                            </div>
                       </div>
                    </div>
                )}
            </div>
        );
    };

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
                        {navLinks.map(link => link.megaMenu ? <MegaMenuNavItem key={link.key} link={link} /> : <NavItem key={link.key} to={link.to} text={link.text} />)}
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
                        {navLinks.map(link => (
                            <div key={link.to} className="w-full text-center">
                                <NavItem to={link.to} text={link.text} />
                                {link.megaMenu && (
                                    <div className="mt-2 flex flex-col items-center gap-2 border-r-2 border-blue-100 pr-4">
                                        {link.megaMenu.sections.flatMap(s => s.links).map(subLink => (
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