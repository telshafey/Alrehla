import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Menu, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { roleNames } from '../../lib/roles.ts';

interface AdminNavbarProps {
    onMobileMenuToggle: () => void;
    isSidebarCollapsed: boolean;
    onSidebarToggle: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMobileMenuToggle, isSidebarCollapsed, onSidebarToggle }) => {
    const { currentUser } = useAuth();

    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm shadow-sm z-20 flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
                 {/* Mobile Menu Button */}
                <button onClick={onMobileMenuToggle} className="md:hidden text-gray-700">
                    <Menu size={24} />
                </button>
                 {/* Desktop Sidebar Toggle Button */}
                 <button 
                  onClick={onSidebarToggle}
                  className="hidden md:flex items-center justify-center w-8 h-8 bg-gray-100 border-2 border-gray-200 rounded-full text-gray-600 hover:bg-gray-200"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isSidebarCollapsed ? <ChevronLeft size={18}/> : <ChevronRight size={18} />}
                </button>
            </div>
            {currentUser && (
                 <div className="flex items-center gap-3">
                     <div className="text-right hidden sm:block">
                         <p className="font-bold text-gray-800">{currentUser.name}</p>
                         <p className="text-xs text-gray-500">{roleNames[currentUser.role]}</p>
                     </div>
                     <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full font-bold">
                        <User size={20} />
                     </div>
                </div>
            )}
        </header>
    );
};

export default AdminNavbar;
