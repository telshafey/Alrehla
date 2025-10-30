import React, { useState, useMemo } from 'react';
// FIX: Imported CheckCircle and AlertCircle icons.
import { Star, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
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
    const refetch = () => {
        if (instructorsError) refetchInstructors();
        if (sessionsError) refetchSessions();
    };

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
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <IntroductorySessionSchedulerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                instructor={selectedInstructor}
            />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة الجلسات التعريفية الشهرية</h1>
                <p className="text-muted-foreground -mt-6">
                    تابع وجدولة الجلسات التعريفية المجانية التي يقدمها المدربون لضمان التزام الجميع بتقديم جلسة واحدة على الأقل شهريًا.
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="text-yellow-500" /> حالة المدربين للشهر الحالي
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>المدرب</TableHead>
                                        <TableHead>الحالة</TableHead>
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
                                                        <CheckCircle size={16} />
                                                        تمت الجدولة في {formatDate(sessionDate)}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-yellow-600">
                                                        <AlertCircle size={16} />
                                                        بانتظار الجدولة
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    onClick={() => handleOpenScheduler(instructor)} 
                                                    size="sm" 
                                                    variant="outline"
                                                    icon={<Calendar size={16} />}
                                                    disabled={hasScheduled}
                                                >
                                                    جدولة
                                                </Button>
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