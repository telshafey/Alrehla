
import { useQuery } from '@tanstack/react-query';
import { publicService } from '../../../services/publicService';

export const useBookingData = () => {
    return useQuery({
        queryKey: ['creativeWritingBookingData'],
        queryFn: async () => {
            const data = await publicService.getAllPublicData();
            return {
                instructors: data.instructors,
                cw_packages: data.creativeWritingPackages,
                holidays: data.publicHolidays,
                cw_services: data.standaloneServices,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrderData = () => {
    return useQuery({
        queryKey: ['enhaLakOrderData'],
        queryFn: async () => {
            const data = await publicService.getAllPublicData();
            return {
                personalizedProducts: data.personalizedProducts,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
