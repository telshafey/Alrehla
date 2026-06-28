
import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../../../services/reportingService';

export const useFinancialsOverview = () => {
    return useQuery({
        queryKey: ['adminFinancialsOverview'],
        queryFn: () => reportingService.getFinancialOverview(),
    });
};

export const useInstructorFinancials = () => {
    return useQuery({
        queryKey: ['adminInstructorFinancials'],
        queryFn: () => reportingService.getInstructorFinancials(),
    });
};

export const useRevenueStreams = () => {
    return useQuery({
        queryKey: ['adminRevenueStreams'],
        queryFn: () => reportingService.getRevenueStreams(),
    });
};

export const useTransactionsLog = () => {
     return useQuery({
        queryKey: ['adminTransactionsLog'],
        queryFn: () => reportingService.getTransactionsLog(),
    });
};
