
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { reportingService } from './reportingService';
import type { 
    Order, 
    Subscription, 
    SubscriptionPlan, 
    PersonalizedProduct, 
    ServiceOrder,
    OrderStatus 
} from '../lib/database.types';

// --- Type Definitions ---
interface CreateOrderPayload {
    userId: string;
    childId: number | null;
    summary: string;
    total: number;
    productKey: string;
    details: Record<string, any>;
    receiptUrl?: string;
}

interface CreateServiceOrderPayload {
    userId: string;
    childId: number;
    total: number;
    receiptUrl?: string;
    details: {
        serviceId: number;
        serviceName: string;
        userNotes?: string;
        fileName?: string;
        assigned_instructor_id?: number | null;
        [key: string]: any;
    };
}

interface CreateSubscriptionPayload {
    userId: string;
    childId: number;
    planId: number;
    planName: string;
    durationMonths: number;
    total: number;
    shippingCost?: number;
    receiptUrl?: string;
    shippingDetails?: any; 
}

interface CreateProductPayload {
    key: string;
    title: string;
    description: string;
    features: string[];
    price_printed: number | null;
    price_electronic: number | null;
    [key: string]: any;
}

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
        
        await reportingService.logAction('UPDATE_ORDER_STATUS', orderId, `طلب رقم #${orderId}`, `تغيير الحالة إلى: ${newStatus}`);
        return { success: true };
    },

    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        const { error } = await (supabase.from('service_orders') as any).update({ status: newStatus }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_SERVICE_STATUS', orderId, `طلب خدمة #${orderId}`, `تغيير الحالة إلى: ${newStatus}`);
        return { success: true };
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        const { error } = await (supabase.from('service_orders') as any).update({ assigned_instructor_id: instructorId }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('ASSIGN_INSTRUCTOR', orderId, `طلب خدمة #${orderId}`, `تعيين مدرب معرف: ${instructorId}`);
        return { success: true };
    },

    async uploadReceipt(itemId: string, itemType: string, receiptFile: File) {
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
        const startDate = new Date();
        const renewalDate = new Date(startDate);
        renewalDate.setMonth(renewalDate.getMonth() + (payload.durationMonths || 1)); 

        const { data: child } = await supabase.from('child_profiles').select('name').eq('id', payload.childId).single();
        const { data: user } = await supabase.from('profiles').select('name').eq('id', payload.userId).single();

        const { data, error } = await (supabase.from('subscriptions') as any).insert([{
            id: subId,
            user_id: payload.userId,
            child_id: payload.childId,
            plan_id: payload.planId,
            plan_name: payload.planName,
            start_date: startDate.toISOString(),
            next_renewal_date: renewalDate.toISOString(),
            status: 'pending_payment',
            total: payload.total,
            user_name: user ? user.name : 'Unknown',
            child_name: child ? child.name : 'Unknown',
            shipping_cost: payload.shippingCost || 0
        }]).select().single();

        if (error) throw new Error(error.message);
        return data as Subscription;
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'cancel' | 'reactivate') {
        let status = action === 'pause' ? 'paused' : action === 'cancel' ? 'cancelled' : 'active';
        const { error } = await (supabase.from('subscriptions') as any).update({ status }).eq('id', subscriptionId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_SUBSCRIPTION', subscriptionId, `اشتراك #${subscriptionId}`, `إجراء: ${action}`);
        return { success: true };
    },

    async uploadOrderFile(file: File, folder: string = 'alrehla_orders') {
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
        
        await reportingService.logAction('BULK_ORDER_UPDATE', 'multiple', `${orderIds.length} طلبات`, `تغيير الحالة مجمع إلى: ${status}`);
        return { success: true };
    },

    async bulkDeleteOrders(orderIds: string[]) {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('BULK_ORDER_DELETE', 'multiple', `${orderIds.length} طلبات`, `حذف مجمع للطلبات`);
        return { success: true };
    },

    async createSubscriptionPlan(payload: Partial<SubscriptionPlan>) {
        const { data, error } = await (supabase.from('subscription_plans') as any).insert([payload]).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('CREATE_SUB_PLAN', data.id.toString(), `باقة اشتراك: ${data.name}`, `إنشاء باقة جديدة بسعر ${data.price}`);
        return data as SubscriptionPlan;
    },

    async updateSubscriptionPlan(payload: Partial<SubscriptionPlan>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("Plan ID is required");
        const { data, error } = await (supabase.from('subscription_plans') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_SUB_PLAN', id.toString(), `باقة اشتراك: ${data.name}`, `تحديث بيانات الباقة`);
        return data as SubscriptionPlan;
    },

    async deleteSubscriptionPlan(planId: number) {
        const { error } = await (supabase.from('subscription_plans') as any).update({ deleted_at: new Date().toISOString() }).eq('id', planId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('DELETE_SUB_PLAN', planId.toString(), `باقة اشتراك ID: ${planId}`, `حذف ناعم للباقة`);
        return { success: true };
    },

    async createPersonalizedProduct(payload: CreateProductPayload) {
        const { data, error } = await (supabase.from('personalized_products') as any).insert([payload]).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('CREATE_PRODUCT', data.id.toString(), `منتج: ${data.title}`, `إضافة منتج جديد للمتجر`);
        return data as PersonalizedProduct;
    },

    async updatePersonalizedProduct(payload: Partial<PersonalizedProduct>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("Product ID is required");
        const { data, error } = await (supabase.from('personalized_products') as any).update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('UPDATE_PRODUCT', id.toString(), `منتج: ${data.title}`, `تحديث بيانات المنتج`);
        return data as PersonalizedProduct;
    },

    async deletePersonalizedProduct(productId: number) {
        const { error } = await (supabase.from('personalized_products') as any).update({ deleted_at: new Date().toISOString() }).eq('id', productId);
        if (error) throw new Error(error.message);
        
        await reportingService.logAction('DELETE_PRODUCT', productId.toString(), `منتج ID: ${productId}`, `حذف ناعم للمنتج`);
        return { success: true };
    }
};
