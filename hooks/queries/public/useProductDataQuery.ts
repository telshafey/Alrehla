
import { useQuery } from '@tanstack/react-query';
import {
    mockPrices,
    mockSiteBranding,
    mockShippingCosts
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));


export const usePrices = () => useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
        const stored = localStorage.getItem('alrehla_prices');
        if (stored) return JSON.parse(stored);
        return mockFetch(mockPrices);
    },
    staleTime: Infinity,
});

export const useSiteBranding = () => useQuery({
    queryKey: ['siteBranding'],
    queryFn: async () => {
        const stored = localStorage.getItem('alrehla_branding');
        if (stored) {
            // Merge with mock data to ensure all keys exist even if mock data updates
            return { ...mockSiteBranding, ...JSON.parse(stored) };
        }
        return mockFetch(mockSiteBranding);
    },
    staleTime: 0, // Ensure fresh data on navigation
});

export const useShippingCosts = () => useQuery({
    queryKey: ['shippingCosts'],
    queryFn: async () => {
        const stored = localStorage.getItem('alrehla_shipping');
        if (stored) return JSON.parse(stored);
        return mockFetch(mockShippingCosts);
    },
    staleTime: Infinity,
});
