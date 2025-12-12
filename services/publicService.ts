
import { supabase } from '../lib/supabaseClient';
import {
    mockSiteContent,
    mockSocialLinks,
    mockPublicHolidays,
    mockCommunicationSettings,
    mockSiteBranding
} from '../data/mockData';

// Mock Fetch Helper for static content
const mockFetch = (data: any, delay = 100) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const publicService = {
    async getAllPublicData() {
        // 1. Fetch Dynamic Data from Supabase
        const [
            { data: instructors },
            { data: blogPosts },
            { data: personalizedProducts },
            { data: creativeWritingPackages },
            { data: subscriptionPlans },
            { data: standaloneServices }
        ] = await Promise.all([
            supabase.from('instructors').select('*'),
            supabase.from('blog_posts').select('*').eq('status', 'published'),
            supabase.from('personalized_products').select('*').order('sort_order'),
            supabase.from('creative_writing_packages').select('*'),
            supabase.from('subscription_plans').select('*').order('price'),
            supabase.from('standalone_services').select('*')
        ]);

        // 2. Fetch Static Data (Fallback to LocalStorage/Mock until DB tables exist for these settings)
        let content = mockSiteContent;
        try {
            const storedContent = localStorage.getItem('alrehla_site_content');
            if (storedContent) content = { ...mockSiteContent, ...JSON.parse(storedContent) };
        } catch (e) { console.error(e); }

        let branding = mockSiteBranding;
        try {
            const storedBranding = localStorage.getItem('alrehla_branding');
            if (storedBranding) branding = { ...mockSiteBranding, ...JSON.parse(storedBranding) };
        } catch (e) { console.error(e); }

        return {
            instructors: instructors || [],
            blogPosts: blogPosts || [],
            personalizedProducts: personalizedProducts || [],
            creativeWritingPackages: creativeWritingPackages || [],
            subscriptionPlans: subscriptionPlans || [],
            standaloneServices: standaloneServices || [],
            
            // Static/Config Data (Keep as mock/local for now)
            siteContent: content,
            socialLinks: mockSocialLinks,
            publicHolidays: mockPublicHolidays,
            communicationSettings: mockCommunicationSettings,
            siteBranding: branding
        };
    }
};
