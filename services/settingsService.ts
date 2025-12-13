
import { 
    mockSocialLinks, 
    mockCommunicationSettings, 
    mockPricingSettings, 
    mockJitsiSettings,
    mockSiteBranding,
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
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

// Switch to FALSE to use Real Backend
const USE_MOCK = false;

export const settingsService = {
    // --- Branding & Prices ---
    async updateBranding(newBranding: Partial<SiteBranding>) {
        if (USE_MOCK) {
            await mockFetch(null, 500);
            const stored = localStorage.getItem('alrehla_branding');
            const current = stored ? JSON.parse(stored) : mockSiteBranding;
            const updated = { ...current, ...newBranding };
            localStorage.setItem('alrehla_branding', JSON.stringify(updated));
            return updated;
        }
        return apiClient.put<SiteBranding>('/admin/settings/branding', newBranding);
    },

    async updatePrices(newPrices: Prices) {
        if (USE_MOCK) {
            await mockFetch(null, 500);
            localStorage.setItem('alrehla_prices', JSON.stringify(newPrices));
            return newPrices;
        }
        return apiClient.put<Prices>('/admin/settings/prices', newPrices);
    },

    async updateShippingCosts(newCosts: ShippingCosts) {
        if (USE_MOCK) {
            await mockFetch(null, 500);
            localStorage.setItem('alrehla_shipping', JSON.stringify(newCosts));
            return newCosts;
        }
        return apiClient.put<ShippingCosts>('/admin/settings/shipping', newCosts);
    },

    // --- General Settings ---
    async updateSocialLinks(links: SocialLinks) {
        if (USE_MOCK) {
            console.log("Service: Updating social links (mock)", links);
            return mockFetch(links, 500);
        }
        return apiClient.put<SocialLinks>('/admin/settings/social-links', links);
    },

    async updateCommunicationSettings(settings: CommunicationSettings) {
        if (USE_MOCK) {
            console.log("Service: Updating comms settings (mock)", settings);
            return mockFetch(settings, 500);
        }
        return apiClient.put<CommunicationSettings>('/admin/settings/communication', settings);
    },

    async updatePricingSettings(settings: PricingSettings) {
        if (USE_MOCK) {
            console.log("Service: Updating pricing settings (mock)", settings);
            return mockFetch(settings, 500);
        }
        return apiClient.put<PricingSettings>('/admin/settings/pricing-config', settings);
    },

    async updateJitsiSettings(settings: JitsiSettings) {
        if (USE_MOCK) {
            console.log("Service: Updating Jitsi settings (mock)", settings);
            return mockFetch(settings, 500);
        }
        return apiClient.put<JitsiSettings>('/admin/settings/jitsi', settings);
    },

    async updateRolePermissions(permissions: any) {
        if (USE_MOCK) {
            await mockFetch(null, 800);
            console.log("Service: Updating permissions (mock)", permissions);
            return { success: true };
        }
        return apiClient.put<{ success: boolean }>('/admin/settings/permissions', permissions);
    }
};
