
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageLoader from '../ui/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  studentOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false, studentOnly = false }) => {
  const { isLoggedIn, hasAdminAccess, currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader text="جاري التحقق من صلاحيات الدخول..." />;
  }

  // 1. If user is not logged in
  if (!isLoggedIn) {
    // If trying to access admin area, redirect to Admin Login
    if (adminOnly) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Otherwise redirect to standard Account Login
    return <Navigate to="/account" state={{ from: location }} replace />;
  }
  
  // 2. If it's an admin-only route, check for admin access
  if (adminOnly && !hasAdminAccess) {
    // Redirect non-admins to the main account page
    return <Navigate to="/account" replace />;
  }

  // 3. If it's a student-only route, check for student role
  if (studentOnly && currentUser?.role !== 'student') {
     // Redirect non-students to the main account page
    return <Navigate to="/account" replace />;
  }

  // 4. If all checks pass, render the requested component
  return <>{children}</>;
};

export default ProtectedRoute;
