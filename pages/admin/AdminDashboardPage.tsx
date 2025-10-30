import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminDashboardData } from '../../hooks/queries/admin/useAdminDashboardDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StatsSummaryWidget from '../../components/admin/dashboards/StatsSummaryWidget';
import ErrorState from '../../components/ui/ErrorState';
import RecentActivityWidget from '../../components/admin/dashboards/RecentActivityWidget';
import ActionCenterWidget from '../../components/admin/dashboards/ActionCenterWidget';
import QuickActionsWidget from '../../components/admin/dashboards/QuickActionsWidget';
import ContentSummaryWidget from '../../components/admin/dashboards/ContentSummaryWidget';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminDashboardPage: React.FC = () => {
    const { permissions, currentUser } = useAuth();
    const { data, isLoading, error, refetch } = useAdminDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    }

    if (!permissions.canViewDashboard) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>لا توجد صلاحيات</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">لا توجد صلاحيات لعرض لوحة التحكم. يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.</p>
                </CardContent>
            </Card>
        );
    }
    
    // Filter blog posts once
    const blogPosts = data?.blogPosts || [];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {currentUser?.name}</h1>
                <p className="text-lg text-gray-600 mt-1">هنا ملخص سريع لنشاط المنصة.</p>
            </div>
            
            {permissions.canViewGlobalStats && <StatsSummaryWidget data={data} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Column: Action Center */}
                <div className="lg:col-span-2 space-y-8">
                    <ActionCenterWidget data={data} permissions={permissions} />
                </div>
                
                {/* Side Column: Quick Actions, Content, Recent Activity */}
                <div className="lg:col-span-1 space-y-8">
                    <QuickActionsWidget permissions={permissions} />
                    {permissions.canManageBlog && <ContentSummaryWidget blogPosts={blogPosts} />}
                    <RecentActivityWidget data={data} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;