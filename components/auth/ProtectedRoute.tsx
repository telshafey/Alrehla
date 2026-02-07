
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
    return <PageLoader text="جاري التحقق من الصلاحيات..." />;
  }

  // 1. التحقق من تسجيل الدخول
  if (!isLoggedIn || !currentUser) {
    if (adminOnly) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/account" state={{ from: location }} replace />;
  }
  
  // 2. حماية مسارات الإدارة
  if (adminOnly && !hasAdminAccess) {
    return <Navigate to="/account" replace />;
  }

  // 3. حماية مسارات الطالب (ومنع أولياء الأمور من دخولها بالخطأ)
  if (studentOnly) {
      if (currentUser.role !== 'student') {
          return <Navigate to="/account" replace />;
      }
  }

  // 4. حماية مسارات ولي الأمر/العامة من الطلاب
  // الطلاب يجب أن يبقوا داخل /student أو المسارات المشتركة مثل /journey
  // إذا حاول الطالب دخول /account (لوحة ولي الأمر)، نرجعه للوحته
  if (!studentOnly && !adminOnly && currentUser.role === 'student') {
      // السماح ببعض المسارات المشتركة مثل الجلسات والرحلات والدفع
      const allowedSharedPaths = ['/journey', '/session', '/checkout', '/payment-status'];
      const isAllowed = allowedSharedPaths.some(path => location.pathname.startsWith(path));
      
      if (!isAllowed) {
           return <Navigate to="/student/dashboard" replace />;
      }
  }

  // 5. السماح بالدخول
  return <>{children}</>;
};

export default ProtectedRoute;
