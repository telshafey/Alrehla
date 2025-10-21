import React, { Suspense, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.tsx';
import PageLoader from '../ui/PageLoader.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import type { Permissions } from '../../lib/roles.ts';
import AdminNavbar from './AdminNavbar.tsx';
import AdminFooter from './AdminFooter.tsx';

// Lazy load all admin pages
const AdminDashboardPage = React.lazy(() => import('../../pages/admin/AdminDashboardPage.tsx'));
const AdminOrdersPage = React.lazy(() => import('../../pages/admin/AdminOrdersPage.tsx'));
const AdminProductsPage = React.lazy(() => import('../../pages/admin/AdminProductsPage.tsx'));
const AdminSettingsPage = React.lazy(() => import('../../pages/admin/AdminSettingsPage.tsx'));
const AdminUsersPage = React.lazy(() => import('../../pages/admin/AdminUsersPage.tsx'));
const AdminPersonalizedProductsPage = React.lazy(() => import('../../pages/admin/AdminPersonalizedProductsPage.tsx'));
const AdminCreativeWritingPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPage.tsx'));
const AdminInstructorsPage = React.lazy(() => import('../../pages/admin/AdminInstructorsPage.tsx'));
const AdminContentManagementPage = React.lazy(() => import('../../pages/admin/AdminContentManagementPage.tsx'));
const AdminSupportPage = React.lazy(() => import('../../pages/admin/AdminSupportPage.tsx'));
const AdminJoinRequestsPage = React.lazy(() => import('../../pages/admin/AdminJoinRequestsPage.tsx'));
const AdminBlogPage = React.lazy(() => import('../../pages/admin/AdminBlogPage.tsx'));
const AdminSubscriptionsPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionsPage.tsx'));
const InstructorDashboardPage = React.lazy(() => import('../../pages/admin/InstructorDashboardPage.tsx'));
const AdminShippingPage = React.lazy(() => import('../../pages/admin/AdminShippingPage.tsx'));


const PermissionBasedRoute: React.FC<{ children: React.ReactElement, permission: keyof Permissions }> = ({ children, permission }) => {
    const { permissions } = useAuth();
    if (permissions[permission]) {
        return children;
    }
    return <Navigate to="/admin" replace />; 
};

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
              <Route path="personalized-products" element={<PermissionBasedRoute permission="canManageEnhaLakProducts"><AdminPersonalizedProductsPage /></PermissionBasedRoute>} />
              <Route path="prices" element={<PermissionBasedRoute permission="canManagePrices"><AdminProductsPage /></PermissionBasedRoute>} />
              <Route path="shipping" element={<PermissionBasedRoute permission="canManageShipping"><AdminShippingPage /></PermissionBasedRoute>} />
              <Route path="creative-writing" element={<PermissionBasedRoute permission="canManageCreativeWritingBookings"><AdminCreativeWritingPage /></PermissionBasedRoute>} />
              <Route path="instructors" element={<PermissionBasedRoute permission="canManageCreativeWritingInstructors"><AdminInstructorsPage /></PermissionBasedRoute>} />
              <Route path="content-management" element={<PermissionBasedRoute permission="canManageContent"><AdminContentManagementPage /></PermissionBasedRoute>} />
              <Route path="blog" element={<PermissionBasedRoute permission="canManageBlog"><AdminBlogPage /></PermissionBasedRoute>} />
              <Route path="support" element={<PermissionBasedRoute permission="canManageSupportTickets"><AdminSupportPage /></PermissionBasedRoute>} />
              <Route path="join-requests" element={<PermissionBasedRoute permission="canManageJoinRequests"><AdminJoinRequestsPage /></PermissionBasedRoute>} />
          </Routes>
      );
  }

  return (
    <div className="flex h-screen bg-gray-100">
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
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
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