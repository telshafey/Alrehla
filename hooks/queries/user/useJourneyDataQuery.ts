import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
    mockBookings,
    mockScheduledSessions,
    mockSessionMessages,
    mockSessionAttachments,
    mockCreativeWritingPackages,
    mockInstructors,
    mockSupportSessionRequests,
    mockAdditionalServices,
    mockUsers,
    mockOrders,
    mockSubscriptions
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

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
            const additionalServices = await mockFetch(mockAdditionalServices);

            return mockFetch({ booking, package: pkg, instructor, messages, attachments, scheduledSessions, approvedSupportSessions, additionalServices });
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
            
            const parent = mockUsers.find(u => u.id === currentChildProfile.user_id);

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
            
            const studentOrders = mockOrders.filter(o => o.child_id === currentChildProfile.id);
            const studentSubscriptions = mockSubscriptions.filter(s => s.child_id === currentChildProfile.id);
            
            return mockFetch({
                parentName: parent?.name,
                journeys: studentBookings,
                orders: studentOrders,
                subscriptions: studentSubscriptions,
            });
        },
        enabled: !!currentChildProfile,
    });
};