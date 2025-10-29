import { useQuery } from '@tanstack/react-query';
import { mockCreativeWritingPackages, mockAdditionalServices, mockSocialLinks } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminCWSettings = () => useQuery({
    queryKey: ['adminCWSettings'],
    queryFn: async () => {
        const [packages, services] = await Promise.all([
            mockFetch(mockCreativeWritingPackages),
            mockFetch(mockAdditionalServices)
        ]);
        return { packages, services };
    },
});

export const useAdminSocialLinks = () => useQuery({
    queryKey: ['adminSocialLinks'],
    queryFn: () => mockFetch(mockSocialLinks),
});
