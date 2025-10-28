import { useQuery } from '@tanstack/react-query';
import {
    mockInstructors,
    mockBlogPosts,
    mockPersonalizedProducts,
    mockCreativeWritingPackages,
    mockSiteContent,
    mockSocialLinks,
    mockPublicHolidays,
    mockPrices,
    mockSiteBranding,
    mockShippingCosts,
} from '../data/mockData';

// Mock async function to simulate network delay
const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const usePublicData = () => {
    return useQuery({
        queryKey: ['publicData'],
        queryFn: async () => {
            // In a real app, these would be separate API calls.
            // Here we fetch them all at once for simplicity in mock mode.
            const data = {
                instructors: await mockFetch(mockInstructors),
                blogPosts: await mockFetch(mockBlogPosts),
                personalizedProducts: await mockFetch(mockPersonalizedProducts),
                creativeWritingPackages: await mockFetch(mockCreativeWritingPackages),
                siteContent: await mockFetch(mockSiteContent),
                socialLinks: await mockFetch(mockSocialLinks),
                publicHolidays: await mockFetch(mockPublicHolidays),
            };
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

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


export const useBookingData = () => {
    return useQuery({
        queryKey: ['creativeWritingBookingData'],
        queryFn: async () => {
            const data = {
                instructors: await mockFetch(mockInstructors),
                cw_packages: await mockFetch(mockCreativeWritingPackages),
                holidays: await mockFetch(mockPublicHolidays),
            };
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrderData = () => {
    return useQuery({
        queryKey: ['enhaLakOrderData'],
        queryFn: async () => {
            const data = {
                personalizedProducts: await mockFetch(mockPersonalizedProducts),
            };
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
