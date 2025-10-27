import { useQuery } from '@tanstack/react-query';
import {
    mockUsers, mockChildProfiles, mockOrders, mockBookings, mockPersonalizedProducts, mockInstructors,
    mockCreativeWritingPackages, mockAdditionalServices, mockSiteContent, mockSupportTickets, mockJoinRequests,
    mockBlogPosts, mockSubscriptions, mockSocialLinks, mockScheduledSessions, mockSupportSessionRequests
} from '../data/mockData';
import type { UserProfileWithRelations, ScheduledSession, ChildProfile, CreativeWritingBooking, SupportSessionRequest, Instructor } from '../lib/database.types';

// Mock async function to simulate network delay
const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));


// --- ADMIN DATA ---
export const useAdminUsers = () => useQuery({ queryKey: ['adminUsers'], queryFn: () => mockFetch(mockUsers) });
export const useAdminUsersWithRelations = () => useQuery({
    queryKey: ['adminUsersWithRelations'],
    queryFn: async (): Promise<UserProfileWithRelations[]> => {
        const users = await mockFetch(mockUsers) as any[];
        const children = await mockFetch(mockChildProfiles) as any[];
        return users.map(u => ({
            ...u,
            children: children.filter(c => c.user_id === u.id)
        }));
    }
});
export const useAdminAllChildProfiles = () => useQuery({ queryKey: ['adminAllChildProfiles'], queryFn: () => mockFetch(mockChildProfiles) });
export const useAdminOrders = () => useQuery({ 
    queryKey: ['adminOrders'], 
    queryFn: async () => {
        const orders = await mockFetch(mockOrders) as any[];
        const users = await mockFetch(mockUsers) as any[];
        return orders.map(o => ({...o, users: users.find(u => u.id === o.user_id)}));
    }
});
export const useAdminCwBookings = () => useQuery({
    queryKey: ['adminCwBookings'],
    queryFn: async () => {
        const bookings = await mockFetch(mockBookings) as any[];
        const children = await mockFetch(mockChildProfiles) as any[];
        const instructors = await mockFetch(mockInstructors) as any[];
        return bookings.map(b => ({
            ...b,
            child_profiles: children.find(c => c.id === b.child_id),
            instructors: instructors.find(i => i.id === b.instructor_id)
        }));
    }
});
export const useAdminPersonalizedProducts = () => useQuery({ queryKey: ['adminPersonalizedProducts'], queryFn: () => mockFetch(mockPersonalizedProducts) });
export const useAdminInstructors = () => useQuery({ queryKey: ['adminInstructors'], queryFn: () => mockFetch(mockInstructors) });
export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: () => mockFetch({ packages: mockCreativeWritingPackages, services: mockAdditionalServices })
});
export const useAdminSiteContent = () => useQuery({ queryKey: ['adminSiteContent'], queryFn: () => mockFetch(mockSiteContent) });
export const useAdminSocialLinks = () => useQuery({ queryKey: ['adminSocialLinks'], queryFn: () => mockFetch(mockSocialLinks) });
export const useAdminSupportTickets = () => useQuery({ queryKey: ['adminSupportTickets'], queryFn: () => mockFetch(mockSupportTickets) });
export const useAdminJoinRequests = () => useQuery({ queryKey: ['adminJoinRequests'], queryFn: () => mockFetch(mockJoinRequests) });
export const useAdminBlogPosts = () => useQuery({ queryKey: ['adminBlogPosts'], queryFn: () => mockFetch(mockBlogPosts) });
export const useAdminSubscriptions = () => useQuery({ queryKey: ['adminSubscriptions'], queryFn: () => mockFetch(mockSubscriptions) });
export const useAdminInstructorUpdates = () => useQuery({
    queryKey: ['adminInstructorUpdates'],
    queryFn: () => mockFetch(mockInstructors.filter(i => i.profile_update_status === 'pending')),
});
export const useAdminSupportSessionRequests = () => useQuery({
    queryKey: ['adminSupportSessionRequests'],
    queryFn: async () => {
        const requests = await mockFetch(mockSupportSessionRequests) as SupportSessionRequest[];
        const instructors = await mockFetch(mockInstructors) as Instructor[];
        const children = await mockFetch(mockChildProfiles) as ChildProfile[];

        return requests.map(req => ({
            ...req,
            instructor_name: instructors.find(i => i.id === req.instructor_id)?.name || 'غير معروف',
            child_name: children.find(c => c.id === req.child_id)?.name || 'غير معروف',
        }));
    }
});


// --- INSTRUCTOR DATA ---
export const useInstructorScheduledSessions = () => {
    return useQuery({
        queryKey: ['instructorScheduledSessions'],
        queryFn: async () => {
            // In a real app, you'd filter by instructor ID from the current user.
            // For mock, we'll assume instructor_id 1, linked to user usr_instructor.
            const instructorId = 1;
            const sessions = await mockFetch(mockScheduledSessions.filter(s => s.instructor_id === instructorId)) as ScheduledSession[];
            const children = await mockFetch(mockChildProfiles) as ChildProfile[];
            
            return sessions.map(session => ({
                ...session,
                child: children.find(c => c.id === session.child_id)
            }));
        },
    });
};
export const useInstructorDashboardData = () => useQuery({
    queryKey: ['instructorDashboardData'],
    queryFn: async () => {
        // Assume instructor_id 1 for mock data, linked to user usr_instructor
        const instructorId = 1;
        const bookings = (await mockFetch(mockBookings) as CreativeWritingBooking[]).filter(b => b.instructor_id === instructorId);
        const children = await mockFetch(mockChildProfiles) as ChildProfile[];

        // Process students data
        const studentMap = new Map<number, { id: number; name: string; avatar_url: string | null; bookings: CreativeWritingBooking[] }>();
        bookings.forEach(booking => {
            const child = children.find(c => c.id === booking.child_id);
            if (child) {
                if (!studentMap.has(child.id)) {
                    studentMap.set(child.id, { id: child.id, name: child.name, avatar_url: child.avatar_url, bookings: [] });
                }
                studentMap.get(child.id)!.bookings.push(booking);
            }
        });

        const students = Array.from(studentMap.values()).map(student => ({
            ...student,
            totalSessions: student.bookings.length,
            completedSessions: student.bookings.filter(b => b.status === 'مكتمل').length,
        }));

        // Process monthly stats for the current year
        const monthlyStatsMap = new Map<string, number>();
        const currentYear = new Date().getFullYear();
        bookings.forEach(booking => {
            if(booking.status !== 'مكتمل') return;
            const bookingDate = new Date(booking.booking_date);
            if (bookingDate.getFullYear() === currentYear) {
                const month = bookingDate.toLocaleString('ar-EG', { month: 'long' });
                monthlyStatsMap.set(month, (monthlyStatsMap.get(month) || 0) + 1);
            }
        });

        const monthOrder = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const monthlyStats = monthOrder
            .filter(month => monthlyStatsMap.has(month))
            .map(month => ({
                label: month,
                value: monthlyStatsMap.get(month)!,
                color: '#4f46e5', // Indigo color
            }));
            
        return { students, monthlyStats };
    }
});
