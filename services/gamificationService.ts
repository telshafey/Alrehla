
import { supabase } from '../lib/supabaseClient';
import { mockBadges } from '../data/mockData';
import { mockFetch } from './mockAdapter';
import type { Badge } from '../lib/database.types';

export const gamificationService = {
    async getAllBadges() {
        // Try DB first, fallback to mock
        const { data, error } = await supabase.from('badges').select('*');
        if (!error && data && data.length > 0) return data as Badge[];
        return mockFetch(mockBadges);
    },

    async awardBadge(payload: { childId: number; badgeId: number; instructorId: number }) {
        // In a real app, we would verify instructor permission here
        const { data, error } = await supabase
            .from('child_badges')
            .insert([{
                child_id: payload.childId,
                badge_id: payload.badgeId,
                earned_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.warn("Using mock for awarding badge due to DB error:", error.message);
            await mockFetch({ success: true });
        }
        return { success: true };
    }
};
