import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Permissions } from '../../lib/roles';

const PermissionBasedRoute: React.FC<{ children: React.ReactElement; permission: keyof Permissions }> = ({ children, permission }) => {
    const { permissions } = useAuth();
    if (permissions[permission]) {
        return children;
    }
    // Redirect to the main admin dashboard if the user lacks specific permission
    return <Navigate to="/admin" replace />; 
};

export default PermissionBasedRoute;
