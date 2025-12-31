
import { supabase } from '../lib/supabaseClient';
import type { Badge } from '../lib/database.types';

export const gamificationService = {
    async getAllBadges() {
        const { data, error } = await supabase.from('badges').select('*');
        if (error) throw new Error(error.message);
        return data as Badge[];
    },

    async awardBadge(payload: { childId: number; badgeId: number; instructorId: number }) {
        const { error } = await supabase
            .from('child_badges')
            .insert([{
                child_id: payload.childId,
                badge_id: payload.badgeId,
                earned_at: new Date().toISOString()
            }]);

        if (error) throw new Error(error.message);
        return { success: true };
    }
};
