
import { supabase } from '../lib/supabaseClient';

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
            supabase.from('subscription_plans').select('*').order('price'),
            supabase.from('standalone_services').select('*'),
            supabase.from('site_settings').select('*'),
            supabase.from('badges').select('*'),
            supabase.from('comparison_items').select('*').order('sort_order')
        ]);

        const getSetting = (key: string) => {
            const item = settingsData?.find(s => s.key === key);
            return item ? item.value : null;
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
            
            publicHolidays: [], // يمكن جلبها من جدول خاص مستقبلاً
        };
    }
};
