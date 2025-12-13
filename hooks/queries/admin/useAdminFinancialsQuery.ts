
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/orderService';
import { bookingService } from '../../../services/bookingService';
import { reportingService } from '../../../services/reportingService'; // Assuming this uses DB now

export const useAdminFinancialsQuery = () => {
    return useQuery({
        queryKey: ['adminFinancials'],
        queryFn: async () => {
            // Fetch real data
            const [orders, bookings, subscriptions, serviceOrders, instructors, packages, services] = await Promise.all([
                orderService.getAllOrders(),
                bookingService.getAllBookings(),
                orderService.getAllSubscriptions(),
                orderService.getAllServiceOrders(),
                bookingService.getAllInstructors(),
                // For settings/packages we usually fetch via public or dedicated settings service
                // Assuming services/packages available in bookingService or publicService logic
                // Using publicService indirectly or dedicated calls if available.
                // For simplicity here, we might need dedicated admin getters if not public.
                // Let's rely on reportingService aggregates if available, otherwise fetch manually.
                // Re-using the manual fetch pattern:
                import('../../../services/publicService').then(m => m.publicService.getAllPublicData().then(d => d.creativeWritingPackages)),
                import('../../../services/publicService').then(m => m.publicService.getAllPublicData().then(d => d.standaloneServices)),
            ]);

            // Note: Payouts usually have their own table. 
            // If `instructor_payouts` table exists, add a service method for it.
            // For now returning empty array for payouts if service not ready.
            const payouts: any[] = []; 

            return { 
                orders, 
                bookings, 
                subscriptions, 
                payouts, 
                instructors, 
                serviceOrders, 
                packages, 
                services 
            };
        },
    });
};
