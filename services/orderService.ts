
import { supabase } from '../lib/supabaseClient';
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
            .select('*')
            .order('order_date', { ascending: false });
        if (error) throw new Error(error.message);
        return data as Order[];
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
            .order('price', { ascending: true });
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan[];
    },

    async getPersonalizedProducts() {
        const { data, error } = await supabase
            .from('personalized_products')
            .select('*')
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

    // --- Mutations: Orders ---
    async createOrder(payload: any) {
        // Generate a random ID if not provided (Client-side generation for ID)
        // Ideally, use the database default if it's auto-generated, but 'orders.id' is text PK.
        const orderId = `ord_${Math.floor(Math.random() * 1000000)}`;
        
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.payload.details.childId || payload.payload.childId, // Adjust based on payload structure
                item_summary: payload.summary,
                total: payload.totalPrice || payload.total,
                status: 'بانتظار الدفع',
                details: payload.payload.details || payload.payload.formData,
                order_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Order;
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async updateOrderComment(orderId: string, comment: string) {
        const { error } = await supabase
            .from('orders')
            .update({ admin_comment: comment })
            .eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async uploadReceipt(itemId: string, itemType: string, receiptFile: File) {
        // 1. Upload file to Storage (Assuming 'receipts' bucket exists)
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${itemType}_${itemId}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Note: You need to create a bucket named 'receipts' in Supabase
        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, receiptFile);

        if (uploadError) {
            console.error("Storage error:", uploadError);
            throw new Error('فشل رفع الملف. تأكد من إعدادات التخزين (Storage Bucket).');
        }

        const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath);

        // 2. Update the record
        const table = itemType === 'order' ? 'orders' : itemType === 'booking' ? 'bookings' : 'subscriptions';
        const { error: updateError } = await supabase
            .from(table)
            .update({ 
                receipt_url: publicUrl,
                status: 'بانتظار المراجعة' // Auto update status
            })
            .eq('id', itemId);

        if (updateError) throw new Error(updateError.message);
        return { receiptUrl: publicUrl };
    },

    async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .in('id', orderIds);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async bulkDeleteOrders(orderIds: string[]) {
        const { error } = await supabase
            .from('orders')
            .delete()
            .in('id', orderIds);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Service Orders ---
    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await supabase
            .from('service_orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        const { error } = await supabase
            .from('service_orders')
            .update({ assigned_instructor_id: instructorId })
            .eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Subscriptions ---
    async createSubscription(payload: any) {
        const subId = `sub_${Math.floor(Math.random() * 1000000)}`;
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                id: subId,
                user_id: payload.userId,
                child_id: 1, // Need to fix this in the payload structure to send child ID
                plan_id: payload.payload.plan.id,
                plan_name: payload.payload.plan.name,
                start_date: new Date().toISOString(),
                next_renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                status: 'pending_payment',
                total: payload.payload.total
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Subscription;
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'cancel' | 'reactivate') {
        const statusMap = {
            pause: 'paused',
            cancel: 'cancelled',
            reactivate: 'active'
        };
        
        const { error } = await supabase
            .from('subscriptions')
            .update({ status: statusMap[action] })
            .eq('id', subscriptionId);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Subscription Plans ---
    async createSubscriptionPlan(payload: any) {
        const { data, error } = await supabase
            .from('subscription_plans')
            .insert([payload])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },

    async updateSubscriptionPlan(payload: any) {
        const { data, error } = await supabase
            .from('subscription_plans')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },

    async deleteSubscriptionPlan(planId: number) {
        const { error } = await supabase
            .from('subscription_plans')
            .delete()
            .eq('id', planId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Personalized Products ---
    async createPersonalizedProduct(payload: any) {
        const { data, error } = await supabase
            .from('personalized_products')
            .insert([payload])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    async updatePersonalizedProduct(payload: any) {
        const { data, error } = await supabase
            .from('personalized_products')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    async deletePersonalizedProduct(productId: number) {
        const { error } = await supabase
            .from('personalized_products')
            .delete()
            .eq('id', productId);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
