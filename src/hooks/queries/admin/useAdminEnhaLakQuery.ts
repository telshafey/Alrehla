
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orderService } from '../../../services/orderService';
import type { OrderWithRelations } from '../../../lib/database.types';

interface UseAdminOrdersOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    statusFilter?: string;
}

export const useAdminOrders = (options: UseAdminOrdersOptions = {}) => {
    return useQuery({
        queryKey: ['adminOrders', options],
        queryFn: async () => {
            const { orders, count } = await orderService.getAllOrders(options);
            return { orders: orders as OrderWithRelations[], count };
        },
        placeholderData: keepPreviousData,
    });
};

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
