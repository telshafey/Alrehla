
import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { getPermissions, Permissions, type UserRole } from '../lib/roles';
import type { ChildProfile, UserProfile } from '../lib/database.types';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { setToken, clearToken } from '../lib/tokenManager';

export type { UserProfile, ChildProfile, UserRole };

interface AuthContextType {
    currentUser: UserProfile | null;
    currentChildProfile: ChildProfile | null;
    isLoggedIn: boolean;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
    updateCurrentUser: (updatedData: Partial<UserProfile>) => void;
    loading: boolean;
    error: string | null;
    hasAdminAccess: boolean;
    permissions: Permissions;
    childProfiles: ChildProfile[];
    isParent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [currentChildProfile, setCurrentChildProfile] = useState<ChildProfile | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const fetchUserData = async (user: UserProfile) => {
        try {
            if (user.role === 'student') {
                const profile = await authService.getStudentProfile(user.id);
                setCurrentChildProfile(profile);
            } else if (['user', 'parent', 'super_admin', 'general_supervisor', 'instructor'].includes(user.role)) {
                const children = await authService.getUserChildren(user.id);
                setChildProfiles(children || []);
            }
        } catch (e) {
            console.warn("Could not fetch secondary user data, continuing...");
        }
    };

    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await authService.getCurrentUser();
                if (response && response.user) {
                    setCurrentUser(response.user);
                    // لا ننتظر تحميل بقية البيانات لفتح الواجهة
                    fetchUserData(response.user);
                }
            } catch (e) {
                console.error("Session sync error", e);
            } finally {
                // نضمن إنهاء وضع التحميل مهما كانت النتيجة
                setLoading(false);
            }
        };
        validateSession();
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { user, accessToken } = await authService.login(email, password);
            if (accessToken) setToken(accessToken);
            setCurrentUser(user);
            await fetchUserData(user);
            addToast(`مرحباً بك، ${user.name}!`, 'success');
            return true;
        } catch (e: any) {
            const msg = e.message || 'بيانات الدخول غير صحيحة';
            setError(msg);
            addToast(msg, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string, role: UserRole) => {
        setLoading(true);
        setError(null);
        try {
            const { user, accessToken } = await authService.register(email, password, name, role);
            if (accessToken) setToken(accessToken);
            setCurrentUser(user);
            addToast('تم إنشاء الحساب بنجاح!', 'success');
            return true;
        } catch (e: any) {
            setError(e.message);
            addToast(e.message, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await authService.logout();
        setCurrentUser(null);
        setChildProfiles([]);
        setCurrentChildProfile(null);
        clearToken();
        queryClient.clear();
        addToast('تم تسجيل الخروج بنجاح.', 'info');
    };
    
    const updateCurrentUser = (updatedData: Partial<UserProfile>) => {
        setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
    };
    
    const value = useMemo(() => {
        const userRole = currentUser?.role || 'user';
        const currentPermissions = getPermissions(userRole);
        
        return {
            currentUser,
            currentChildProfile,
            isLoggedIn: !!currentUser,
            signOut,
            signIn,
            signUp,
            updateCurrentUser,
            loading,
            error,
            // حق الوصول للوحة بناءً على الرتبة المباشرة
            hasAdminAccess: ['super_admin', 'general_supervisor', 'instructor', 'enha_lak_supervisor', 'creative_writing_supervisor'].includes(userRole),
            permissions: currentPermissions,
            childProfiles,
            isParent: childProfiles.length > 0,
        };
    }, [currentUser, currentChildProfile, loading, error, childProfiles]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
