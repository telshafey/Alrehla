
import { 
    mockOrders, 
    mockSubscriptions, 
    mockSubscriptionPlans, 
    mockPersonalizedProducts,
    mockServiceOrders
} from '../data/mockData';
import type { 
    Order, 
    Subscription, 
    SubscriptionPlan, 
    PersonalizedProduct, 
    ServiceOrder,
    OrderStatus 
} from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const orderService = {
    // --- Queries ---
    async getAllOrders() {
        if (USE_MOCK) {
            return mockFetch(mockOrders as Order[]);
        }
        return apiClient.get<Order[]>('/admin/orders');
    },

    async getAllSubscriptions() {
        if (USE_MOCK) {
            return mockFetch(mockSubscriptions as Subscription[]);
        }
        return apiClient.get<Subscription[]>('/admin/subscriptions');
    },

    async getSubscriptionPlans() {
        if (USE_MOCK) {
            return mockFetch(mockSubscriptionPlans as SubscriptionPlan[]);
        }
        return apiClient.get<SubscriptionPlan[]>('/admin/subscription-plans');
    },

    async getPersonalizedProducts() {
        if (USE_MOCK) {
            return mockFetch(mockPersonalizedProducts as PersonalizedProduct[]);
        }
        return apiClient.get<PersonalizedProduct[]>('/admin/personalized-products');
    },

    async getAllServiceOrders() {
        if (USE_MOCK) {
            return mockFetch(mockServiceOrders as ServiceOrder[]);
        }
        return apiClient.get<ServiceOrder[]>('/admin/service-orders');
    },

    // --- Mutations: Orders ---
    async createOrder(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating order (mock)", payload);
            // Simulate email sending for gifts
            const { formData } = payload;
            if (formData?.shippingOption === 'gift' && formData?.sendDigitalCard && formData?.recipientEmail) {
                console.log("Service: Simulating gift email...");
            }
            return mockFetch({ ...payload, id: `ord_${Math.random()}` }, 1000);
        }
        return apiClient.post<Order>('/orders', payload);
    },

    async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
        if (USE_MOCK) {
            console.log("Service: Updating order status (mock)", { orderId, newStatus });
            return mockFetch({ success: true }, 300);
        }
        return apiClient.put<{ success: boolean }>(`/admin/orders/${orderId}/status`, { status: newStatus });
    },

    async updateOrderComment(orderId: string, comment: string) {
        if (USE_MOCK) {
            console.log("Service: Updating order comment (mock)", { orderId, comment });
            return mockFetch({ success: true }, 300);
        }
        return apiClient.put<{ success: boolean }>(`/admin/orders/${orderId}/comment`, { comment });
    },

    async uploadReceipt(itemId: string, itemType: string, receiptFile: File) {
        if (USE_MOCK) {
            console.log("Service: Uploading receipt (mock)", { itemId, fileName: receiptFile.name });
            return mockFetch({ receiptUrl: 'https://example.com/mock-receipt.jpg' }, 1000);
        }
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        formData.append('itemType', itemType);
        return apiClient.post<{ receiptUrl: string }>(`/orders/${itemId}/receipt`, formData);
    },

    async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus) {
        if (USE_MOCK) {
            console.log("Service: Bulk update status (mock)", { orderIds, status });
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>('/admin/orders/bulk-status', { orderIds, status });
    },

    async bulkDeleteOrders(orderIds: string[]) {
        if (USE_MOCK) {
            console.log("Service: Bulk delete orders (mock)", orderIds);
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>('/admin/orders/bulk-delete', { orderIds });
    },

    // --- Mutations: Service Orders ---
    async updateServiceOrderStatus(orderId: string, newStatus: OrderStatus) {
        if (USE_MOCK) {
            console.log("Service: Updating service order status (mock)", { orderId, newStatus });
            return mockFetch({ success: true }, 300);
        }
        return apiClient.put<{ success: boolean }>(`/admin/service-orders/${orderId}/status`, { status: newStatus });
    },

    async assignInstructorToServiceOrder(orderId: string, instructorId: number | null) {
        if (USE_MOCK) {
            console.log("Service: Assigning instructor (mock)", { orderId, instructorId });
            return mockFetch({ success: true }, 300);
        }
        return apiClient.put<{ success: boolean }>(`/admin/service-orders/${orderId}/assign`, { instructorId });
    },

    // --- Mutations: Subscriptions ---
    async createSubscription(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating subscription (mock)", payload);
            return mockFetch({ ...payload, id: `sub_${Math.random()}` }, 1000);
        }
        return apiClient.post<Subscription>('/subscriptions', payload);
    },

    async updateSubscriptionStatus(subscriptionId: string, action: 'pause' | 'cancel' | 'reactivate') {
        if (USE_MOCK) {
            console.log(`Service: ${action} subscription (mock)`, subscriptionId);
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>(`/admin/subscriptions/${subscriptionId}/${action}`, {});
    },

    // --- Mutations: Subscription Plans ---
    async createSubscriptionPlan(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating plan (mock)", payload);
            return mockFetch({ ...payload, id: Math.random() });
        }
        return apiClient.post<SubscriptionPlan>('/admin/subscription-plans', payload);
    },

    async updateSubscriptionPlan(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating plan (mock)", payload);
            return mockFetch(payload);
        }
        return apiClient.put<SubscriptionPlan>(`/admin/subscription-plans/${payload.id}`, payload);
    },

    async deleteSubscriptionPlan(planId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting plan (mock)", planId);
            return mockFetch({ success: true });
        }
        return apiClient.delete<{ success: boolean }>(`/admin/subscription-plans/${planId}`);
    },

    // --- Mutations: Personalized Products ---
    async createPersonalizedProduct(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating product (mock)", payload);
            return mockFetch({ ...payload, id: Math.random() }, 800);
        }
        return apiClient.post<PersonalizedProduct>('/admin/personalized-products', payload);
    },

    async updatePersonalizedProduct(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating product (mock)", payload);
            return mockFetch(payload, 800);
        }
        return apiClient.put<PersonalizedProduct>(`/admin/personalized-products/${payload.id}`, payload);
    },

    async deletePersonalizedProduct(productId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting product (mock)", productId);
            return mockFetch({ success: true });
        }
        return apiClient.delete<{ success: boolean }>(`/admin/personalized-products/${productId}`);
    }
};
