
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
    mockSiteBranding
} from '../data/mockData';
import { mockFetch } from './mockAdapter';

export const publicService = {
    async getAllPublicData() {
        // Check LocalStorage for overrides (CMS simulation)
        let content = mockSiteContent;
        try {
            const storedContent = localStorage.getItem('alrehla_site_content');
            if (storedContent) {
                content = { ...mockSiteContent, ...JSON.parse(storedContent) };
            }
        } catch (e) { console.error(e); }

        let branding = mockSiteBranding;
        try {
            const storedBranding = localStorage.getItem('alrehla_branding');
            if (storedBranding) {
                branding = { ...mockSiteBranding, ...JSON.parse(storedBranding) };
            }
        } catch (e) { console.error(e); }

        // Simulate parallel fetching
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
            mockFetch(content),
            mockFetch(mockSocialLinks),
            mockFetch(mockPublicHolidays),
            mockFetch(mockSubscriptionPlans),
            mockFetch(mockStandaloneServices),
            mockFetch(mockCommunicationSettings)
        ]);

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
            siteBranding: branding // Add branding to return
        };
    }
};
