
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import type { 
    Notification,
    Order, 
    Subscription, 
    CreativeWritingBooking, 
    ScheduledSession, 
    CreativeWritingPackage, 
    ChildBadge, 
    Badge, 
    SessionAttachment,
    ChildProfile 
} from '../../../lib/database.types';

export type { SessionAttachment };

export const useUserNotifications = () => {
    const { currentUser } = useAuth();
    return useQuery<Notification[]>({
        queryKey: ['userNotifications', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return [];
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            return (data as Notification[]) || [];
        },
        enabled: !!currentUser,
    });
};

export type EnrichedBooking = CreativeWritingBooking & {
    sessions: ScheduledSession[];
    packageDetails: CreativeWritingPackage | undefined;
    instructorName: string;
    child_profiles: { name: string } | null;
};

export interface EnrichedChildProfile extends ChildProfile {
    student_email?: string;
}

export interface UserAccountData {
    userOrders: Order[];
    userSubscriptions: Subscription[];
    userBookings: EnrichedBooking[];
    childBadges: ChildBadge[];
    allBadges: Badge[];
    attachments: SessionAttachment[];
    childProfiles: EnrichedChildProfile[];
}

export const useUserAccountData = () => {
    const { currentUser } = useAuth();
    
    return useQuery<UserAccountData>({
        queryKey: ['userAccountData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return { userOrders: [], userSubscriptions: [], userBookings: [], childBadges: [], allBadges: [], attachments: [], childProfiles: [] };

            // الفلترة هنا هي المفتاح: .eq('user_id', currentUser.id) تضمن الخصوصية
            const [ordersRes, subsRes, bookingsRes, childrenRes, badgesRes, allBadgesRes] = await Promise.all([
                supabase.from('orders').select('*').eq('user_id', currentUser.id).order('order_date', { ascending: false }),
                supabase.from('subscriptions').select('*').eq('user_id', currentUser.id),
                supabase.from('bookings').select('*, child_profiles(name)').eq('user_id', currentUser.id),
                supabase.from('child_profiles').select('*').eq('user_id', currentUser.id),
                supabase.from('child_badges').select('*'), // سيتم ربطها لاحقاً بالهوية
                supabase.from('badges').select('*')
            ]);

            let enrichedBookings: EnrichedBooking[] = [];
            const rawBookings = bookingsRes.data || [];
            
            if (rawBookings.length > 0) {
                try {
                    const { data: instructors } = await supabase.from('instructors').select('id, name');
                    const { data: packages } = await supabase.from('creative_writing_packages').select('*');
                    const { data: sessions } = await supabase.from('scheduled_sessions').select('*');

                    enrichedBookings = rawBookings.map((booking: any) => ({
                        ...booking,
                        sessions: sessions?.filter(s => s.booking_id === booking.id) || [],
                        packageDetails: packages?.find(p => p.name === booking.package_name),
                        instructorName: instructors?.find(i => i.id === booking.instructor_id)?.name || 'غير محدد',
                        child_profiles: booking.child_profiles
                    }));
                } catch (e) {
                    console.error("Enrichment failed", e);
                }
            }

            return {
                userOrders: (ordersRes.data as Order[]) || [],
                userSubscriptions: (subsRes.data as Subscription[]) || [],
                userBookings: enrichedBookings,
                childBadges: (badgesRes.data as ChildBadge[]) || [],
                allBadges: (allBadgesRes.data as Badge[]) || [],
                attachments: [],
                childProfiles: (childrenRes.data as EnrichedChildProfile[]) || []
            };
        },
        enabled: !!currentUser,
    });
};
