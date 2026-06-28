
import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../../../services/reportingService';

interface AuditLogFilters {
    startDate: string;
    endDate: string;
    actionType: string;
    userId: string;
}

export const useAdminAuditLogQuery = (filters: AuditLogFilters, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['adminAuditLog', filters],
        queryFn: () => reportingService.getAuditLogs(filters),
        enabled: enabled, 
    });
};
