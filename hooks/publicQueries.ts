import { useQuery } from '@tanstack/react-query';
import {
    mockPersonalizedProducts, mockInstructors,
    mockCreativeWritingPackages, mockBlogPosts, mockSiteContent, mockSocialLinks
} from '../data/mockData';

// Mock async function to simulate network delay
const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

// --- PUBLIC DATA ---
export const usePublicData = () => {
    return useQuery({
        queryKey: ['publicData'],
        queryFn: async () => {
            const data = {
                personalizedProducts: await mockFetch(mockPersonalizedProducts),
                instructors: await mockFetch(mockInstructors),
                cw_packages: await mockFetch(mockCreativeWritingPackages),
                blogPosts: await mockFetch(mockBlogPosts.filter(p => p.status === 'published')),
                siteContent: await mockFetch(mockSiteContent),
                socialLinks: await mockFetch(mockSocialLinks),
            };
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
