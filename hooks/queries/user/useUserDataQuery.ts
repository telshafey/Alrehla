
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
            try {
                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.warn('Notifications fetch warning:', error.message);
                    return [];
                }
                return data as Notification[];
            } catch (e) {
                return [];
            }
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

// Extend ChildProfile to include the linked student email
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
    childProfiles: EnrichedChildProfile[]; // Added live child profiles
}

export const useUserAccountData = () => {
    const { currentUser } = useAuth(); // We still use Auth for ID, but fetch data freshly
    
    return useQuery<UserAccountData>({
        queryKey: ['userAccountData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return { userOrders: [], userSubscriptions: [], userBookings: [], childBadges: [], allBadges: [], attachments: [], childProfiles: [] };

            const safeFetch = async (table: string, query: any) => {
                try {
                    const { data, error } = await query;
                    if (error) {
                        console.warn(`Failed to fetch ${table}:`, error.message);
                        return [];
                    }
                    return data;
                } catch (e) {
                    console.warn(`Exception fetching ${table}`, e);
                    return [];
                }
            };

            // 0. Fetch Child Profiles (Freshly from DB to fix "Not showing" issue)
            // We fetch the child profile AND the linked student user email
            const childrenData = await safeFetch('child_profiles', supabase
                .from('child_profiles')
                .select('*, student:profiles!student_user_id(email)')
                .eq('user_id', currentUser.id)
            );
            
            const childProfiles: EnrichedChildProfile[] = childrenData.map((child: any) => ({
                ...child,
                student_email: child.student?.email // Flatten the relationship
            }));

            // 1. Fetch Orders
            const userOrders = await safeFetch('orders', supabase
                .from('orders')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('order_date', { ascending: false }));

            // 2. Fetch Subscriptions
            const userSubscriptions = await safeFetch('subscriptions', supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false }));

            // 3. Fetch Bookings
            const userBookingsData = await safeFetch('bookings', supabase
                .from('bookings') 
                .select('*')
                .eq('user_id', currentUser.id)
                .order('booking_date', { ascending: false }));

            // 4. Enrich Bookings
            let userBookings: EnrichedBooking[] = [];
            if (userBookingsData && userBookingsData.length > 0) {
                const bookingIds = userBookingsData.map((b: any) => b.id);
                
                const sessions = await safeFetch('scheduled_sessions', supabase.from('scheduled_sessions').select('*').in('booking_id', bookingIds));
                const instructors = await safeFetch('instructors', supabase.from('instructors').select('id, name'));
                const packages = await safeFetch('creative_writing_packages', supabase.from('creative_writing_packages').select('*'));

                userBookings = userBookingsData.map((booking: any) => {
                    const bookingSessions = sessions?.filter((s: any) => s.booking_id === booking.id) || [];
                    const pkg = packages?.find((p: any) => p.name === booking.package_name); 
                    const instructor = instructors?.find((i: any) => i.id === booking.instructor_id);
                    const child = childProfiles.find(c => c.id === booking.child_id);

                    return {
                        ...booking,
                        sessions: bookingSessions as ScheduledSession[],
                        packageDetails: pkg as CreativeWritingPackage,
                        instructorName: instructor?.name || 'غير محدد',
                        child_profiles: child ? { name: child.name } : null
                    };
                });
            }

            // 5. Fetch Badges
            const childIds = childProfiles.map(c => c.id);
            let childBadges: ChildBadge[] = [];
            if (childIds.length > 0) {
                childBadges = await safeFetch('child_badges', supabase
                    .from('child_badges')
                    .select('*')
                    .in('child_id', childIds)) as ChildBadge[];
            }

            const allBadges = await safeFetch('badges', supabase.from('badges').select('*')) as Badge[];

            // 6. Fetch Attachments
            let attachments: SessionAttachment[] = [];
            if (userBookingsData && userBookingsData.length > 0) {
                 const bookingIds = userBookingsData.map((b: any) => b.id);
                 attachments = await safeFetch('session_attachments', supabase
                    .from('session_attachments')
                    .select('*')
                    .in('booking_id', bookingIds)) as SessionAttachment[];
            }

            return {
                userOrders: (userOrders as Order[]) || [],
                userSubscriptions: (userSubscriptions as Subscription[]) || [],
                userBookings,
                childBadges,
                allBadges,
                attachments,
                childProfiles // Return fresh profiles
            };
        },
        enabled: !!currentUser,
    });
};
