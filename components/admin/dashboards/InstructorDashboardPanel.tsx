
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '../../../hooks/queries/instructor/useInstructorDataQuery';
import PageLoader from '../../ui/PageLoader';
import StatCard from '../StatCard';
import { Calendar, BookOpen, Award, Star, AlertCircle, CheckCircle } from 'lucide-react';
import InstructorJourneysPanel from './InstructorJourneysPanel';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const InstructorDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useInstructorData();

    if (isLoading || !data) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }
    
    if (!data.instructor) {
        return <div className="text-center text-red-500 p-4">لم يتم العثور على ملف المدرب الخاص بك.</div>;
    }

    const { instructor, bookings, introSessionsThisMonth } = data;

    const upcomingSessionsCount = bookings.reduce((count, booking) => {
        return count + (booking.sessions?.filter((s: any) => s.status === 'upcoming').length || 0);
    }, 0);

    const activeJourneysCount = bookings.filter((b: any) => b.status === 'مؤكد').length;
    
    // هدف الجلسات التعريفية (على الأقل واحدة شهرياً)
    const introSessionGoalMet = introSessionsThisMonth >= 1;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {instructor.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">هنا ملخص لرحلاتك التدريبية وجدولك الزمني.</p>
                </div>
                {instructor.profile_update_status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                        <Star size={16} /> طلب تحديث بياناتك قيد المراجعة
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="الجلسات القادمة" 
                    value={upcomingSessionsCount} 
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />} 
                    onClick={() => navigate('/admin/schedule')}
                />
                <StatCard 
                    title="الرحلات النشطة" 
                    value={activeJourneysCount} 
                    icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} 
                    onClick={() => navigate('/admin/journeys')}
                />
                <StatCard 
                    title="جلسات تعريفية مكتملة (هذا الشهر)" 
                    value={`${introSessionsThisMonth} / 1`}
                    icon={<Award className={`h-4 w-4 ${introSessionGoalMet ? "text-green-500" : "text-yellow-500"}`} />} 
                />
                <Card className={introSessionGoalMet ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-xs text-muted-foreground">حالة هدف الشهر</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                        {introSessionGoalMet ? (
                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                <CheckCircle className="h-5 w-5" /> تم تحقيق الهدف!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-blue-700 font-bold">
                                <AlertCircle className="h-5 w-5" /> متبقي جلسة واحدة
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <InstructorJourneysPanel instructorBookings={bookings as any[]} />

            {!introSessionGoalMet && (
                <div className="p-4 bg-yellow-50 border-r-4 border-yellow-400 text-yellow-800 rounded shadow-sm">
                    <p className="text-sm font-bold flex items-center gap-2">
                        <Star className="text-yellow-600" /> تذكير: مطلوب منك إكمال جلسة تعريفية واحدة على الأقل شهرياً لضمان ظهور ملفك للعملاء الجدد.
                    </p>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboardPage;
