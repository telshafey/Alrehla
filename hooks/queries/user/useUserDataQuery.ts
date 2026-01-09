
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
            // Return empty structure if no user
            if (!currentUser) return { 
                userOrders: [], 
                userSubscriptions: [], 
                userBookings: [], 
                childBadges: [], 
                allBadges: [], 
                attachments: [], 
                childProfiles: [] 
            };

            // 1. Fetch primary user data in parallel
            const [ordersRes, subsRes, bookingsRes, childrenRes, badgesRes, allBadgesRes] = await Promise.all([
                supabase.from('orders').select('*').eq('user_id', currentUser.id).order('order_date', { ascending: false }),
                supabase.from('subscriptions').select('*').eq('user_id', currentUser.id),
                supabase.from('bookings').select('*, child_profiles(name)').eq('user_id', currentUser.id),
                supabase.from('child_profiles').select('*').eq('user_id', currentUser.id),
                supabase.from('child_badges').select('*'),
                supabase.from('badges').select('*')
            ]);

            const rawBookings = (bookingsRes.data || []) as any[];
            let enrichedBookings: EnrichedBooking[] = [];
            let attachments: SessionAttachment[] = [];

            // 2. Fetch related booking data (Optimized: Filter by IDs)
            if (rawBookings.length > 0) {
                const bookingIds = rawBookings.map(b => b.id);
                
                try {
                    const [instructorsRes, packagesRes, sessionsRes, attachmentsRes] = await Promise.all([
                        supabase.from('instructors').select('id, name'),
                        supabase.from('creative_writing_packages').select('*'),
                        supabase.from('scheduled_sessions').select('*').in('booking_id', bookingIds),
                        supabase.from('session_attachments').select('*').in('booking_id', bookingIds).order('created_at', { ascending: false })
                    ]);

                    const instructors = (instructorsRes.data || []) as any[];
                    const packages = (packagesRes.data || []) as CreativeWritingPackage[];
                    const sessions = (sessionsRes.data || []) as ScheduledSession[];
                    attachments = (attachmentsRes.data || []) as SessionAttachment[];

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
                userOrders: (ordersRes.data || []) as Order[],
                userSubscriptions: (subsRes.data || []) as Subscription[],
                userBookings: enrichedBookings,
                childBadges: (badgesRes.data || []) as ChildBadge[],
                allBadges: (allBadgesRes.data || []) as Badge[],
                attachments: attachments,
                childProfiles: (childrenRes.data || []) as EnrichedChildProfile[]
            };
        },
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 2, // 2 minutes cache
    });
};
