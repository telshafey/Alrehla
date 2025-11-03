import { useQuery } from '@tanstack/react-query';
import {
    mockOrders,
    mockBookings,
    mockSubscriptions,
    mockInstructorPayouts,
    mockInstructors,
    mockServiceOrders,
    mockCreativeWritingPackages,
    mockStandaloneServices,
    mockSubscriptionPlans,
} from '../../../data/mockData';
import type { Instructor, CreativeWritingBooking, CreativeWritingPackage, ServiceOrder, StandaloneService, Order, Subscription, InstructorPayout, SubscriptionPlan } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

// Query for FinancialOverviewPage
export const useFinancialsOverview = () => {
    return useQuery({
        queryKey: ['adminFinancialsOverview'],
        queryFn: async () => {
            const [orders, bookings, serviceOrders, subscriptions, payouts, subscriptionPlans] = await Promise.all([
                mockFetch(mockOrders) as Promise<Order[]>,
                mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
                mockFetch(mockServiceOrders) as Promise<ServiceOrder[]>,
                mockFetch(mockSubscriptions) as Promise<Subscription[]>,
                mockFetch(mockInstructorPayouts) as Promise<InstructorPayout[]>,
                mockFetch(mockSubscriptionPlans) as Promise<SubscriptionPlan[]>,
            ]);
            return { orders, bookings, serviceOrders, subscriptions, payouts, subscriptionPlans };
        },
    });
};

// Query for InstructorPayoutsPage
export const useInstructorFinancials = () => {
    return useQuery({
        queryKey: ['adminInstructorFinancials'],
        queryFn: async () => {
            const [instructors, bookings, serviceOrders, payouts, packages, services] = await Promise.all([
                mockFetch(mockInstructors) as Promise<Instructor[]>,
                mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
                mockFetch(mockServiceOrders) as Promise<ServiceOrder[]>,
                mockFetch(mockInstructorPayouts) as Promise<InstructorPayout[]>,
                mockFetch(mockCreativeWritingPackages) as Promise<CreativeWritingPackage[]>,
                mockFetch(mockStandaloneServices) as Promise<StandaloneService[]>,
            ]);
            
            return instructors.map(instructor => {
                const completedBookings = bookings.filter(b => b.instructor_id === instructor.id && b.status === 'مكتمل');
                const completedServices = serviceOrders.filter(so => so.assigned_instructor_id === instructor.id && so.status === 'مكتمل');
                
                const totalBookingEarnings = completedBookings.reduce((sum, b) => {
                    const pkg = packages.find(p => p.name === b.package_name);
                    return sum + (instructor.package_rates?.[pkg?.id as any] || 0);
                }, 0);
    
                const totalServiceEarnings = completedServices.reduce((sum, so) => {
                     const service = services.find(s => s.id === so.service_id);
                     return sum + (instructor.service_rates?.[service?.id as any] || 0);
                }, 0);
    
                const totalEarnings = totalBookingEarnings + totalServiceEarnings;
                const instructorPayouts = payouts.filter(p => p.instructor_id === instructor.id);
                const totalPaid = instructorPayouts.reduce((sum, p) => sum + p.amount, 0);
                const outstandingBalance = totalEarnings - totalPaid;
    
                return {
                    id: instructor.id,
                    name: instructor.name,
                    totalEarnings,
                    totalPaid,
                    outstandingBalance,
                    payouts: instructorPayouts,
                };
            });
        },
    });
};

// Query for RevenueStreamsPage
export const useRevenueStreams = () => {
    return useQuery({
        queryKey: ['adminRevenueStreams'],
        queryFn: async () => {
            const [orders, bookings, serviceOrders, subscriptions] = await Promise.all([
                mockFetch(mockOrders) as Promise<Order[]>,
                mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
                mockFetch(mockServiceOrders) as Promise<ServiceOrder[]>,
                mockFetch(mockSubscriptions) as Promise<Subscription[]>,
            ]);
            return { orders, bookings, serviceOrders, subscriptions };
        },
    });
};

// Query for TransactionsLogPage
export const useTransactionsLog = () => {
     return useQuery({
        queryKey: ['adminTransactionsLog'],
        queryFn: async () => {
            const [orders, bookings, serviceOrders, payouts, instructors] = await Promise.all([
                mockFetch(mockOrders) as Promise<Order[]>,
                mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
                mockFetch(mockServiceOrders) as Promise<ServiceOrder[]>,
                mockFetch(mockInstructorPayouts) as Promise<InstructorPayout[]>,
                mockFetch(mockInstructors) as Promise<Instructor[]>,
            ]);
             return { orders, bookings, serviceOrders, payouts, instructors };
        },
    });
};
