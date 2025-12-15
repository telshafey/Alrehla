
import { supabase } from '../lib/supabaseClient';
import {
    mockSocialLinks,
    mockPublicHolidays,
    mockCommunicationSettings,
    mockSiteBranding,
    mockSiteContent,
    mockBadges 
} from '../data/mockData';

export const publicService = {
    async getAllPublicData() {
        // 1. Fetch Dynamic Data from Supabase Tables
        const [
            { data: instructors },
            { data: blogPosts },
            { data: personalizedProducts },
            { data: creativeWritingPackages },
            { data: subscriptionPlans },
            { data: standaloneServices },
            { data: settingsData },
            { data: badges } 
        ] = await Promise.all([
            supabase.from('instructors').select('*').is('deleted_at', null),
            supabase.from('blog_posts').select('*').eq('status', 'published').is('deleted_at', null),
            supabase.from('personalized_products').select('*').is('deleted_at', null).order('sort_order'),
            supabase.from('creative_writing_packages').select('*'),
            supabase.from('subscription_plans').select('*').order('price'),
            supabase.from('standalone_services').select('*'),
            supabase.from('site_settings').select('*'),
            supabase.from('badges').select('*')
        ]);

        // Helper to extract value from settings array
        const getSetting = (key: string, fallback: any) => {
            const item = settingsData?.find(s => s.key === key);
            return item ? item.value : fallback;
        };

        return {
            instructors: instructors || [],
            blogPosts: blogPosts || [],
            personalizedProducts: personalizedProducts || [],
            creativeWritingPackages: creativeWritingPackages || [],
            subscriptionPlans: subscriptionPlans || [],
            standaloneServices: standaloneServices || [],
            badges: badges && badges.length > 0 ? badges : mockBadges,
            
            // Dynamic Settings from site_settings table
            siteContent: getSetting('global_content', mockSiteContent),
            siteBranding: getSetting('branding', mockSiteBranding),
            socialLinks: getSetting('social_links', mockSocialLinks),
            communicationSettings: getSetting('communication_settings', mockCommunicationSettings),
            
            // Static/Config Data
            publicHolidays: mockPublicHolidays,
        };
    }
};
