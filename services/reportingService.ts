
import { supabase } from '../lib/supabaseClient';
import type { Order, UserProfile, Instructor } from '../lib/database.types';

// Temporarily disabling MOCK to force DB usage, 
// but we implement direct Supabase calls since API endpoints like /admin/reports don't exist in a pure client-side Supabase setup.
const USE_MOCK = false;

// Helper to safely fetch data or return default
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
    // --- Financials ---
    async getFinancialOverview() {
        const [
            orders,
            bookings,
            serviceOrders,
            subscriptions,
            subscriptionPlans
        ] = await Promise.all([
            safeFetch(supabase.from('orders').select('*'), []),
            safeFetch(supabase.from('bookings').select('*'), []),
            safeFetch(supabase.from('service_orders').select('*'), []),
            safeFetch(supabase.from('subscriptions').select('*'), []),
            // supabase.from('instructor_payouts').select('*'), // Assuming table exists
            safeFetch(supabase.from('subscription_plans').select('*'), []),
        ]);

        return { 
            orders, 
            bookings, 
            serviceOrders, 
            subscriptions, 
            payouts: [], // payouts || [] 
            subscriptionPlans 
        };
    },

    async getInstructorFinancials() {
        // This requires complex joining. For client-side, we fetch all and join in JS as done in hooks/useAdminFinancialsQuery
        // We can reuse that logic or duplicate fetch here.
        // Returning minimal structure to avoid breaking the app
        const instructors = await safeFetch(supabase.from('instructors').select('*'), []);
        return instructors;
    },

    async getRevenueStreams() {
        // Similar to overview
        return this.getFinancialOverview();
    },

    async getTransactionsLog() {
        // Similar to overview
        return this.getFinancialOverview();
    },

    // --- Custom Reports ---
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
            // Complex aggregation usually needed. Returning raw instructors for now.
            return safeFetch(supabase.from('instructors').select('*'), []);
        }
        
        return [];
    },

    // --- Audit Logs ---
    async getAuditLogs(filters: any) {
        // Ensure table exists first in your SQL schema. 
        // If not, we return empty to prevent crash.
        const { data, error } = await supabase.from('audit_logs').select('*');
        if (error) {
            // console.warn("Audit logs table might not exist.", error.message);
            return [];
        }
        return data || [];
    }
};
