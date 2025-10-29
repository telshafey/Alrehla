import { useQuery } from '@tanstack/react-query';
import { mockBookings, mockChildProfiles, mockInstructors } from '../../../data/mockData';
import type { CreativeWritingBooking, ChildProfile, Instructor } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const transformCwBookings = (bookings: CreativeWritingBooking[], children: ChildProfile[], instructors: Instructor[]): (CreativeWritingBooking & { child_profiles: { name: string } | null, instructors: { name: string } | null })[] => {
    return bookings.map(booking => {
        const child = children.find(c => c.id === booking.child_id);
        const instructor = instructors.find(i => i.id === booking.instructor_id);
        return {
            ...booking,
            child_profiles: child ? { name: child.name } : null,
            instructors: instructor ? { name: instructor.name } : null,
        };
    });
};

export const useAdminRawCwBookings = () => useQuery({
    queryKey: ['adminRawCwBookings'],
    queryFn: () => mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
});
