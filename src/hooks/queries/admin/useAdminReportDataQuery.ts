
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { reportingService } from '../../../services/reportingService';
import { UserRole } from '../../../lib/roles';

export interface OrderReportItem {
    id: string;
    users: { name: string } | null;
    child_profiles: { name: string } | null;
    item_summary: string;
    total: number;
    status: string;
    order_date: string;
}

export interface UserReportItem {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface InstructorReportItem {
    id: number;
    name: string;
    specialty: string;
    totalStudents: number;
    totalBookings: number;
    completedSessions: number;
    upcomingSessions: number;
    introSessions: number;
    totalNetEarnings: number;
    totalGrossRevenue: number;
}

export type ReportData = OrderReportItem | UserReportItem | InstructorReportItem;

interface ReportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
    instructorId?: string;
}

export const useAdminReportDataQuery = (reportType: 'orders' | 'users' | 'instructors', filters: ReportFilters, enabled: boolean) => {
    return useQuery({
        queryKey: ['adminReportData', reportType, filters],
        queryFn: () => reportingService.getReportData(reportType, filters),
        placeholderData: keepPreviousData,
        enabled,
    });
};
