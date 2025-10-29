import { useQuery } from '@tanstack/react-query';
import {
    mockInstructors,
    mockBlogPosts,
    mockPersonalizedProducts,
    mockCreativeWritingPackages,
    mockSiteContent,
    mockSocialLinks,
    mockPublicHolidays,
    mockSubscriptionPlans,
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const usePublicData = () => {
    return useQuery({
        queryKey: ['publicData'],
        queryFn: async () => {
            // In a real app, these would be separate API calls.
            // Here we fetch them all at once for simplicity in mock mode.
            const data = {
                instructors: await mockFetch(mockInstructors),
                blogPosts: await mockFetch(mockBlogPosts),
                personalizedProducts: await mockFetch(mockPersonalizedProducts),
                creativeWritingPackages: await mockFetch(mockCreativeWritingPackages),
                siteContent: await mockFetch(mockSiteContent),
                socialLinks: await mockFetch(mockSocialLinks),
                publicHolidays: await mockFetch(mockPublicHolidays),
                subscriptionPlans: await mockFetch(mockSubscriptionPlans),
            };
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};