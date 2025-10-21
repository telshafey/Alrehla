import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Database, Subscription, PersonalizedProduct, Instructor, CreativeWritingBooking, JoinRequest, SupportTicket, BlogPost, ChildProfile, SocialLinks, CreativeWritingPackage } from '../lib/database.types.ts';
import type { UserProfile } from '../contexts/AuthContext.tsx';
import {
    mockPersonalizedProducts,
    mockCreativeWritingPackages,
    mockInstructors,
    mockBlogPosts,
    mockSocialLinks,
    mockOrders,
    mockBookings,
    mockSubscriptions,
    mockUsers,
    mockSiteContent,
    mockJoinRequests,
    mockSupportTickets,
    mockChildProfiles
} from '../data/mockData.ts';

const MOCK_API_DELAY = 300; // ms

// --- Individual Fetcher Functions ---

const fetchPublicData = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve({
        personalizedProducts: mockPersonalizedProducts,
        cw_packages: mockCreativeWritingPackages,
        instructors: mockInstructors,
        blogPosts: mockBlogPosts.filter(p => p.status === 'published'),
        socialLinks: mockSocialLinks
    });
};

const fetchUserAccountData = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const userOrders = mockOrders.filter(o => o.user_id === userId);
    const userBookings = mockBookings.filter(b => b.user_id === userId);
    const userSubscriptions = mockSubscriptions.filter(s => s.user_id === userId);

    return Promise.resolve({
        userOrders,
        userBookings,
        userSubscriptions
    });
};


const fetchStudentDashboardData = async (childId: number) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const studentBookings = mockBookings.filter(b => b.child_id === childId);
    return Promise.resolve({ studentBookings });
};

const fetchAdminUsers = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockUsers);
};

const fetchAdminOrders = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockOrders);
};

const fetchAdminCwBookings = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockBookings);
};

const fetchAdminSubscriptions = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockSubscriptions);
};

const fetchAdminPersonalizedProducts = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockPersonalizedProducts);
};

const fetchAdminInstructors = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockInstructors);
};

const fetchAdminSiteContent = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockSiteContent);
};

const fetchAdminBlogPosts = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockBlogPosts);
};

const fetchAdminSupportTickets = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockSupportTickets);
};

const fetchAdminJoinRequests = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockJoinRequests);
};

const fetchAdminSocialLinks = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockSocialLinks);
};

const fetchAdminAllChildProfiles = async () => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    return Promise.resolve(mockChildProfiles);
};

const fetchInstructorDashboardData = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const instructor = mockInstructors.find(i => i.user_id === userId);
    if (!instructor) return Promise.resolve({ instructorBookings: [] });
    
    const instructorBookings = mockBookings.filter(b => b.instructor_id === instructor.id);
    return Promise.resolve({ instructorBookings });
};


// --- Custom Hooks ---

export const usePublicData = () => {
    return useQuery({
        queryKey: ['publicData'],
        queryFn: fetchPublicData,
    });
};

export const useUserAccountData = () => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: ['userAccountData', currentUser?.id],
        queryFn: () => fetchUserAccountData(currentUser!.id),
        enabled: !!currentUser,
    });
};


export const useStudentDashboardData = () => {
    const { currentChildProfile } = useAuth();
    return useQuery({
        queryKey: ['studentDashboardData', currentChildProfile?.id],
        queryFn: () => fetchStudentDashboardData(currentChildProfile!.id),
        enabled: !!currentChildProfile,
    });
};

export const useAdminUsers = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminUsers'], queryFn: fetchAdminUsers, enabled: hasAdminAccess });
};
export const useAdminOrders = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminOrders'], queryFn: fetchAdminOrders, enabled: hasAdminAccess });
};
export const useAdminCwBookings = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminCwBookings'], queryFn: fetchAdminCwBookings, enabled: hasAdminAccess });
};
export const useAdminSubscriptions = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminSubscriptions'], queryFn: fetchAdminSubscriptions, enabled: hasAdminAccess });
};
export const useAdminPersonalizedProducts = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminPersonalizedProducts'], queryFn: fetchAdminPersonalizedProducts, enabled: hasAdminAccess });
};
export const useAdminInstructors = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminInstructors'], queryFn: fetchAdminInstructors, enabled: hasAdminAccess });
};
export const useAdminSiteContent = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminSiteContent'], queryFn: fetchAdminSiteContent, enabled: hasAdminAccess });
};
export const useAdminBlogPosts = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminBlogPosts'], queryFn: fetchAdminBlogPosts, enabled: hasAdminAccess });
};
export const useAdminSupportTickets = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminSupportTickets'], queryFn: fetchAdminSupportTickets, enabled: hasAdminAccess });
};
export const useAdminJoinRequests = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminJoinRequests'], queryFn: fetchAdminJoinRequests, enabled: hasAdminAccess });
};
export const useAdminSocialLinks = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminSocialLinks'], queryFn: fetchAdminSocialLinks, enabled: hasAdminAccess });
};
export const useAdminAllChildProfiles = () => {
    const { hasAdminAccess } = useAuth();
    return useQuery({ queryKey: ['adminAllChildProfiles'], queryFn: fetchAdminAllChildProfiles, enabled: hasAdminAccess });
};
export const useInstructorDashboardData = () => {
    const { currentUser } = useAuth();
    return useQuery({
        queryKey: ['instructorDashboardData', currentUser?.id],
        queryFn: () => fetchInstructorDashboardData(currentUser!.id),
        enabled: !!currentUser && currentUser.role === 'instructor',
    });
};