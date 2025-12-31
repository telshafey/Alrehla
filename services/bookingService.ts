
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { mockComparisonItems } from '../data/mockData';
import type { 
    CreativeWritingBooking, 
    ScheduledSession, 
    Instructor,
    BookingStatus,
    CreativeWritingPackage,
    StandaloneService,
    SessionAttachment,
    ComparisonItem,
    SessionMessage
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

    async getInstructorBookings(instructorId: number) {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('instructor_id', instructorId)
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
            .is('deleted_at', null)
            .order('name', { ascending: true });
        if (error) throw new Error(error.message);
        return data as Instructor[];
    },

    async getInstructorByUserId(userId: string) {
        const { data, error } = await supabase
            .from('instructors')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();
        
        if (error) {
            if (error.code !== 'PGRST116') {
                throw new Error(error.message);
            }
            return null;
        }
        return data as Instructor | null;
    },

    async getAllAttachments() {
        const { data, error } = await supabase
            .from('session_attachments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as SessionAttachment[];
    },

    async getAllPackages() {
        const { data, error } = await supabase
            .from('creative_writing_packages')
            .select('*')
            .order('price', { ascending: true });
        if (error) throw new Error(error.message);
        return data as CreativeWritingPackage[];
    },

    async getAllStandaloneServices() {
        const { data, error } = await supabase
            .from('standalone_services')
            .select('*')
            .order('price', { ascending: true });
        if (error) throw new Error(error.message);
        return data as StandaloneService[];
    },

    async getAllComparisonItems() {
        try {
            const { data, error } = await supabase
                .from('comparison_items')
                .select('*')
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return data as ComparisonItem[];
        } catch (e) {
            return mockComparisonItems;
        }
    },

    // --- Mutations: Messages & Attachments ---
    async sendSessionMessage(payload: { bookingId: string; senderId: string; role: string; message: string }) {
        const { data, error } = await supabase
            .from('session_messages')
            .insert([{
                booking_id: payload.bookingId,
                sender_id: payload.senderId,
                sender_role: payload.role,
                message_text: payload.message,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw new Error(error.message);
        return data as SessionMessage;
    },

    async uploadSessionAttachment(payload: { bookingId: string; uploaderId: string; role: string; file: File }) {
        const fileUrl = await cloudinaryService.uploadImage(payload.file, `session_attachments/${payload.bookingId}`);
        
        const { data, error } = await supabase
            .from('session_attachments')
            .insert([{
                booking_id: payload.bookingId,
                uploader_id: payload.uploaderId,
                uploader_role: payload.role,
                file_name: payload.file.name,
                file_url: fileUrl,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as SessionAttachment;
    },

    // --- Mutations: Instructors & Others ---
    async createInstructor(payload: any) {
        let avatarUrl = payload.avatar_url;
        if (payload.avatarFile) {
            try {
                avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
            } catch (err) {
                console.error("Avatar upload failed", err);
            }
        }

        const { avatarFile, ...dbPayload } = payload;
        const insertData = { ...dbPayload, avatar_url: avatarUrl };

        const { data, error } = await supabase
            .from('instructors')
            .insert([insertData])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Instructor;
    },

    async updateInstructor(payload: any) {
        let avatarUrl = payload.avatar_url;
        if (payload.avatarFile) {
            try {
                avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
            } catch (err) {
                console.error("Avatar upload failed", err);
            }
        }

        const { id, avatarFile, ...updates } = payload;
        const updateData = { ...updates };
        if (avatarUrl) updateData.avatar_url = avatarUrl;

        const { data, error } = await supabase
            .from('instructors')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as Instructor;
    },

    async deleteInstructor(instructorId: number) {
        const { error } = await supabase
            .from('instructors')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', instructorId);
        
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createBooking(payload: any) {
        const bookingId = `bk_${Math.floor(Math.random() * 1000000)}`;
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
            .select();

        if (error) throw new Error(error.message);
        return data?.[0] as CreativeWritingBooking;
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
            .update({ draft_content: draft })
            .eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createPackage(payload: any) {
        const { id, ...rest } = payload; 
        const { data, error } = await supabase
            .from('creative_writing_packages')
            .insert([rest])
            .select();
            
        if (error) throw new Error(error.message);
        return data?.[0] as CreativeWritingPackage;
    },

    async updatePackage(payload: any) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("ID Required");
        const { data, error } = await supabase
            .from('creative_writing_packages')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw new Error(error.message);
        return data?.[0] as CreativeWritingPackage;
    },

    async deletePackage(packageId: number) {
        const { error } = await supabase.from('creative_writing_packages').delete().eq('id', packageId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createStandaloneService(payload: any) {
        const { id, ...rest } = payload;
        const { data, error } = await supabase.from('standalone_services').insert([rest]).select();
        if (error) throw new Error(error.message);
        return data?.[0] as StandaloneService;
    },

    async updateStandaloneService(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('standalone_services').update(updates).eq('id', id).select();
        if (error) throw new Error(error.message);
        return data?.[0] as StandaloneService;
    },

    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase.from('standalone_services').delete().eq('id', serviceId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Comparison Item Mutations ---

    /**
     * Creates a new comparison criterion in the database.
     */
    async createComparisonItem(payload: any) {
        const { data, error } = await supabase
            .from('comparison_items')
            .insert([payload])
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    /**
     * Updates an existing comparison criterion.
     */
    async updateComparisonItem(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('comparison_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    /**
     * Deletes a comparison criterion by its ID.
     */
    async deleteComparisonItem(itemId: string) {
        const { error } = await supabase
            .from('comparison_items')
            .delete()
            .eq('id', itemId);
        if (error) throw new Error(error.message);
        return { success: true };
    }
};
