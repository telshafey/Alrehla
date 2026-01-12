
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/orderService';
import { bookingService } from '../../../services/bookingService';
import { supabase } from '../../../lib/supabaseClient';

export const useAdminFinancialsQuery = () => {
    return useQuery({
        queryKey: ['adminFinancials'],
        queryFn: async () => {
            // Fetch real data directly
            const [orders, bookings, subscriptions, serviceOrders, instructors, packagesResult, servicesResult] = await Promise.all([
                orderService.getAllOrders(),
                bookingService.getAllBookings(),
                orderService.getAllSubscriptions(),
                orderService.getAllServiceOrders(),
                bookingService.getAllInstructors(),
                supabase.from('creative_writing_packages').select('*'),
                supabase.from('standalone_services').select('*'),
            ]);

            const packages = packagesResult.data || [];
            const services = servicesResult.data || [];

            // Payouts fetch (Real DB table)
            const { data: payouts } = await supabase.from('instructor_payouts').select('*');

            return { 
                orders, 
                bookings, 
                subscriptions, 
                payouts: payouts || [], 
                instructors, 
                serviceOrders, 
                packages, 
                services 
            };
        },
    });
};
