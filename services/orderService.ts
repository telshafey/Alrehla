
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

    // --- Helpers ---
    async uploadOrderFile(file: File, path: string): Promise<string> {
        // نستخدم دلو (Bucket) اسمه 'uploads' أو 'receipts'. تأكد من إنشائه في Supabase Dashboard
        // أو نستخدم 'public' كمجلد عام إذا لم تكن الصلاحيات معقدة
        const bucketName = 'receipts'; 
        
        // تنظيف اسم الملف لتجنب مشاكل الرموز العربية
        const fileExt = file.name.split('.').pop();
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${path}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            // محاولة إنشاء الباكيت إذا لم يكن موجوداً (للمحاكاة فقط، في الواقع يجب إنشاؤه يدوياً)
            console.error(`Upload failed to ${bucketName}:`, uploadError);
            throw new Error(`فشل رفع الملف: ${uploadError.message}. تأكد من إعداد Storage في Supabase.`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // --- Mutations: Orders ---
    async createOrder(payload: any) {
        // payload expects: { userId, summary, total, status, details, childId?, receiptUrl? }
        
        const orderId = `ord_${Date.now()}`;
        
        // التأكد من أن details كائن صالح
        const orderDetails = payload.details || {};
        
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.childId || null, 
                item_summary: payload.summary,
                total: payload.total,
                status: 'بانتظار المراجعة',
                details: orderDetails,
                receipt_url: payload.receiptUrl || null,
                order_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Database Insert Error:", error);
            throw new Error(error.message);
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
        // 1. Upload File
        const publicUrl = await this.uploadOrderFile(receiptFile, `receipts/${itemType}_${itemId}`);

        // 2. Update Table based on type
        let table = 'orders';
        if (itemType === 'booking') table = 'bookings';
        if (itemType === 'subscription') table = 'subscriptions';

        const { error: updateError } = await supabase
            .from(table)
            .update({ 
                receipt_url: publicUrl,
                status: 'بانتظار المراجعة' // تغيير الحالة لتنبيه الإدارة
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
        const subId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{
                id: subId,
                user_id: payload.userId,
                child_id: payload.childId || null, 
                plan_id: payload.planId,
                plan_name: payload.planName,
                start_date: new Date().toISOString(),
                next_renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                status: 'pending_payment',
                total: payload.total
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
