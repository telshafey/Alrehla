import { useQuery } from '@tanstack/react-query';
import { mockOrders, mockSubscriptions, mockPersonalizedProducts, mockUsers, mockChildProfiles } from '../../../data/mockData';
import type { Order, OrderWithRelations, UserProfile, ChildProfile, PersonalizedProduct, Subscription } from '../../../lib/database.types';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));


export const useAdminOrders = () => useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
        const orders: Order[] = await mockFetch(mockOrders) as Order[];
        const users: UserProfile[] = await mockFetch(mockUsers) as UserProfile[];
        const children: ChildProfile[] = await mockFetch(mockChildProfiles) as ChildProfile[];

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
    queryFn: () => mockFetch(mockSubscriptions) as Promise<Subscription[]>,
});

export const useAdminPersonalizedProducts = () => useQuery({
    queryKey: ['adminPersonalizedProducts'],
    queryFn: () => mockFetch(mockPersonalizedProducts) as Promise<PersonalizedProduct[]>,
});
