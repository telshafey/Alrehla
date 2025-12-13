
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import { orderService } from '../../../services/orderService';
import { userService } from '../../../services/userService';
import { supabase } from '../../../lib/supabaseClient';
import type { 
    Instructor, 
    CreativeWritingBooking, 
    CreativeWritingPackage, 
    ScheduledSession, 
    ChildProfile, 
    SessionAttachment,
    InstructorPayout,
    ServiceOrder
} from '../../../lib/database.types';

export const useInstructorData = () => {
    const { currentUser } = useAuth();
    
    return useQuery({
        queryKey: ['instructorData', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null;

            // 1. Fetch Instructor Profile (Real DB)
            const currentInstructor = await bookingService.getInstructorByUserId(currentUser.id);
            if (!currentInstructor) return { instructor: null };

            // 2. Fetch related data (Real DB)
            const [
                instructorBookings,
                allPackages,
                allScheduledSessions,
                allChildren,
                instructorServiceOrders,
                instructorPayouts,
                instructorAttachments
            ] = await Promise.all([
                bookingService.getInstructorBookings(currentInstructor.id),
                bookingService.getAllPackages(),
                bookingService.getAllScheduledSessions(),
                userService.getAllChildProfiles(), // We might need a more optimized query later
                supabase.from('service_orders').select('*').eq('assigned_instructor_id', currentInstructor.id).then(res => res.data as ServiceOrder[] || []),
                // Payouts might not have a service yet, using direct supabase call or empty array
                supabase.from('instructor_payouts').select('*').eq('instructor_id', currentInstructor.id).then(res => res.data as InstructorPayout[] || []).catch(() => []),
                supabase.from('session_attachments').select('*').then(res => res.data as SessionAttachment[] || [])
            ]);

            // 3. Process and Enrich Data
            const enrichedBookings = instructorBookings.map(booking => {
                const journeySessions = allScheduledSessions.filter(s => s.booking_id === booking.id);
                const packageDetails = allPackages.find(p => p.name === booking.package_name);
                const child = allChildren.find(c => c.id === booking.child_id);
                
                return {
                    ...booking,
                    sessions: journeySessions,
                    packageDetails,
                    child_profiles: child ? { id: child.id, name: child.name, avatar_url: child.avatar_url } : null
                }
            });

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const introSessionsThisMonth = enrichedBookings.filter(b => 
                b.package_name === 'الجلسة التعريفية' &&
                b.status === 'مكتمل' &&
                new Date(b.booking_date).getMonth() === currentMonth &&
                new Date(b.booking_date).getFullYear() === currentYear
            ).length;
            
            const instructorBookingIds = new Set(instructorBookings.map(b => b.id));
            const relevantAttachments = instructorAttachments.filter(att => instructorBookingIds.has(att.booking_id));

            return {
                instructor: currentInstructor,
                bookings: enrichedBookings,
                introSessionsThisMonth,
                payouts: instructorPayouts,
                serviceOrders: instructorServiceOrders,
                attachments: relevantAttachments,
            };
        },
        enabled: !!currentUser,
    });
};
