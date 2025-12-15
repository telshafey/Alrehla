
import { supabase } from '../lib/supabaseClient';
import type { Order, CreativeWritingBooking, ServiceOrder, Subscription, Instructor, SubscriptionPlan } from '../lib/database.types';

// Helper to safely fetch data
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
    // --- Financials Overview ---
    async getFinancialOverview() {
        // Fetch all raw data needed for calculation
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
            safeFetch(supabase.from('instructor_payouts').select('*'), []) // New Table
        ]);

        return { 
            orders, 
            bookings, 
            serviceOrders, 
            subscriptions, 
            subscriptionPlans,
            payouts 
        };
    },

    // --- Instructor Financials (Calculated on the fly) ---
    async getInstructorFinancials() {
        // 1. Fetch Data
        // FIX: Add .is('deleted_at', null) to ignore deleted instructors
        const [instructors, bookings, serviceOrders, payouts] = await Promise.all([
            safeFetch(supabase.from('instructors').select('id, name, rate_per_session').is('deleted_at', null), [] as Instructor[]),
            safeFetch(supabase.from('bookings').select('*').eq('status', 'مكتمل'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*').eq('status', 'مكتمل'), [] as ServiceOrder[]),
            safeFetch(supabase.from('instructor_payouts').select('*'), [])
        ]);

        // 2. Aggregate per instructor
        const instructorStats = instructors.map(instructor => {
            // A. Calculate Earnings from Sessions (Bookings)
            
            const totalBookingRevenue = bookings
                .filter(b => b.instructor_id === instructor.id)
                .reduce((sum, b) => sum + b.total, 0);

            const totalServiceRevenue = serviceOrders
                .filter(s => s.assigned_instructor_id === instructor.id)
                .reduce((sum, s) => sum + s.total, 0);

            // Assuming 70% share for instructor
            const estimatedEarnings = (totalBookingRevenue + totalServiceRevenue) * 0.70;

            // B. Calculate Payouts
            const totalPaid = payouts
                .filter((p: any) => p.instructor_id === instructor.id)
                .reduce((sum, p: any) => sum + p.amount, 0);

            return {
                id: instructor.id,
                name: instructor.name,
                totalEarnings: estimatedEarnings, // المستحقات الكلية
                totalPaid: totalPaid, // ما تم صرفه
                outstandingBalance: estimatedEarnings - totalPaid, // المتبقي
                // Pass raw data for details modal
                rawCompletedBookings: bookings.filter(b => b.instructor_id === instructor.id),
                rawCompletedServices: serviceOrders.filter(s => s.assigned_instructor_id === instructor.id),
                payouts: payouts.filter((p: any) => p.instructor_id === instructor.id)
            };
        });

        return instructorStats;
    },

    async getRevenueStreams() {
        return this.getFinancialOverview();
    },

    async getTransactionsLog() {
        const data = await this.getFinancialOverview();
        const instructors = await safeFetch(supabase.from('instructors').select('id, name'), []);
        return { ...data, instructors };
    },

    // --- Reports & Audit ---
    async getReportData(reportType: 'orders' | 'users' | 'instructors', filters: any) {
        let query;

        if (reportType === 'orders') {
            query = supabase.from('orders').select('*, users(name), child_profiles(name)');
            if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
            if (filters.startDate) query = query.gte('order_date', filters.startDate);
            if (filters.endDate) query = query.lte('order_date', filters.endDate);
            
            return safeFetch(query, []);
        } 
        else if (reportType === 'users') {
            query = supabase.from('profiles').select('*');
            if (filters.startDate) query = query.gte('created_at', filters.startDate);
            if (filters.endDate) query = query.lte('created_at', filters.endDate);
            
            return safeFetch(query, []);
        }
        else if (reportType === 'instructors') {
            return safeFetch(supabase.from('instructors').select('*'), []);
        }
        
        return [];
    },

    async getAuditLogs(filters: any) {
        const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        return data || [];
    }
};
