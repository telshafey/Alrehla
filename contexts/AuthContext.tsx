
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
        if (user.role === 'user') {
            const children = await authService.getUserChildren(user.id);
            setChildProfiles(children);
        } else if (user.role === 'student') {
            const profile = await authService.getStudentProfile(user.id);
            setCurrentChildProfile(profile);
        }
    };

    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await authService.getCurrentUser();
                if (response && response.user) {
                    setCurrentUser(response.user);
                    await fetchUserData(response.user);
                } else {
                    // Session invalid or expired
                    setCurrentUser(null);
                }
            } catch (e) {
                console.error("Session validation failed", e);
                setCurrentUser(null);
            } finally {
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
            setToken(accessToken);
            setCurrentUser(user);
            await fetchUserData(user);
            addToast(`مرحباً بعودتك، ${user.name}!`, 'success');
            return true;
        } catch (e: any) {
            setError(e.message);
            addToast(`فشل تسجيل الدخول: ${e.message}`, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { user, accessToken } = await authService.register(email, password, name, role);
            setToken(accessToken);
            setCurrentUser(user);
            setChildProfiles([]); 
            addToast('تم إنشاء حسابك بنجاح!', 'success');
            return true;
        } catch (e: any) {
            setError(e.message);
            addToast(`فشل إنشاء الحساب: ${e.message}`, 'error');
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
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...updatedData };
        });
    };
    
    const isParent = useMemo(() => childProfiles.length > 0, [childProfiles]);

    const value: AuthContextType = useMemo(() => ({
        currentUser,
        currentChildProfile,
        isLoggedIn: !!currentUser,
        signOut,
        signIn,
        signUp,
        updateCurrentUser,
        loading,
        error,
        hasAdminAccess: currentUser ? getPermissions(currentUser.role).canViewDashboard : false,
        permissions: currentUser ? getPermissions(currentUser.role) : getPermissions('user'),
        childProfiles,
        isParent,
    }), [currentUser, currentChildProfile, loading, error, childProfiles, isParent]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
