import { useQuery } from '@tanstack/react-query';
import {
    mockUsers, mockChildProfiles, mockOrders, mockBookings, mockPersonalizedProducts, mockInstructors,
    mockCreativeWritingPackages, mockAdditionalServices, mockSiteContent, mockSocialLinks,
    mockSupportTickets, mockJoinRequests, mockBlogPosts, mockSubscriptions, mockSupportSessionRequests,
    mockScheduledSessions
} from '../data/mockData';
import type { UserProfile, ChildProfile, UserProfileWithRelations, CreativeWritingBooking, Instructor, OrderWithRelations, Order, ScheduledSession } from '../lib/database.types';

// Mock async function to simulate network delay
const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

// --- TRANSFORMERS ---

export const transformUsersWithRelations = (users: UserProfile[], children: ChildProfile[]): UserProfileWithRelations[] => {
    const childrenByParentId = new Map<string, ChildProfile[]>();
    children.forEach(child => {
        if (!childrenByParentId.has(child.user_id)) {
            childrenByParentId.set(child.user_id, []);
        }
        childrenByParentId.get(child.user_id)!.push(child);
    });
    return users.map(user => ({
        ...user,
        children: childrenByParentId.get(user.id) || []
    }));
};

export const transformCwBookings = (bookings: CreativeWritingBooking[], children: ChildProfile[], instructors: Instructor[]): (CreativeWritingBooking & { child_profiles: { name: string } | null, instructors: { name: string } | null })[] => {
    return bookings.map(booking => {
        const child = children.find(c => c.id === booking.child_id);
        const instructor = instructors.find(i => i.id === booking.instructor_id);
        return {
            ...booking,
            child_profiles: child ? { name: child.name } : null,
            instructors: instructor ? { name: instructor.name } : null,
        };
    });
};

// --- QUERIES ---

export const useAdminUsers = () => useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => mockFetch(mockUsers) as Promise<UserProfile[]>,
});

export const useAdminAllChildProfiles = () => useQuery({
    queryKey: ['adminAllChildProfiles'],
    queryFn: () => mockFetch(mockChildProfiles) as Promise<ChildProfile[]>,
});

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

export const useAdminRawCwBookings = () => useQuery({
    queryKey: ['adminRawCwBookings'],
    queryFn: () => mockFetch(mockBookings) as Promise<CreativeWritingBooking[]>,
});

export const useAdminInstructors = () => useQuery({
    queryKey: ['adminInstructors'],
    queryFn: () => mockFetch(mockInstructors) as Promise<Instructor[]>,
});

export const useAdminPersonalizedProducts = () => useQuery({
    queryKey: ['adminPersonalizedProducts'],
    queryFn: () => mockFetch(mockPersonalizedProducts),
});

export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: async () => {
        const [packages, services] = await Promise.all([
            mockFetch(mockCreativeWritingPackages),
            mockFetch(mockAdditionalServices)
        ]);
        return { packages, services };
    },
});

export const useAdminSiteContent = () => useQuery({
    queryKey: ['adminSiteContent'],
    queryFn: () => mockFetch(mockSiteContent),
});

export const useAdminSocialLinks = () => useQuery({
    queryKey: ['adminSocialLinks'],
    queryFn: () => mockFetch(mockSocialLinks),
});

export const useAdminSupportTickets = () => useQuery({
    queryKey: ['adminSupportTickets'],
    queryFn: () => mockFetch(mockSupportTickets),
});

export const useAdminJoinRequests = () => useQuery({
    queryKey: ['adminJoinRequests'],
    queryFn: () => mockFetch(mockJoinRequests),
});

export const useAdminBlogPosts = () => useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => mockFetch(mockBlogPosts),
});

export const useAdminSubscriptions = () => useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => mockFetch(mockSubscriptions),
});

export const useAdminInstructorUpdates = () => useQuery({
    queryKey: ['adminInstructorUpdates'],
    queryFn: async () => {
        const instructors: Instructor[] = await mockFetch(mockInstructors) as Instructor[];
        return instructors.filter(i => i.profile_update_status === 'pending');
    },
});

export const useAdminSupportSessionRequests = () => useQuery({
    queryKey: ['adminSupportSessionRequests'],
    queryFn: async () => {
         const requests = await mockFetch(mockSupportSessionRequests);
         const instructors = await mockFetch(mockInstructors);
         const children = await mockFetch(mockChildProfiles);
         return (requests as any[]).map(r => ({
             ...r,
             instructor_name: (instructors as any[]).find(i => i.id === r.instructor_id)?.name || 'N/A',
             child_name: (children as any[]).find(c => c.id === r.child_id)?.name || 'N/A',
         }));
    },
});

export const useAdminScheduledSessions = () => useQuery({
    queryKey: ['adminScheduledSessions'],
    queryFn: async () => {
        const [sessions, instructors, children] = await Promise.all([
            mockFetch(mockScheduledSessions) as Promise<ScheduledSession[]>,
            mockFetch(mockInstructors) as Promise<Instructor[]>,
            mockFetch(mockChildProfiles) as Promise<ChildProfile[]>
        ]);

        return sessions.map(session => ({
            ...session,
            instructor_name: instructors.find(i => i.id === session.instructor_id)?.name || 'غير محدد',
            child_name: children.find(c => c.id === session.child_id)?.name || 'غير محدد',
            type: session.subscription_id ? 'اشتراك' : 'حجز باقة',
        }));
    },
});