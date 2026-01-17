
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
    // --- Notification Helpers ---
    
    async sendNotification(userId: string, message: string, link: string, type: string = 'info') {
        try {
            await (supabase.from('notifications') as any).insert([{
                user_id: userId,
                message,
                link,
                type,
                created_at: new Date().toISOString(),
                read: false
            }]);
        } catch (error) {
            console.error("Failed to send notification:", error);
        }
    },

    async notifyAdmins(message: string, link: string, type: string = 'admin_alert') {
        try {
            // Fetch admins with relevant roles
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .in('role', ['super_admin', 'general_supervisor', 'creative_writing_supervisor', 'enha_lak_supervisor']);

            if (admins && admins.length > 0) {
                const notifications = admins.map((admin: any) => ({
                    user_id: admin.id,
                    message,
                    link,
                    type,
                    created_at: new Date().toISOString(),
                    read: false
                }));

                await (supabase.from('notifications') as any).insert(notifications);
            }
        } catch (error) {
            console.error("Failed to notify admins:", error);
        }
    },

    // --- Existing Methods ---

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
        
        // Notify Admins about new ticket
        this.notifyAdmins(`تذكرة دعم فني جديدة من ${payload.name}`, '/admin/support', 'ticket');
        
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
        
        // Notify Admins
        this.notifyAdmins(`طلب انضمام جديد من ${payload.name} (${payload.role})`, '/admin/join-requests', 'join_request');

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
