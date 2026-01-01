
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import type { 
    Order, 
    Subscription, 
    SubscriptionPlan, 
    PersonalizedProduct, 
    ServiceOrder,
    OrderStatus 
} from '../lib/database.types';

export const orderService = {
    // --- Queries ---
    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*, users:profiles!fk_orders_user(name, email), child_profiles:child_profiles!fk_orders_child(name)') 
            .order('order_date', { ascending: false });
            
        if (error) throw new Error(error.message);
        return data as any[];
    },

    async getAllSubscriptions() {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as Subscription[];
    },

    async getSubscriptionPlans() {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .is('deleted_at', null)
            .order('price', { ascending: true });
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan[];
    },

    async getPersonalizedProducts() {
        const { data, error } = await supabase
            .from('personalized_products')
            .select('*')
            .is('deleted_at', null)
            .order('sort_order', { ascending: true });
        if (error) throw new Error(error.message);
        return data as PersonalizedProduct[];
    },

    async getAllServiceOrders() {
        const { data, error } = await supabase
            .from('service_orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as ServiceOrder[];
    },

    // --- Mutations ---
    async createOrder(payload: any) {
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const safeDetails = payload.details || {};
        const initialStatus: OrderStatus = payload.receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع';
        
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.childId || null, 
                item_summary: payload.summary,
                total: payload.total,
                status: initialStatus,
                details: safeDetails,
                receipt_url: payload.receiptUrl || null,
                order_date: new Date().toISOString()
            }])
            .select().single();

        if (error) throw new Error(error.message);
        return data as Order;
    },

    async createServiceOrder(payload: any) {
        const orderId = `SRV-${Date.now().toString().slice(-6)}`;
        const initialStatus: OrderStatus = payload.receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع';
        
        const { data, error } = await supabase
            .from('service_orders')
            .insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.childId,
                service_id: payload.details.serviceId,
                total: payload.total,
                status: initialStatus,
                details: payload.details,
                assigned_instructor_id: payload.details.assigned_instructor_id || null,
                created_at: new Date().toISOString()
            }])
            .select().single();

        if (error) throw new Error(error.message);
        return data as ServiceOrder;
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await supabase.from('service_orders').update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        const { error } = await supabase.from('service_orders').update({ assigned_instructor_id: instructorId }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async uploadReceipt(itemId: string, itemType: string, receiptFile: File) {
        const publicUrl = await cloudinaryService.uploadImage(receiptFile, 'alrehla_receipts');
        let table = 'orders';
        if (itemType === 'booking') table = 'bookings';
        else if (itemType === 'subscription') table = 'subscriptions';
        else if (itemType === 'service_order') table = 'service_orders';

        const { error: updateError } = await supabase.from(table).update({ receipt_url: publicUrl, status: 'بانتظار المراجعة' }).eq('id', itemId);
        if (updateError) throw new Error(updateError.message);
        return { receiptUrl: publicUrl };
    },

    async createSubscription(payload: any) {
        const subId = `SUB-${Date.now().toString().slice(-6)}`;
        const startDate = new Date();
        const renewalDate = new Date(startDate);
        renewalDate.setMonth(renewalDate.getMonth() + (payload.durationMonths || 1)); 

        const { data: child } = await supabase.from('child_profiles').select('name').eq('id', payload.childId).single();
        const { data: user } = await supabase.from('profiles').select('name').eq('id', payload.userId).single();

        const { data, error } = await supabase.from('subscriptions').insert([{
            id: subId,
            user_id: payload.userId,
            child_id: payload.childId,
            plan_id: payload.planId,
            plan_name: payload.planName,
            start_date: startDate.toISOString(),
            next_renewal_date: renewalDate.toISOString(),
            status: 'pending_payment',
            total: payload.total,
            user_name: user?.name || 'Unknown',
            child_name: child?.name || 'Unknown',
            shipping_cost: payload.shippingCost || 0
        }]).select().single();

        if (error) throw new Error(error.message);
        return data as Subscription;
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'cancel' | 'reactivate') {
        let status = action === 'pause' ? 'paused' : action === 'cancel' ? 'cancelled' : 'active';
        const { error } = await supabase.from('subscriptions').update({ status }).eq('id', subscriptionId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Fix: Property 'uploadOrderFile' does not exist on type 'orderService'
    async uploadOrderFile(file: File, folder: string = 'alrehla_orders') {
        return cloudinaryService.uploadImage(file, folder);
    },

    // Fix: Property 'updateOrderComment' does not exist on type 'orderService'
    async updateOrderComment(orderId: string, comment: string) {
        const { error } = await supabase.from('orders').update({ admin_comment: comment }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Fix: Property 'bulkUpdateOrderStatus' does not exist on type 'orderService'
    async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
        const { error } = await supabase.from('orders').update({ status }).in('id', orderIds);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Fix: Property 'bulkDeleteOrders' does not exist on type 'orderService'
    async bulkDeleteOrders(orderIds: string[]) {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Fix: Property 'createSubscriptionPlan' does not exist on type 'orderService'
    async createSubscriptionPlan(payload: any) {
        const { data, error } = await supabase.from('subscription_plans').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },

    // Fix: Property 'updateSubscriptionPlan' does not exist on type 'orderService'
    async updateSubscriptionPlan(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('subscription_plans').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },

    // Fix: Property 'deleteSubscriptionPlan' does not exist on type 'orderService'
    async deleteSubscriptionPlan(planId: number) {
        const { error } = await supabase.from('subscription_plans').update({ deleted_at: new Date().toISOString() }).eq('id', planId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Fix: Property 'createPersonalizedProduct' does not exist on type 'orderService'
    async createPersonalizedProduct(payload: any) {
        const { data, error } = await supabase.from('personalized_products').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    // Fix: Property 'updatePersonalizedProduct' does not exist on type 'orderService'
    async updatePersonalizedProduct(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('personalized_products').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    // Fix: Property 'deletePersonalizedProduct' does not exist on type 'orderService'
    async deletePersonalizedProduct(productId: number) {
        const { error } = await supabase.from('personalized_products').update({ deleted_at: new Date().toISOString() }).eq('id', productId);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
