
import { 
    mockSupportTickets, 
    mockJoinRequests, 
    mockSupportSessionRequests 
} from '../data/mockData';
import type { 
    SupportTicket, 
    JoinRequest, 
    SupportSessionRequest 
} from '../lib/database.types';
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const communicationService = {
    async getAllSupportTickets() {
        if (USE_MOCK) {
            return mockFetch(mockSupportTickets as SupportTicket[]);
        }
        return apiClient.get<SupportTicket[]>('/admin/support-tickets');
    },

    async getAllJoinRequests() {
        if (USE_MOCK) {
            return mockFetch(mockJoinRequests as JoinRequest[]);
        }
        return apiClient.get<JoinRequest[]>('/admin/join-requests');
    },

    async getAllSupportSessionRequests() {
        if (USE_MOCK) {
            return mockFetch(mockSupportSessionRequests as SupportSessionRequest[]);
        }
        return apiClient.get<SupportSessionRequest[]>('/admin/support-session-requests');
    }
};
