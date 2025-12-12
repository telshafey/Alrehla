
import { supabase } from '../lib/supabaseClient';
import type { 
    CreativeWritingBooking, 
    ScheduledSession, 
    Instructor,
    BookingStatus,
    CreativeWritingPackage,
    StandaloneService,
    SessionAttachment
} from '../lib/database.types';

export const bookingService = {
    // --- Queries ---
    async getAllBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('booking_date', { ascending: false });
        if (error) throw new Error(error.message);
        return data as CreativeWritingBooking[];
    },

    async getAllScheduledSessions() {
        const { data, error } = await supabase
            .from('scheduled_sessions')
            .select('*')
            .order('session_date', { ascending: true });
        if (error) throw new Error(error.message);
        return data as ScheduledSession[];
    },

    async getAllInstructors() {
        const { data, error } = await supabase
            .from('instructors')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw new Error(error.message);
        return data as Instructor[];
    },

    async getAllAttachments() {
        const { data, error } = await supabase
            .from('session_attachments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as SessionAttachment[];
    },

    // --- Mutations: Bookings ---
    async createBooking(payload: any) {
        const bookingId = `bk_${Math.floor(Math.random() * 1000000)}`;
        // payload usually has: { child, package, instructor, dateTime, total }
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                id: bookingId,
                user_id: payload.userId,
                child_id: payload.payload.child.id,
                instructor_id: payload.payload.instructor.id,
                package_name: payload.payload.package.name,
                booking_date: payload.payload.dateTime.date,
                booking_time: payload.payload.dateTime.time,
                total: payload.payload.total,
                status: 'بانتظار الدفع',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as CreativeWritingBooking;
    },

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async updateBookingProgressNotes(bookingId: string, notes: string) {
        const { error } = await supabase
            .from('bookings')
            .update({ progress_notes: notes })
            .eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async saveBookingDraft(bookingId: string, draft: string) {
        const { error } = await supabase
            .from('bookings')
            .update({ draft_content: draft }) // Ensure column exists in DB or map it
            .eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Packages ---
    async createPackage(payload: any) {
        const { data, error } = await supabase
            .from('creative_writing_packages')
            .insert([payload])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as CreativeWritingPackage;
    },

    async updatePackage(payload: any) {
        const { data, error } = await supabase
            .from('creative_writing_packages')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as CreativeWritingPackage;
    },

    async deletePackage(packageId: number) {
        const { error } = await supabase
            .from('creative_writing_packages')
            .delete()
            .eq('id', packageId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Standalone Services ---
    async createStandaloneService(payload: any) {
        const { data, error } = await supabase
            .from('standalone_services')
            .insert([payload])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as StandaloneService;
    },

    async updateStandaloneService(payload: any) {
        const { data, error } = await supabase
            .from('standalone_services')
            .update(payload)
            .eq('id', payload.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as StandaloneService;
    },

    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase
            .from('standalone_services')
            .delete()
            .eq('id', serviceId);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
