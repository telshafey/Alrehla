import React, { useState, useMemo } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import AdminSection from '../AdminSection';
import { formatDate } from '../../../utils/helpers';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../../lib/database.types';
import { Button } from '../../ui/Button';
import RequestSessionChangeModal from './RequestSessionChangeModal';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


type EnrichedInstructorBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
    child_profiles: { name: string } | null;
};

interface InstructorJourneysPanelProps {
    instructorBookings: EnrichedInstructorBooking[];
}

const JourneyDetailsCard: React.FC<{ journey: EnrichedInstructorBooking }> = ({ journey }) => {

    const totalSessions = parseInt(journey.packageDetails?.sessions?.match(/\d+/)?.[0] || '0', 10);
    const completedSessionsCount = journey.sessions.filter(s => s.status === 'completed').length;
    
    return (
        <>
            <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full flex-shrink-0"><BookOpen /></div>
                        <div>
                            <h3 className="font-bold text-lg">{journey.child_profiles?.name}</h3>
                            <p className="text-sm text-gray-500">{journey.package_name}</p>
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-right">
                        <p>{completedSessionsCount} / {totalSessions || '?'} </p>
                        <p>جلسات مكتملة</p>
                    </div>
                </div>
                 <div className="mt-4 border-t pt-4 flex justify-end">
                    <Button asChild size="sm">
                        <Link to={`/journey/${journey.id}`}>
                            <span>افتح مساحة العمل</span>
                            <ArrowLeft size={16} />
                        </Link>
                    </Button>
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