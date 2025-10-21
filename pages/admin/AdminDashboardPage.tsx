import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import GlobalDashboard from '../../components/admin/dashboards/GlobalDashboard.tsx';
import EnhaLakDashboard from '../../components/admin/dashboards/EnhaLakDashboard.tsx';
import CreativeWritingDashboard from '../../components/admin/dashboards/CreativeWritingDashboard.tsx';
import ContentDashboard from '../../components/admin/dashboards/ContentDashboard.tsx';
import SupportDashboard from '../../components/admin/dashboards/SupportDashboard.tsx';

const AdminDashboardPage: React.FC = () => {
  const { permissions, loading: authLoading } = useAuth();
  
  // Although the contexts load their own data, we wait for auth to ensure permissions are set.
  if (authLoading) return <PageLoader text="جاري تحميل بيانات لوحة التحكم..." />;

  // A check to ensure at least one dashboard can be viewed, otherwise show a message.
  const canViewAnyDashboard = 
      permissions.canViewGlobalStats || 
      permissions.canViewEnhaLakStats || 
      permissions.canViewCreativeWritingStats || 
      permissions.canViewContentStats || 
      permissions.canViewSupportStats;

  return (
    <div className="animate-fadeIn space-y-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة التحكم</h1>
      
      {canViewAnyDashboard ? (
        <div className="space-y-8">
            {permissions.canViewGlobalStats && <GlobalDashboard />}
            {permissions.canViewEnhaLakStats && <EnhaLakDashboard />}
            {permissions.canViewCreativeWritingStats && <CreativeWritingDashboard />}
            {permissions.canViewContentStats && <ContentDashboard />}
            {permissions.canViewSupportStats && <SupportDashboard />}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-700">مرحباً بك!</h2>
            <p className="text-gray-500 mt-2">لا توجد إحصائيات متاحة للعرض بناءً على دورك الحالي.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;