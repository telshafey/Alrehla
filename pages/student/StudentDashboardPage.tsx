import React from 'react';
import { useStudentDashboardData } from '../../hooks/userQueries';
import PageLoader from '../../components/ui/PageLoader';
import StudentJourneyCard from '../../components/student/StudentJourneyCard';
import { BookOpen } from 'lucide-react';

const StudentDashboardPage: React.FC = () => {
    const { data, isLoading, error } = useStudentDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل رحلاتك التدريبية..." />;
    }

    if (error || !data) {
        return <div className="text-center text-red-500 py-20">{error?.message || 'حدث خطأ في تحميل بياناتك.'}</div>;
    }

    const { journeys = [] } = data;
    const activeJourneys = journeys.filter((j: any) => j.status === 'مؤكد');

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen /> رحلاتي التدريبية النشطة
            </h2>

            {activeJourneys.length > 0 ? (
                <div className="space-y-6">
                    {activeJourneys.map((journey: any) => (
                        <StudentJourneyCard key={journey.id} journey={journey} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-md border-2 border-dashed">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-100">
                         <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-800">لا توجد رحلات نشطة</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">عندما يقوم ولي أمرك بحجز باقة لك، ستظهر رحلتك التدريبية هنا.</p>
                </div>
            )}
        </div>
    );
};

export default StudentDashboardPage;
