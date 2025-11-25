
import { useQuery } from '@tanstack/react-query';
import { mockAuditLogs, mockUsers } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

interface AuditLogFilters {
    startDate: string;
    endDate: string;
    actionType: string;
    userId: string;
}

export const useAdminAuditLogQuery = (filters: AuditLogFilters, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['adminAuditLog', filters],
        queryFn: async () => {
            const logs = await mockFetch(mockAuditLogs) as any[];
            const users = await mockFetch(mockUsers.filter(u => u.role !== 'user' && u.role !== 'student')) as any[];

            // Enrich logs with user names AND Filter (Simulating Server-Side Filtering)
            const filteredAndEnrichedLogs = logs.filter((log: any) => {
                const logDate = new Date(log.timestamp);
                
                const matchesDate = 
                    (!filters.startDate || logDate >= new Date(filters.startDate)) &&
                    (!filters.endDate || logDate <= new Date(filters.endDate));
                
                const matchesAction = filters.actionType === 'all' || log.action === filters.actionType;
                const matchesUser = filters.userId === 'all' || log.user_id === filters.userId;

                return matchesDate && matchesAction && matchesUser;
            }).map(log => {
                const user = users.find(u => u.id === log.user_id);
                return {
                    ...log,
                    user_name: user ? user.name : 'مستخدم محذوف',
                };
            });

            // Sort by newest first
            filteredAndEnrichedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const actionTypes = [...new Set(logs.map(log => log.action))];
            
            return { logs: filteredAndEnrichedLogs, users, actionTypes };
        },
        enabled: enabled, // Only run when enabled is true
    });
};
