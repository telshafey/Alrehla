import { useQuery } from '@tanstack/react-query';
import { mockInstructors, mockInstructorPayouts } from '../../../data/mockData';
import type { Instructor } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminInstructors = () => useQuery({
    queryKey: ['adminInstructors'],
    queryFn: () => mockFetch(mockInstructors) as Promise<Instructor[]>,
});

export const useAdminInstructorUpdates = () => useQuery({
    queryKey: ['adminInstructorUpdates'],
    queryFn: async () => {
        const instructors: Instructor[] = await mockFetch(mockInstructors) as Instructor[];
        return instructors.filter(i => i.profile_update_status === 'pending');
    },
});

export const useAdminInstructorPayouts = () => useQuery({
    queryKey: ['adminInstructorPayouts'],
    queryFn: () => mockFetch(mockInstructorPayouts) as Promise<any[]>,
});