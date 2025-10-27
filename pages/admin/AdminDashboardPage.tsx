import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../../components/ui/PageLoader';
import GlobalDashboard from '../../components/admin/dashboards/GlobalDashboard';
import EnhaLakDashboard from '../../components/admin/dashboards/EnhaLakDashboard';
import CreativeWritingDashboard from '../../components/admin/dashboards/CreativeWritingDashboard';
import ContentDashboard from '../../components/admin/dashboards/ContentDashboard';
import SupportDashboard from '../../components/admin/dashboards/SupportDashboard';
import { Globe, ShoppingBag, BookOpen, FileText, MessageSquare } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const { currentUser, permissions, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('global');

    const dashboardTabs = useMemo(() => {
        const tabs = [];
        if (permissions.canViewGlobalStats) tabs.push({ key: 'global', title: 'نظرة عامة', icon: <Globe size={18} />, component: <GlobalDashboard /> });
        if (permissions.canViewEnhaLakStats) tabs.push({ key: 'enhalak', title: 'إنها لك', icon: <ShoppingBag size={18} />, component: <EnhaLakDashboard /> });
        if (permissions.canViewCreativeWritingStats) tabs.push({ key: 'creative', title: 'بداية الرحلة', icon: <BookOpen size={18} />, component: <CreativeWritingDashboard /> });
        if (permissions.canViewContentStats) tabs.push({ key: 'content', title: 'المحتوى', icon: <FileText size={18} />, component: <ContentDashboard /> });
        if (permissions.canViewSupportStats) tabs.push({ key: 'support', title: 'الدعم', icon: <MessageSquare size={18} />, component: <SupportDashboard /> });
        return tabs;
    }, [permissions]);

    if (authLoading || !currentUser) {
        return <PageLoader text="جاري تحميل بيانات لوحة التحكم..." />;
    }

    // Super Admins and General Supervisors get a tabbed interface
    if (currentUser.role === 'super_admin' || currentUser.role === 'general_supervisor') {
        const activeComponent = dashboardTabs.find(t => t.key === activeTab)?.component;
        return (
            <div className="animate-fadeIn space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة التحكم</h1>
                    <p className="text-lg text-gray-500 mt-1">مرحباً بعودتك، {currentUser.name}!</p>
                </div>

                {/* Global Stats Summary is always visible for these roles */}
                <div className="bg-white p-6 rounded-2xl shadow-md">
                    <GlobalDashboard />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 pt-4">تفاصيل الأقسام</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 rtl:space-x-reverse overflow-x-auto">
                        {dashboardTabs.filter(t => t.key !== 'global').map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.title}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-8">
                    {activeTab !== 'global' && activeComponent}
                </div>
            </div>
        );
    }

    // Other roles get a single, focused dashboard
    let focusedDashboard: React.ReactNode | null = null;
    if (currentUser.role === 'enha_lak_supervisor') {
        focusedDashboard = <EnhaLakDashboard />;
    } else if (currentUser.role === 'creative_writing_supervisor') {
        focusedDashboard = <CreativeWritingDashboard />;
    } else if (currentUser.role === 'content_editor') {
        focusedDashboard = <ContentDashboard />;
    } else if (currentUser.role === 'support_agent') {
        focusedDashboard = <SupportDashboard />;
    }

    if (focusedDashboard) {
        return (
            <div className="animate-fadeIn space-y-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة التحكم</h1>
              {focusedDashboard}
            </div>
        );
    }
    
    // Fallback for roles with no specific dashboard view
    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة التحكم</h1>
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700">مرحباً بك، {currentUser.name}!</h2>
                <p className="text-gray-500 mt-2">لا توجد إحصائيات متاحة للعرض بناءً على دورك الحالي.</p>
            </div>
        </div>
    );
};

export default AdminDashboardPage;