import { useQuery } from '@tanstack/react-query';
import {
    mockOrders, mockBookings, mockSubscriptions, mockNotifications,
    mockScheduledSessions, mockSessionMessages, mockSessionAttachments,
    mockSupportSessionRequests, mockCreativeWritingPackages, mockInstructors, mockChildProfiles
} from '../data/mockData';
import type { ScheduledSession, ChildProfile, CreativeWritingBooking, SupportSessionRequest, Instructor, CreativeWritingPackage } from '../lib/database.types';

// Mock async function to simulate network delay
const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));


// --- USER-SPECIFIC DATA (Account Page) ---
export const useUserAccountData = () => {
    // In a real app, you'd pass a user ID here.
    return useQuery({
        queryKey: ['userAccountData'],
        queryFn: async () => {
            const data = {
                userOrders: await mockFetch(mockOrders),
                userBookings: await mockFetch(mockBookings),
                userSubscriptions: await mockFetch(mockSubscriptions),
            };
            return data;
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useUserNotifications = () => {
    return useQuery({
        queryKey: ['userNotifications'],
        queryFn: () => mockFetch(mockNotifications),
    });
};


// --- STUDENT-SPECIFIC DATA ---
export const useStudentDashboardData = () => {
    return useQuery({
        queryKey: ['studentDashboardData'],
        queryFn: () => mockFetch({ studentBookings: mockBookings }),
    });
};

// --- NEW SESSION MANAGEMENT HOOKS ---

// Hook to get all scheduled sessions for the current user (mock)
// In a real app, this would take a user ID and filter.
export const useUserScheduledSessions = () => {
    return useQuery({
        queryKey: ['userScheduledSessions'],
        queryFn: async () => {
            // Mock fetching all sessions for now.
            const sessions = await mockFetch(mockScheduledSessions);
            // In a real app, you'd fetch related instructors and children here or join them in the query.
            return sessions;
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

// Hook to get all data for a single training journey (booking)
export const useTrainingJourneyData = (bookingId: string | undefined) => {
    return useQuery({
        queryKey: ['trainingJourney', bookingId],
        queryFn: async () => {
            if (!bookingId) return null;
            
            const booking = (await mockFetch(mockBookings) as CreativeWritingBooking[]).find(b => b.id === bookingId);
            if (!booking) throw new Error('Booking not found');

            const [pkg, instructor, child, scheduledSessions, messages, attachments, supportRequests] = await Promise.all([
                (mockFetch(mockCreativeWritingPackages) as Promise<CreativeWritingPackage[]>).then(pkgs => pkgs.find(p => p.name === booking.package_name)),
                (mockFetch(mockInstructors) as Promise<Instructor[]>).then(insts => insts.find(i => i.id === booking.instructor_id)),
                (mockFetch(mockChildProfiles) as Promise<ChildProfile[]>).then(children => children.find(c => c.id === booking.child_id)),
                (mockFetch(mockScheduledSessions) as Promise<ScheduledSession[]>).then(s => s.filter(ses => ses.booking_id === bookingId)),
                (mockFetch(mockSessionMessages) as Promise<any[]>).then(m => m.filter(msg => msg.booking_id === bookingId)),
                (mockFetch(mockSessionAttachments) as Promise<any[]>).then(a => a.filter(att => att.booking_id === bookingId)),
                (mockFetch(mockSupportSessionRequests) as Promise<SupportSessionRequest[]>).then(reqs => reqs.filter(r => r.child_id === booking.child_id && r.status === 'approved'))
            ]);

            return {
                booking,
                package: pkg,
                instructor,
                child,
                scheduledSessions,
                messages,
                attachments,
                approvedSupportSessions: supportRequests,
            };
        },
        enabled: !!bookingId,
        staleTime: 1000 * 60, // 1 minute
    });
};
