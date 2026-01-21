
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';
import { communicationService } from './communicationService';
import type { 
    Order, 
    OrderWithRelations, 
    OrderStatus, 
    Subscription, 
    SubscriptionPlan, 
    PersonalizedProduct, 
    ServiceOrder 
} from '../lib/database.types';

export interface GetOrdersOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    statusFilter?: string;
}

interface CreateOrderPayload { 
    userId: string; 
    childId: number | null; 
    summary: string; 
    total: number; 
    shippingCost: number;
    productKey: string; 
    details: Record<string, any>; 
    receiptUrl?: string; 
}

// Helper to handle Schema Cache errors automatically
const executeWithRetry = async <T>(operation: () => Promise<{ data: T | null; error: any }>): Promise<T | null> => {
    let { data, error } = await operation();
    
    if (!error) return data;

    // Detect Schema Cache issues (PGRST204 or specific error messages)
    const errorMsg = error.message || '';
    if (error.code === 'PGRST204' || errorMsg.includes('schema cache') || errorMsg.includes('Could not find the')) {
        console.warn("⚠️ Stale Cache detected. Attempting to reload and retry...");
        
        // Try calling the RPC to reload cache (requires the RPC to be created in SQL)
        try { await supabase.rpc('reload_schema_cache'); } catch (e) { console.log("RPC reload_schema_cache not found, skipping."); }
        
        // Wait a moment for the cache to refresh
        await new Promise(r => setTimeout(r, 1000));
        
        // Retry the operation
        const res2 = await operation();
        if (!res2.error) return res2.data;
        
        // If it still fails, throw the new error
        throw res2.error;
    }

    throw error;
};

export const orderService = {
    async getAllOrders(options: GetOrdersOptions = {}) {
        const { page = 1, pageSize = 10, search, statusFilter } = options;
        
        let query = supabase
            .from('orders')
            .select('*, users:profiles!fk_orders_user(name, email), child_profiles:child_profiles!fk_orders_child(name)', { count: 'exact' });

        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'active') {
                query = query.neq('status', 'ملغي').neq('status', 'مكتمل').neq('status', 'تم التسليم');
            } else if (statusFilter === 'completed') {
                query = query.in('status', ['مكتمل', 'تم التسليم']);
            } else if (statusFilter === 'cancelled') {
                query = query.eq('status', 'ملغي');
            } else {
                query = query.eq('status', statusFilter);
            }
        }

        if (search) {
            query = query.or(`id.ilike.%${search}%,item_summary.ilike.%${search}%`);
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('order_date', { ascending: false });

        const { data, count, error } = await query;
        if (error) {
            console.error("Fetch orders error", error);
            return { orders: [], count: 0 };
        }
        return { orders: (data || []) as OrderWithRelations[], count: count || 0 };
    },

    async createOrder(payload: CreateOrderPayload) {
        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const initialStatus: OrderStatus = payload.receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع';
        
        return await executeWithRetry(async () => {
             return await (supabase.from('orders') as any).insert([{
                id: orderId,
                user_id: payload.userId,
                child_id: payload.childId, 
                item_summary: payload.summary,
                total: payload.total,
                shipping_cost: payload.shippingCost || 0,
                status: initialStatus,
                details: payload.details,
                receipt_url: payload.receiptUrl || null,
                order_date: new Date().toISOString()
            }]).select().single();
        }).then(async (data: any) => {
             // Notify Admins if receipt is uploaded immediately
            if (payload.receiptUrl) {
                communicationService.notifyAdmins(
                    `طلب جديد: ${payload.summary} (قيد المراجعة)`,
                    `/admin/orders/${orderId}`,
                    'order'
                );
            }
            return data as Order;
        });
    },

    async createSubscription(payload: { userId: string, childId: number, planName: string, durationMonths: number }) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + payload.durationMonths);
        const nextRenewal = new Date();
        nextRenewal.setMonth(startDate.getMonth() + 1);

        return await executeWithRetry(async () => {
             return await (supabase.from('subscriptions') as any).insert([{
                id: uuidv4(),
                user_id: payload.userId,
                child_id: payload.childId,
                plan_name: payload.planName,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                next_renewal_date: nextRenewal.toISOString(),
                status: 'pending_payment'
            }]).select().single();
        }) as Subscription;
    },

    async getAllSubscriptions() {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*, users:profiles!fk_subscriptions_user(name), child_profiles:child_profiles!fk_subscriptions_child(name)');
            
        if (error) return [];
        return (data || []).map((sub: any) => ({
            ...sub,
            user_name: sub.users?.name,
            child_name: sub.child_profiles?.name
        })) as Subscription[];
    },

    async getSubscriptionPlans() {
        const { data, error } = await supabase.from('subscription_plans').select('*').is('deleted_at', null).order('price');
        if (error) return [];
        return data as SubscriptionPlan[];
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'reactivate' | 'cancel') {
        let status = 'active';
        if (action === 'pause') status = 'paused';
        if (action === 'cancel') status = 'cancelled';
        
        return await executeWithRetry(async () => {
             return await (supabase.from('subscriptions') as any)
                .update({ status })
                .eq('id', subscriptionId)
                .select('user_id, plan_name')
                .single();
        }).then((data: any) => {
             // Notify User
            communicationService.sendNotification(
                data.user_id,
                `تم تحديث حالة اشتراكك (${data.plan_name}) إلى: ${status}`,
                '/account',
                'subscription'
            );
            return { success: true };
        });
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
        return await executeWithRetry(async () => {
             return await (supabase.from('orders') as any)
                .update({ status: newStatus })
                .eq('id', orderId)
                .select('user_id, item_summary')
                .single();
        }).then((data: any) => {
             // Notify User
            communicationService.sendNotification(
                data.user_id,
                `تحديث الطلب: ${newStatus} (${data.item_summary})`,
                `/account`,
                'order'
            );
            return { success: true };
        });
    },
    
    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        return await executeWithRetry(async () => {
             return await (supabase.from('service_orders') as any)
                .update({ status: newStatus })
                .eq('id', orderId)
                .select('user_id')
                .single();
        }).then((data: any) => {
             // Notify User
            communicationService.sendNotification(
                data.user_id,
                `تحديث حالة خدمة إبداعية إلى: ${newStatus}`,
                '/account',
                'order'
            );
            return { success: true };
        });
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        const { error } = await (supabase.from('service_orders') as any).update({ assigned_instructor_id: instructorId }).eq('id', orderId);
        if (error) throw new Error(error.message);
        
        // Notify Instructor if assigned
        if (instructorId) {
             const { data: instructor } = await supabase.from('instructors').select('user_id').eq('id', instructorId).single();
             if ((instructor as any)?.user_id) {
                 communicationService.sendNotification((instructor as any).user_id, 'تم تعيينك لخدمة إبداعية جديدة.', '/admin/instructor-financials', 'service');
             }
        }

        return { success: true };
    },

    async updateOrderComment(orderId: string, comment: string) {
        const { error } = await (supabase.from('orders') as any).update({ admin_comment: comment }).eq('id', orderId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async uploadReceipt(itemId: string, itemType: 'order' | 'booking' | 'subscription', receiptFile: File) {
        const folder = `receipts/${itemType}`;
        const url = await storageService.uploadFile(receiptFile, 'receipts', folder);
        
        let table = 'orders';
        if (itemType === 'booking') table = 'bookings';
        if (itemType === 'subscription') table = 'subscriptions';

        const statusUpdate = itemType === 'subscription' ? { status: 'active' } : { status: 'بانتظار المراجعة' };

        return await executeWithRetry(async () => {
             return await (supabase.from(table) as any)
                .update({ receipt_url: url, ...statusUpdate })
                .eq('id', itemId)
                .select('id')
                .single();
        }).then(() => {
             // Notify Admins
            let link = '/admin/orders';
            if (itemType === 'booking') link = '/admin/creative-writing';
            if (itemType === 'subscription') link = '/admin/subscriptions';
            
            communicationService.notifyAdmins(
                `تم رفع إيصال دفع جديد لـ ${itemType} #${itemId}`,
                link,
                'payment'
            );
            return { success: true, url };
        });
    },

    async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
        const { data, error } = await (supabase.from('orders') as any)
            .update({ status })
            .in('id', orderIds)
            .select('user_id');
            
        if (error) throw new Error(error.message);
        
        // Notify Users in bulk (simplified loop)
        if (data) {
            data.forEach((order: any) => {
                 communicationService.sendNotification(order.user_id, `تحديث حالة طلبك إلى: ${status}`, '/account', 'order');
            });
        }
        
        return { success: true };
    },

    async bulkDeleteOrders(orderIds: string[]) {
        const { error } = await supabase.from('orders').delete().in('id', orderIds);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createSubscriptionPlan(plan: Partial<SubscriptionPlan>) {
        const { error } = await (supabase.from('subscription_plans') as any).insert([plan]);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async updateSubscriptionPlan(plan: Partial<SubscriptionPlan> & { id: number }) {
        const { id, ...updates } = plan;
        const { error } = await (supabase.from('subscription_plans') as any).update(updates).eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async deleteSubscriptionPlan(planId: number) {
        const { error } = await (supabase.from('subscription_plans') as any).update({ deleted_at: new Date().toISOString() }).eq('id', planId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async getPersonalizedProducts() {
        const { data, error } = await supabase.from('personalized_products').select('*').is('deleted_at', null).order('sort_order');
        if (error) return [];
        return data as PersonalizedProduct[];
    },

    async createPersonalizedProduct(product: Partial<PersonalizedProduct>) {
        const { error } = await (supabase.from('personalized_products') as any).insert([product]);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async updatePersonalizedProduct(product: Partial<PersonalizedProduct> & { id: number }) {
        const { id, ...updates } = product;
        const { error } = await (supabase.from('personalized_products') as any).update(updates).eq('id', id);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async deletePersonalizedProduct(productId: number) {
        const { error } = await (supabase.from('personalized_products') as any).update({ deleted_at: new Date().toISOString() }).eq('id', productId);
        if (error) throw new Error(error.message);
        return { success: true };
    },
    
    async getAllServiceOrders() {
        const { data, error } = await supabase.from('service_orders').select('*').order('created_at', { ascending: false });
        if (error) return [];
        return data as ServiceOrder[];
    }
};
