
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';

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
