import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import AdminSection from '../AdminSection';
import InstructorStudentCard from './InstructorStudentCard';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../../../lib/database.types';

type EnrichedInstructorBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails?: CreativeWritingPackage;
    child_profiles: { id: number; name: string; avatar_url: string | null } | null;
};

interface InstructorJourneysPanelProps {
    instructorBookings: EnrichedInstructorBooking[];
}

const InstructorJourneysPanel: React.FC<InstructorJourneysPanelProps> = ({ instructorBookings }) => {
    
    const students = useMemo(() => {
        const studentMap = new Map<number, { studentProfile: any, journeys: EnrichedInstructorBooking[] }>();
        
        instructorBookings.forEach(booking => {
            if (!booking.child_profiles) return;
            const childId = booking.child_id;
            
            if (!studentMap.has(childId)) {
                studentMap.set(childId, {
                    studentProfile: booking.child_profiles,
                    journeys: [],
                });
            }
            studentMap.get(childId)!.journeys.push(booking);
        });

        return Array.from(studentMap.values());
    }, [instructorBookings]);

    return (
        <AdminSection title="رحلات الطلاب" icon={<BookOpen />}>
            {students.length > 0 ? (
                <div className="space-y-8">
                    {students.map(({ studentProfile, journeys }) => (
                        <InstructorStudentCard 
                            key={studentProfile.id} 
                            student={studentProfile} 
                            journeys={journeys} 
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">لم يتم تعيين أي طلاب لك بعد.</p>
            )}
        </AdminSection>
    );
};

export default InstructorJourneysPanel;