
import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from './ToastContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import { getPermissions, adminAccessRoles } from '../lib/roles.ts';
import type { Permissions, UserRole } from '../lib/roles.ts';
import type { ChildProfile, Database } from '../lib/database.types.ts';
import { mockUsers, mockChildProfiles } from '../data/mockData.ts';

export type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
    currentUser: UserProfile | null;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
    permissions: Permissions;
    hasAdminAccess: boolean;
    childProfiles: ChildProfile[];
    currentChildProfile: ChildProfile | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    addChildProfile: (profileData: any) => Promise<void>;
    updateChildProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { data: childProfiles = [] } = useQuery({
        queryKey: ['childProfiles', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return [];
            // Mock fetching child profiles for the current user
            return mockChildProfiles.filter(p => p.user_id === currentUser.id);
        },
        enabled: !!currentUser,
    });

    const currentChildProfile = childProfiles.find(c => c.student_user_id === currentUser?.id) || null;

    useEffect(() => {
        // Mock session check
        setLoading(false);
    }, []);

    const handleAuthChange = useCallback((user: UserProfile | null) => {
        setCurrentUser(user);
        setError(null);
        if (user) {
            queryClient.invalidateQueries({ queryKey: ['childProfiles', user.id] });
        } else {
            queryClient.removeQueries({ queryKey: ['childProfiles'] });
        }
        setLoading(false);
    }, [queryClient]);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        const user = mockUsers.find(u => u.email === email);
        if (user) {
            handleAuthChange(user);
            addToast('تم تسجيل الدخول بنجاح!', 'success');
        } else {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
            addToast('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
            setLoading(false);
        }
    };
    
    const signUp = async (email: string, password: string, name: string, role: UserRole) => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
        addToast('تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني (محاكاة).', 'success');
        setLoading(false);
    };

    const signOut = async () => {
        handleAuthChange(null);
        addToast('تم تسجيل الخروج.', 'info');
    };
    
    const addChildProfile = async (profileData: any) => {
        addToast(`تمت إضافة ${profileData.name} بنجاح.`, 'success');
        queryClient.invalidateQueries({ queryKey: ['childProfiles', currentUser?.id] });
    };

    const updateChildProfile = async (profileData: any) => {
        addToast(`تم تحديث ملف ${profileData.name} بنجاح.`, 'success');
        queryClient.invalidateQueries({ queryKey: ['childProfiles', currentUser?.id] });
    };

    const permissions = getPermissions(currentUser?.role || 'user');
    const hasAdminAccess = !!currentUser && adminAccessRoles.includes(currentUser.role);

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        loading,
        error,
        permissions,
        hasAdminAccess,
        childProfiles,
        currentChildProfile,
        signIn,
        signUp,
        signOut,
        addChildProfile,
        updateChildProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
