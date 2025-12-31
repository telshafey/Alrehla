
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { bookingService } from '../../../services/bookingService';

export const useStudentDashboardData = () => {
    const { currentUser } = useAuth();
    
    return useQuery({
        queryKey: ['studentDashboardData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null;

            const { data: childData, error: childError } = await supabase
                .from('child_profiles')
                .select('id, name, user_id')
                .eq('student_user_id', currentUser.id)
                .maybeSingle();

            if (childError) throw new Error("خطأ في جلب بيانات الربط");
            if (!childData) return { isUnlinked: true, journeys: [], orders: [], subscriptions: [], badges: [] };

            const { data: parentProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', childData.user_id)
                .single();

            const childId = childData.id;
            const parentName = parentProfile?.name || 'ولي أمر';

            const [bookingsRes, ordersRes, subsRes, badgesRes, attachmentsRes] = await Promise.all([
                supabase.from('bookings').select('*, instructors(name, id, avatar_url, specialty)').eq('child_id', childId),
                supabase.from('orders').select('*').eq('child_id', childId),
                supabase.from('subscriptions').select('*').eq('child_id', childId),
                supabase.from('child_badges').select('*, badges(*)').eq('child_id', childId),
                supabase.from('session_attachments').select('*').eq('booking_id', childId) 
            ]);

            return {
                parentName,
                isUnlinked: false,
                journeys: (bookingsRes.data || []).map(b => ({
                    ...b,
                    instructor_name: (b as any).instructors?.name,
                    sessions: [] 
                })),
                orders: ordersRes.data || [],
                subscriptions: subsRes.data || [],
                badges: (badgesRes.data || []).map((cb: any) => cb.badges).filter(Boolean),
                attachments: attachmentsRes.data || []
            };
        },
        enabled: !!currentUser && currentUser.role === 'student',
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
            
            // جلب بيانات الحجز الأساسية مع العلاقات
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select('*, instructors(*), child_profiles(*)')
                .eq('id', journeyId)
                .single();

            if (bookingError) throw bookingError;

            // جلب البيانات المرتبطة بالتوازي
            const [sessionsRes, messagesRes, attachmentsRes, packagesRes, servicesRes] = await Promise.all([
                supabase.from('scheduled_sessions').select('*').eq('booking_id', journeyId).order('session_date', { ascending: true }),
                supabase.from('session_messages').select('*').eq('booking_id', journeyId).order('created_at', { ascending: true }),
                supabase.from('session_attachments').select('*').eq('booking_id', journeyId).order('created_at', { ascending: false }),
                supabase.from('creative_writing_packages').select('*').eq('name', booking.package_name).maybeSingle(),
                supabase.from('standalone_services').select('*').limit(5)
            ]);

            return {
                booking,
                package: packagesRes.data,
                instructor: booking.instructors,
                childProfile: booking.child_profiles,
                scheduledSessions: sessionsRes.data || [],
                messages: messagesRes.data || [],
                attachments: attachmentsRes.data || [],
                additionalServices: servicesRes.data || []
            };
        },
        enabled: !!journeyId,
    });
};
