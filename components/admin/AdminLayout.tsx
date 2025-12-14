
import React, { useState, Suspense, lazy } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import PageLoader from '../ui/PageLoader';
import PermissionBasedRoute from '../auth/PermissionBasedRoute';

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import('../../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../../pages/admin/AdminUsersPage'));
const AdminUserFormPage = lazy(() => import('../../pages/admin/AdminUserFormPage'));
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
const AdminBlogPostEditorPage = lazy(() => import('../../pages/admin/AdminBlogPostEditorPage'));
const AdminContentManagementPage = lazy(() => import('../../pages/admin/AdminContentManagementPage'));
const AdminShippingPage = lazy(() => import('../../pages/admin/AdminShippingPage'));
const AdminSubscriptionsPage = lazy(() => import('../../pages/admin/AdminSubscriptionsPage'));
const AdminSubscriptionBoxPage = lazy(() => import('../../pages/admin/AdminSubscriptionBoxPage'));
const AdminCreativeWritingPackagesPage = lazy(() => import('../../pages/admin/AdminCreativeWritingPackagesPage'));
const AdminPackageDetailPage = lazy(() => import('../../pages/admin/AdminPackageDetailPage'));
const AdminCreativeWritingServicesPage = lazy(() => import('../../pages/admin/AdminCreativeWritingServicesPage'));
const AdminServiceDetailPage = lazy(() => import('../../pages/admin/AdminServiceDetailPage'));
const AdminServiceOrdersPage = lazy(() => import('../../pages/admin/AdminServiceOrdersPage'));
const AdminScheduledSessionsPage = lazy(() => import('../../pages/admin/AdminScheduledSessionsPage'));
const AdminIntegrationsPage = lazy(() => import('../../pages/admin/AdminIntegrationsPage'));
const AdminIntroductorySessionsPage = lazy(() => import('../../pages/admin/AdminIntroductorySessionsPage'));
const AdminPriceReviewPage = lazy(() => import('../../pages/admin/AdminPriceReviewPage'));
const AdminReportsPage = lazy(() => import('../../pages/admin/AdminReportsPage'));
const AdminAuditLogPage = lazy(() => import('../../pages/admin/AdminAuditLogPage'));
const AdminMigrationPage = lazy(() => import('../../pages/admin/AdminMigrationPage'));

// Financials
const AdminFinancialsLayout = lazy(() => import('../../pages/admin/financials/AdminFinancialsLayout'));
const FinancialOverviewPage = lazy(() => import('../../pages/admin/financials/FinancialOverviewPage'));
const InstructorPayoutsPage = lazy(() => import('../../pages/admin/financials/InstructorPayoutsPage'));
const InstructorFinancialDetailsPage = lazy(() => import('../../pages/admin/financials/InstructorFinancialDetailsPage'));
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
    const location = useLocation();

    const isInstructorOnly = permissions.isInstructor && !permissions.canViewGlobalStats;

    return (
        <div className="flex h-screen bg-muted/30 overflow-hidden" dir="rtl">
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <AdminSidebar 
                isCollapsed={isSidebarCollapsed} 
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Main Content Wrapper */}
            <main className="flex-1 flex flex-col w-full md:w-auto min-w-0 overflow-hidden relative transition-all duration-300">
                <AdminNavbar 
                    onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} 
                    isSidebarCollapsed={isSidebarCollapsed} 
                    onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                
                {/* Scrollable Page Content Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
                     {/* 
                        Flex-1 here ensures this div takes up all remaining space.
                        min-h-[calc(100vh-4rem)] ensures it's at least the height of the screen minus navbar,
                        forcing the footer to the bottom even if content is short.
                     */}
                     <div className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
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
                                        <Route path="users/new" element={<PermissionBasedRoute permission="canManageUsers"><AdminUserFormPage /></PermissionBasedRoute>} />
                                        <Route path="users/:id" element={<PermissionBasedRoute permission="canManageUsers"><AdminUserFormPage /></PermissionBasedRoute>} />
                                        
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
                                        <Route path="blog/:id" element={<PermissionBasedRoute permission="canManageBlog"><AdminBlogPostEditorPage /></PermissionBasedRoute>} />
                                        
                                        {/* Force Remount on key change for content pages */}
                                        <Route path="content/:sectionKey" element={<PermissionBasedRoute permission="canManageSiteContent"><AdminContentManagementPage key={location.pathname} /></PermissionBasedRoute>} />
                                        
                                        <Route path="shipping" element={<PermissionBasedRoute permission="canManageSettings"><AdminShippingPage /></PermissionBasedRoute>} />
                                        <Route path="subscriptions" element={<PermissionBasedRoute permission="canManageEnhaLakOrders"><AdminSubscriptionsPage /></PermissionBasedRoute>} />
                                        <Route path="subscription-box" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminSubscriptionBoxPage /></PermissionBasedRoute>} />
                                        <Route path="creative-writing-packages" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingPackagesPage /></PermissionBasedRoute>} />
                                        <Route path="creative-writing-packages/:id" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminPackageDetailPage /></PermissionBasedRoute>} />
                                        <Route path="creative-writing-services" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingServicesPage /></PermissionBasedRoute>} />
                                        <Route path="creative-writing-services/:id" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminServiceDetailPage /></PermissionBasedRoute>} />
                                        <Route path="service-orders" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminServiceOrdersPage /></PermissionBasedRoute>} />
                                        <Route path="scheduled-sessions" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminScheduledSessionsPage /></PermissionBasedRoute>} />
                                        <Route path="introductory-sessions" element={<PermissionBasedRoute permission="canManageInstructors"><AdminIntroductorySessionsPage/></PermissionBasedRoute>} />
                                        <Route path="integrations" element={<PermissionBasedRoute permission="canManageSettings"><AdminIntegrationsPage/></PermissionBasedRoute>} />
                                        <Route path="price-review" element={<PermissionBasedRoute permission="canManageInstructors"><AdminPriceReviewPage/></PermissionBasedRoute>} />
                                        <Route path="reports" element={<PermissionBasedRoute permission="canManageFinancials"><AdminReportsPage /></PermissionBasedRoute>} />
                                        <Route path="audit-log" element={<PermissionBasedRoute permission="canViewAuditLog"><AdminAuditLogPage /></PermissionBasedRoute>} />
                                        
                                        {/* Migration Page - Restricted to Super Admins typically, or general Settings permission */}
                                        <Route path="migration" element={<PermissionBasedRoute permission="canManageSettings"><AdminMigrationPage /></PermissionBasedRoute>} />

                                        <Route path="financials" element={<PermissionBasedRoute permission="canManageFinancials"><AdminFinancialsLayout /></PermissionBasedRoute>}>
                                            <Route index element={<FinancialOverviewPage />} />
                                            <Route path="instructor-payouts" element={<InstructorPayoutsPage />} />
                                            <Route path="instructor-payouts/:id" element={<InstructorFinancialDetailsPage />} />
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
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
