
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import {
    mockPrices,
    mockSiteBranding,
    mockShippingCosts
} from '../../../data/mockData';

export const usePrices = () => useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'prices').single();
        return data?.value || mockPrices;
    },
    staleTime: Infinity,
});

export const useSiteBranding = () => useQuery({
    queryKey: ['siteBranding'],
    queryFn: async () => {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'branding').single();
        return data?.value || mockSiteBranding;
    },
    staleTime: 0, 
});

export const useShippingCosts = () => useQuery({
    queryKey: ['shippingCosts'],
    queryFn: async () => {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'shipping_costs').single();
        return data?.value || mockShippingCosts;
    },
    staleTime: Infinity,
});
