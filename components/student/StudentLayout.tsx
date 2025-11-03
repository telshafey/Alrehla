import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { LogOut, LayoutDashboard, GalleryVertical } from 'lucide-react';
import { useStudentDashboardData } from '../../hooks/queries/user/useJourneyDataQuery';
import Image from '../ui/Image';

const StudentLayout: React.FC = () => {
    const { currentChildProfile, signOut } = useAuth();
    const navigate = useNavigate();
    const { data, isLoading } = useStudentDashboardData();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <Image 
                                src={currentChildProfile?.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                                alt={currentChildProfile?.name || 'Student'} 
                                className="w-12 h-12 rounded-full border-2 border-blue-200"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">أهلاً بك، {currentChildProfile?.name}</h1>
                                {isLoading ? (
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
                                ) : data?.parentName ? (
                                    <p className="text-sm text-gray-500">تحت إشراف: {data.parentName}</p>
                                ) : (
                                    <p className="text-sm text-gray-500">لوحة تحكم الطالب</p>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </header>
            
            <div className="bg-white border-b sticky top-20 z-9">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 rtl:space-x-reverse">
                    <NavLink 
                        to="/student/dashboard" 
                        end 
                        className={({ isActive }) => `whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <LayoutDashboard size={16} /> لوحة التحكم
                    </NavLink>
                    <NavLink 
                        to="/student/portfolio" 
                        className={({ isActive }) => `whitespace-nowrap flex items-center gap-2 py-3 px-1 border-b-2 font-semibold text-sm ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <GalleryVertical size={16} /> معرض أعمالي
                    </NavLink>
                </nav>
            </div>
            
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default StudentLayout;
