import { useQuery } from '@tanstack/react-query';
import {
    mockOrders,
    mockBookings,
    mockSubscriptions,
    mockInstructorPayouts,
    mockInstructors,
    mockServiceOrders,
    mockCreativeWritingPackages,
    mockStandaloneServices
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminFinancialsQuery = () => {
    return useQuery({
        queryKey: ['adminFinancials'],
        queryFn: async () => {
            const [orders, bookings, subscriptions, payouts, instructors, serviceOrders, packages, services] = await Promise.all([
                mockFetch(mockOrders),
                mockFetch(mockBookings),
                mockFetch(mockSubscriptions),
                mockFetch(mockInstructorPayouts),
                mockFetch(mockInstructors),
                mockFetch(mockServiceOrders),
                mockFetch(mockCreativeWritingPackages),
                mockFetch(mockStandaloneServices),
            ]);
            return { orders, bookings, subscriptions, payouts, instructors, serviceOrders, packages, services };
        },
    });
};
