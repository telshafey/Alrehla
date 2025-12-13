
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';
import { userService } from '../../../services/userService';
import type { ScheduledSession, Instructor, ChildProfile, CreativeWritingBooking } from '../../../lib/database.types';

export const useAdminScheduledSessions = () => useQuery({
    queryKey: ['adminScheduledSessions'],
    queryFn: async () => {
        const [sessions, instructors, children, bookings] = await Promise.all([
            bookingService.getAllScheduledSessions(),
            bookingService.getAllInstructors(),
            userService.getAllChildProfiles(), // Note: This gets all children in admin context
            bookingService.getAllBookings()
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
