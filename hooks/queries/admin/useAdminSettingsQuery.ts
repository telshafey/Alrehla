import { useQuery } from '@tanstack/react-query';
import {
    mockCreativeWritingPackages,
    mockAdditionalServices,
    mockSocialLinks,
    mockStandaloneServices,
    mockPricingSettings,
    mockRolePermissions,
    mockCommunicationSettings,
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

export const useAdminCommunicationSettings = () => useQuery({
    queryKey: ['adminCommunicationSettings'],
    queryFn: () => mockFetch(mockCommunicationSettings),
});

export const useAdminPricingSettings = () => useQuery({
    queryKey: ['adminPricingSettings'],
    queryFn: () => mockFetch(mockPricingSettings),
});

export const useAdminRolePermissions = () => useQuery({
    queryKey: ['adminRolePermissions'],
    queryFn: () => mockFetch(mockRolePermissions),
});