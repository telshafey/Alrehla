
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
import { mockPricingSettings } from '../data/mockData';

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
            supabase.from('creative_writing_packages').select('*'), // Hard delete implies checking table structure, assuming active if present or no column
            supabase.from('subscription_plans').select('*').is('deleted_at', null).order('price'),
            supabase.from('standalone_services').select('*'), // Assuming hard delete or no soft delete column based on types
            (supabase.from('site_settings') as any).select('*'), // Cast to any to avoid property access issues
            supabase.from('badges').select('*'),
            supabase.from('comparison_items').select('*').order('sort_order')
        ]);

        const getSetting = (key: string, defaultValue?: any) => {
            // Using as any for item to access properties safely
            const item = (settingsData as any[])?.find(s => s.key === key);
            return item ? item.value : defaultValue || null;
        };

        return {
            instructors: instructors || [],
            blogPosts: blogPosts || [],
            personalizedProducts: personalizedProducts || [],
            creativeWritingPackages: creativeWritingPackages || [],
            subscriptionPlans: subscriptionPlans || [],
            standaloneServices: standaloneServices || [],
            badges: badges || [],
            comparisonItems: comparisonItems || [],
            
            // سيعيد null إذا لم تكن الإعدادات موجودة في DB، مما ينبه المسؤول لتهيئتها
            siteContent: getSetting('global_content'),
            siteBranding: getSetting('branding'),
            socialLinks: getSetting('social_links'),
            communicationSettings: getSetting('communication_settings'),
            pricingSettings: getSetting('pricing_config', mockPricingSettings), // Ensure fallback to mock if missing
            
            publicHolidays: [], // يمكن جلبها من جدول خاص مستقبلاً
        };
    }
};
