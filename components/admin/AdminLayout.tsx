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
const AdminContentManagementPage = React.lazy(() => import('../../pages/admin/AdminContentManagementPage'));
const AdminSupportPage = React.lazy(() => import('../../pages/admin/AdminSupportPage'));
const AdminJoinRequestsPage = React.lazy(() => import('../../pages/admin/AdminJoinRequestsPage'));
const AdminBlogPage = React.lazy(() => import('../../pages/admin/AdminBlogPage'));
const AdminSubscriptionsPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionsPage'));
const InstructorDashboardPage = React.lazy(() => import('../../pages/admin/InstructorDashboardPage'));
const AdminShippingPage = React.lazy(() => import('../../pages/admin/AdminShippingPage'));
const AdminSupportRequestsPage = React.lazy(() => import('../../pages/admin/AdminSupportRequestsPage'));
const AdminScheduledSessionsPage = React.lazy(() => import('../../pages/admin/AdminScheduledSessionsPage'));
const AdminSubscriptionBoxPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionBoxPage'));
const AdminServiceOrdersPage = React.lazy(() => import('../../pages/admin/AdminServiceOrdersPage'));
const AdminCreativeWritingPackagesPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPackagesPage'));
const AdminCreativeWritingServicesPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingServicesPage'));
const AdminIntroductorySessionsPage = React.lazy(() => import('../../pages/admin/AdminIntroductorySessionsPage'));


const AdminLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile overlay
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse

  let routesContent;

  if (currentUser?.role === 'instructor') {
      routesContent = (
          <Routes>
              <Route path="/*" element={<InstructorDashboardPage />} />
          </Routes>
      );
  } else {
      routesContent = (
          <Routes>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<PermissionBasedRoute permission="canManageUsers"><AdminUsersPage /></PermissionBasedRoute>} />
              <Route path="settings" element={<PermissionBasedRoute permission="canManageSettings"><AdminSettingsPage /></PermissionBasedRoute>} />
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
              <Route path="introductory-sessions" element={<PermissionBasedRoute permission="canManageSchedules"><AdminIntroductorySessionsPage/></PermissionBasedRoute>} />
              <Route path="instructors" element={<PermissionBasedRoute permission="canManageCreativeWritingInstructors"><AdminInstructorsPage /></PermissionBasedRoute>} />
              <Route path="support-requests" element={<PermissionBasedRoute permission="canManageSupportRequests"><AdminSupportRequestsPage /></PermissionBasedRoute>} />
              <Route path="content-management" element={<PermissionBasedRoute permission="canManageContent"><AdminContentManagementPage /></PermissionBasedRoute>} />
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