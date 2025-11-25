
import { 
    mockBookings, 
    mockScheduledSessions,
    mockInstructors,
    mockSessionAttachments
} from '../data/mockData';
import type { 
    CreativeWritingBooking, 
    ScheduledSession, 
    Instructor,
    BookingStatus,
    CreativeWritingPackage,
    StandaloneService,
    SessionAttachment
} from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const bookingService = {
    // --- Queries ---
    async getAllBookings() {
        if (USE_MOCK) {
            return mockFetch(mockBookings as CreativeWritingBooking[]);
        }
        return apiClient.get<CreativeWritingBooking[]>('/admin/bookings');
    },

    async getAllScheduledSessions() {
        if (USE_MOCK) {
            return mockFetch(mockScheduledSessions as ScheduledSession[]);
        }
        return apiClient.get<ScheduledSession[]>('/admin/scheduled-sessions');
    },

    async getAllInstructors() {
        if (USE_MOCK) {
            return mockFetch(mockInstructors as Instructor[]);
        }
        return apiClient.get<Instructor[]>('/admin/instructors');
    },

    async getAllAttachments() {
        if (USE_MOCK) {
            return mockFetch(mockSessionAttachments as SessionAttachment[]);
        }
        return apiClient.get<SessionAttachment[]>('/admin/attachments');
    },

    // --- Mutations: Bookings ---
    async createBooking(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating booking (mock)", payload);
            return mockFetch({ ...payload, id: `bk_${Math.random()}` }, 1000);
        }
        return apiClient.post<CreativeWritingBooking>('/bookings', payload);
    },

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        if (USE_MOCK) {
            console.log("Service: Updating booking status (mock)", { bookingId, newStatus });
            return mockFetch({ success: true }, 300);
        }
        return apiClient.put<{ success: boolean }>(`/admin/bookings/${bookingId}/status`, { status: newStatus });
    },

    async updateBookingProgressNotes(bookingId: string, notes: string) {
        if (USE_MOCK) {
            console.log("Service: Updating progress notes (mock)", { bookingId, notes });
            return mockFetch({ success: true });
        }
        return apiClient.put<{ success: boolean }>(`/admin/bookings/${bookingId}/notes`, { notes });
    },

    async saveBookingDraft(bookingId: string, draft: string) {
        if (USE_MOCK) {
            console.log("Service: Saving draft (mock)", { bookingId, draft });
            return mockFetch({ success: true });
        }
        return apiClient.put<{ success: boolean }>(`/bookings/${bookingId}/draft`, { draft });
    },

    // --- Mutations: Packages ---
    async createPackage(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating package (mock)", payload);
            return mockFetch({ ...payload, id: Math.random() }, 500);
        }
        return apiClient.post<CreativeWritingPackage>('/admin/cw-packages', payload);
    },

    async updatePackage(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating package (mock)", payload);
            return mockFetch(payload, 500);
        }
        return apiClient.put<CreativeWritingPackage>(`/admin/cw-packages/${payload.id}`, payload);
    },

    async deletePackage(packageId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting package (mock)", packageId);
            return mockFetch({ success: true }, 500);
        }
        return apiClient.delete<{ success: boolean }>(`/admin/cw-packages/${packageId}`);
    },

    // --- Mutations: Standalone Services ---
    async createStandaloneService(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Creating standalone service (mock)", payload);
            return mockFetch({ ...payload, id: Math.random() }, 500);
        }
        return apiClient.post<StandaloneService>('/admin/standalone-services', payload);
    },

    async updateStandaloneService(payload: any) {
        if (USE_MOCK) {
            console.log("Service: Updating standalone service (mock)", payload);
            return mockFetch(payload, 500);
        }
        return apiClient.put<StandaloneService>(`/admin/standalone-services/${payload.id}`, payload);
    },

    async deleteStandaloneService(serviceId: number) {
        if (USE_MOCK) {
            console.log("Service: Deleting standalone service (mock)", serviceId);
            return mockFetch({ success: true }, 500);
        }
        return apiClient.delete<{ success: boolean }>(`/admin/standalone-services/${serviceId}`);
    }
};
