
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
    ChildProfile,
    Instructor
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

            const [ordersRes, subsRes, bookingsRes, childrenRes, badgesRes, allBadgesRes] = await Promise.all([
                supabase.from('orders').select('*').eq('user_id', currentUser.id).order('order_date', { ascending: false }),
                supabase.from('subscriptions').select('*').eq('user_id', currentUser.id),
                supabase.from('bookings').select('*, child_profiles(name)').eq('user_id', currentUser.id),
                supabase.from('child_profiles').select('*').eq('user_id', currentUser.id),
                supabase.from('child_badges').select('*'),
                supabase.from('badges').select('*')
            ]);

            let enrichedBookings: EnrichedBooking[] = [];
            // Fix: Cast explicitly to any[] to avoid never[] inference on empty array
            const rawBookings = (bookingsRes.data || []) as any[];
            
            if (rawBookings.length > 0) {
                try {
                    const { data: instructorsData } = await supabase.from('instructors').select('id, name');
                    const { data: packagesData } = await supabase.from('creative_writing_packages').select('*');
                    const { data: sessionsData } = await supabase.from('scheduled_sessions').select('*');

                    const instructors = (instructorsData || []) as any[];
                    const packages = (packagesData || []) as CreativeWritingPackage[];
                    const sessions = (sessionsData || []) as ScheduledSession[];

                    enrichedBookings = rawBookings.map((b: any) => ({
                        ...b,
                        sessions: sessions.filter((s) => s.booking_id === b.id) || [],
                        packageDetails: packages.find((p) => p.name === b.package_name),
                        instructorName: instructors.find((i) => i.id === b.instructor_id)?.name || 'غير محدد',
                        child_profiles: b.child_profiles
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
