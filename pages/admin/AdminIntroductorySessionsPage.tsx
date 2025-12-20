
import React, { useState, useMemo } from 'react';
import { Star, Calendar, CheckCircle, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminScheduledSessions } from '../../hooks/queries/admin/useAdminSchedulingQuery';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import IntroductorySessionSchedulerModal from '../../components/admin/IntroductorySessionSchedulerModal';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import type { Instructor } from '../../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const AdminIntroductorySessionsPage: React.FC = () => {
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useAdminScheduledSessions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

    const isLoading = instructorsLoading || sessionsLoading;
    const error = instructorsError || sessionsError;

    const instructorSessionStatus = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return instructors.map(instructor => {
            const introSessionThisMonth = (sessions as any[]).find(s =>
                s.instructor_id === instructor.id &&
                s.package_name === 'الجلسة التعريفية' &&
                new Date(s.session_date).getMonth() === currentMonth &&
                new Date(s.session_date).getFullYear() === currentYear
            );
            return {
                instructor,
                hasScheduled: !!introSessionThisMonth,
                sessionDate: introSessionThisMonth ? introSessionThisMonth.session_date : null,
            };
        });
    }, [instructors, sessions]);
    
    const handleOpenScheduler = (instructor: Instructor) => {
        setSelectedInstructor(instructor);
        setIsModalOpen(true);
    };

    if (isLoading) return <PageLoader text="جاري تحميل بيانات الجلسات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={() => { refetchInstructors(); refetchSessions(); }} />;

    return (
        <>
            <IntroductorySessionSchedulerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                instructor={selectedInstructor}
            />
            <div className="animate-fadeIn space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground">الجلسات التعريفية الشهرية</h1>
                    <p className="text-muted-foreground mt-1">
                        متابعة التزام المدربين بتقديم جلسة تعريفية مجانية واحدة على الأقل شهرياً لخدمة العملاء الجدد.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-green-800">مدربون ملتزمون هذا الشهر</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-green-600">{instructorSessionStatus.filter(s => s.hasScheduled).length}</p></CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-yellow-800">مدربون لم يجدولوا بعد</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold text-yellow-600">{instructorSessionStatus.filter(s => !s.hasScheduled).length}</p></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="text-yellow-500" /> قائمة المدربين وحالة الالتزام
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>المدرب</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>تاريخ الجلسة</TableHead>
                                        <TableHead>إجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {instructorSessionStatus.map(({ instructor, hasScheduled, sessionDate }) => (
                                        <TableRow key={instructor.id}>
                                            <TableCell className="font-semibold">{instructor.name}</TableCell>
                                            <TableCell>
                                                {hasScheduled ? (
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                        <CheckCircle size={16} /> ملتزم
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-yellow-600">
                                                        <AlertCircle size={16} /> بانتظار الجدولة
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {sessionDate ? formatDate(sessionDate) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {!hasScheduled && (
                                                    <Button 
                                                        onClick={() => handleOpenScheduler(instructor)} 
                                                        size="sm" 
                                                        variant="outline"
                                                        icon={<Calendar size={16} />}
                                                    >
                                                        جدولة جلسة له
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminIntroductorySessionsPage;
