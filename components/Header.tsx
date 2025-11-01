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
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

// --- Sub-components for Header ---

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'order': return <ShoppingCart className="w-5 h-5 text-primary" />;
        case 'booking': return <Calendar className="w-5 h-5 text-purple-500" />;
        default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
};

const NotificationDropdown: React.FC<{
    notifications: any[];
    onClose: () => void;
    onMarkAsRead: (id: number) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
}> = ({ notifications, onClose, onMarkAsRead, onDelete }) => (
    <Card className="absolute top-full left-0 mt-2 w-80 animate-fadeIn z-50">
        <CardHeader className="p-3 border-b">
            <h3 className="font-semibold text-sm">الإشعارات</h3>
        </CardHeader>
        <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? notifications.map((notif: any) => (
                <Link
                    key={notif.id}
                    to={notif.link}
                    state={notif.link === '/account' ? { defaultTab: 'myLibrary' } : undefined}
                    onClick={() => { onClose(); onMarkAsRead(notif.id); }}
                    className={`flex items-start gap-3 p-3 text-sm hover:bg-accent ${!notif.read ? 'bg-blue-50' : ''}`}
                >
                    <NotificationIcon type={notif.type} />
                    <div className="flex-grow">
                        <p className="text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => onDelete(e, notif.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                    </Button>
                </Link>
            )) : (
                <p className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات.</p>
            )}
        </CardContent>
        <CardFooter className="p-2 border-t">
            <Button asChild variant="link" size="sm" className="w-full">
                <Link to="/account" state={{ defaultTab: 'notifications' }} onClick={onClose}>
                    عرض كل الإشعارات
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

const UserDropdown: React.FC<{
    currentUser: any;
    hasAdminAccess: boolean;
    onSignOut: () => void;
    onClose: () => void;
}> = ({ currentUser, hasAdminAccess, onSignOut, onClose }) => (
     <Card className="absolute top-full left-0 mt-2 w-56 animate-fadeIn z-50">
         <CardHeader className="p-4">
            <p className="text-sm font-semibold">مرحباً، {currentUser?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
        </CardHeader>
        <CardContent className="p-1">
            <Link to="/account" onClick={onClose} className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent">حسابي</Link>
            {hasAdminAccess && <Link to="/admin" onClick={onClose} className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent">لوحة التحكم</Link>}
        </CardContent>
        <CardFooter className="p-1 border-t">
                <button onClick={onClose} className="w-full">
                    <span onClick={onSignOut} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                        <LogOut size={16} /> تسجيل الخروج
                    </span>
                </button>
        </CardFooter>
    </Card>
);

const MobileMenu: React.FC<{
    navLinks: { key: string; to: string; text: string; icon?: React.ReactNode }[];
    isLoggedIn: boolean;
    onClose: () => void;
    NavItemComponent: React.FC<{ to: string; text: string; icon?: React.ReactNode }>;
}> = ({ navLinks, isLoggedIn, onClose, NavItemComponent }) => (
    <div className="lg:hidden bg-background border-t">
        <nav className="flex flex-col items-center gap-6 p-6">
            {navLinks.map(link => (
                <NavItemComponent key={link.key} to={link.to} text={link.text} icon={link.icon} />
            ))}
            {!isLoggedIn && (
                <Button asChild size="md"><Link to="/account" onClick={onClose}>تسجيل الدخول</Link></Button>
            )}
        </nav>
    </div>
);


// --- Main Header Component ---

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
            { key: 'join-us', to: '/join-us', text: 'انضم إلينا' },
            { key: 'support', to: '/support', text: 'الدعم' },
        ];
        
        const enhaLakNavLinks = [
            { key: 'back', to: '/', text: 'الرئيسية', icon: <ArrowLeft size={16} /> },
            { key: 'enha-lak-home', to: '/enha-lak', text: 'عن المشروع' },
            { key: 'enha-lak-store', to: '/enha-lak/store', text: 'متجر القصص' },
            { key: 'enha-lak-subscription', to: '/enha-lak/subscription', text: 'صندوق الرحلة' },
        ];
        
        const creativeWritingNavLinks = [
            { key: 'back', to: '/', text: 'الرئيسية', icon: <ArrowLeft size={16} /> },
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
                `flex items-center gap-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`
            }
            onClick={closeAllMenus}
        >
            {icon}
            <span>{text}</span>
        </NavLink>
    );

    return (
        <header className={`bg-background/80 backdrop-blur-md border-b sticky top-0 z-40 ${headerStyle}`} dir="rtl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3" onClick={closeAllMenus}>
                        <img src={siteBranding?.logoUrl || "https://i.ibb.co/C0bSJJT/favicon.png"} alt="شعار منصة الرحلة" className="h-10 w-auto" />
                         <div className="hidden sm:flex items-baseline gap-2">
                             <span className="text-lg font-bold text-foreground">منصة الرحلة</span>
                             {sectionTitle && <span className="text-xs font-semibold text-muted-foreground">| {sectionTitle}</span>}
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        {currentNavLinks.map(link => <NavItem key={link.key} to={link.to} text={link.text} icon={link.icon} />)}
                    </nav>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button asChild variant="ghost" size="icon" aria-label="Shopping Cart">
                            <Link to="/cart" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </Button>
                        
                        {isLoggedIn ? (
                            <>
                                <div ref={el => (menusRef.current['notifications'] = el)} className="relative">
                                     <Button variant="ghost" size="icon" onClick={() => toggleMenu('notifications')} aria-label="Notifications">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                    {openMenu === 'notifications' && (
                                        <NotificationDropdown 
                                            notifications={notifications}
                                            onClose={closeAllMenus}
                                            onMarkAsRead={(id) => markNotificationAsRead.mutate({ notificationId: id })}
                                            onDelete={handleDeleteNotification}
                                        />
                                    )}
                                </div>
                                
                                <div ref={el => (menusRef.current['user'] = el)} className="relative">
                                    <Button variant="ghost" size="icon" onClick={() => toggleMenu('user')} aria-label="User Menu">
                                        <User className="h-5 w-5" />
                                    </Button>
                                    {openMenu === 'user' && (
                                        <UserDropdown 
                                            currentUser={currentUser}
                                            hasAdminAccess={hasAdminAccess}
                                            onSignOut={signOut}
                                            onClose={closeAllMenus}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <Button asChild size="sm" className="hidden lg:inline-flex"><Link to="/account">تسجيل الدخول</Link></Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <MobileMenu
                    navLinks={currentNavLinks}
                    isLoggedIn={isLoggedIn}
                    onClose={closeAllMenus}
                    NavItemComponent={NavItem}
                />
            )}
        </header>
    );
};

export default Header;
