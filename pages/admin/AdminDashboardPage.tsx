import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminDashboardData } from '../../hooks/queries/admin/useAdminDashboardDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StatsSummaryWidget from '../../components/admin/dashboards/StatsSummaryWidget';
import ErrorState from '../../components/ui/ErrorState';
import RecentActivityWidget from '../../components/admin/dashboards/RecentActivityWidget';
import DashboardWidget from '../../components/admin/dashboards/DashboardWidget';
import { ShoppingBag, BookOpen, CalendarCheck, UserCog, MessageSquare, UserPlus, ShieldQuestion, ArrowLeft } from 'lucide-react';

// A new, reusable card for actionable items.
const ActionItemCard: React.FC<{ title: string; value: number; icon: React.ReactNode; to: string; state?: any; color: string; }> = ({ title, value, icon, to, state, color }) => {
    if (value === 0) return null; // Don't show card if there are no items
    
    return (
        <Link to={to} state={state} className={`p-6 bg-white rounded-2xl shadow-md border-l-4 rtl:border-l-0 rtl:border-r-4 ${color} flex items-center justify-between transition-transform transform hover:-translate-y-1 hover:shadow-lg`}>
            <div>
                <p className="text-3xl font-extrabold text-gray-800">{value}</p>
                <p className="text-sm font-semibold text-gray-600 mt-1">{title}</p>
            </div>
            <div className="text-gray-400">
                <ArrowLeft size={24} />
            </div>
        </Link>
    );
};


const AdminDashboardPage: React.FC = () => {
    const { permissions, currentUser } = useAuth();
    const { data, isLoading, error, refetch } = useAdminDashboardData();
    const navigate = useNavigate();

    const actionItems = useMemo(() => {
        if (!data) return [];
        
        const { orders = [], bookings = [], instructors = [], supportTickets = [], joinRequests = [], supportSessionRequests = [] } = data;

        return [
            {
                title: 'طلبات جديدة بانتظار المراجعة',
                value: orders.filter((o: any) => o.status === 'بانتظار المراجعة').length,
                to: '/admin/orders',
                color: 'border-pink-500',
                permission: permissions.canManageEnhaLakOrders,
            },
            {
                title: 'حجوزات بانتظار تأكيد الدفع',
                value: bookings.filter((b: any) => b.status === 'بانتظار الدفع').length,
                to: '/admin/creative-writing',
                state: { statusFilter: 'بانتظار الدفع' },
                color: 'border-purple-500',
                permission: permissions.canManageCreativeWritingBookings,
            },
            {
                title: 'طلبات تعديل جداول المدربين',
                value: instructors.filter((i: any) => i.schedule_status === 'pending').length,
                to: '/admin/instructors',
                color: 'border-yellow-500',
                permission: permissions.canManageInstructorUpdates,
            },
             {
                title: 'طلبات تحديث الملفات الشخصية',
                value: instructors.filter((i: any) => i.profile_update_status === 'pending').length,
                to: '/admin/instructors',
                color: 'border-orange-500',
                permission: permissions.canManageInstructorUpdates,
            },
            {
                title: 'رسائل دعم جديدة',
                value: supportTickets.filter((t: any) => t.status === 'جديدة').length,
                to: '/admin/support',
                color: 'border-cyan-500',
                permission: permissions.canManageSupportTickets,
            },
            {
                title: 'طلبات انضمام جديدة',
                value: joinRequests.filter((r: any) => r.status === 'جديد').length,
                to: '/admin/join-requests',
                color: 'border-indigo-500',
                permission: permissions.canManageJoinRequests,
            },
            {
                title: 'طلبات دعم من المدربين',
                value: supportSessionRequests.filter((r: any) => r.status === 'pending').length,
                to: '/admin/support-requests',
                color: 'border-red-500',
                permission: permissions.canManageSupportRequests,
            },
        ].filter(item => item.permission && item.value > 0); // Only show permitted and non-zero items

    }, [data, permissions]);


    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    }

    const canViewAnything = permissions.canViewDashboard;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {currentUser?.name}</h1>
                <p className="text-lg text-gray-600 mt-1">هنا ملخص سريع لنشاط المنصة.</p>
            </div>
            
            {!canViewAnything ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-xl font-bold">لا توجد صلاحيات لعرض لوحة التحكم.</h2>
                    <p className="text-gray-600 mt-2">يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.</p>
                </div>
            ) : (
                <>
                    {permissions.canViewGlobalStats && <StatsSummaryWidget data={data} />}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Main Column: Action Center */}
                        <div className="lg:col-span-2">
                             <DashboardWidget title="مهام تحتاج إلى انتباهك" icon={<ShieldQuestion className="text-red-500"/>}>
                                {actionItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {actionItems.map(item => <ActionItemCard key={item.title} {...item} />)}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-10">لا توجد مهام عاجلة في الوقت الحالي. عمل رائع!</p>
                                )}
                            </DashboardWidget>
                        </div>
                        
                        {/* Side Column: Recent Activity */}
                        <div className="lg:col-span-1">
                            <RecentActivityWidget data={data} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboardPage;