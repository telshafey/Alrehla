
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { authService } from '../../../services/authService';

export const useStudentDashboardData = () => {
    const { currentUser } = useAuth();
    
    return useQuery({
        queryKey: ['studentDashboardData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null;

            // 1. جلب ملف الطفل المرتبط بحساب الطالب من DB
            const childProfile = await authService.getStudentProfile(currentUser.id);

            if (!childProfile) {
                return { isUnlinked: true, journeys: [], orders: [], subscriptions: [], badges: [] };
            }

            const childId = childProfile.id;

            // 2. جلب اسم ولي الأمر الحقيقي
            const { data: parentProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', childProfile.user_id)
                .single();
            
            const parentName = parentProfile?.name || 'ولي أمر';

            // 3. جلب البيانات المرتبطة من الجداول الحقيقية فقط
            const [bookingsRes, ordersRes, subsRes, badgesRes, attachmentsRes] = await Promise.all([
                supabase.from('bookings').select('*, instructors(name, id, avatar_url, specialty)').eq('child_id', childId),
                supabase.from('orders').select('*').eq('child_id', childId),
                supabase.from('subscriptions').select('*').eq('child_id', childId),
                supabase.from('child_badges').select('*, badges(*)').eq('child_id', childId),
                supabase.from('session_attachments').select('*').eq('uploader_id', currentUser.id)
            ]);

            return {
                parentName,
                isUnlinked: false,
                journeys: bookingsRes.data?.map(b => ({ ...b, instructor_name: (b as any).instructors?.name })) || [],
                orders: ordersRes.data || [],
                subscriptions: subsRes.data || [],
                badges: badgesRes.data?.map((cb: any) => cb.badges).filter(Boolean) || [],
                attachments: attachmentsRes.data || [],
                childProfile
            };
        },
        enabled: !!currentUser,
    });
};

export const useSessionDetails = (sessionId: string | undefined) => {
    return useQuery({
        queryKey: ['sessionDetails', sessionId],
        queryFn: async () => {
            if (!sessionId) return null;
            const { data } = await supabase.from('scheduled_sessions').select('*, instructors(name)').eq('id', sessionId).single();
            return data;
        },
        enabled: !!sessionId,
    });
};

export const useTrainingJourneyData = (journeyId: string | undefined) => {
    return useQuery({
        queryKey: ['trainingJourney', journeyId],
        queryFn: async () => {
            if (!journeyId) return null;
            
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select('*, instructors(*), child_profiles(*)')
                .eq('id', journeyId)
                .single();

            if (bookingError) throw bookingError;

            const [sessionsRes, messagesRes, attachmentsRes, packagesRes] = await Promise.all([
                supabase.from('scheduled_sessions').select('*').eq('booking_id', journeyId).order('session_date', { ascending: true }),
                supabase.from('session_messages').select('*').eq('booking_id', journeyId).order('created_at', { ascending: true }),
                supabase.from('session_attachments').select('*').eq('booking_id', journeyId).order('created_at', { ascending: false }),
                supabase.from('creative_writing_packages').select('*').eq('name', booking.package_name).maybeSingle()
            ]);

            return {
                booking,
                package: packagesRes.data,
                instructor: booking.instructors,
                childProfile: booking.child_profiles,
                scheduledSessions: sessionsRes.data || [],
                messages: messagesRes.data || [],
                attachments: attachmentsRes.data || []
            };
        },
        enabled: !!journeyId,
    });
};
