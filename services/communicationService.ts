
import { supabase } from '../lib/supabaseClient';
import type { 
    SupportTicket, 
    JoinRequest, 
    SupportSessionRequest 
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

    async getAllSupportSessionRequests() {
        const { data, error } = await supabase.from('support_session_requests').select('*');
        if (error) {
            console.warn("Table 'support_session_requests' missing or error:", error.message);
            return [] as SupportSessionRequest[];
        }
        return data as SupportSessionRequest[];
    }
};
