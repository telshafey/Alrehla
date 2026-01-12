
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, LogOut, PanelRightOpen, PanelRightClose, User, Settings } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/Button';
import Image from '../ui/Image';
import AdminBreadcrumbs from './AdminBreadcrumbs';

interface AdminNavbarProps {
    onMobileMenuToggle: () => void;
    isSidebarCollapsed: boolean;
    onSidebarToggle: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMobileMenuToggle, isSidebarCollapsed, onSidebarToggle }) => {
    const { currentUser, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex-shrink-0 bg-background border-b z-30 sticky top-0">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <Button onClick={onMobileMenuToggle} variant="ghost" size="icon" className="md:hidden">
                        <Menu size={24} />
                    </Button>
                    
                    {/* Logo for Mobile - Visible only on small screens */}
                     <div className="h-8 w-8 relative md:hidden">
                        <Image 
                            src="https://i.ibb.co/C0bSJJT/favicon.png" 
                            alt="شعار" 
                            className="h-full w-full !bg-transparent" 
                            objectFit="contain"
                        />
                    </div>

                    {/* Desktop Sidebar Toggle */}
                     <Button onClick={onSidebarToggle} variant="ghost" size="icon" className="hidden md:block text-muted-foreground hover:text-foreground">
                        {isSidebarCollapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
                    </Button>
                    
                    {/* Breadcrumbs - Desktop Only */}
                    <div className="hidden md:block mr-2 border-r pr-4 h-6 flex items-center">
                        <AdminBreadcrumbs />
                    </div>
                </div>
                
                <div className="relative" ref={menuRef}>
                    <Button onClick={() => setIsMenuOpen(prev => !prev)} variant="ghost" className="flex items-center gap-2 p-2 rounded-full hover:bg-muted">
                        <span className="font-semibold text-sm text-foreground hidden sm:block">{currentUser?.name}</span>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                             <User size={18} />
                        </div>
                    </Button>
                    {isMenuOpen && (
                        <Card className="absolute left-0 mt-2 w-56 origin-top-left animate-fadeIn z-50 shadow-xl border-t-2 border-t-primary">
                            <CardContent className="p-1">
                                <Link to="/admin/my-profile" onClick={() => setIsMenuOpen(false)} className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent flex items-center gap-2">
                                    <Settings size={16} />
                                    إعدادات الحساب
                                </Link>
                                <Link to="/" className="block w-full text-right px-3 py-2 text-sm rounded-md hover:bg-accent flex items-center gap-2">
                                    <PanelRightOpen size={16} />
                                    العودة للموقع
                                </Link>
                            </CardContent>
                             <CardFooter className="p-1 border-t">
                                 <button onClick={signOut} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                    <LogOut size={16} />
                                    تسجيل الخروج
                                </button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
            
            {/* Breadcrumbs - Mobile Only (Below Header) */}
            <div className="md:hidden px-6 py-2 border-b bg-muted/20 overflow-x-auto whitespace-nowrap">
                 <AdminBreadcrumbs />
            </div>
        </header>
    );
};

export default AdminNavbar;
