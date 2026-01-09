
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, LogOut, PanelRightOpen, PanelRightClose, User, Settings } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/Button';
import Image from '../ui/Image';

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
        <header className="flex-shrink-0 bg-background border-b z-30">
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
                     <Button onClick={onSidebarToggle} variant="ghost" size="icon" className="hidden md:block">
                        {isSidebarCollapsed ? <PanelRightOpen size={24} /> : <PanelRightClose size={24} />}
                    </Button>
                </div>
                
                <div className="relative" ref={menuRef}>
                    <Button onClick={() => setIsMenuOpen(prev => !prev)} variant="ghost" className="flex items-center gap-2 p-2 rounded-full">
                        <span className="font-semibold text-sm text-foreground hidden sm:block">{currentUser?.name}</span>
                        <User size={20} className="text-muted-foreground"/>
                    </Button>
                    {isMenuOpen && (
                        <Card className="absolute left-0 mt-2 w-56 origin-top-left animate-fadeIn z-50">
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
                                 <button onClick={signOut} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md">
                                    <LogOut size={16} />
                                    تسجيل الخروج
                                </button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;
