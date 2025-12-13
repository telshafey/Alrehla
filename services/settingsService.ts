
import { supabase } from '../lib/supabaseClient';
import { 
    mockSocialLinks, 
    mockCommunicationSettings, 
    mockPricingSettings, 
    mockJitsiSettings,
    mockSiteBranding
} from '../data/mockData';
import type { 
    SocialLinks, 
    CommunicationSettings, 
    PricingSettings, 
    JitsiSettings,
    SiteBranding,
    Prices,
    ShippingCosts
} from '../lib/database.types';

export const settingsService = {
    // --- Branding ---
    async updateBranding(newBranding: Partial<SiteBranding>) {
        // 1. Get current branding to merge
        const { data: current } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'branding')
            .single();
            
        const currentVal = current?.value || mockSiteBranding;
        const updatedValue = { ...currentVal, ...newBranding };

        // 2. Save to DB
        const { error } = await supabase
            .from('site_settings')
            .upsert({ 
                key: 'branding', 
                value: updatedValue,
                updated_at: new Date().toISOString()
            });

        if (error) throw new Error(error.message);
        return updatedValue as SiteBranding;
    },

    // --- Prices ---
    async updatePrices(newPrices: Prices) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ 
                key: 'prices', 
                value: newPrices,
                updated_at: new Date().toISOString()
            });

        if (error) throw new Error(error.message);
        return newPrices;
    },

    // --- Shipping ---
    async updateShippingCosts(newCosts: ShippingCosts) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ 
                key: 'shipping_costs', 
                value: newCosts,
                updated_at: new Date().toISOString()
            });

        if (error) throw new Error(error.message);
        return newCosts;
    },

    // --- General Settings ---
    async updateSocialLinks(links: SocialLinks) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'social_links', value: links, updated_at: new Date().toISOString() });
        
        if (error) throw new Error(error.message);
        return links;
    },

    async updateCommunicationSettings(settings: CommunicationSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'communication_settings', value: settings, updated_at: new Date().toISOString() });

        if (error) throw new Error(error.message);
        return settings;
    },

    async updatePricingSettings(settings: PricingSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'pricing_config', value: settings, updated_at: new Date().toISOString() });

        if (error) throw new Error(error.message);
        return settings;
    },

    async updateJitsiSettings(settings: JitsiSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'jitsi_settings', value: settings, updated_at: new Date().toISOString() });

        if (error) throw new Error(error.message);
        return settings;
    },

    async updateRolePermissions(permissions: any) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'role_permissions', value: permissions, updated_at: new Date().toISOString() });

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
