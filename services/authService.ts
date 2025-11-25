
import { mockUsers, mockChildProfiles } from '../data/mockData';
import type { UserProfile, ChildProfile, UserRole } from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

// Flag to switch between Mock and Real API globally for Auth
const USE_MOCK_AUTH = true;

export const authService = {
    async login(email: string, password: string) {
        if (USE_MOCK_AUTH) {
            // Simulate network delay
            await mockFetch(null, 800);
            
            // Demo Logic
            if (password === '123456') {
                const user = mockUsers.find(u => u.email === email);
                if (!user) throw new Error('البريد الإلكتروني غير صحيح');
                
                // Store mock session
                localStorage.setItem('mockUserEmail', user.email);
                return {
                    user,
                    accessToken: 'mock_token_' + Math.random().toString(36).substr(2),
                };
            }
            throw new Error('كلمة المرور غير صحيحة');
        } else {
            // Real API Logic (Laravel Sanctum)
            const response = await apiClient.post<{ user: UserProfile, accessToken: string }>('/auth/login', { email, password });
            return response;
        }
    },

    async register(email: string, password: string, name: string, role: UserRole) {
        if (USE_MOCK_AUTH) {
            await mockFetch(null, 1000);
            // Check if email exists
            if (mockUsers.find(u => u.email === email)) {
                throw new Error('البريد الإلكتروني مستخدم بالفعل');
            }
            
            const newUser: UserProfile = {
                id: `usr_${Math.random().toString(36).substr(2, 9)}`,
                email,
                name,
                role,
                created_at: new Date().toISOString(),
            };
            
            localStorage.setItem('mockUserEmail', newUser.email);
            // In a real mock scenario, we would push to mockUsers array, 
            // but since it's imported from a file, we simulate success for the session.
            
            return {
                user: newUser,
                accessToken: 'mock_token_' + Math.random().toString(36).substr(2),
            };
        } else {
            return apiClient.post<{ user: UserProfile, accessToken: string }>('/auth/register', { email, password, name, role });
        }
    },

    async logout() {
        if (USE_MOCK_AUTH) {
            localStorage.removeItem('mockUserEmail');
            await mockFetch(null, 300);
        } else {
            // await apiClient.post('/auth/logout', {});
            localStorage.removeItem('accessToken');
        }
    },

    async getCurrentUser() {
        if (USE_MOCK_AUTH) {
            const mockEmail = localStorage.getItem('mockUserEmail');
            if (!mockEmail) return null;
            
            // Simulate verifying token
            const user = mockUsers.find(u => u.email === mockEmail);
            return user ? { user } : null;
        } else {
            return apiClient.get<{ user: UserProfile }>('/auth/me');
        }
    },

    async getUserChildren(userId: string) {
        if (USE_MOCK_AUTH) {
            return mockChildProfiles.filter(c => c.user_id === userId);
        } else {
            const res = await apiClient.get<{ childProfiles: ChildProfile[] }>('/user/child-profiles');
            return res.childProfiles;
        }
    },
    
    async getStudentProfile(userId: string) {
        if (USE_MOCK_AUTH) {
            return mockChildProfiles.find(c => c.student_user_id === userId) || null;
        } else {
             const res = await apiClient.get<{ currentChildProfile: ChildProfile }>('/user/student-profile');
             return res.currentChildProfile;
        }
    }
};
