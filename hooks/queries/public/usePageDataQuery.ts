import { useQuery } from '@tanstack/react-query';
import {
    mockInstructors,
    mockCreativeWritingPackages,
    mockPublicHolidays,
    mockAdditionalServices,
    mockPersonalizedProducts
} from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useBookingData = () => {
    return useQuery({
        queryKey: ['creativeWritingBookingData'],
        queryFn: async () => {
            const [instructors, cw_packages, holidays, services] = await Promise.all([
                mockFetch(mockInstructors),
                mockFetch(mockCreativeWritingPackages),
                mockFetch(mockPublicHolidays),
                mockFetch(mockAdditionalServices)
            ]);
            const data = {
                instructors,
                cw_packages,
                holidays,
                cw_services: services,
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
