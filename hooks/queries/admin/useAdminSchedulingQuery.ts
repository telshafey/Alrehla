import { useQuery } from '@tanstack/react-query';
import { mockScheduledSessions, mockInstructors, mockChildProfiles } from '../../../data/mockData';
import type { ScheduledSession, Instructor, ChildProfile } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminScheduledSessions = () => useQuery({
    queryKey: ['adminScheduledSessions'],
    queryFn: async () => {
        const [sessions, instructors, children] = await Promise.all([
            mockFetch(mockScheduledSessions) as Promise<ScheduledSession[]>,
            mockFetch(mockInstructors) as Promise<Instructor[]>,
            mockFetch(mockChildProfiles) as Promise<ChildProfile[]>
        ]);

        return sessions.map(session => ({
            ...session,
            instructor_name: instructors.find(i => i.id === session.instructor_id)?.name || 'غير محدد',
            child_name: children.find(c => c.id === session.child_id)?.name || 'غير محدد',
            type: session.subscription_id ? 'اشتراك' : 'حجز باقة',
        }));
    },
});
