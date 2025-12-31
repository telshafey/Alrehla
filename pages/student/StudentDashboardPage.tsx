
import React from 'react';
import { useStudentDashboardData } from '../../hooks/queries/user/useJourneyDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StudentJourneyCard from '../../components/student/StudentJourneyCard';
import BadgeDisplay from '../../components/shared/BadgeDisplay';
import { BookOpen, ShoppingBag, Star, Award, Link2Off, AlertCircle } from 'lucide-react';
import { getStatusColor, getSubStatusColor, getSubStatusText, formatDate } from '../../utils/helpers';
import type { Order, Subscription, Badge } from '../../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

const StudentDashboardPage: React.FC = () => {
    const { data, isLoading, error } = useStudentDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري فحص حالة الحساب..." />;
    }

    // إذا لم يجد الربط في سجلات الأطفال (isUnlinked)
    if (data?.isUnlinked) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                <div className="bg-orange-100 p-6 rounded-full mb-6">
                    <Link2Off className="w-16 h-16 text-orange-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-800">هذا الحساب غير مرتبط بملف طالب</h2>
                <p className="text-gray-600 max-w-md mt-4 text-lg leading-relaxed">
                    مرحباً بك. يبدو أن حسابك لم يتم ربطه بملف الطفل في لوحة تحكم ولي الأمر بعد. 
                    <br/>
                    <span className="font-bold text-orange-700">يرجى الطلب من ولي أمرك تنفيذ "ربط الحساب" من المركز العائلي.</span>
                </p>
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3 text-right max-w-lg">
                    <AlertCircle className="text-blue-500 shrink-0 mt-1" />
                    <p className="text-sm text-blue-800 font-semibold">ملاحظة للمسؤول: إذا كنت ترى هذا المستخدم مرتبطاً في لوحة الأدمن، فهذا يعني أن معرّف الطالب في جدول `child_profiles` لا يزال فارغاً أو غير صحيح.</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return <div className="text-center py-20 text-red-500 font-bold">حدث خطأ أثناء جلب البيانات.</div>;
    }

    const { journeys = [], orders = [], subscriptions = [], badges = [] } = data;
    const displayJourneys = journeys.filter((j: any) => ['مؤكد', 'مكتمل'].includes(j.status));

    return (
        <div className="space-y-12 animate-fadeIn">
             <section>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
                    <BookOpen /> رحلاتي التدريبية
                </h2>
                {displayJourneys.length > 0 ? (
                    <div className="space-y-6">
                        {displayJourneys.map((journey: any) => (
                            <StudentJourneyCard key={journey.id} journey={journey} />
                        ))}
                    </div>
                ) : (
                    <Card><CardContent className="text-center py-10 text-muted-foreground">لا توجد رحلات نشطة بعد.</CardContent></Card>
                )}
            </section>

             <section>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
                    <Award /> إنجازاتي
                </h2>
                {badges.length > 0 ? (
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {(badges as Badge[]).map(badge => (
                                <BadgeDisplay key={badge.id} badge={badge} />
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                     <Card><CardContent className="text-center py-10 text-muted-foreground">لم تحصل على شارات بعد.</CardContent></Card>
                )}
            </section>
        </div>
    );
};

export default StudentDashboardPage;
