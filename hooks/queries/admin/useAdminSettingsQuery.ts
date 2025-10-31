import { useQuery } from '@tanstack/react-query';
import {
    mockCreativeWritingPackages,
    mockAdditionalServices,
    mockSocialLinks,
    mockStandaloneServices,
    mockAiSettings,
    mockPricingSettings,
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: async () => {
        const [packages, services, standaloneServices] = await Promise.all([
            mockFetch(mockCreativeWritingPackages),
            mockFetch(mockAdditionalServices),
            mockFetch(mockStandaloneServices),
        ]);
        return { packages, services, standaloneServices };
    },
});

export const useAdminSocialLinks = () => useQuery({
    queryKey: ['adminSocialLinks'],
    queryFn: () => mockFetch(mockSocialLinks),
});

export const useAdminAiSettings = () => useQuery({
    queryKey: ['adminAiSettings'],
    queryFn: () => mockFetch(mockAiSettings),
});

export const useAdminPricingSettings = () => useQuery({
    queryKey: ['adminPricingSettings'],
    queryFn: () => mockFetch(mockPricingSettings),
});