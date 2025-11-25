
import { mockUsers, mockChildProfiles } from '../data/mockData';
import type { UserProfile, ChildProfile } from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

// Toggle this to switch between Mock and Real API
const USE_MOCK = true;

export const userService = {
    // --- Queries ---
    async getAllUsers() {
        if (USE_MOCK) {
            return mockFetch(mockUsers);
        }
        return apiClient.get<UserProfile[]>('/admin/users');
    },

    async getAllChildProfiles() {
        if (USE_MOCK) {
            return mockFetch(mockChildProfiles);
        }
        return apiClient.get<ChildProfile[]>('/admin/child-profiles');
    },

    async getUserById(id: string) {
        if (USE_MOCK) {
            const user = mockUsers.find(u => u.id === id);
            return mockFetch(user);
        }
        return apiClient.get<UserProfile>(`/admin/users/${id}`);
    },

    // --- Mutations ---
    async updateUser(payload: { id: string, name?: string, role?: string, address?: string, governorate?: string, phone?: string }) {
        if (USE_MOCK) {
            console.log("Service: Updating user (mock)", payload);
            return mockFetch({ ...payload });
        }
        return apiClient.put<UserProfile>(`/admin/users/${payload.id}`, payload);
    },

    async updateUserPassword(payload: { userId: string, currentPassword?: string, newPassword?: string }) {
        if (USE_MOCK) {
            console.log("Service: Updating password (mock)", payload.userId);
            return mockFetch({ success: true });
        }
        return apiClient.put<{ success: boolean }>(`/admin/users/${payload.userId}/password`, payload);
    },

    async createChildProfile(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating child profile (mock)", payload);
            return mockFetch({ ...payload, id: Math.floor(Math.random() * 10000) });
        }
        return apiClient.post<ChildProfile>('/user/child-profiles', payload);
    },

    async updateChildProfile(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating child profile (mock)", payload);
            return mockFetch(payload);
        }
        return apiClient.put<ChildProfile>(`/user/child-profiles/${payload.id}`, payload);
    },

    async deleteChildProfile(childId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting child profile (mock)", childId);
            return mockFetch({ success: true });
        }
        return apiClient.delete<{ success: boolean }>(`/user/child-profiles/${childId}`);
    },

    async createAndLinkStudentAccount(payload: { name: string, email: string, password: string, childProfileId: number }) {
        if (USE_MOCK) {
            console.log("Service: Creating student account (mock)", payload);
            return mockFetch({ success: true }, 800);
        }
        return apiClient.post<{ success: boolean }>('/admin/students/create-link', payload);
    },

    async linkStudentToChildProfile(payload: { studentUserId: string, childProfileId: number }) {
        if (USE_MOCK) {
            console.log("Service: Linking student (mock)", payload);
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>('/admin/students/link', payload);
    },

    async unlinkStudentFromChildProfile(childProfileId: number) {
        if (USE_MOCK) {
            console.log("Service: Unlinking student (mock)", childProfileId);
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>('/admin/students/unlink', { childProfileId });
    },

    async bulkDeleteUsers(userIds: string[]) {
        if (USE_MOCK) {
            console.log("Service: Bulk deleting users (mock)", userIds);
            return mockFetch({ success: true });
        }
        return apiClient.post<{ success: boolean }>('/admin/users/bulk-delete', { userIds });
    }
};
