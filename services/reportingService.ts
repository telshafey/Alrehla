
import { supabase } from '../lib/supabaseClient';
import type { Order, CreativeWritingBooking, ServiceOrder, Subscription, Instructor, SubscriptionPlan } from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'admin_audit_logs_backup';

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
    // وظيفة توثيق النشاطات الإدارية (نظام هجين)
    async logAction(action: string, targetId: string, targetDesc: string, details: string) {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            
            // 1. تجهيز بيانات السجل
            const logEntry = {
                id: uuidv4(), // إنشاء معرف فريد محلياً
                user_id: user?.id || null,
                action: action,
                target_description: `${targetDesc} (#${targetId})`,
                details: details,
                timestamp: new Date().toISOString()
            };

            // 2. محاولة الحفظ في قاعدة البيانات
            const { error } = await (supabase.from('audit_logs') as any).insert([{
                user_id: logEntry.user_id,
                action: logEntry.action,
                target_description: logEntry.target_description,
                details: logEntry.details,
                timestamp: logEntry.timestamp
            }]);

            // 3. في حال الفشل، الحفظ في التخزين المحلي كنسخة احتياطية
            if (error) {
                console.warn("Audit DB insert failed, using LocalStorage fallback:", error.message);
                
                try {
                    const localLogs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
                    localLogs.unshift(logEntry);
                    // الاحتفاظ بآخر 50 عملية فقط لتجنب امتلاء التخزين
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localLogs.slice(0, 50)));
                } catch (lsError) {
                    console.error("LocalStorage write failed:", lsError);
                }
            }
            
        } catch (e) {
            console.warn("Audit logging failed silently", e);
        }
    },

    async getAuditLogs(filters: any) {
        let dbLogs: any[] = [];
        
        // 1. محاولة جلب البيانات من قاعدة البيانات
        try {
            let query = supabase.from('audit_logs').select('*');
            if (filters.startDate) query = query.gte('timestamp', filters.startDate);
            if (filters.endDate) query = query.lte('timestamp', filters.endDate);
            if (filters.actionType && filters.actionType !== 'all') query = query.eq('action', filters.actionType);
            if (filters.userId && filters.userId !== 'all') query = query.eq('user_id', filters.userId);

            const { data, error } = await query.order('timestamp', { ascending: false });
            
            if (!error && data) {
                dbLogs = data;
            } else if (error) {
                console.warn("Failed to fetch audit logs from DB, falling back to local.", error.message);
            }
        } catch (e) {
            console.warn("DB connection error for audit logs", e);
        }

        // 2. جلب البيانات المحلية (التي فشل إرسالها للسيرفر)
        let localLogs: any[] = [];
        try {
            localLogs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            
            // تطبيق الفلاتر على البيانات المحلية
            if (filters.startDate) localLogs = localLogs.filter((l: any) => l.timestamp >= filters.startDate);
            if (filters.endDate) localLogs = localLogs.filter((l: any) => l.timestamp <= filters.endDate);
            if (filters.actionType && filters.actionType !== 'all') localLogs = localLogs.filter((l: any) => l.action === filters.actionType);
        } catch (e) {
            console.error("Failed to parse local logs", e);
        }

        // 3. دمج البيانات وإزالة التكرار (بناءً على التوقيت والتفاصيل)
        const combinedLogs = [...localLogs, ...dbLogs];
        
        // إزالة التكرار البسيط
        const uniqueLogsMap = new Map();
        combinedLogs.forEach(log => {
            const key = `${log.timestamp}-${log.action}-${log.details}`;
            if (!uniqueLogsMap.has(key)) {
                uniqueLogsMap.set(key, log);
            }
        });
        const uniqueLogs = Array.from(uniqueLogsMap.values());

        // ترتيب نهائي
        uniqueLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // 4. إثراء البيانات بأسماء المستخدمين
        const userIds = [...new Set(uniqueLogs.map(l => l.user_id).filter(Boolean))];
        let userMap: Record<string, string> = {};

        if (userIds.length > 0) {
             const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', userIds);
             if (profiles) {
                 profiles.forEach((p: any) => userMap[p.id] = p.name);
             }
        }

        const enrichedLogs = uniqueLogs.map(l => ({
            ...l,
            user_name: userMap[l.user_id] || l.user_name || 'مسؤول النظام'
        }));

        const types = Array.from(new Set(enrichedLogs.map(l => l.action)));
        return { logs: enrichedLogs, actionTypes: types };
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
    }
};
