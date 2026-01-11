
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';
import type { CreativeWritingBooking, ChildProfile, Instructor, UserProfile } from '../../../lib/database.types';

export const transformCwBookings = (
    bookings: CreativeWritingBooking[], 
    children: ChildProfile[], 
    instructors: Instructor[],
    users: UserProfile[] = []
): (CreativeWritingBooking & { child_profiles: { name: string } | null, instructors: { name: string } | null, users: { name: string, email: string } | null })[] => {
    return bookings.map(booking => {
        const child = children.find(c => c.id === booking.child_id);
        const instructor = instructors.find(i => i.id === booking.instructor_id);
        const user = users.find(u => u.id === booking.user_id);
        
        return {
            ...booking,
            child_profiles: child ? { name: child.name } : null,
            instructors: instructor ? { name: instructor.name } : null,
            users: user ? { name: user.name, email: user.email } : null
        };
    });
};

export const useAdminRawCwBookings = () => useQuery({
    queryKey: ['adminRawCwBookings'],
    queryFn: () => bookingService.getAllBookings(),
});
