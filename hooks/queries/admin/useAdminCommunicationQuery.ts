import { useQuery } from '@tanstack/react-query';
import { mockSupportTickets, mockJoinRequests, mockSupportSessionRequests, mockInstructors, mockChildProfiles, mockServiceOrders, mockStandaloneServices, mockUsers } from '../../../data/mockData';
import type { ServiceOrderWithRelations } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminSupportTickets = () => useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: () => mockFetch(mockSupportTickets),
});

export const useAdminJoinRequests = () => useQuery({
    queryKey: ['adminJoinRequests'],
    queryFn: () => mockFetch(mockJoinRequests),
});

export const useAdminSupportSessionRequests = () => useQuery({
    queryKey: ['adminSupportSessionRequests'],
    queryFn: async () => {
         const requests = await mockFetch(mockSupportSessionRequests);
         const instructors = await mockFetch(mockInstructors);
         const children = await mockFetch(mockChildProfiles);
         return (requests as any[]).map(r => ({
             ...r,
             instructor_name: (instructors as any[]).find(i => i.id === r.instructor_id)?.name || 'N/A',
             child_name: (children as any[]).find(c => c.id === r.child_id)?.name || 'N/A',
         }));
    },
});

export const useAdminServiceOrders = () => useQuery({
    queryKey: ['adminServiceOrders'],
    queryFn: async () => {
        const [orders, users, children, instructors, services] = await Promise.all([
            mockFetch(mockServiceOrders) as Promise<any[]>,
            mockFetch(mockUsers) as Promise<any[]>,
            mockFetch(mockChildProfiles) as Promise<any[]>,
            mockFetch(mockInstructors) as Promise<any[]>,
            mockFetch(mockStandaloneServices) as Promise<any[]>
        ]);

        return orders.map(order => ({
            ...order,
            users: users.find(u => u.id === order.user_id) || null,
            child_profiles: children.find(c => c.id === order.child_id) || null,
            instructors: instructors.find(i => i.id === order.assigned_instructor_id) || null,
            standalone_services: services.find(s => s.id === order.service_id) || null,
        })) as ServiceOrderWithRelations[];
    },
});
