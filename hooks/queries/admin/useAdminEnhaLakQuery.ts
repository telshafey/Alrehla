
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/orderService';
import type { OrderWithRelations } from '../../../lib/database.types';

export const useAdminOrders = () => useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
        // Data is already joined in the service layer using Supabase foreign keys
        const orders = await orderService.getAllOrders();
        return orders as OrderWithRelations[];
    },
});

export const useAdminSubscriptions = () => useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => orderService.getAllSubscriptions(),
});

export const useAdminSubscriptionPlans = () => useQuery({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: () => orderService.getSubscriptionPlans(),
});

export const useAdminPersonalizedProducts = () => useQuery({
    queryKey: ['adminPersonalizedProducts'],
    queryFn: () => orderService.getPersonalizedProducts(),
});
