
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
    PricingSettings,
    MaintenanceSettings
} from '../lib/database.types';
import { 
    mockPricingSettings, 
    mockSiteContent, 
    mockCommunicationSettings, 
    mockSocialLinks,
    mockBlogPosts,
    mockMaintenanceSettings
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
    maintenanceSettings: MaintenanceSettings;
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
            // Fetch ALL products regardless of status, client will filter.
            // Updated: Join with publisher profile to get the name
            supabase.from('personalized_products')
                .select('*, publisher:profiles!personalized_products_publisher_id_fkey(name)')
                .is('deleted_at', null)
                .order('sort_order'),
            supabase.from('creative_writing_packages').select('*'), 
            supabase.from('subscription_plans').select('*').is('deleted_at', null).order('price'),
            supabase.from('standalone_services').select('*'), 
            (supabase.from('site_settings') as any).select('*'), 
            supabase.from('badges').select('*'),
            supabase.from('comparison_items').select('*').order('sort_order')
        ]);

        // Helper to get settings. 
        const getSetting = (key: string, defaultValue?: any) => {
            const item = (settingsData as any[])?.find(s => s.key === key);
            return item ? item.value : defaultValue || null;
        };
        
        // CLIENT-SIDE FILTERING & TRANSFORMATION:
        // Rule 1: If is_active is false, hide it.
        // Rule 2: If publisher is missing, default to "الرحلة".
        const activeProducts = (personalizedProducts as PersonalizedProduct[] || [])
            .filter(p => p.is_active !== false)
            .map(p => ({
                ...p,
                publisher: p.publisher ? p.publisher : { name: 'الرحلة' }
            }));

        return {
            instructors: (instructors as Instructor[]) || [],
            blogPosts: (blogPosts as BlogPost[])?.length > 0 ? (blogPosts as BlogPost[]) : mockBlogPosts,
            personalizedProducts: activeProducts,
            creativeWritingPackages: (creativeWritingPackages as CreativeWritingPackage[]) || [],
            subscriptionPlans: (subscriptionPlans as SubscriptionPlan[]) || [],
            standaloneServices: (standaloneServices as StandaloneService[]) || [],
            badges: (badges as any[]) || [],
            comparisonItems: (comparisonItems as any[]) || [],
            
            siteContent: getSetting('global_content', mockSiteContent),
            siteBranding: getSetting('branding'),
            socialLinks: getSetting('social_links', mockSocialLinks),
            communicationSettings: getSetting('communication_settings', mockCommunicationSettings),
            pricingSettings: getSetting('pricing_config', mockPricingSettings),
            maintenanceSettings: getSetting('maintenance_settings', mockMaintenanceSettings),
            
            publicHolidays: [], 
        };
    }
};
