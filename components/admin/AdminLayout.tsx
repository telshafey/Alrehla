import React, { Suspense, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../ui/PageLoader';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import PermissionBasedRoute from '../auth/PermissionBasedRoute';

// Lazy load all admin pages
const AdminDashboardPage = React.lazy(() => import('../../pages/admin/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('../../pages/admin/AdminOrdersPage'));
const AdminSettingsPage = React.lazy(() => import('../../pages/admin/AdminSettingsPage'));
const AdminUsersPage = React.lazy(() => import('../../pages/admin/AdminUsersPage'));
const AdminPersonalizedProductsPage = React.lazy(() => import('../../pages/admin/AdminPersonalizedProductsPage'));
const AdminProductDetailPage = React.lazy(() => import('../../pages/admin/AdminProductDetailPage'));
const AdminCreativeWritingPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPage'));
const AdminInstructorsPage = React.lazy(() => import('../../pages/admin/AdminInstructorsPage'));
const AdminInstructorDetailPage = React.lazy(() => import('../../pages/admin/AdminInstructorDetailPage'));
const AdminContentManagementPage = React.lazy(() => import('../../pages/admin/AdminContentManagementPage'));
const AdminPageContentEditor = React.lazy(() => import('../../pages/admin/content-editor/AdminPageContentEditor'));
const AdminSupportPage = React.lazy(() => import('../../pages/admin/AdminSupportPage'));
const AdminJoinRequestsPage = React.lazy(() => import('../../pages/admin/AdminJoinRequestsPage'));
const AdminBlogPage = React.lazy(() => import('../../pages/admin/AdminBlogPage'));
const AdminSubscriptionsPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionsPage'));
const AdminShippingPage = React.lazy(() => import('../../pages/admin/AdminShippingPage'));
const AdminIntegrationsPage = React.lazy(() => import('../../pages/admin/AdminIntegrationsPage'));

const AdminScheduledSessionsPage = React.lazy(() => import('../../pages/admin/AdminScheduledSessionsPage'));
const AdminSubscriptionBoxPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionBoxPage'));
const AdminServiceOrdersPage = React.lazy(() => import('../../pages/admin/AdminServiceOrdersPage'));
const AdminCreativeWritingPackagesPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPackagesPage'));
const AdminCreativeWritingServicesPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingServicesPage'));

const AdminPriceReviewPage = React.lazy(() => import('../../pages/admin/AdminPriceReviewPage'));

// Lazy load instructor pages
const InstructorDashboardPage = React.lazy(() => import('../../pages/admin/instructor/InstructorDashboardPage'));
const InstructorJourneysPage = React.lazy(() => import('../../pages/admin/instructor/InstructorJourneysPage'));
const InstructorFinancialsPage = React.lazy(() => import('../../pages/admin/instructor/InstructorFinancialsPage'));
const InstructorSchedulePage = React.lazy(() => import('../../pages/admin/instructor/InstructorSchedulePage'));
const InstructorProfilePage = React.lazy(() => import('../../pages/admin/instructor/InstructorProfilePage'));
const InstructorPricingPage = React.lazy(() => import('../../pages/admin/instructor/InstructorPricingPage'));


const AdminLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile overlay
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse

  let routesContent;

  if (currentUser?.role === 'instructor') {
      routesContent = (
          <Routes>
              <Route index element={<InstructorDashboardPage />} />
              <Route path="journeys" element={<InstructorJourneysPage />} />
              <Route path="financials" element={<InstructorFinancialsPage />} />
              <Route path="schedule" element={<InstructorSchedulePage />} />
              <Route path="profile" element={<InstructorProfilePage />} />
              <Route path="pricing" element={<InstructorPricingPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
      );
  } else {
      routesContent = (
          <Routes>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<PermissionBasedRoute permission="canManageUsers"><AdminUsersPage /></PermissionBasedRoute>} />
              <Route path="settings" element={<PermissionBasedRoute permission="canManageSettings"><AdminSettingsPage /></PermissionBasedRoute>} />
              <Route path="integrations" element={<PermissionBasedRoute permission="canManageSettings"><AdminIntegrationsPage /></PermissionBasedRoute>} />
              <Route path="orders" element={<PermissionBasedRoute permission="canManageEnhaLakOrders"><AdminOrdersPage /></PermissionBasedRoute>} />
              <Route path="subscriptions" element={<PermissionBasedRoute permission="canManageEnhaLakSubscriptions"><AdminSubscriptionsPage /></PermissionBasedRoute>} />
              <Route path="subscription-box" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminSubscriptionBoxPage /></PermissionBasedRoute>} />
              <Route path="personalized-products" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminPersonalizedProductsPage /></PermissionBasedRoute>} />
              <Route path="personalized-products/new" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminProductDetailPage /></PermissionBasedRoute>} />
              <Route path="personalized-products/:id" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminProductDetailPage /></PermissionBasedRoute>} />
              <Route path="shipping" element={<PermissionBasedRoute permission="canManageShipping"><AdminShippingPage /></PermissionBasedRoute>} />
              <Route path="creative-writing" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminCreativeWritingPage /></PermissionBasedRoute>} />
              <Route path="service-orders" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminServiceOrdersPage /></PermissionBasedRoute>} />
              <Route path="creative-writing-packages" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingPackagesPage/></PermissionBasedRoute>} />
              <Route path="creative-writing-services" element={<PermissionBasedRoute permission="canManageCreativeWritingSettings"><AdminCreativeWritingServicesPage/></PermissionBasedRoute>} />
              
              <Route path="instructors" element={<PermissionBasedRoute permission="canManageCreativeWritingInstructors"><AdminInstructorsPage /></PermissionBasedRoute>} />
              <Route path="instructors/new" element={<PermissionBasedRoute permission="canManageCreativeWritingInstructors"><AdminInstructorDetailPage /></PermissionBasedRoute>} />
              <Route path="instructors/:id" element={<PermissionBasedRoute permission="canManageCreativeWritingInstructors"><AdminInstructorDetailPage /></PermissionBasedRoute>} />
              <Route path="pricing-review" element={<PermissionBasedRoute permission="canManagePrices"><AdminPriceReviewPage/></PermissionBasedRoute>} />
              
              <Route path="content-management" element={<PermissionBasedRoute permission="canManageContent"><AdminContentManagementPage /></PermissionBasedRoute>} />
              <Route path="content/:pageKey" element={<PermissionBasedRoute permission="canManageContent"><AdminPageContentEditor /></PermissionBasedRoute>} />
              <Route path="blog" element={<PermissionBasedRoute permission="canManageBlog"><AdminBlogPage /></PermissionBasedRoute>} />
              <Route path="support" element={<PermissionBasedRoute permission="canManageSupportTickets"><AdminSupportPage /></PermissionBasedRoute>} />
              <Route path="join-requests" element={<PermissionBasedRoute permission="canManageJoinRequests"><AdminJoinRequestsPage /></PermissionBasedRoute>} />
              <Route path="scheduled-sessions" element={<PermissionBasedRoute permission="canManageSchedules"><AdminScheduledSessionsPage /></PermissionBasedRoute>} />
          </Routes>
      );
  }

  return (
    <div className="flex h-screen bg-muted/40">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isCollapsed={isSidebarCollapsed}
        />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64'}`}>
            <AdminNavbar 
                onMobileMenuToggle={() => setIsSidebarOpen(true)}
                isSidebarCollapsed={isSidebarCollapsed}
                onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="flex-1 overflow-y-auto p-6 sm:p-8">
                <Suspense fallback={<PageLoader text="جاري تحميل الصفحة..." />}>
                    {routesContent}
                </Suspense>
                <AdminFooter />
            </main>
        </div>
    </div>
  );
};

export default AdminLayout;
