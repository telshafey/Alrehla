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
    mockStandaloneServices,
    mockCommunicationSettings
} from '../../../data/mockData';
import type {
    Instructor,
    BlogPost,
    PersonalizedProduct,
    CreativeWritingPackage,
    SiteContent,
    SocialLinks,
    SubscriptionPlan,
    StandaloneService,
    CommunicationSettings
} from '../../../lib/database.types';

// Define the shape of the data returned
interface PublicData {
    instructors: Instructor[];
    blogPosts: BlogPost[];
    personalizedProducts: PersonalizedProduct[];
    creativeWritingPackages: CreativeWritingPackage[];
    siteContent: SiteContent;
    socialLinks: SocialLinks;
    publicHolidays: string[];
    subscriptionPlans: SubscriptionPlan[];
    standaloneServices: StandaloneService[];
    communicationSettings: CommunicationSettings;
}

// A helper to simulate network latency
const mockFetch = (data: any, delay = 150) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const usePublicData = () => {
    return useQuery<PublicData>({
        queryKey: ['publicData'],
        queryFn: async () => {
            // Simulate fetching all public data in parallel, just like a real API call would.
            const [
                instructors,
                blogPosts,
                personalizedProducts,
                creativeWritingPackages,
                siteContent,
                socialLinks,
                publicHolidays,
                subscriptionPlans,
                standaloneServices,
                communicationSettings
            ] = await Promise.all([
                mockFetch(mockInstructors),
                mockFetch(mockBlogPosts),
                mockFetch(mockPersonalizedProducts),
                mockFetch(mockCreativeWritingPackages),
                mockFetch(mockSiteContent),
                mockFetch(mockSocialLinks),
                mockFetch(mockPublicHolidays),
                mockFetch(mockSubscriptionPlans),
                mockFetch(mockStandaloneServices),
                mockFetch(mockCommunicationSettings)
            ]);

            // Assemble the data into the expected structure
            return {
                instructors,
                blogPosts,
                personalizedProducts,
                creativeWritingPackages,
                siteContent,
                socialLinks,
                publicHolidays,
                subscriptionPlans,
                standaloneServices,
                communicationSettings,
            } as PublicData;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
