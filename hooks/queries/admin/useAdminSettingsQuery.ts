
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import {
    mockSocialLinks,
    mockPricingSettings,
    mockRolePermissions,
    mockCommunicationSettings,
    mockJitsiSettings,
    mockAdditionalServices
} from '../../../data/mockData';
import { bookingService } from '../../../services/bookingService';

// Helper to fetch single setting
const fetchSetting = async (key: string, fallback: any) => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', key).single();
    // Explicit check for data before accessing value to satisfy TS and prevent runtime errors
    if (data && typeof data === 'object' && 'value' in data) {
        return (data as any).value;
    }
    return fallback;
};

export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: async () => {
        const [packages, standaloneServices, services, comparisonItems] = await Promise.all([
            bookingService.getAllPackages(),
            bookingService.getAllStandaloneServices(),
            fetchSetting('additional_services', mockAdditionalServices),
            bookingService.getAllComparisonItems(),
        ]);
        return { packages, services, standaloneServices, comparisonItems };
    },
});

export const useAdminSocialLinks = () => useQuery({
    queryKey: ['adminSocialLinks'],
    queryFn: () => fetchSetting('social_links', mockSocialLinks),
});

export const useAdminCommunicationSettings = () => useQuery({
    queryKey: ['adminCommunicationSettings'],
    queryFn: () => fetchSetting('communication_settings', mockCommunicationSettings),
});

export const useAdminJitsiSettings = () => useQuery({
    queryKey: ['adminJitsiSettings'],
    queryFn: () => fetchSetting('jitsi_settings', mockJitsiSettings),
});

export const useAdminPricingSettings = () => useQuery({
    queryKey: ['adminPricingSettings'],
    queryFn: () => fetchSetting('pricing_config', mockPricingSettings),
});

export const useAdminRolePermissions = () => useQuery({
    queryKey: ['adminRolePermissions'],
    queryFn: () => fetchSetting('role_permissions', mockRolePermissions),
});
