
import { supabase } from '../lib/supabaseClient';
import type { Order, CreativeWritingBooking, ServiceOrder, Subscription, Instructor, SubscriptionPlan } from '../lib/database.types';

const safeFetch = async <T>(promise: Promise<{ data: T | null; error: any }>, defaultValue: T): Promise<T> => {
    try {
        const { data, error } = await promise;
        if (error) {
            console.warn(`Reporting Service Warning: ${error.message}`);
            return defaultValue;
        }
        return data || defaultValue;
    } catch (e) {
        console.error("Reporting Service Exception:", e);
        return defaultValue;
    }
};

export const reportingService = {
    async getFinancialOverview() {
        const [
            orders,
            bookings,
            serviceOrders,
            subscriptions,
            subscriptionPlans,
            payouts
        ] = await Promise.all([
            safeFetch(supabase.from('orders').select('*'), [] as Order[]),
            safeFetch(supabase.from('bookings').select('*'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*'), [] as ServiceOrder[]),
            safeFetch(supabase.from('subscriptions').select('*'), [] as Subscription[]),
            safeFetch(supabase.from('subscription_plans').select('*'), [] as SubscriptionPlan[]),
            safeFetch(supabase.from('instructor_payouts').select('*'), [])
        ]);

        return { orders, bookings, serviceOrders, subscriptions, subscriptionPlans, payouts };
    },

    async getInstructorFinancials() {
        const [instructors, bookings, serviceOrders, payouts] = await Promise.all([
            safeFetch(supabase.from('instructors').select('id, name, rate_per_session').is('deleted_at', null), [] as Instructor[]),
            safeFetch(supabase.from('bookings').select('*').eq('status', 'مكتمل'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*').eq('status', 'مكتمل'), [] as ServiceOrder[]),
            safeFetch(supabase.from('instructor_payouts').select('*'), [])
        ]);

        return instructors.map(instructor => {
            const totalBookingRevenue = bookings.filter(b => b.instructor_id === instructor.id).reduce((sum, b) => sum + b.total, 0);
            const totalServiceRevenue = serviceOrders.filter(s => s.assigned_instructor_id === instructor.id).reduce((sum, s) => sum + s.total, 0);
            const estimatedEarnings = (totalBookingRevenue + totalServiceRevenue) * 0.70;
            const totalPaid = payouts.filter((p: any) => p.instructor_id === instructor.id).reduce((sum, p: any) => sum + p.amount, 0);

            return {
                id: instructor.id,
                name: instructor.name,
                totalEarnings: estimatedEarnings,
                totalPaid: totalPaid,
                outstandingBalance: estimatedEarnings - totalPaid,
                rawCompletedBookings: bookings.filter(b => b.instructor_id === instructor.id),
                rawCompletedServices: serviceOrders.filter(s => s.assigned_instructor_id === instructor.id),
                payouts: payouts.filter((p: any) => p.instructor_id === instructor.id)
            };
        });
    },

    async getRevenueStreams() {
        return this.getFinancialOverview();
    },

    async getTransactionsLog() {
        const data = await this.getFinancialOverview();
        const instructors = await safeFetch(supabase.from('instructors').select('id, name'), []);
        return { ...data, instructors };
    },

    async getReportData(reportType: 'orders' | 'users' | 'instructors', filters: any) {
        let query;
        if (reportType === 'orders') {
            query = supabase.from('orders').select('*, users(name), child_profiles(name)');
            if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
            if (filters.startDate) query = query.gte('order_date', filters.startDate);
            if (filters.endDate) query = query.lte('order_date', filters.endDate);
            return safeFetch(query, []);
        } else if (reportType === 'users') {
            query = supabase.from('profiles').select('*');
            if (filters.startDate) query = query.gte('created_at', filters.startDate);
            if (filters.endDate) query = query.lte('created_at', filters.endDate);
            return safeFetch(query, []);
        } else if (reportType === 'instructors') {
            return safeFetch(supabase.from('instructors').select('*'), []);
        }
        return [];
    },

    // تفعيل سجل النشاطات الحقيقي
    async getAuditLogs(filters: any) {
        let query = supabase.from('audit_logs').select('*');
        
        if (filters.startDate) query = query.gte('timestamp', filters.startDate);
        if (filters.endDate) query = query.lte('timestamp', filters.endDate);
        if (filters.actionType && filters.actionType !== 'all') query = query.eq('action', filters.actionType);
        if (filters.userId && filters.userId !== 'all') query = query.eq('user_id', filters.userId);

        const { data, error } = await query.order('timestamp', { ascending: false });
        
        if (error) {
            console.warn("Audit logs fetch error (table might be missing):", error.message);
            return [];
        }
        return data || [];
    }
};
