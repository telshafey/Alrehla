import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useAdminRawCwBookings, transformCwBookings } from '../../hooks/queries/admin/useAdminBookingsQuery';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminCWSettings } from '../../hooks/queries/admin/useAdminSettingsQuery';
import { useAdminScheduledSessions } from '../../hooks/queries/admin/useAdminSchedulingQuery';
import PageLoader from '../../components/ui/PageLoader';
import InstructorDashboardPanel from '../../components/admin/dashboards/InstructorDashboardPanel';
import InstructorJourneysPanel from '../../components/admin/dashboards/InstructorJourneysPanel';
import InstructorSchedulePanel from '../../components/admin/dashboards/InstructorSchedulePanel';
import InstructorProfilePanel from '../../components/admin/dashboards/InstructorProfilePanel';
import InstructorFinancialsPanel from '../../components/admin/dashboards/InstructorFinancialsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { LayoutDashboard, BookOpen, DollarSign, Calendar, User } from 'lucide-react';

import type { Instructor, CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../lib/database.types';

type InstructorTab = 'dashboard' | 'journeys' | 'financials' | 'schedule' | 'profile';

const InstructorDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<InstructorTab>('dashboard');
    
    // Fetch all data and then filter. This is how the mock setup works.
    const { data: instructors = [], isLoading: instructorsLoading } = useAdminInstructors();
    const { data: rawBookings = [], isLoading: bookingsLoading } = useAdminRawCwBookings();
    const { data: allChildren = [], isLoading: childrenLoading } = useAdminAllChildProfiles();
    const { data: settingsData, isLoading: settingsLoading } = useAdminCWSettings();
    const { data: allScheduledSessions = [], isLoading: sessionsLoading } = useAdminScheduledSessions();

    const isLoading = instructorsLoading || bookingsLoading || childrenLoading || settingsLoading || sessionsLoading;

    const dashboardData = useMemo(() => {
        if (isLoading || !currentUser) return null;

        const currentInstructor = instructors.find((i: Instructor) => i.user_id === currentUser?.id);
        if (!currentInstructor) return null;

        const instructorBookings = rawBookings.filter((b: CreativeWritingBooking) => b.instructor_id === currentInstructor.id);
        const transformedBookings = transformCwBookings(instructorBookings, allChildren, instructors);

        const enrichedBookings = transformedBookings.map(booking => {
            const journeySessions = allScheduledSessions.filter(s => s.booking_id === booking.id);
            const packageDetails = settingsData?.packages.find((p: CreativeWritingPackage) => p.name === booking.package_name);
            return {
                ...booking,
                sessions: journeySessions,
                packageDetails,
            }
        });
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const introSessionsThisMonth = enrichedBookings.filter(b => 
            b.package_name === 'الجلسة التعريفية' &&
            b.status === 'مكتمل' &&
            new Date(b.booking_date).getMonth() === currentMonth &&
            new Date(b.booking_date).getFullYear() === currentYear
        ).length;


        return {
            instructor: currentInstructor,
            bookings: enrichedBookings,
            introSessionsThisMonth
        };
    }, [isLoading, currentUser, instructors, rawBookings, allChildren, settingsData, allScheduledSessions]);


    if (isLoading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    if (!dashboardData) {
        return <div className="text-center text-red-500 p-4">لم يتم العثور على ملف المدرب الخاص بك أو حدث خطأ في تحميل البيانات.</div>;
    }

    const { instructor, bookings, introSessionsThisMonth } = dashboardData;
    
    const tabs = [
        { key: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
        { key: 'journeys', label: 'رحلاتي', icon: <BookOpen size={18} /> },
        { key: 'financials', label: 'الحسابات المالية', icon: <DollarSign size={18} /> },
        { key: 'schedule', label: 'الجدول', icon: <Calendar size={18} /> },
        { key: 'profile', label: 'الملف الشخصي', icon: <User size={18} /> },
    ];


    return (
        <div className="animate-fadeIn space-y-8">
             <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بك، {instructor.name}</h1>
                <p className="text-lg text-gray-600 mt-1">هنا ملخص لرحلاتك التدريبية وجدولك الزمني.</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InstructorTab)}>
                <TabsList>
                    {tabs.map(tab => (
                        <TabsTrigger key={tab.key} value={tab.key}>
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                
                <TabsContent value="dashboard">
                    <InstructorDashboardPanel 
                        instructor={instructor} 
                        bookings={bookings}
                        introSessionsCount={introSessionsThisMonth}
                        onNavigateTab={setActiveTab}
                    />
                </TabsContent>
                <TabsContent value="journeys">
                    <InstructorJourneysPanel instructorBookings={bookings} />
                </TabsContent>
                <TabsContent value="financials">
                    <InstructorFinancialsPanel bookings={bookings} instructor={instructor} />
                </TabsContent>
                <TabsContent value="schedule">
                    <InstructorSchedulePanel instructor={instructor} bookings={bookings} />
                </TabsContent>
                <TabsContent value="profile">
                    <InstructorProfilePanel instructor={instructor} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InstructorDashboardPage;