
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, LogOut, PanelRightOpen, PanelRightClose, User } from 'lucide-react';

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
        <header className="flex-shrink-0 bg-white shadow-sm z-30">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button onClick={onMobileMenuToggle} className="md:hidden text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>

                    {/* Desktop Sidebar Toggle */}
                    <button onClick={onSidebarToggle} className="hidden md:block text-gray-500 hover:text-gray-700">
                        {isSidebarCollapsed ? <PanelRightOpen size={24} /> : <PanelRightClose size={24} />}
                    </button>
                </div>
                
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
                        <span className="font-semibold text-sm text-gray-700 hidden sm:block">{currentUser?.name}</span>
                        <User size={20} className="text-gray-600"/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
                            <div className="py-1">
                                <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    العودة للموقع
                                </Link>
                                <div className="border-t my-1"></div>
                                <button onClick={signOut} className="w-full text-right flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <LogOut size={16} />
                                    تسجيل الخروج
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;