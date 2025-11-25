
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
    mockCommunicationSettings,
    mockSiteBranding // Import mock branding
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
            // Check LocalStorage for overrides with safety checks
            let content = mockSiteContent;
            try {
                const storedContent = localStorage.getItem('alrehla_site_content');
                if (storedContent) {
                    content = { ...mockSiteContent, ...JSON.parse(storedContent) };
                }
            } catch (e) {
                console.error("Failed to parse site content from storage", e);
            }

            let branding = mockSiteBranding;
            try {
                const storedBranding = localStorage.getItem('alrehla_branding');
                if (storedBranding) {
                    branding = { ...mockSiteBranding, ...JSON.parse(storedBranding) };
                }
            } catch (e) {
                console.error("Failed to parse branding from storage", e);
            }

            // Simulate fetching all public data in parallel
            const [
                instructors,
                blogPosts,
                personalizedProducts,
                creativeWritingPackages,
                siteContentResult,
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
                mockFetch(content), // Return the localStorage content or mock
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
                siteContent: siteContentResult,
                socialLinks,
                publicHolidays,
                subscriptionPlans,
                standaloneServices,
                communicationSettings,
            } as PublicData;
        },
        staleTime: 0, // Ensure we get fresh data if localStorage changes
    });
};
