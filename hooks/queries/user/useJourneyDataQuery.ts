import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

export const useStudentDashboardData = () => {
    const { currentUser } = useAuth();
    
    return useQuery({
        queryKey: ['studentDashboardData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null;

            // البحث عن الطفل المرتبط بهذا الحساب
            const { data: childData, error: childError } = await supabase
                .from('child_profiles')
                .select('id, name, user_id')
                .eq('student_user_id', currentUser.id)
                .maybeSingle();

            if (childError) throw new Error("خطأ في جلب بيانات الربط");

            // إذا لم يجد الربط، فهذا حساب طالب "يتيم" (سيتم حذفه تلقائياً بعد تشغيل الـ SQL)
            if (!childData) {
                return { isUnlinked: true, journeys: [], orders: [], subscriptions: [], badges: [] };
            }

            // جلب اسم ولي الأمر
            const { data: parentProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', childData.user_id)
                .single();

            const childId = childData.id;
            const parentName = parentProfile?.name || 'ولي أمر';

            const [bookingsRes, ordersRes, subsRes, badgesRes, attachmentsRes] = await Promise.all([
                supabase.from('bookings').select('*, instructors(name)').eq('child_id', childId),
                supabase.from('orders').select('*').eq('child_id', childId),
                supabase.from('subscriptions').select('*').eq('child_id', childId),
                supabase.from('child_badges').select('*, badges(*)').eq('child_id', childId),
                supabase.from('session_attachments').select('*').eq('child_id', childId) // تأكد من وجود child_id في هذا الجدول
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
            const { data } = await supabase.from('scheduled_sessions').select('*').eq('id', sessionId).single();
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
            return null; 
        },
        enabled: !!journeyId,
    });
};