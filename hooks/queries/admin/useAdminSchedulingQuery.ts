import { useQuery } from '@tanstack/react-query';
import { mockScheduledSessions, mockInstructors, mockChildProfiles, mockBookings } from '../../../data/mockData';
import type { ScheduledSession, Instructor, ChildProfile, CreativeWritingBooking } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminScheduledSessions = () => useQuery({
    queryKey: ['adminScheduledSessions'],
    queryFn: async () => {
        const [sessions, instructors, children, bookings] = await Promise.all([
            mockFetch(mockScheduledSessions) as Promise<ScheduledSession[]>,
            mockFetch(mockInstructors) as Promise<Instructor[]>,
            mockFetch(mockChildProfiles) as Promise<ChildProfile[]>,
            mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>
        ]);

        return sessions.map(session => {
            const booking = bookings.find(b => b.id === session.booking_id);
            return {
                ...session,
                instructor_name: instructors.find(i => i.id === session.instructor_id)?.name || 'غير محدد',
                child_name: children.find(c => c.id === session.child_id)?.name || 'غير محدد',
                type: session.subscription_id ? 'اشتراك' : 'حجز باقة',
                package_name: booking?.package_name || null,
            };
        });
    },
});