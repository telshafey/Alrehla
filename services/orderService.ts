
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { storageService } from './storageService'; // Keeping for potential future use if needed for non-image docs
import { reportingService } from './reportingService';
import type { 
    Order, 
    Subscription, 
    SubscriptionPlan, 
    PersonalizedProduct, 
    ServiceOrder,
    OrderStatus 
} from '../lib/database.types';

// ... (Interfaces omitted for brevity, they remain the same) ...
interface CreateOrderPayload { userId: string; childId: number | null; summary: string; total: number; productKey: string; details: Record<string, any>; receiptUrl?: string; }
interface CreateServiceOrderPayload { userId: string; childId: number; total: number; receiptUrl?: string; details: any; }
interface CreateSubscriptionPayload { userId: string; childId: number; planId: number; planName: string; durationMonths: number; total: number; shippingCost?: number; receiptUrl?: string; shippingDetails?: any; }
interface CreateProductPayload { key: string; title: string; description: string; features: string[]; price_printed: number | null; price_electronic: number | null; [key: string]: any; }

export const orderService = {
    // --- Queries (SAFE MODE) ---
    async getAllOrders() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, users:profiles!fk_orders_user(name, email), child_profiles:child_profiles!fk_orders_child(name)') 
                .order('order_date', { ascending: false });
                
            if (error) {
                console.warn("getAllOrders failed:", error.message);
                return []; 
            }
            return data as any[];
        } catch (e) {
            return [];
        }
    },

    async getAllSubscriptions() {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data as Subscription[];
        } catch { return []; }
    },

    async getSubscriptionPlans() {
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .is('deleted_at', null)
                .order('price', { ascending: true });
            if (error) return [];
            return data as SubscriptionPlan[];
        } catch { return []; }
    },

    async getPersonalizedProducts() {
        try {
            const { data, error } = await supabase
                .from('personalized_products')
                .select('*')
                .is('deleted_at', null)
                .order('sort_order', { ascending: true });
            if (error) return [];
            return data as PersonalizedProduct[];
        } catch { return []; }
    },

    async getAllServiceOrders() {
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data as ServiceOrder[];
        } catch { return []; }
    },

    // --- Mutations (Keep throwing errors so user knows if action fails) ---
    async createOrder(payload: CreateOrderPayload) {
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const initialStatus: OrderStatus = payload.receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع';
        
        const { data, error } = await (supabase.from('orders') as any).insert([{
            id: orderId,
            user_id: payload.userId,
            child_id: payload.childId, 
            item_summary: payload.summary,
            total: payload.total,
            status: initialStatus,
            details: payload.details,
            receipt_url: payload.receiptUrl || null,
            order_date: new Date().toISOString()
        }]).select().single();

        if (error) throw new Error(error.message);
        
        // Log not strictly needed for customer actions, but good for tracking
        // await reportingService.logAction('CREATE_ORDER', orderId, 'طلب قصة', 'تم إنشاء طلب جديد');
        
        return data as Order;
    },

    async createServiceOrder(payload: CreateServiceOrderPayload) {
        const orderId = `SRV-${Date.now().toString().slice(-6)}`;
        const initialStatus: OrderStatus = payload.receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع';
        
        const { data, error } = await (supabase.from('service_orders') as any).insert([{
            id: orderId,
            user_id: payload.userId,
            child_id: payload.childId,
            service_id: payload.details.serviceId,
            total: payload.total,
            status: initialStatus,
            details: payload.details,
            assigned_instructor_id: payload.details.assigned_instructor_id || null,
            created_at: new Date().toISOString()
        }]).select().single();

        if (error) throw new Error(error.message);
        return data as ServiceOrder;
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await (supabase.from('orders') as any).update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_ORDER', orderId, 'طلب (إنها لك)', `تغيير الحالة إلى: ${newStatus}`);
        return { success: true };
    },

    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await (supabase.from('service_orders') as any).update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_SERVICE_ORDER', orderId, 'طلب خدمة', `تغيير الحالة إلى: ${newStatus}`);
        return { success: true };
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        const { error } = await (supabase.from('service_orders') as any).update({ assigned_instructor_id: instructorId }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('ASSIGN_INSTRUCTOR', orderId, 'طلب خدمة', `تعيين مدرب ID: ${instructorId || 'إلغاء'}`);
        return { success: true };
    },

    async uploadReceipt(itemId: string, itemType: string, receiptFile: File) {
        // Use Cloudinary for Receipts (Images)
        const publicUrl = await cloudinaryService.uploadImage(receiptFile, 'alrehla_receipts');
        
        let table = 'orders';
        if (itemType === 'booking') table = 'bookings';
        else if (itemType === 'subscription') table = 'subscriptions';
        else if (itemType === 'service_order') table = 'service_orders';

        const { error: updateError } = await (supabase.from(table) as any).update({ receipt_url: publicUrl, status: 'بانتظار المراجعة' }).eq('id', itemId);
        if (updateError) throw new Error(updateError.message);
        return { receiptUrl: publicUrl };
    },

    async createSubscription(payload: CreateSubscriptionPayload) {
        const subId = `SUB-${Date.now().toString().slice(-6)}`;
        const initialStatus = payload.receiptUrl ? 'active' : 'pending_payment'; // Auto-active if receipt present for now, or reviewer logic
        
        const { data, error } = await (supabase.from('subscriptions') as any).insert([{
            id: subId,
            user_id: payload.userId,
            child_id: payload.childId,
            plan_id: payload.planId,
            plan_name: payload.planName,
            start_date: new Date().toISOString(),
            next_renewal_date: new Date(new Date().setMonth(new Date().getMonth() + payload.durationMonths)).toISOString(),
            status: initialStatus,
            total: payload.total,
            shipping_cost: payload.shippingCost || 0,
            details: payload.shippingDetails, // Store shipping info
            created_at: new Date().toISOString()
        }]).select().single();
        
        if (error) throw new Error(error.message);
        return data as Subscription;
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'cancel' | 'reactivate') {
        let status = action === 'pause' ? 'paused' : action === 'cancel' ? 'cancelled' : 'active';
        const { error } = await (supabase.from('subscriptions') as any).update({ status }).eq('id', subscriptionId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_SUBSCRIPTION', subscriptionId, 'اشتراك صندوق', `إجراء: ${action} (الحالة الجديدة: ${status})`);
        return { success: true };
    },

    async uploadOrderFile(file: File, folder: string = 'alrehla_orders') {
        // Use Cloudinary for order receipts/images in checkout
        return cloudinaryService.uploadImage(file, folder);
    },

    async updateOrderComment(orderId: string, comment: string) {
        const { error } = await (supabase.from('orders') as any).update({ admin_comment: comment }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
        const { error } = await (supabase.from('orders') as any).update({ status }).in('id', orderIds);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('BULK_UPDATE_ORDERS', 'multiple', `${orderIds.length} طلبات`, `تحديث الحالة إلى: ${status}`);
        return { success: true };
    },

    async bulkDeleteOrders(orderIds: string[]) {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('BULK_DELETE_ORDERS', 'multiple', `${orderIds.length} طلبات`, `حذف نهائي`);
        return { success: true };
    },

    async createSubscriptionPlan(payload: Partial<SubscriptionPlan>) {
        const payloadWithId = {
            ...payload,
            id: payload.id || Math.floor(Math.random() * 2147483647)
        };
        const { data, error } = await (supabase.from('subscription_plans') as any).insert([payloadWithId]).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('CREATE_PLAN', 'new', 'باقة اشتراك', `باقة جديدة: ${payload.name}`);
        return data as SubscriptionPlan;
    },

    async updateSubscriptionPlan(payload: Partial<SubscriptionPlan>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("Plan ID is required");
        const { data, error } = await (supabase.from('subscription_plans') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_PLAN', id.toString(), 'باقة اشتراك', `تحديث تفاصيل الباقة`);
        return data as SubscriptionPlan;
    },

    async deleteSubscriptionPlan(planId: number) {
        const { error } = await (supabase.from('subscription_plans') as any).update({ deleted_at: new Date().toISOString() }).eq('id', planId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('DELETE_PLAN', planId.toString(), 'باقة اشتراك', `حذف (أرشفة) الباقة`);
        return { success: true };
    },

    async createPersonalizedProduct(payload: CreateProductPayload) {
        const { data, error } = await (supabase.from('personalized_products') as any).insert([payload]).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('CREATE_PRODUCT', 'new', 'منتج مخصص', `منتج جديد: ${payload.title}`);
        return data as PersonalizedProduct;
    },

    async updatePersonalizedProduct(payload: Partial<PersonalizedProduct>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("Product ID is required");
        const { data, error } = await (supabase.from('personalized_products') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_PRODUCT', id.toString(), 'منتج مخصص', `تحديث بيانات المنتج: ${updates.title || ''}`);
        return data as PersonalizedProduct;
    },

    async deletePersonalizedProduct(productId: number) {
        const { error } = await (supabase.from('personalized_products') as any).update({ deleted_at: new Date().toISOString() }).eq('id', productId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('DELETE_PRODUCT', productId.toString(), 'منتج مخصص', `حذف (أرشفة) المنتج`);
        return { success: true };
    }
};
