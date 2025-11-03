import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { getPermissions, Permissions, type UserRole } from '../lib/roles';
import type { ChildProfile, UserProfile } from '../lib/database.types';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/tokenManager';
import { mockUsers, mockChildProfiles } from '../data/mockData'; // Import mock data

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

    useEffect(() => {
        const validateSession = async () => {
            // 1. Check for mock user session first
            const mockUserEmail = localStorage.getItem('mockUserEmail');
            if (mockUserEmail) {
                const user = mockUsers.find(u => u.email === mockUserEmail);
                if (user) {
                    setCurrentUser(user);
                    if (user.role === 'user') {
                        setChildProfiles(mockChildProfiles.filter(c => c.user_id === user.id));
                    }
                    if (user.role === 'student') {
                        const profile = mockChildProfiles.find(c => c.student_user_id === user.id);
                        setCurrentChildProfile(profile || null);
                    }
                }
                setLoading(false);
                return;
            }

            // 2. If no mock session, check for real token
            const token = getToken();
            if (token) {
                try {
                    const { user } = await apiClient.get<{ user: UserProfile }>('/auth/me');
                    setCurrentUser(user);
                    
                    if (user.role === 'user' || user.role === 'student') {
                        const accountData = await apiClient.get<{ childProfiles: ChildProfile[], currentChildProfile?: ChildProfile }>('/user/account-data');
                        setChildProfiles(accountData.childProfiles || []);
                        if (user.role === 'student') {
                            setCurrentChildProfile(accountData.currentChildProfile || null);
                        }
                    }
                } catch (e: any) {
                    console.error("Session validation failed", e);
                    clearToken(); // Token is invalid, clear it
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        };

        validateSession();
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        // --- DEMO LOGIN LOGIC ---
        if (password === '123456') {
            const user = mockUsers.find(u => u.email === email);
            if (user) {
                setCurrentUser(user);
                if (user.role === 'user') {
                    setChildProfiles(mockChildProfiles.filter(c => c.user_id === user.id));
                }
                if (user.role === 'student') {
                    const profile = mockChildProfiles.find(c => c.student_user_id === user.id);
                    setCurrentChildProfile(profile || null);
                }
                clearToken(); // Ensure no real token is present
                localStorage.setItem('mockUserEmail', user.email);
                addToast(`مرحباً بعودتك (تجريبي)، ${user.name}!`, 'success');
                setLoading(false);
                return true;
            }
        }
        // --- END DEMO LOGIN LOGIC ---
        
        // --- REAL API LOGIN LOGIC ---
        try {
            const { user, accessToken } = await apiClient.post<{ user: UserProfile, accessToken: string }>('/auth/login', { email, password });
            setToken(accessToken);
            localStorage.removeItem('mockUserEmail'); // Clear mock session
            setCurrentUser(user);
            
            if (user.role === 'user' || user.role === 'student') {
                 const accountData = await apiClient.get<{ childProfiles: ChildProfile[], currentChildProfile?: ChildProfile }>('/user/account-data');
                 setChildProfiles(accountData.childProfiles || []);
                 if (user.role === 'student') {
                     setCurrentChildProfile(accountData.currentChildProfile || null);
                 }
            }
            
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
            const { user, accessToken } = await apiClient.post<{ user: UserProfile, accessToken: string }>('/auth/register', { email, password, name, role });
            setToken(accessToken);
            localStorage.removeItem('mockUserEmail'); // Clear mock session
            setCurrentUser(user);
            setChildProfiles([]); // New user has no child profiles yet
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
        setCurrentUser(null);
        setChildProfiles([]);
        setCurrentChildProfile(null);
        clearToken();
        localStorage.removeItem('mockUserEmail');
        queryClient.clear();
        addToast('تم تسجيل الخروج بنجاح.', 'info');
    };
    
    const updateCurrentUser = (updatedData: Partial<UserProfile>) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const newUser = { ...prevUser, ...updatedData };
            // Note: This is a client-side update for optimistic UI. 
            // The source of truth is the server, updated via mutations.
            return newUser;
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