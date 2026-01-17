
import { supabase } from '../lib/supabaseClient';
import type {
    Instructor,
    BlogPost,
    PersonalizedProduct,
    CreativeWritingPackage,
    SiteContent,
    SocialLinks,
    SubscriptionPlan,
    StandaloneService,
    CommunicationSettings,
    PricingSettings
} from '../lib/database.types';
import { 
    mockPricingSettings, 
    mockSiteContent, 
    mockCommunicationSettings, 
    mockSocialLinks,
    mockBlogPosts
} from '../data/mockData';

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
    pricingSettings: PricingSettings;
}

export const publicService = {
    async getAllPublicData() {
        const now = new Date().toISOString();

        const [
            { data: instructors },
            { data: blogPosts },
            { data: personalizedProducts },
            { data: creativeWritingPackages },
            { data: subscriptionPlans },
            { data: standaloneServices },
            { data: settingsData },
            { data: badges },
            { data: comparisonItems }
        ] = await Promise.all([
            supabase.from('instructors').select('*').is('deleted_at', null),
            // Filter blog posts: Status must be published AND published_at must be in the past or now
            supabase.from('blog_posts').select('*').eq('status', 'published').lte('published_at', now).is('deleted_at', null).order('published_at', { ascending: false }),
            supabase.from('personalized_products').select('*').is('deleted_at', null).order('sort_order'),
            supabase.from('creative_writing_packages').select('*'), 
            supabase.from('subscription_plans').select('*').is('deleted_at', null).order('price'),
            supabase.from('standalone_services').select('*'), 
            (supabase.from('site_settings') as any).select('*'), 
            supabase.from('badges').select('*'),
            supabase.from('comparison_items').select('*').order('sort_order')
        ]);

        // Helper to get settings. 
        // Note: For settings (single row configs like branding/texts), we still keep the seed logic 
        // inside 'contentService' or 'settingsService' to populate the DB once if empty, 
        // but here we just read what's there.
        const getSetting = (key: string, defaultValue?: any) => {
            const item = (settingsData as any[])?.find(s => s.key === key);
            return item ? item.value : defaultValue || null;
        };

        return {
            // REAL DATA ONLY: If DB is empty, return empty array.
            instructors: (instructors as Instructor[]) || [],
            // Use mockBlogPosts if DB returns empty (for demo purposes)
            blogPosts: (blogPosts as BlogPost[])?.length > 0 ? (blogPosts as BlogPost[]) : mockBlogPosts,
            personalizedProducts: (personalizedProducts as PersonalizedProduct[]) || [],
            creativeWritingPackages: (creativeWritingPackages as CreativeWritingPackage[]) || [],
            subscriptionPlans: (subscriptionPlans as SubscriptionPlan[]) || [],
            standaloneServices: (standaloneServices as StandaloneService[]) || [],
            badges: (badges as any[]) || [],
            comparisonItems: (comparisonItems as any[]) || [],
            
            // Configs: Fallback to defaults only if DB row is missing entirely (Seeding logic)
            siteContent: getSetting('global_content', mockSiteContent),
            siteBranding: getSetting('branding'),
            socialLinks: getSetting('social_links', mockSocialLinks),
            communicationSettings: getSetting('communication_settings', mockCommunicationSettings),
            pricingSettings: getSetting('pricing_config', mockPricingSettings),
            
            publicHolidays: [], 
        };
    }
};
