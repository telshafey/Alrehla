
import { useQuery } from '@tanstack/react-query';
import { communicationService } from '../../../services/communicationService';
import { orderService } from '../../../services/orderService';
import { userService } from '../../../services/userService';
import { bookingService } from '../../../services/bookingService';
import { mockFetch } from '../../../services/mockAdapter';
import { mockStandaloneServices } from '../../../data/mockData';
import type { ServiceOrderWithRelations } from '../../../lib/database.types';

export const useAdminSupportTickets = () => useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: () => communicationService.getAllSupportTickets(),
});

export const useAdminJoinRequests = () => useQuery({
    queryKey: ['adminJoinRequests'],
    queryFn: () => communicationService.getAllJoinRequests(),
});

export const useAdminSupportSessionRequests = () => useQuery({
    queryKey: ['adminSupportSessionRequests'],
    queryFn: async () => {
         const requests = await communicationService.getAllSupportSessionRequests();
         const instructors = await bookingService.getAllInstructors();
         const children = await userService.getAllChildProfiles();
         
         // Manually join data (Backend usually does this)
         return requests.map(r => ({
             ...r,
             instructor_name: instructors.find(i => i.id === r.instructor_id)?.name || 'N/A',
             child_name: children.find(c => c.id === r.child_id)?.name || 'N/A',
         }));
    },
});

export const useAdminServiceOrders = () => useQuery({
    queryKey: ['adminServiceOrders'],
    queryFn: async () => {
        const [orders, usersResult, children, instructors, services] = await Promise.all([
            orderService.getAllServiceOrders(),
            userService.getAllUsers({ page: 1, pageSize: 1000 }), // Pass arguments to get larger list
            userService.getAllChildProfiles(),
            bookingService.getAllInstructors(),
            mockFetch(mockStandaloneServices) // Should be in a service too
        ]);

        // Fix: usersResult is { users: UserProfile[], count: number }
        const users = usersResult.users;

        return orders.map(order => ({
            ...order,
            users: users.find(u => u.id === order.user_id) || null,
            child_profiles: children.find(c => c.id === order.child_id) || null,
            instructors: instructors.find(i => i.id === order.assigned_instructor_id) || null,
            standalone_services: services.find((s: any) => s.id === order.service_id) || null,
        })) as ServiceOrderWithRelations[];
    },
});
