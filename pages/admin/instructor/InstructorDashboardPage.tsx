
import React, { useMemo } from 'react';
import { useInstructorData } from '../../../hooks/queries/instructor/useInstructorDataQuery';
import PageLoader from '../../../components/ui/PageLoader';
import StatCard from '../../../components/admin/StatCard';
import { Calendar, BookOpen, Award, Star } from 'lucide-react';
import InstructorJourneysPanel from '../../../components/admin/dashboards/InstructorJourneysPanel';
import WeeklySessionsWidget from '../../../components/admin/dashboards/WeeklySessionsWidget';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const InstructorDashboardPage: React.FC = () => {
    const { data, isLoading } = useInstructorData();

    // 1. استخلاص البيانات الأساسية بشكل آمن
    const instructor = data?.instructor;
    const bookings = data?.bookings || [];
    const introSessionsThisMonth = data?.introSessionsThisMonth || 0;

    // 2. معالجة الجلسات المجدولة باستخدام useMemo لمنع إعادة الحساب غير الضرورية
    const allScheduledSessions = useMemo(() => {
        if (!bookings.length) return [];
        return bookings.flatMap((b: any) => 
            (b.sessions || []).map((s: any) => ({
                ...s,
                child_name: b.child_profiles?.name || 'طالب',
                package_name: b.package_name
            }))
        );
    }, [bookings]);

    // 3. حساب الإحصائيات
    const stats = useMemo(() => {
        const now = new Date();
        const upcomingTotal = allScheduledSessions.filter((s: any) => 
            s.status === 'upcoming' && new Date(s.session_date) >= now
        ).length;

        const activeStudentsCount = bookings.filter((b: any) => b.status === 'مؤكد').length;
        
        return { upcomingTotal, activeStudentsCount };
    }, [allScheduledSessions, bookings]);

    const introSessionGoalMet = introSessionsThisMonth >= 1;

    // 4. معالجة حالات العرض (بعد تعريف كل الـ Hooks)
    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }
    
    if (!instructor) {
        return (
            <div className="text-center p-12 bg-white rounded-2xl border shadow-sm max-w-lg mx-auto mt-20">
                <Star className="mx-auto text-muted-foreground/20 mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-800">عذراً، لم نتمكن من العثور على ملف المدرب</h2>
                <p className="text-muted-foreground mt-2">يرجى التأكد من أن حسابك مربوط بملف مدرب نشط أو التواصل مع الإدارة.</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {instructor.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">إليك ملخص جدولك وأداء طلابك لهذا الأسبوع.</p>
                </div>
                <div className="flex gap-2">
                    {instructor.profile_update_status === 'pending' && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse shadow-sm">
                            <Star size={16} /> تحديث بياناتك قيد المراجعة
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="جلساتك المجدولة" 
                    value={stats.upcomingTotal} 
                    icon={<Calendar className="h-4 w-4 text-blue-500" />} 
                />
                <StatCard 
                    title="الطلاب النشطون" 
                    value={stats.activeStudentsCount} 
                    icon={<BookOpen className="h-4 w-4 text-purple-500" />} 
                />
                <StatCard 
                    title="جلسات تعريفية (هذا الشهر)" 
                    value={`${introSessionsThisMonth} / 1`}
                    icon={<Award className={`h-4 w-4 ${introSessionGoalMet ? "text-green-500" : "text-yellow-500"}`} />} 
                />
                 <Card className={introSessionGoalMet ? "bg-green-50/50 border-green-100" : "bg-blue-50/50 border-blue-100"}>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">حالة التوافر</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                            متاح حالياً للطلاب
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <WeeklySessionsWidget sessions={allScheduledSessions} instructorName={instructor.name} />
                </div>
                
                <div className="xl:col-span-1">
                    <InstructorJourneysPanel instructorBookings={(bookings as any[])} />
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboardPage;
