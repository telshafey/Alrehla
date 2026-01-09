
import { supabase } from '../lib/supabaseClient';
import { 
    mockSocialLinks, 
    mockCommunicationSettings, 
    mockPricingSettings, 
    mockJitsiSettings,
    mockSiteBranding,
    mockSiteContent,
    mockPrices,
    mockShippingCosts
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
        
        // Safe access with optional chaining and casting
        const currentVal = (current as any)?.value || mockSiteBranding;
        const updatedValue = { ...currentVal, ...newBranding };

        // 2. Save to DB
        const { error } = await supabase
            .from('site_settings')
            .upsert({ 
                key: 'branding', 
                value: updatedValue,
                updated_at: new Date().toISOString()
            } as any);

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
            } as any);

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
            } as any);

        if (error) throw new Error(error.message);
        return newCosts;
    },

    // --- General Settings ---
    async updateSocialLinks(links: SocialLinks) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'social_links', value: links, updated_at: new Date().toISOString() } as any);
        
        if (error) throw new Error(error.message);
        return links;
    },

    async updateCommunicationSettings(settings: CommunicationSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'communication_settings', value: settings, updated_at: new Date().toISOString() } as any);

        if (error) throw new Error(error.message);
        return settings;
    },

    async updatePricingSettings(settings: PricingSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'pricing_config', value: settings, updated_at: new Date().toISOString() } as any);

        if (error) throw new Error(error.message);
        return settings;
    },

    async updateJitsiSettings(settings: JitsiSettings) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'jitsi_settings', value: settings, updated_at: new Date().toISOString() } as any);

        if (error) throw new Error(error.message);
        return settings;
    },

    async updateRolePermissions(permissions: any) {
        const { error } = await supabase
            .from('site_settings')
            .upsert({ key: 'role_permissions', value: permissions, updated_at: new Date().toISOString() } as any);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Database Initialization ---
    async initializeDefaults() {
        const defaults = [
            { key: 'branding', value: mockSiteBranding },
            { key: 'social_links', value: mockSocialLinks },
            { key: 'communication_settings', value: mockCommunicationSettings },
            { key: 'pricing_config', value: mockPricingSettings },
            { key: 'jitsi_settings', value: mockJitsiSettings },
            { key: 'global_content', value: mockSiteContent },
            { key: 'prices', value: mockPrices },
            { key: 'shipping_costs', value: mockShippingCosts }
        ];

        const promises = defaults.map(item => 
            supabase.from('site_settings').upsert({
                key: item.key,
                value: item.value,
                updated_at: new Date().toISOString()
            } as any)
        );

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
            throw new Error(`Fails to seed ${errors.length} settings. Ensure table 'site_settings' exists.`);
        }
        
        return { success: true };
    }
};
