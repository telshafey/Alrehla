
import { useQuery } from '@tanstack/react-query';
import { mockOrders, mockUsers, mockInstructors, mockBookings, mockScheduledSessions, mockCreativeWritingPackages } from '../../../data/mockData';

const mockFetch = (data: any, delay = 300) => new Promise(resolve => setTimeout(() => resolve(data), delay));

type ReportType = 'orders' | 'users' | 'instructors';
interface ReportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
    instructorId?: string;
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
        case 'instructors': {
            // Parallel fetch for aggregation
            const [allInstructors, allBookings, allSessions, allPackages] = await Promise.all([
                mockFetch(mockInstructors) as Promise<any[]>,
                mockFetch(mockBookings) as Promise<any[]>,
                mockFetch(mockScheduledSessions) as Promise<any[]>,
                mockFetch(mockCreativeWritingPackages) as Promise<any[]>
            ]);

            let instructorsToProcess = allInstructors;

            // Filter specific instructor if selected
            if (filters.instructorId && filters.instructorId !== 'all') {
                instructorsToProcess = allInstructors.filter(i => i.id.toString() === filters.instructorId);
            }

            return instructorsToProcess.map(instructor => {
                // Filter bookings related to this instructor
                const instructorBookings = allBookings.filter(b => b.instructor_id === instructor.id);
                
                // Filter bookings based on date range (if applicable)
                const filteredBookings = instructorBookings.filter(b => {
                    const bookingDate = new Date(b.created_at);
                    return (!filters.startDate || bookingDate >= new Date(filters.startDate)) &&
                           (!filters.endDate || bookingDate <= new Date(filters.endDate));
                });

                // Metrics Calculation
                const uniqueStudents = new Set(filteredBookings.map(b => b.child_id)).size;
                const completedSessions = allSessions.filter(s => s.instructor_id === instructor.id && s.status === 'completed' && 
                    (!filters.startDate || new Date(s.session_date) >= new Date(filters.startDate)) && 
                    (!filters.endDate || new Date(s.session_date) <= new Date(filters.endDate))
                ).length;
                
                const upcomingSessions = allSessions.filter(s => s.instructor_id === instructor.id && s.status === 'upcoming').length;
                
                // Calculate free sessions (Introductory Sessions)
                const introPackage = allPackages.find(p => p.name === 'الجلسة التعريفية');
                const introSessionsCount = filteredBookings.filter(b => b.package_name === 'الجلسة التعريفية').length;

                return {
                    id: instructor.id,
                    name: instructor.name,
                    specialty: instructor.specialty,
                    totalStudents: uniqueStudents,
                    totalBookings: filteredBookings.length,
                    completedSessions,
                    upcomingSessions,
                    introSessions: introSessionsCount,
                    // Mock calculation for total available slots (assume fixed for now or derived from schedule)
                    availableSlots: Object.keys(instructor.availability || {}).length * 8, // approximate
                };
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
