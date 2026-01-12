
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
    mockInstructors, 
    mockCreativeWritingPackages, 
    mockPersonalizedProducts,
    mockStandaloneServices,
    mockSubscriptionPlans,
    mockCommunicationSettings,
    mockSocialLinks,
    mockComparisonItems
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
            supabase.from('blog_posts').select('*').eq('status', 'published').is('deleted_at', null),
            supabase.from('personalized_products').select('*').is('deleted_at', null).order('sort_order'),
            supabase.from('creative_writing_packages').select('*'), 
            supabase.from('subscription_plans').select('*').is('deleted_at', null).order('price'),
            supabase.from('standalone_services').select('*'), 
            (supabase.from('site_settings') as any).select('*'), 
            supabase.from('badges').select('*'),
            supabase.from('comparison_items').select('*').order('sort_order')
        ]);

        const getSetting = (key: string, defaultValue?: any) => {
            const item = (settingsData as any[])?.find(s => s.key === key);
            return item ? item.value : defaultValue || null;
        };

        // Fallback Logic: Use Mock Data if DB returns empty arrays (meaning table exists but empty)
        // This ensures the site doesn't look broken initially
        const finalInstructors = instructors && instructors.length > 0 ? instructors : mockInstructors;
        const finalProducts = personalizedProducts && personalizedProducts.length > 0 ? personalizedProducts : mockPersonalizedProducts;
        const finalPackages = creativeWritingPackages && creativeWritingPackages.length > 0 ? creativeWritingPackages : mockCreativeWritingPackages;
        const finalServices = standaloneServices && standaloneServices.length > 0 ? standaloneServices : mockStandaloneServices;
        const finalPlans = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : mockSubscriptionPlans;
        const finalComparisonItems = comparisonItems && comparisonItems.length > 0 ? comparisonItems : mockComparisonItems;

        return {
            instructors: finalInstructors || [],
            blogPosts: blogPosts || [], // Blog posts can be empty initially
            personalizedProducts: finalProducts || [],
            creativeWritingPackages: finalPackages || [],
            subscriptionPlans: finalPlans || [],
            standaloneServices: finalServices || [],
            badges: badges || [],
            comparisonItems: finalComparisonItems || [],
            
            siteContent: getSetting('global_content', mockSiteContent),
            siteBranding: getSetting('branding'),
            socialLinks: getSetting('social_links', mockSocialLinks),
            communicationSettings: getSetting('communication_settings', mockCommunicationSettings),
            pricingSettings: getSetting('pricing_config', mockPricingSettings),
            
            publicHolidays: [], 
        };
    }
};
