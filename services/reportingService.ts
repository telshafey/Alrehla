
import {
    mockOrders,
    mockBookings,
    mockSubscriptions,
    mockInstructorPayouts,
    mockInstructors,
    mockServiceOrders,
    mockCreativeWritingPackages,
    mockStandaloneServices,
    mockSubscriptionPlans,
    mockUsers,
    mockScheduledSessions,
    mockAuditLogs
} from '../data/mockData';
import { UserRole } from '../lib/roles';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const reportingService = {
    // --- Financials ---
    async getFinancialOverview() {
        if (USE_MOCK) {
            const [orders, bookings, serviceOrders, subscriptions, payouts, subscriptionPlans] = await Promise.all([
                mockFetch(mockOrders),
                mockFetch(mockBookings),
                mockFetch(mockServiceOrders),
                mockFetch(mockSubscriptions),
                mockFetch(mockInstructorPayouts),
                mockFetch(mockSubscriptionPlans),
            ]);
            return { orders, bookings, serviceOrders, subscriptions, payouts, subscriptionPlans };
        }
        return apiClient.get<any>('/admin/reports/financial-overview');
    },

    async getInstructorFinancials() {
        if (USE_MOCK) {
            const [instructors, bookings, serviceOrders, payouts, packages, services] = await Promise.all([
                mockFetch(mockInstructors),
                mockFetch(mockBookings),
                mockFetch(mockServiceOrders),
                mockFetch(mockInstructorPayouts),
                mockFetch(mockCreativeWritingPackages),
                mockFetch(mockStandaloneServices),
            ]);
            
            // Simulate backend logic for aggregating instructor earnings
            return instructors.map((instructor: any) => {
                const completedBookings = bookings.filter((b: any) => b.instructor_id === instructor.id && b.status === 'مكتمل');
                const completedServices = serviceOrders.filter((so: any) => so.assigned_instructor_id === instructor.id && so.status === 'مكتمل');
                
                const totalBookingEarnings = completedBookings.reduce((sum: number, b: any) => {
                    const pkg = packages.find((p: any) => p.name === b.package_name);
                    return sum + (instructor.package_rates?.[pkg?.id as any] || 0);
                }, 0);
    
                const totalServiceEarnings = completedServices.reduce((sum: number, so: any) => {
                     const service = services.find((s: any) => s.id === so.service_id);
                     return sum + (instructor.service_rates?.[service?.id as any] || 0);
                }, 0);
    
                const totalEarnings = totalBookingEarnings + totalServiceEarnings;
                const instructorPayouts = payouts.filter((p: any) => p.instructor_id === instructor.id);
                const totalPaid = instructorPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);
                const outstandingBalance = totalEarnings - totalPaid;
    
                return {
                    id: instructor.id,
                    name: instructor.name,
                    rate_per_session: instructor.rate_per_session,
                    package_rates: instructor.package_rates,
                    totalEarnings,
                    totalPaid,
                    outstandingBalance,
                    payouts: instructorPayouts,
                    rawCompletedBookings: completedBookings,
                    rawCompletedServices: completedServices
                };
            });
        }
        return apiClient.get<any[]>('/admin/reports/instructor-financials');
    },

    async getRevenueStreams() {
        if (USE_MOCK) {
            const [orders, bookings, serviceOrders, subscriptions] = await Promise.all([
                mockFetch(mockOrders),
                mockFetch(mockBookings),
                mockFetch(mockServiceOrders),
                mockFetch(mockSubscriptions),
            ]);
            return { orders, bookings, serviceOrders, subscriptions };
        }
        return apiClient.get<any>('/admin/reports/revenue-streams');
    },

    async getTransactionsLog() {
        if (USE_MOCK) {
            const [orders, bookings, serviceOrders, payouts, instructors] = await Promise.all([
                mockFetch(mockOrders),
                mockFetch(mockBookings),
                mockFetch(mockServiceOrders),
                mockFetch(mockInstructorPayouts),
                mockFetch(mockInstructors),
            ]);
             return { orders, bookings, serviceOrders, payouts, instructors };
        }
        return apiClient.get<any>('/admin/reports/transactions-log');
    },

    // --- Custom Reports ---
    async getReportData(reportType: 'orders' | 'users' | 'instructors', filters: any) {
        if (USE_MOCK) {
            await mockFetch(null, 500); // Simulate delay

            switch (reportType) {
                case 'orders': {
                    return mockOrders.filter((order: any) => {
                        const orderDate = new Date(order.order_date);
                        const matchesDate = 
                            (!filters.startDate || orderDate >= new Date(filters.startDate)) &&
                            (!filters.endDate || orderDate <= new Date(filters.endDate));
                        const matchesStatus = !filters.status || filters.status === 'all' || order.status === filters.status;
                        return matchesDate && matchesStatus;
                    }).map((order: any) => ({
                        id: order.id,
                        users: { name: 'Unknown' }, // In mock we simplify this unless we join
                        child_profiles: { name: 'Unknown' },
                        item_summary: order.item_summary,
                        total: order.total,
                        status: order.status,
                        order_date: order.order_date
                    }));
                }
                case 'users': {
                     return mockUsers.filter((user: any) => {
                        const userDate = new Date(user.created_at);
                        const matchesDate = 
                            (!filters.startDate || userDate >= new Date(filters.startDate)) &&
                            (!filters.endDate || userDate <= new Date(filters.endDate));
                        const matchesRole = !filters.status || filters.status === 'all' || user.role === filters.status;
                        return matchesDate && matchesRole;
                    });
                }
                case 'instructors': {
                    // Aggregate instructor data
                    let instructorsToProcess = mockInstructors;
                    if (filters.instructorId && filters.instructorId !== 'all') {
                        instructorsToProcess = mockInstructors.filter((i: any) => i.id.toString() === filters.instructorId);
                    }

                    return instructorsToProcess.map((instructor: any) => {
                        const instructorBookings = mockBookings.filter((b: any) => b.instructor_id === instructor.id);
                        const filteredBookings = instructorBookings.filter((b: any) => {
                            const bookingDate = new Date(b.created_at);
                            return (!filters.startDate || bookingDate >= new Date(filters.startDate)) &&
                                   (!filters.endDate || bookingDate <= new Date(filters.endDate));
                        });

                        const uniqueStudents = new Set(filteredBookings.map((b: any) => b.child_id)).size;
                        const completedSessions = mockScheduledSessions.filter((s: any) => s.instructor_id === instructor.id && s.status === 'completed').length;
                        const upcomingSessions = mockScheduledSessions.filter((s: any) => s.instructor_id === instructor.id && s.status === 'upcoming').length;
                        const introSessionsCount = filteredBookings.filter((b: any) => b.package_name === 'الجلسة التعريفية').length;

                        return {
                            id: instructor.id,
                            name: instructor.name,
                            specialty: instructor.specialty,
                            totalStudents: uniqueStudents,
                            totalBookings: filteredBookings.length,
                            completedSessions,
                            upcomingSessions,
                            introSessions: introSessionsCount,
                            availableSlots: Object.keys(instructor.availability || {}).length * 8, 
                        };
                    });
                }
                default:
                    return [];
            }
        }
        
        // For Real API
        const queryParams = new URLSearchParams(filters).toString();
        return apiClient.get<any[]>(`/admin/reports/${reportType}?${queryParams}`);
    },

    // --- Audit Logs ---
    async getAuditLogs(filters: any) {
        if (USE_MOCK) {
            const logs = await mockFetch(mockAuditLogs) as any[];
            const users = await mockFetch(mockUsers.filter((u: any) => u.role !== 'user' && u.role !== 'student')) as any[];

            const filteredAndEnrichedLogs = logs.filter((log: any) => {
                const logDate = new Date(log.timestamp);
                const matchesDate = 
                    (!filters.startDate || logDate >= new Date(filters.startDate)) &&
                    (!filters.endDate || logDate <= new Date(filters.endDate));
                const matchesAction = filters.actionType === 'all' || log.action === filters.actionType;
                const matchesUser = filters.userId === 'all' || log.user_id === filters.userId;
                return matchesDate && matchesAction && matchesUser;
            }).map((log: any) => {
                const user = users.find((u: any) => u.id === log.user_id);
                return {
                    ...log,
                    user_name: user ? user.name : 'مستخدم محذوف',
                };
            });

            filteredAndEnrichedLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const actionTypes = [...new Set(logs.map((log: any) => log.action))];
            
            return { logs: filteredAndEnrichedLogs, users, actionTypes };
        }
        return apiClient.get<any>('/admin/audit-logs');
    }
};
