import { useQuery } from '@tanstack/react-query';
import { mockOrders, mockUsers } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

type ReportType = 'orders' | 'users';
interface ReportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
}

const fetchAndFilterData = async (reportType: ReportType, filters: ReportFilters): Promise<any[]> => {
    switch (reportType) {
        case 'orders': {
            const allOrders = await mockFetch(mockOrders) as any[];
            return allOrders.filter(order => {
                const orderDate = new Date(order.order_date);
                const matchesDate = 
                    (!filters.startDate || orderDate >= new Date(filters.startDate)) &&
                    (!filters.endDate || orderDate <= new Date(filters.endDate));
                const matchesStatus = !filters.status || filters.status === 'all' || order.status === filters.status;
                return matchesDate && matchesStatus;
            });
        }
        case 'users': {
            const allUsers = await mockFetch(mockUsers) as any[];
             return allUsers.filter(user => {
                const userDate = new Date(user.created_at);
                const matchesDate = 
                    (!filters.startDate || userDate >= new Date(filters.startDate)) &&
                    (!filters.endDate || userDate <= new Date(filters.endDate));
                const matchesRole = !filters.status || filters.status === 'all' || user.role === filters.status;
                return matchesDate && matchesRole;
            });
        }
        default:
            return [];
    }
};

export const useAdminReportDataQuery = (reportType: ReportType, filters: ReportFilters, enabled: boolean) => {
    return useQuery({
        queryKey: ['adminReportData', reportType, filters],
        queryFn: () => fetchAndFilterData(reportType, filters),
        // Keep previous data while refetching to avoid UI flickers
        keepPreviousData: true,
        enabled,
    });
};
