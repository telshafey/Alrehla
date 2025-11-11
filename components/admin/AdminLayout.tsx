import React, { useState, Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import PageLoader from '../ui/PageLoader';
import PermissionBasedRoute from '../auth/PermissionBasedRoute';

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import('../../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../../pages/admin/AdminUsersPage'));
const AdminOrdersPage = lazy(() => import('../../pages/admin/AdminOrdersPage'));
const AdminCreativeWritingPage = lazy(() => import('../../pages/admin/AdminCreativeWritingPage'));
const AdminPersonalizedProductsPage = lazy(() => import('../../pages/admin/AdminPersonalizedProductsPage'));
const AdminProductDetailPage = lazy(() => import('../../pages/admin/AdminProductDetailPage'));
const AdminSettingsPage = lazy(() => import('../../pages/admin/AdminSettingsPage'));
const AdminInstructorsPage = lazy(() => import('../../pages/admin/AdminInstructorsPage'));
const AdminInstructorDetailPage = lazy(() => import('../../pages/admin/AdminInstructorDetailPage'));
const AdminSupportPage = lazy(() => import('../../pages/admin/AdminSupportPage'));
const AdminJoinRequestsPage = lazy(() => import('../../pages/admin/AdminJoinRequestsPage'));
const AdminBlogPage = lazy(() => import('../../pages/admin/AdminBlogPage'));
const AdminContentManagementPage = lazy(() => import('../../pages/admin/AdminContentManagementPage'));
const AdminShippingPage = lazy(() => import('../../pages/admin/AdminShippingPage'));
const AdminSubscriptionsPage = lazy(() => import('../../pages/admin/AdminSubscriptionsPage'));
const AdminSubscriptionBoxPage = lazy(() => import('../../pages/admin/AdminSubscriptionBoxPage'));
const AdminCreativeWritingPackagesPage = lazy(() => import('../../pages/admin/AdminCreativeWritingPackagesPage'));
const AdminCreativeWritingServicesPage = lazy(() => import('../../pages/admin/AdminCreativeWritingServicesPage'));
const AdminServiceOrdersPage = lazy(() => import('../../pages/admin/AdminServiceOrdersPage'));
const AdminScheduledSessionsPage = lazy(() => import('../../pages/admin/AdminScheduledSessionsPage'));
const AdminIntegrationsPage = lazy(() => import('../../pages/admin/AdminIntegrationsPage'));
const AdminIntroductorySessionsPage = lazy(() => import('../../pages/admin/AdminIntroductorySessionsPage'));
const AdminPriceReviewPage = lazy(() => import('../../pages/admin/AdminPriceReviewPage'));
const AdminReportsPage = lazy(() => import('../../pages/admin/AdminReportsPage'));
const AdminAuditLogPage = lazy(() => import('../../pages/admin/AdminAuditLogPage'));


// Financials
const AdminFinancialsLayout = lazy(() => import('../../pages/admin/financials/AdminFinancialsLayout'));
const FinancialOverviewPage = lazy(() => import('../../pages/admin/financials/FinancialOverviewPage'));
const InstructorPayoutsPage = lazy(() => import('../../pages/admin/financials/InstructorPayoutsPage'));
const RevenueStreamsPage = lazy(() => import('../../pages/admin/financials/RevenueStreamsPage'));
const TransactionsLogPage = lazy(() => import('../../pages/admin/financials/TransactionsLogPage'));


// Instructor-specific pages
const InstructorDashboardPage = lazy(() => import('../../pages/admin/instructor/InstructorDashboardPage'));
const InstructorProfilePage = lazy(() => import('../../pages/admin/instructor/InstructorProfilePage'));
const InstructorSchedulePage = lazy(() => import('../../pages/admin/instructor/InstructorSchedulePage'));
const InstructorJourneysPage = lazy(() => import('../../pages/admin/instructor/InstructorJourneysPage'));
const InstructorFinancialsPage = lazy(() => import('../../pages/admin/instructor/InstructorFinancialsPage'));
const InstructorPricingPage = lazy(() => import('../../pages/admin/instructor/InstructorPricingPage'));


const AdminLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { permissions } = useAuth();

    // This is the key logic: Is the user ONLY an instructor and not a higher-level admin?
    const isInstructorOnly = permissions.isInstructor && !permissions.canViewGlobalStats;

    return (
        <div className="flex h-screen bg-muted/50" dir="rtl">
            <AdminSidebar isCollapsed={isSidebarCollapsed} />
            <main className="flex-1 flex flex-col">
                <AdminNavbar 
                    onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    isSidebarCollapsed={isSidebarCollapsed} 
                    onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                     <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {isInstructorOnly ? (
                                <>
                                    <Route index element={<InstructorDashboardPage />} />
                                    <Route path="profile" element={<InstructorProfilePage />} />
                                    <Route path="schedule" element={<InstructorSchedulePage />} />
                                    <Route path="journeys" element={<InstructorJourneysPage />} />
                                    <Route path="pricing" element={<InstructorPricingPage />} />
                                    <Route path="financials" element={<InstructorFinancialsPage />} />
                                    <Route path="*" element={<Navigate to="/admin" replace />} />
                                </>
                            ) : (
                                <>
                                     <Route index element={<AdminDashboardPage />} />
                                     <Route path="users" element={<PermissionBasedRoute permission="canManageUsers"><AdminUsersPage /></PermissionBasedRoute>} />
                                     <Route path="orders" element={<PermissionBasedRoute permission="canManageEnhaLakOrders"><AdminOrdersPage /></PermissionBasedRoute>} />
                                     <Route path="creative-writing" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminCreativeWritingPage /></PermissionBasedRoute>} />
                                     <Route path="personalized-products" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminPersonalizedProductsPage /></PermissionBasedRoute>} />
                                     <Route path="personalized-products/:id" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminProductDetailPage /></PermissionBasedRoute>} />
                                     <Route path="settings" element={<PermissionBasedRoute permission="canManageSettings"><AdminSettingsPage /></PermissionBasedRoute>} />
                                     <Route path="instructors" element={<PermissionBasedRoute permission="canManageInstructors"><AdminInstructorsPage /></PermissionBasedRoute>} />
                                     <Route path="instructors/:id" element={<PermissionBasedRoute permission="canManageInstructors"><AdminInstructorDetailPage /></PermissionBasedRoute>} />
                                     <Route path="support" element={<PermissionBasedRoute permission="canManageSupportTickets"><AdminSupportPage /></PermissionBasedRoute>} />
                                     <Route path="join-requests" element={<PermissionBasedRoute permission="canManageJoinRequests"><AdminJoinRequestsPage /></PermissionBasedRoute>} />
                                     <Route path="blog" element={<PermissionBasedRoute permission="canManageBlog"><AdminBlogPage /></PermissionBasedRoute>} />
                                     <Route path="content-management" element={<PermissionBasedRoute permission="canManageSiteContent"><AdminContentManagementPage /></PermissionBasedRoute>} />
                                     <Route path="shipping" element={<PermissionBasedRoute permission="canManageSettings"><AdminShippingPage /></PermissionBasedRoute>} />
                                     <Route path="subscriptions" element={<PermissionBasedRoute permission="canManageEnhaLakOrders"><AdminSubscriptionsPage /></PermissionBasedRoute>} />
                                     <Route path="subscription-box" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminSubscriptionBoxPage /></PermissionBasedRoute>} />
                                     <Route path="creative-writing-packages" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingPackagesPage /></PermissionBasedRoute>} />
                                     <Route path="creative-writing-services" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingServicesPage /></PermissionBasedRoute>} />
                                     <Route path="service-orders" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminServiceOrdersPage /></PermissionBasedRoute>} />
                                     <Route path="scheduled-sessions" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminScheduledSessionsPage /></PermissionBasedRoute>} />
                                     <Route path="introductory-sessions" element={<PermissionBasedRoute permission="canManageInstructors"><AdminIntroductorySessionsPage/></PermissionBasedRoute>} />
                                     <Route path="integrations" element={<PermissionBasedRoute permission="canManageSettings"><AdminIntegrationsPage/></PermissionBasedRoute>} />
                                     <Route path="price-review" element={<PermissionBasedRoute permission="canManageInstructors"><AdminPriceReviewPage/></PermissionBasedRoute>} />
                                     <Route path="reports" element={<PermissionBasedRoute permission="canManageFinancials"><AdminReportsPage /></PermissionBasedRoute>} />
                                     <Route path="audit-log" element={<PermissionBasedRoute permission="canViewAuditLog"><AdminAuditLogPage /></PermissionBasedRoute>} />

                                     <Route path="financials" element={<PermissionBasedRoute permission="canManageFinancials"><AdminFinancialsLayout /></PermissionBasedRoute>}>
                                        <Route index element={<FinancialOverviewPage />} />
                                        <Route path="instructor-payouts" element={<InstructorPayoutsPage />} />
                                        <Route path="revenue-streams" element={<RevenueStreamsPage />} />
                                        <Route path="transactions-log" element={<TransactionsLogPage />} />
                                     </Route>

                                     <Route path="*" element={<Navigate to="/admin" replace />} />
                                </>
                            )}
                        </Routes>
                    </Suspense>
                </div>
                <AdminFooter />
            </main>
        </div>
    );
};

export default AdminLayout;