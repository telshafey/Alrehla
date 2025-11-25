
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../../services/orderService';
import { userService } from '../../../services/userService';
import type { OrderWithRelations } from '../../../lib/database.types';

export const useAdminOrders = () => useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
        const [orders, users, children] = await Promise.all([
            orderService.getAllOrders(),
            userService.getAllUsers(),
            userService.getAllChildProfiles()
        ]);

        return orders.map(order => {
            const user = users.find(u => u.id === order.user_id);
            const child = children.find(c => c.id === order.child_id);
            return {
                ...order,
                users: user ? { name: user.name, email: user.email } : null,
                child_profiles: child ? { name: child.name } : null,
            };
        }) as OrderWithRelations[];
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
