import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
    mockNotifications,
    mockOrders,
    mockSubscriptions,
    mockBookings,
    mockScheduledSessions,
    mockSessionMessages,
    mockSessionAttachments,
    mockCreativeWritingPackages,
    mockInstructors,
    mockSupportSessionRequests
} from '../data/mockData';
import type { CreativeWritingBooking, ScheduledSession, CreativeWritingPackage } from '../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useUserNotifications = () => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: ['userNotifications', currentUser?.id],
        queryFn: () => {
            if (!currentUser) return [];
            return mockFetch(mockNotifications.filter(n => n.user_id === currentUser.id));
        },
        enabled: !!currentUser,
    });
};

export const useUserAccountData = () => {
    const { currentUser, childProfiles } = useAuth();
    return useQuery({
        queryKey: ['userAccountData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return {};
            const userOrders = mockOrders.filter(o => o.user_id === currentUser.id);
            const userSubscriptions = mockSubscriptions.filter(s => s.user_id === currentUser.id);
            
            // Enriched bookings
            const userBookings = mockBookings
                .filter(b => b.user_id === currentUser.id)
                .map(booking => {
                    const sessions = mockScheduledSessions.filter(s => s.booking_id === booking.id);
                    const packageDetails = mockCreativeWritingPackages.find(p => p.name === booking.package_name);
                    const instructorName = mockInstructors.find(i => i.id === booking.instructor_id)?.name || 'N/A';
                    return { ...booking, sessions, packageDetails, instructorName };
                });

            return mockFetch({ userOrders, userSubscriptions, userBookings });
        },
        enabled: !!currentUser,
    });
};

export const useTrainingJourneyData = (journeyId: string | undefined) => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: ['trainingJourney', journeyId],
        queryFn: async () => {
            if (!journeyId) return null;

            const booking = mockBookings.find(b => b.id === journeyId);
            if (!booking) throw new Error('Booking not found');
            
            // For security, you might check if currentUser is the parent or the student
            
            const pkg = mockCreativeWritingPackages.find(p => p.name === booking.package_name);
            const instructor = mockInstructors.find(i => i.id === booking.instructor_id);
            const messages = mockSessionMessages.filter(m => m.booking_id === journeyId);
            const attachments = mockSessionAttachments.filter(a => a.booking_id === journeyId);
            const scheduledSessions = mockScheduledSessions.filter(s => s.booking_id === journeyId);
            const approvedSupportSessions = mockSupportSessionRequests.filter(
                s => s.instructor_id === instructor?.id && s.child_id === booking.child_id && s.status === 'approved'
            );

            return mockFetch({ booking, package: pkg, instructor, messages, attachments, scheduledSessions, approvedSupportSessions });
        },
        enabled: !!journeyId && !!currentUser,
    });
};

export const useStudentDashboardData = () => {
    const { currentChildProfile } = useAuth(); // for students
    return useQuery({
        queryKey: ['studentDashboardData', currentChildProfile?.id],
        queryFn: async () => {
            if (!currentChildProfile) return null;
            
            const studentBookings = mockBookings
                .filter(b => b.child_id === currentChildProfile.id)
                .map(booking => {
                    const instructor = mockInstructors.find(i => i.id === booking.instructor_id);
                    const sessions = mockScheduledSessions.filter(s => s.booking_id === booking.id);
                    const packageDetails = mockCreativeWritingPackages.find(p => p.name === booking.package_name);
                    return {
                        ...booking,
                        instructor_name: instructor?.name,
                        sessions,
                        packageDetails,
                    };
                });
            
            return mockFetch({
                journeys: studentBookings,
            });
        },
        enabled: !!currentChildProfile,
    });
};
