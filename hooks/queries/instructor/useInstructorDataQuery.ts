import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
    mockInstructors,
    mockBookings,
    mockChildProfiles,
    mockCreativeWritingPackages,
    mockScheduledSessions,
    mockInstructorPayouts,
    mockServiceOrders,
    mockSessionAttachments, // Added import
} from '../../../data/mockData';
import { transformCwBookings } from '../admin/useAdminBookingsQuery';
import type { Instructor, CreativeWritingBooking, CreativeWritingPackage, ScheduledSession, ChildProfile, SessionAttachment } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 100) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useInstructorData = () => {
    const { currentUser } = useAuth();
    
    return useQuery({
        queryKey: ['instructorData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null;

            // Fetch all data in parallel
            const [
                allInstructors, 
                rawBookings, 
                allChildren, 
                allPackages, 
                allScheduledSessions, 
                allPayouts,
                allServiceOrders,
                allAttachments // Added fetch
            ] = await Promise.all([
                mockFetch(mockInstructors) as Promise<Instructor[]>,
                mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
                mockFetch(mockChildProfiles) as Promise<ChildProfile[]>,
                mockFetch(mockCreativeWritingPackages) as Promise<CreativeWritingPackage[]>,
                mockFetch(mockScheduledSessions) as Promise<ScheduledSession[]>,
                mockFetch(mockInstructorPayouts),
                mockFetch(mockServiceOrders),
                mockFetch(mockSessionAttachments) as Promise<SessionAttachment[]> // Added fetch
            ]);

            const currentInstructor = allInstructors.find((i: Instructor) => i.user_id === currentUser.id);
            if (!currentInstructor) return { instructor: null };

            const instructorBookings = rawBookings.filter((b: CreativeWritingBooking) => b.instructor_id === currentInstructor.id);
            
            const transformedBookings = transformCwBookings(instructorBookings, allChildren, allInstructors);

            const enrichedBookings = transformedBookings.map(booking => {
                const journeySessions = (allScheduledSessions as ScheduledSession[]).filter(s => s.booking_id === booking.id);
                const packageDetails = (allPackages as CreativeWritingPackage[]).find(p => p.name === booking.package_name);
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

            const instructorPayouts = (allPayouts as any[]).filter(p => p.instructor_id === currentInstructor.id);
            const instructorServiceOrders = (allServiceOrders as any[]).filter(o => o.assigned_instructor_id === currentInstructor.id);
            
            const instructorBookingIds = new Set(instructorBookings.map(b => b.id));
            const instructorAttachments = allAttachments.filter(att => instructorBookingIds.has(att.booking_id));


            return {
                instructor: currentInstructor,
                bookings: enrichedBookings,
                introSessionsThisMonth,
                payouts: instructorPayouts,
                serviceOrders: instructorServiceOrders,
                attachments: instructorAttachments, // Added attachments to returned data
            };
        },
        enabled: !!currentUser,
    });
};