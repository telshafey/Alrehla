
import { supabase } from '../lib/supabaseClient';
import {
    mockSocialLinks,
    mockPublicHolidays,
    mockCommunicationSettings,
    mockSiteBranding,
    mockSiteContent 
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
            { data: settingsData } // Fetch all settings in one query if possible or separate
        ] = await Promise.all([
            supabase.from('instructors').select('*').is('deleted_at', null),
            supabase.from('blog_posts').select('*').eq('status', 'published').is('deleted_at', null),
            supabase.from('personalized_products').select('*').is('deleted_at', null).order('sort_order'), // Filter deleted products
            supabase.from('creative_writing_packages').select('*'),
            supabase.from('subscription_plans').select('*').order('price'),
            supabase.from('standalone_services').select('*'),
            supabase.from('site_settings').select('*') // Get all key-value settings
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
