import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import {
    mockNotifications,
    mockOrders,
    mockSubscriptions,
    mockBookings,
    mockScheduledSessions,
    mockCreativeWritingPackages,
    mockInstructors,
} from '../../../data/mockData';

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
