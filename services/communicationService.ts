
import { supabase } from '../lib/supabaseClient';
import { reportingService } from './reportingService';
import type { 
    SupportTicket, 
    JoinRequest, 
    SupportSessionRequest,
    TicketStatus,
    RequestStatus 
} from '../lib/database.types';

export const communicationService = {
    async getAllSupportTickets() {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.warn("Error fetching support tickets (table might be missing):", error.message);
            return [];
        }
        return data as SupportTicket[];
    },

    async createSupportTicket(payload: { name: string, email: string, subject: string, message: string }) {
        const { error } = await (supabase.from('support_tickets') as any).insert([{
            ...payload,
            status: 'جديدة',
            created_at: new Date().toISOString()
        }]);
        
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async getAllJoinRequests() {
        const { data, error } = await supabase
            .from('join_requests')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.warn("Error fetching join requests (table might be missing):", error.message);
            return [];
        }
        return data as JoinRequest[];
    },

    async createJoinRequest(payload: { name: string, email: string, phone: string, role: string, message: string, portfolio_url?: string }) {
        const { error } = await (supabase.from('join_requests') as any).insert([{
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            message: payload.message,
            portfolio_url: payload.portfolio_url || null,
            status: 'جديد',
            created_at: new Date().toISOString()
        }]);

        if (error) throw new Error(error.message);
        return { success: true };
    },

    async getAllSupportSessionRequests() {
        const { data, error } = await supabase.from('support_session_requests').select('*');
        if (error) {
            console.warn("Table 'support_session_requests' missing or error:", error.message);
            return [] as SupportSessionRequest[];
        }
        return data as SupportSessionRequest[];
    },

    // New Update Methods moved from hooks for better logging support
    async updateSupportTicketStatus(ticketId: string, newStatus: TicketStatus) {
        const { error } = await (supabase.from('support_tickets') as any).update({ status: newStatus }).eq('id', ticketId);
        if (error) throw error;
        
        await reportingService.logAction('UPDATE_TICKET', ticketId, 'تذكرة دعم', `تحديث الحالة إلى: ${newStatus}`);
        return { success: true };
    },

    async updateJoinRequestStatus(requestId: string, newStatus: RequestStatus) {
        const { error } = await (supabase.from('join_requests') as any).update({ status: newStatus }).eq('id', requestId);
        if (error) throw error;
        
        await reportingService.logAction('UPDATE_JOIN_REQUEST', requestId, 'طلب انضمام', `تحديث الحالة إلى: ${newStatus}`);
        return { success: true };
    }
};
