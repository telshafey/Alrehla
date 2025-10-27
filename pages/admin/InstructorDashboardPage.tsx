import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminInstructors, useInstructorDashboardData } from '../../hooks/adminQueries';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import WeeklyScheduleManager from '../../components/admin/WeeklyScheduleManager';
import BarChart from '../../components/admin/BarChart';
import InstructorStudentCard from '../../components/admin/dashboards/InstructorStudentCard';
import RequestSupportSessionModal from '../../components/admin/RequestSupportSessionModal';
import { Users, BarChart2, Clock, User } from 'lucide-react';
import InstructorProfileEditor from '../../components/admin/dashboards/InstructorProfileEditor';

const InstructorDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { data: instructors = [], isLoading: instructorsLoading, error: adminError } = useAdminInstructors();
    const { data, isLoading: dashboardLoading, error: dashboardError } = useInstructorDashboardData();
    
    const [activeTab, setActiveTab] = useState<'students' | 'stats' | 'schedule' | 'profile'>('students');
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [selectedStudentForSupport, setSelectedStudentForSupport] = useState<any | null>(null);

    const isLoading = instructorsLoading || dashboardLoading;
    const error = adminError || dashboardError;

    const instructor = instructors.find(i => i.user_id === currentUser?.id);

    const handleRequestSupport = (student: any) => {
        setSelectedStudentForSupport(student);
        setIsSupportModalOpen(true);
    };

    if (isLoading) return <PageLoader text="جاري تحميل بياناتك..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;
    if (!instructor) return <div className="text-center text-red-500">لم يتم ربط حسابك بملف مدرب.</div>;
    
    const { students = [], monthlyStats = [] } = data || {};

    const tabs = [
        { key: 'students', label: 'الطلاب', icon: <Users size={18} /> },
        { key: 'stats', label: 'الإحصائيات الشهرية', icon: <BarChart2 size={18} /> },
        { key: 'schedule', label: 'جدولي الأسبوعي', icon: <Clock size={18} /> },
        { key: 'profile', label: 'ملفي الشخصي', icon: <User size={18} /> },
    ];

    return (
        <>
            <RequestSupportSessionModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                instructorId={instructor.id}
                childId={selectedStudentForSupport?.id}
            />
            <div className="animate-fadeIn space-y-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لوحة تحكم المدرب</h1>
                    <p className="text-lg text-gray-600 mt-1">أهلاً بك، {instructor.name}!</p>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6 rtl:space-x-reverse overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`whitespace-nowrap flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="mt-8">
                    {activeTab === 'students' && (
                        <AdminSection title="قائمة طلابي" icon={<Users />}>
                            {students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {students.map(student => (
                                        <InstructorStudentCard 
                                            key={student.id} 
                                            student={student} 
                                            onRequestSupport={() => handleRequestSupport(student)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-8 text-gray-500">لا يوجد لديك طلاب بعد.</p>
                            )}
                        </AdminSection>
                    )}

                    {activeTab === 'stats' && (
                        <AdminSection title="الجلسات المكتملة هذا العام" icon={<BarChart2 />}>
                            <BarChart title="" data={monthlyStats} />
                        </AdminSection>
                    )}

                    {activeTab === 'schedule' && (
                        <AdminSection title="إدارة الجدول الأسبوعي" icon={<Clock />}>
                            <p className="text-gray-600 mb-6 -mt-4">
                                حدد الأيام والأوقات التي تكون متاحًا فيها بشكل أسبوعي. سيتم إرسال طلبك للموافقة.
                            </p>
                            <WeeklyScheduleManager instructor={instructor} />
                        </AdminSection>
                    )}

                    {activeTab === 'profile' && (
                        <AdminSection title="تعديل الملف الشخصي" icon={<User />}>
                            <p className="text-gray-600 mb-6 -mt-4">
                                يمكنك هنا تعديل نبذتك التعريفية واقتراح سعر جديد لجلساتك. ستخضع التغييرات لمراجعة الإدارة قبل اعتمادها.
                            </p>
                            <InstructorProfileEditor instructor={instructor} />
                        </AdminSection>
                    )}
                </div>
            </div>
        </>
    );
};

export default InstructorDashboardPage;