import React, { useState, useMemo } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import AdminSection from '../AdminSection';
import { formatDate } from '../../../utils/helpers';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../../lib/database.types';
import { Button } from '../../ui/Button';
import RequestSessionChangeModal from './RequestSessionChangeModal';

type EnrichedInstructorBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
    child_profiles: { name: string } | null;
};

interface InstructorJourneysPanelProps {
    instructorBookings: EnrichedInstructorBooking[];
}

const JourneyDetailsCard: React.FC<{ journey: EnrichedInstructorBooking }> = ({ journey }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);

    const totalSessions = parseInt(journey.packageDetails?.sessions?.match(/\d+/)?.[0] || '0', 10);
    const completedSessionsCount = journey.sessions.filter(s => s.status === 'completed').length;
    
    const upcomingSessions = useMemo(() => 
        journey.sessions
            .filter(s => s.status === 'upcoming')
            .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()),
        [journey.sessions]
    );

    const handleChangeRequest = (session: ScheduledSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    return (
        <>
            <RequestSessionChangeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} session={selectedSession} childName={journey.child_profiles?.name} />
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{journey.child_profiles?.name}</h3>
                        <p className="text-sm text-gray-500">{journey.package_name}</p>
                    </div>
                    <div className="text-sm font-semibold">
                        {completedSessionsCount} / {totalSessions || '?'} جلسات مكتملة
                    </div>
                </div>
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-bold mb-2">الجلسات القادمة:</h4>
                    {upcomingSessions.length > 0 ? (
                        <ul className="space-y-2">
                            {upcomingSessions.map(session => (
                                <li key={session.id} className="flex justify-between items-center p-2 bg-white rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-blue-500"/>
                                        <span className="text-sm font-semibold">{formatDate(session.session_date)} - {new Date(session.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleChangeRequest(session)}>
                                        طلب تغيير
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center">لا توجد جلسات قادمة مجدولة لهذه الرحلة.</p>
                    )}
                </div>
            </div>
        </>
    );
};


const InstructorJourneysPanel: React.FC<InstructorJourneysPanelProps> = ({ instructorBookings }) => {
    return (
        <AdminSection title="كل الرحلات التدريبية" icon={<BookOpen />}>
            {instructorBookings.length > 0 ? (
                <div className="space-y-6">
                    {instructorBookings.map(journey => (
                        <JourneyDetailsCard key={journey.id} journey={journey} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">لم يتم تعيين أي رحلات لك بعد.</p>
            )}
        </AdminSection>
    );
};

export default InstructorJourneysPanel;