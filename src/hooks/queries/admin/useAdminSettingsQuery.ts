
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import {
    mockSocialLinks,
    mockPricingSettings,
    mockRolePermissions,
    mockCommunicationSettings,
    mockJitsiSettings,
    mockMaintenanceSettings,
    mockLibraryPricingSettings,
} from '../../../data/mockData';
import { bookingService } from '../../../services/bookingService';
import { DEFAULT_CONFIG } from '../../../lib/config';

// Helper to fetch single setting safely with Auto-Seed logic embedded in the query
const fetchSetting = async (key: string, seedValue: any) => {
    const { data, error } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle();
    
    // Auto-Seed logic: Only runs if the KEY is missing entirely from the DB.
    // This ensures we have a structure to work with, but the content is persisted in DB.
    if (error || !data || (data as any).value === undefined || (data as any).value === null) {
        await supabase.from('site_settings').upsert({
             key: key,
             value: seedValue,
             updated_at: new Date().toISOString()
        } as any);
        return seedValue;
    }
    
    return (data as any).value;
};

export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: async () => {
        const [packages, standaloneServices, comparisonItems] = await Promise.all([
            bookingService.getAllPackages(),
            bookingService.getAllStandaloneServices(),
            bookingService.getAllComparisonItems(),
        ]);
        
        // Return REAL DB data. If empty, the UI will show empty states/tables.
        return { packages, services: [], standaloneServices, comparisonItems };
    },
    staleTime: 1000 * 60 * 5 
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

export const useAdminLibraryPricingSettings = () => useQuery({
    queryKey: ['adminLibraryPricingSettings'],
    queryFn: () => fetchSetting('library_pricing_config', mockLibraryPricingSettings),
});

export const useAdminRolePermissions = () => useQuery({
    queryKey: ['adminRolePermissions'],
    queryFn: () => fetchSetting('role_permissions', mockRolePermissions),
});

export const useAdminSystemConfig = () => useQuery({
    queryKey: ['adminSystemConfig'],
    queryFn: () => fetchSetting('system_config', DEFAULT_CONFIG),
});

export const useAdminMaintenanceSettings = () => useQuery({
    queryKey: ['adminMaintenanceSettings'],
    queryFn: () => fetchSetting('maintenance_settings', mockMaintenanceSettings),
});
