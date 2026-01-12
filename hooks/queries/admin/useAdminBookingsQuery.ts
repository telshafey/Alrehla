
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';
import type { CreativeWritingBooking } from '../../../lib/database.types';

// The helper transformation function is removed as we now fetch joined data directly
// Old `transformCwBookings` can be removed if no longer used by other components.

interface UseAdminBookingsOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    statusFilter?: string;
}

export const useAdminRawCwBookings = (options: UseAdminBookingsOptions = {}) => useQuery({
    queryKey: ['adminRawCwBookings', options],
    queryFn: async () => {
        const { bookings, count } = await bookingService.getAllBookings(options);
        return { bookings, count };
    },
    placeholderData: keepPreviousData,
});

// Helper for components that relied on the transformed data structure
// Since the new service returns joined data (child_profiles, etc), we just map it to match expected keys if needed.
// However, the new service returns { bookings: [...], count } so components using this hook need updating.
