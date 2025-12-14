
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
            .select('*') 
            .order('order_date', { ascending: false });
            
        if (error) {
            console.error("Error fetching orders:", error);
            return [];
        }
        return data as any[];
    },

    async getAllSubscriptions() {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return [];
        return data as Subscription[];
    },

    async getSubscriptionPlans() {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true });
        if (error) return [];
        return data as SubscriptionPlan[];
    },

    async getPersonalizedProducts() {
        const { data, error } = await supabase
            .from('personalized_products')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) return [];
        return data as PersonalizedProduct[];
    },

    async getAllServiceOrders() {
        const { data, error } = await supabase
            .from('service_orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return [];
        return data as ServiceOrder[];
    },

    // --- Helpers ---
    async uploadOrderFile(file: File, folderName: string): Promise<string> {
        // Use Cloudinary Service instead of Supabase Storage
        // Note: folderName logic in Cloudinary is a bit different, but we pass it as 'folder' param
        return await cloudinaryService.uploadImage(file, folderName);
    },

    // --- Mutations: Orders ---
    async createOrder(payload: any) {
        // payload expects: { userId, summary, total, status, details, childId?, receiptUrl? }
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        
        // Ensure details is a valid object
        const safeDetails = payload.details || {};
        
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.childId || null, 
                item_summary: payload.summary,
                total: payload.total,
                status: 'بانتظار المراجعة',
                details: safeDetails,
                receipt_url: payload.receiptUrl || null,
                order_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Database Insert Error:", error);
            throw new Error(`فشل حفظ الطلب في قاعدة البيانات: ${error.message}`);
        }
        
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
        // Upload to Cloudinary under 'alrehla_receipts' folder
        const publicUrl = await cloudinaryService.uploadImage(receiptFile, 'alrehla_receipts');

        let table = 'orders';
        if (itemType === 'booking') table = 'bookings';
        if (itemType === 'subscription') table = 'subscriptions';

        const { error: updateError } = await supabase
            .from(table)
            .update({ 
                receipt_url: publicUrl,
                status: 'بانتظار المراجعة'
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

    // --- Placeholders for other mutations ---
    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) { return { success: true }; },
    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) { return { success: true }; },
    async createSubscription(payload: any) { return {} as Subscription; },
    async updateSubscriptionStatus(subscriptionId: string, action: string) { return { success: true }; },
    async createSubscriptionPlan(payload: any) { return {} as SubscriptionPlan; },
    async updateSubscriptionPlan(payload: any) { return {} as SubscriptionPlan; },
    async deleteSubscriptionPlan(planId: number) { return { success: true }; },
    async createPersonalizedProduct(payload: any) { return {} as PersonalizedProduct; },
    async updatePersonalizedProduct(payload: any) { return {} as PersonalizedProduct; },
    async deletePersonalizedProduct(productId: number) { return { success: true }; }
};
