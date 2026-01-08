
import { supabase } from '../lib/supabaseClient';
import type { Order, CreativeWritingBooking, ServiceOrder, Subscription, Instructor, SubscriptionPlan } from '../lib/database.types';

const safeFetch = async <T>(promise: any, defaultValue: T): Promise<T> => {
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
    // وظيفة توثيق النشاطات الإدارية
    async logAction(action: string, targetId: string, targetDesc: string, details: string) {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            
            let userName = 'System';
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
                userName = profile?.name || user.email || 'Admin';
            }

            const logEntry = {
                user_id: user?.id || null,
                user_name: userName,
                action: action,
                target_description: `${targetDesc} (#${targetId})`,
                details: details,
                timestamp: new Date().toISOString()
            };

            await supabase.from('audit_logs').insert([logEntry]);
        } catch (e) {
            console.warn("Audit logging failed silently (non-critical)");
        }
    },

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
        const instructors = await safeFetch(
            supabase.from('instructors').select('id, name, rate_per_session, package_rates, service_rates').is('deleted_at', null), 
            [] as Instructor[]
        );
        
        const [bookings, serviceOrders, payouts] = await Promise.all([
            safeFetch(supabase.from('bookings').select('*').eq('status', 'مكتمل'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*').eq('status', 'مكتمل'), [] as ServiceOrder[]),
            safeFetch(supabase.from('instructor_payouts').select('*'), [])
        ]);

        return instructors.map(instructor => {
            const instructorBookings = bookings.filter(b => b.instructor_id === instructor.id);
            const totalBookingRevenue = instructorBookings.reduce((sum, b) => sum + (b.total || 0), 0);
            const instructorServices = serviceOrders.filter(s => s.assigned_instructor_id === instructor.id);
            const totalServiceRevenue = instructorServices.reduce((sum, s) => sum + (s.total || 0), 0);
            const totalRevenue = totalBookingRevenue + totalServiceRevenue;
            const estimatedEarnings = totalRevenue * 0.70;
            const totalPaid = payouts.filter((p: any) => p.instructor_id === instructor.id).reduce((sum, p: any) => sum + (p.amount || 0), 0);

            return {
                id: instructor.id,
                name: instructor.name,
                totalEarnings: estimatedEarnings,
                totalPaid: totalPaid,
                outstandingBalance: estimatedEarnings - totalPaid,
                rawCompletedBookings: instructorBookings,
                rawCompletedServices: instructorServices,
                payouts: payouts.filter((p: any) => p.instructor_id === instructor.id)
            };
        });
    },

    async getRevenueStreams() {
        const [orders, bookings, serviceOrders, subscriptions] = await Promise.all([
            safeFetch(supabase.from('orders').select('*'), [] as Order[]),
            safeFetch(supabase.from('bookings').select('*'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*'), [] as ServiceOrder[]),
            safeFetch(supabase.from('subscriptions').select('*'), [] as Subscription[])
        ]);
        return { orders, bookings, serviceOrders, subscriptions };
    },

    async getTransactionsLog() {
        const [orders, bookings, serviceOrders, payouts, instructors] = await Promise.all([
            safeFetch(supabase.from('orders').select('*'), [] as Order[]),
            safeFetch(supabase.from('bookings').select('*'), [] as CreativeWritingBooking[]),
            safeFetch(supabase.from('service_orders').select('*'), [] as ServiceOrder[]),
            safeFetch(supabase.from('instructor_payouts').select('*'), []),
            safeFetch(supabase.from('instructors').select('id, name'), [] as Instructor[])
        ]);
        return { orders, bookings, serviceOrders, payouts, instructors };
    },

    async getReportData(reportType: 'orders' | 'users' | 'instructors', filters: any) {
        if (reportType === 'orders') {
            let query = supabase.from('orders').select('*, users:profiles!fk_orders_user(name), child_profiles:child_profiles!fk_orders_child(name)');
            if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
            if (filters.startDate) query = query.gte('order_date', filters.startDate);
            if (filters.endDate) query = query.lte('order_date', filters.endDate);
            return safeFetch(query, []);
        } else if (reportType === 'users') {
            let query = supabase.from('profiles').select('*');
            if (filters.startDate) query = query.gte('created_at', filters.startDate);
            if (filters.endDate) query = query.lte('created_at', filters.endDate);
            if (filters.status && filters.status !== 'all') query = query.eq('role', filters.status);
            return safeFetch(query, []);
        } else if (reportType === 'instructors') {
            const [instructors, bookings, sessions] = await Promise.all([
                safeFetch(supabase.from('instructors').select('*').is('deleted_at', null), []),
                safeFetch(supabase.from('bookings').select('*'), []),
                safeFetch(supabase.from('scheduled_sessions').select('*'), [])
            ]);

            return instructors.map((inst: any) => {
                const instBookings = bookings.filter((b: any) => b.instructor_id === inst.id);
                return {
                    id: inst.id,
                    name: inst.name,
                    specialty: inst.specialty,
                    totalStudents: new Set(instBookings.map((b: any) => b.child_id)).size,
                    totalBookings: instBookings.length,
                    completedSessions: sessions.filter((s: any) => s.instructor_id === inst.id && s.status === 'completed').length,
                    upcomingSessions: sessions.filter((s: any) => s.instructor_id === inst.id && s.status === 'upcoming').length,
                    introSessions: instBookings.filter((b: any) => b.package_name === 'الجلسة التعريفية' && b.status === 'مكتمل').length
                };
            });
        }
        return [];
    },

    async getAuditLogs(filters: any) {
        let query = supabase.from('audit_logs').select('*');
        if (filters.startDate) query = query.gte('timestamp', filters.startDate);
        if (filters.endDate) query = query.lte('timestamp', filters.endDate);
        if (filters.actionType && filters.actionType !== 'all') query = query.eq('action', filters.actionType);
        if (filters.userId && filters.userId !== 'all') query = query.eq('user_id', filters.userId);

        const { data, error } = await query.order('timestamp', { ascending: false });
        if (error) return { logs: [], actionTypes: [] };

        const types = Array.from(new Set((data || []).map(l => l.action)));
        return { logs: data || [], actionTypes: types };
    }
};
