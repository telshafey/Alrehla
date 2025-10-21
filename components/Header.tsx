import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { siteBranding, loading: brandingLoading } = useProduct();
    const { isLoggedIn } = useAuth();
    const location = useLocation();

    const getCurrentSection = (pathname: string) => {
        if (pathname === '/') {
            return 'portal';
        }
        if (pathname.startsWith('/creative-writing') || pathname.startsWith('/instructor') || pathname.startsWith('/session')) {
            return 'creative-writing';
        }
        if (pathname.startsWith('/enha-lak')) {
            return 'enha-lak';
        }
        return 'portal'; // Default for shared pages like /about, /blog
    };

    const currentSection = getCurrentSection(location.pathname);

    const { logoUrl, logoAlt } = useMemo(() => {
        if (brandingLoading || !siteBranding) {
            return { logoUrl: '', logoAlt: 'شعار منصة الرحلة' };
        }
        if (currentSection === 'creative-writing') {
            return {
                logoUrl: siteBranding.creativeWritingLogoUrl,
                logoAlt: 'شعار برنامج بداية الرحلة',
            };
        }
        // For 'portal' and 'enha-lak'
        return {
            logoUrl: siteBranding.logoUrl,
            logoAlt: 'شعار منصة إنها لك',
        };
    }, [currentSection, siteBranding, brandingLoading]);

    const navLinks = useMemo(() => {
        if (currentSection === 'creative-writing') {
            return [
                { path: "/creative-writing", label: "رئيسية البرنامج" },
                { path: "/creative-writing/about", label: "عن البرنامج" },
                { path: "/creative-writing/curriculum", label: "المنهج" },
                { path: "/creative-writing/instructors", label: "المدربون" },
                { path: "/creative-writing/booking", label: "الباقات والحجز" },
            ];
        }
        if (currentSection === 'enha-lak') {
            return [
                { path: "/enha-lak", label: "عن المشروع" },
                { path: "/enha-lak/store", label: 'المتجر' },
                { path: "/enha-lak/subscription", label: "الاشتراك الشهري" },
            ];
        }
        // For Portal
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
                <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                        isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link to="/">
                            {brandingLoading || !siteBranding ? (
                                <div className="h-12 w-24 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <img className="h-12 w-auto" src={logoUrl || ''} alt={logoAlt || 'شعار المنصة'} />
                            )}
                        </Link>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-2 rtl:md:space-x-reverse">
                       <NavLinksComponent className="flex items-center space-x-2 rtl:space-x-reverse"/>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                        <Link to="/account" className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                           <User size={16} />
                           <span>{isLoggedIn ? 'حسابي' : 'تسجيل الدخول'}</span>
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLinksComponent className="flex flex-col space-y-1"/>
                        <Link
                            to="/account"
                            onClick={() => setIsMenuOpen(false)}
                            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700"
                        >
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