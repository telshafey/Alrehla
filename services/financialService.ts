
import { mockFetch } from './mockAdapter';
import { apiClient } from '../lib/api';

const USE_MOCK = true;

export const financialService = {
    async createPayout(payload: { instructorId: number, amount: number, details: string }) {
        if (USE_MOCK) {
            await mockFetch(null, 500);
            console.log("Service: Creating payout (mock)", payload);
            return { success: true };
        }
        return apiClient.post<{ success: boolean }>('/admin/financials/payouts', payload);
    }
};
