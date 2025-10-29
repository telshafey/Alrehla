import { useQuery } from '@tanstack/react-query';
import {
    mockPrices,
    mockSiteBranding,
    mockShippingCosts
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));


export const usePrices = () => useQuery({
    queryKey: ['prices'],
    queryFn: () => mockFetch(mockPrices),
    staleTime: Infinity,
});

export const useSiteBranding = () => useQuery({
    queryKey: ['siteBranding'],
    queryFn: () => mockFetch(mockSiteBranding),
    staleTime: Infinity,
});

export const useShippingCosts = () => useQuery({
    queryKey: ['shippingCosts'],
    queryFn: () => mockFetch(mockShippingCosts),
    staleTime: Infinity,
});
