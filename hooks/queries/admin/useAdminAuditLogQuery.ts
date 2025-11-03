import { useQuery } from '@tanstack/react-query';
import { mockAuditLogs, mockUsers } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

export const useAdminAuditLogQuery = () => {
    return useQuery({
        queryKey: ['adminAuditLog'],
        queryFn: async () => {
            const logs = await mockFetch(mockAuditLogs) as any[];
            const users = await mockFetch(mockUsers.filter(u => u.role !== 'user' && u.role !== 'student')) as any[];

            // Enrich logs with user names
            const enrichedLogs = logs.map(log => {
                const user = users.find(u => u.id === log.user_id);
                return {
                    ...log,
                    user_name: user ? user.name : 'مستخدم محذوف',
                };
            });

            const actionTypes = [...new Set(logs.map(log => log.action))];
            
            return { logs: enrichedLogs, users, actionTypes };
        },
    });
};
