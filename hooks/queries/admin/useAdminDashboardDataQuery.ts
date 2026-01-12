
import { useQueries } from '@tanstack/react-query';
import { userService } from '../../../services/userService';
import { orderService } from '../../../services/orderService';
import { bookingService } from '../../../services/bookingService';
import { publicService } from '../../../services/publicService';
import { communicationService } from '../../../services/communicationService';

const queries = [
    // Fix: Extract arrays because getAllUsers/Orders/Bookings now return { data, count } objects
    { key: 'users', fn: () => userService.getAllUsers().then(res => res.users) },
    { key: 'orders', fn: () => orderService.getAllOrders().then(res => res.orders) },
    { key: 'bookings', fn: () => bookingService.getAllBookings().then(res => res.bookings) },
    
    { key: 'subscriptions', fn: () => orderService.getAllSubscriptions() },
    { key: 'supportTickets', fn: () => communicationService.getAllSupportTickets() },
    { key: 'joinRequests', fn: () => communicationService.getAllJoinRequests() },
    { key: 'blogPosts', fn: () => publicService.getAllPublicData().then(d => d.blogPosts) },
    { key: 'instructors', fn: () => bookingService.getAllInstructors() },
    { key: 'supportSessionRequests', fn: () => communicationService.getAllSupportSessionRequests() },
    { key: 'scheduledSessions', fn: () => bookingService.getAllScheduledSessions() },
    { key: 'serviceOrders', fn: () => orderService.getAllServiceOrders() },
    { key: 'attachments', fn: () => bookingService.getAllAttachments() },
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
            result.refetch();
        });
    };

    return { data, isLoading, error, refetch };
};
