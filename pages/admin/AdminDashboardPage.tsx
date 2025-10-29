import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminDashboardData } from '../../hooks/queries/admin/useAdminDashboardDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StatsSummaryWidget from '../../components/admin/dashboards/StatsSummaryWidget';
import EnhaLakDashboard from '../../components/admin/dashboards/EnhaLakDashboard';
import CreativeWritingDashboard from '../../components/admin/dashboards/CreativeWritingDashboard';
import ContentDashboard from '../../components/admin/dashboards/ContentDashboard';
import SupportDashboard from '../../components/admin/dashboards/SupportDashboard';
import ErrorState from '../../components/ui/ErrorState';
import RecentActivityWidget from '../../components/admin/dashboards/RecentActivityWidget';

const AdminDashboardPage: React.FC = () => {
    const { permissions, currentUser } = useAuth();
    const { data, isLoading, error, refetch } = useAdminDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    }

    const canViewAnyStats = permissions.canViewGlobalStats || permissions.canViewEnhaLakStats || permissions.canViewCreativeWritingStats || permissions.canViewContentStats || permissions.canViewSupportStats;
    
    const gridWidgets = [
        {
            permission: permissions.canViewEnhaLakStats,
            component: <EnhaLakDashboard data={data} />,
        },
        {
            permission: permissions.canViewCreativeWritingStats,
            component: <CreativeWritingDashboard data={data} />,
        },
        {
            permission: permissions.canViewContentStats,
            component: <ContentDashboard data={data} />,
        },
        {
            permission: permissions.canViewSupportStats,
            component: <SupportDashboard data={data} />,
        },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {currentUser?.name}</h1>
                <p className="text-lg text-gray-600 mt-1">هنا ملخص سريع لنشاط المنصة.</p>
            </div>
            
            {!canViewAnyStats ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-xl font-bold">لا توجد صلاحيات لعرض الإحصائيات.</h2>
                    <p className="text-gray-600 mt-2">يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.</p>
                </div>
            ) : (
                <>
                    {permissions.canViewGlobalStats && <StatsSummaryWidget data={data} />}

                    <RecentActivityWidget data={data} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {gridWidgets.filter(widget => widget.permission).map((widget, index) => (
                            <React.Fragment key={index}>
                                {widget.component}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboardPage;