
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
        if (error) throw new Error(error.message);
        return data as SupportTicket[];
    },

    async getAllJoinRequests() {
        const { data, error } = await supabase
            .from('join_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as JoinRequest[];
    },

    // Note: 'support_session_requests' table was NOT in the initial SQL provided.
    // If you need this feature, you should create the table.
    // For now, we will return an empty array or throw error if called, 
    // or implement a mock if critical. Let's return empty to prevent crash.
    async getAllSupportSessionRequests() {
        // const { data, error } = await supabase.from('support_session_requests').select('*');
        console.warn("Table 'support_session_requests' does not exist yet.");
        return [] as SupportSessionRequest[];
    }
};
