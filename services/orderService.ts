
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
        // Use Supabase Join to fetch related user and child profile data directly
        const { data, error } = await supabase
            .from('orders')
            .select('*, users:profiles!fk_orders_user(name, email), child_profiles:child_profiles!fk_orders_child(name)') 
            .order('order_date', { ascending: false });
            
        if (error) {
            console.error("Error fetching orders:", error);
            throw new Error(error.message);
        }
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
            .is('deleted_at', null) // Filter deleted plans
            .order('price', { ascending: true });
        if (error) throw new Error(error.message);
        return data as SubscriptionPlan[];
    },

    async getPersonalizedProducts() {
        const { data, error } = await supabase
            .from('personalized_products')
            .select('*')
            .is('deleted_at', null) // Only fetch active products
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

    // --- Helpers ---
    async uploadOrderFile(file: File, folderName: string): Promise<string> {
        // Use Cloudinary Service instead of Supabase Storage
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
    
    async createSubscriptionPlan(payload: any) { 
        const { id, ...rest } = payload;
        const { data, error } = await supabase
            .from('subscription_plans')
            .insert([rest])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },
    
    async updateSubscriptionPlan(payload: any) { 
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('subscription_plans')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as SubscriptionPlan;
    },

    async deleteSubscriptionPlan(planId: number) { 
        // Implement Soft Delete for Plans
        const { error } = await supabase
            .from('subscription_plans')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', planId);

        if (error) throw new Error(error.message);
        return { success: true }; 
    },
    
    // Personalized Products CRUD
    async createPersonalizedProduct(payload: any) { 
         const { id, ...rest } = payload;
         const { data, error } = await supabase
            .from('personalized_products')
            .insert([rest])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    async updatePersonalizedProduct(payload: any) { 
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('personalized_products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as PersonalizedProduct;
    },

    async deletePersonalizedProduct(productId: number) { 
        // Implement Soft Delete
        const { error } = await supabase
            .from('personalized_products')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', productId);
            
        if (error) throw new Error(error.message);
        return { success: true }; 
    }
};
