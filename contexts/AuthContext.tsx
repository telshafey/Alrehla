import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { getPermissions, Permissions, UserRole } from '../lib/roles';
import type { ChildProfile, UserProfile } from '../lib/database.types';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { mockUsers, mockChildProfiles } from '../data/mockData';

export type { UserProfile, ChildProfile };

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
    addChildProfile: (profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateChildProfile: (profileData: Partial<ChildProfile> & { id: number }) => Promise<void>;
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

    // Check for logged-in user in localStorage on initial load
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const user: UserProfile = JSON.parse(storedUser);
                setCurrentUser(user);
                // Load related profiles
                if (user.role === 'user') {
                    setChildProfiles(mockChildProfiles.filter(c => c.user_id === user.id));
                } else if (user.role === 'student') {
                     const child = mockChildProfiles.find(c => c.student_user_id === user.id);
                     setCurrentChildProfile(child || null);
                }
            }
        } catch (e) {
            console.error("Failed to parse stored user", e);
            localStorage.removeItem('currentUser');
        }
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        // Note: In mock mode, password check is simplified
        const user = mockUsers.find(u => u.email === email);

        if (user) {
            const userProfile: UserProfile = {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
                role: user.role,
            };
            setCurrentUser(userProfile);
            localStorage.setItem('currentUser', JSON.stringify(userProfile));

            if (user.role === 'user') {
                const profiles = mockChildProfiles.filter(c => c.user_id === user.id);
                setChildProfiles(profiles);
            } else if (user.role === 'student') {
                const child = mockChildProfiles.find(c => c.student_user_id === user.id);
                setCurrentChildProfile(child || null);
                if (!child) {
                    addToast('لم يتم ربط حساب الطالب هذا بأي ملف طفل.', 'warning');
                }
            }
            setLoading(false);
            return true;
        } else {
            setError('Invalid email or password');
            addToast('فشل تسجيل الدخول. تحقق من بريدك وكلمة المرور.', 'error');
            setLoading(false);
            return false;
        }
    };

    const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        if (mockUsers.some(u => u.email === email)) {
            setError('Email already exists');
            addToast('فشل إنشاء الحساب. البريد الإلكتروني مستخدم بالفعل.', 'error');
            setLoading(false);
            return false;
        }

        const newUser: UserProfile = {
            id: `usr_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name,
            role,
            created_at: new Date().toISOString(),
        };
        // In a real app, you'd add the user to the mockUsers array for the session
        addToast('تم إنشاء الحساب بنجاح! (محاكاة)', 'success');
        // Automatically sign in the new user
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setLoading(false);
        return true;
    };

    const signOut = async () => {
        setCurrentUser(null);
        setChildProfiles([]);
        setCurrentChildProfile(null);
        localStorage.removeItem('currentUser');
        queryClient.clear();
        addToast('تم تسجيل الخروج بنجاح.', 'info');
    };
    
    const addChildProfile = async (profileData: Omit<ChildProfile, 'id' | 'user_id' | 'created_at'>) => {
        addToast("ميزة إضافة طفل غير مفعلة بعد (محاكاة).", 'info');
        // In a real app, you would have mutation logic here.
        return Promise.resolve();
    };

    const updateChildProfile = async (profileData: Partial<ChildProfile> & { id: number }) => {
        addToast("ميزة تعديل طفل غير مفعلة بعد (محاكاة).", 'info');
        // In a real app, you would have mutation logic here.
        return Promise.resolve();
    };

    const updateCurrentUser = (updatedData: Partial<UserProfile>) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const newUser = { ...prevUser, ...updatedData };
            localStorage.setItem('currentUser', JSON.stringify(newUser));
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
        addChildProfile,
        updateChildProfile,
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