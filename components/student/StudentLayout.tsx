import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const StudentLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
    const { currentChildProfile, signOut } = useAuth();
    const navigate = useNavigate();

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
                            <img 
                                src={currentChildProfile?.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} 
                                alt={currentChildProfile?.name || 'Student'} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">أهلاً بك، {currentChildProfile?.name}</h1>
                                <p className="text-sm text-gray-500">لوحة تحكم الطالب</p>
                            </div>
                        </div>
                        <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}

export default StudentLayout;