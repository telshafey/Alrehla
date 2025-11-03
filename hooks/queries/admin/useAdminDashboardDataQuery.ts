import { useQueries } from '@tanstack/react-query';
import {
    mockUsers, mockOrders, mockBookings, mockSubscriptions, mockSupportTickets, mockJoinRequests,
    mockBlogPosts, mockInstructors, mockSupportSessionRequests, mockScheduledSessions, mockServiceOrders,
    mockSessionAttachments
} from '../../../data/mockData';

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
    { key: 'supportSessionRequests', fn: () => mockFetch(mockSupportSessionRequests) },
    { key: 'scheduledSessions', fn: () => mockFetch(mockScheduledSessions) },
    { key: 'serviceOrders', fn: () => mockFetch(mockServiceOrders) },
    { key: 'attachments', fn: () => mockFetch(mockSessionAttachments) },
];

export const useAdminDashboardData = () => {
    const results = useQueries({
        queries: queries.map(q => ({
            queryKey: ['adminDashboard', q.key],
            queryFn: q.fn,
        })),
    });

    const isLoading = results.some(result => result.isLoading);
    const errorResult = results.find(result => result.error);
    const error = errorResult?.error;

    const data = isLoading || error ? null : results.reduce((acc, result, index) => {
        const key = queries[index].key;
        acc[key] = result.data;
        return acc;
    }, {} as any);

    const refetch = () => {
        results.forEach(result => {
            // Refetch all queries, or just the ones that failed. Refetching all is simpler.
            result.refetch();
        });
    };

    return { data, isLoading, error, refetch };
};