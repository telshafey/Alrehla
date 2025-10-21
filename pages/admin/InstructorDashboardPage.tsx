import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useAdminInstructors, useInstructorDashboardData } from '../../hooks/queries.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import AvailabilityManager from '../../components/admin/AvailabilityManager.tsx';
import WeeklyScheduleManager from '../../components/admin/WeeklyScheduleManager.tsx';
import StatCard from '../../components/admin/StatCard.tsx';
import { Calendar, Users, Clock, CheckCircle, Briefcase } from 'lucide-react';

const InstructorDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { data: instructors = [], isLoading: adminLoading, error: adminError } = useAdminInstructors();
    const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useInstructorDashboardData();
    const bookings = dashboardData?.instructorBookings || [];

    const isLoading = adminLoading || dashboardLoading;
    const error = adminError || dashboardError;

    const instructor = instructors.find(i => i.user_id === currentUser?.id);

    const completedSessionsThisMonth = useMemo(() => {
        return bookings.filter(b => {
            const sessionDate = new Date(b.booking_date);
            const now = new Date();
            return b.status === 'مكتمل' && sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
        }).length;
    }, [bookings]);

    const myStudents = useMemo(() => {
        const studentMap = new Map();
        bookings.forEach(booking => {
            const student = booking.child_profiles;
            if (student && !studentMap.has(student.id)) {
                studentMap.set(student.id, student);
            }
        });
        return Array.from(studentMap.values());
    }, [bookings]);
    
    if (isLoading) return <PageLoader text="جاري تحميل بياناتك..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;
    if (!instructor) return <div className="text-center text-red-500">لم يتم ربط حسابك بملف مدرب.</div>;
    
    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة تحكم المدرب</h1>
            <p className="text-lg text-gray-600 -mt-10">أهلاً بك، {instructor.name}!</p>

             <AdminSection title="إحصائيات الشهر الحالي" icon={<Briefcase />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="الجلسات المكتملة" value={completedSessionsThisMonth} icon={<CheckCircle size={28} className="text-green-500" />} color="bg-green-100" />
                    <StatCard title="الطلاب" value={myStudents.length} icon={<Users size={28} className="text-indigo-500" />} color="bg-indigo-100" />
                 </div>
            </AdminSection>

             <AdminSection title="الطلاب" icon={<Users />}>
                {myStudents.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {myStudents.map((student: any) => (
                            <div key={student.id} className="p-3 bg-gray-50 rounded-lg border text-center">
                                <img src={student.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={student.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"/>
                                <p className="font-bold text-sm">{student.name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">لا يوجد لديك طلاب بعد.</p>
                )}
            </AdminSection>
            
            <AdminSection title="إدارة المواعيد المتاحة" icon={<Calendar />}>
                <p className="text-gray-600 mb-6 -mt-4">
                    أضف أو احذف المواعيد المتاحة بشكل مباشر من التقويم.
                </p>
                <AvailabilityManager instructor={instructor} />
            </AdminSection>

             <AdminSection title="إدارة الجدول الأسبوعي" icon={<Clock />}>
                <p className="text-gray-600 mb-6 -mt-4">
                    حدد الأيام والأوقات التي تكون متاحًا فيها بشكل أسبوعي. سيتم إرسال طلبك للموافقة.
                </p>
                <WeeklyScheduleManager instructor={instructor} />
            </AdminSection>

        </div>
    );
};

export default InstructorDashboardPage;