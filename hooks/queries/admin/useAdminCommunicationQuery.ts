import { useQuery } from '@tanstack/react-query';
import { mockSupportTickets, mockJoinRequests, mockSupportSessionRequests, mockInstructors, mockChildProfiles } from '../../../data/mockData';

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
