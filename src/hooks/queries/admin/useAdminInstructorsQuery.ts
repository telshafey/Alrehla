
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';
import type { Instructor } from '../../../lib/database.types';

export const useAdminInstructors = () => useQuery({
    queryKey: ['adminInstructors'],
    queryFn: () => bookingService.getAllInstructors(),
});

export const useAdminInstructorUpdates = () => useQuery({
    queryKey: ['adminInstructorUpdates'],
    queryFn: async () => {
        const instructors = await bookingService.getAllInstructors();
        return instructors.filter(i => i.profile_update_status === 'pending');
    },
});

export const useAdminInstructorPayouts = () => useQuery({
    queryKey: ['adminInstructorPayouts'],
    // This endpoint should ideally exist in financialService, but mocking fallback for now if not implemented
    queryFn: async () => {
        // Replace with real service call when available
        return []; 
    },
});
