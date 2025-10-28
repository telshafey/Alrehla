import { useQueries } from '@tanstack/react-query';
import {
    mockUsers, mockOrders, mockBookings, mockSubscriptions, mockSupportTickets, mockJoinRequests,
    mockBlogPosts, mockInstructors
} from '../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

const queries = [
    { key: 'users', fn: () => mockFetch(mockUsers) },
    { key: 'orders', fn: () => mockFetch(mockOrders) },
    { key: 'bookings', fn: () => mockFetch(mockBookings) },
    { key: 'subscriptions', fn: () => mockFetch(mockSubscriptions) },
    { key: 'supportTickets', fn: () => mockFetch(mockSupportTickets) },
    { key: 'joinRequests', fn: () => mockFetch(mockJoinRequests) },
    { key: 'blogPosts', fn: () => mockFetch(mockBlogPosts) },
    { key: 'instructors', fn: () => mockFetch(mockInstructors) },
];

export const useAdminDashboardData = () => {
    const results = useQueries({
        queries: queries.map(q => ({
            queryKey: ['adminDashboard', q.key],
            queryFn: q.fn,
        })),
    });

    const isLoading = results.some(result => result.isLoading);
    const error = results.find(result => result.error)?.error;

    const data = isLoading || error ? null : results.reduce((acc, result, index) => {
        const key = queries[index].key;
        acc[key] = result.data;
        return acc;
    }, {} as any);

    return { data, isLoading, error };
};