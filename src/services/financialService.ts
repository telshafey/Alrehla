import { supabase } from '../lib/supabaseClient';

export const financialService = {
    async createPayout(payload: { instructorId: number, amount: number, details: string }) {
        const { error } = await (supabase.from('instructor_payouts') as any)
            .insert([{
                instructor_id: payload.instructorId,
                amount: payload.amount,
                details: payload.details,
                payout_date: new Date().toISOString().split('T')[0]
            }]);
            
        if (error) {
            console.error("Failed to create instructor payout:", error);
            throw new Error(error.message);
        }
        
        return { success: true };
    }
};
