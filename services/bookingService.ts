
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { reportingService } from './reportingService';
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
import { v4 as uuidv4 } from 'uuid';

export const bookingService = {
    // --- Queries ---
    
    // Fix: Added missing getAllBookings method to retrieve all bookings from the database
    async getAllBookings() {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as CreativeWritingBooking[];
    },

    // Fix: Added missing getAllInstructors method to retrieve all active instructors
    async getAllInstructors() {
        const { data, error } = await supabase.from('instructors').select('*').is('deleted_at', null);
        if (error) throw error;
        return data as Instructor[];
    },

    // Fix: Added missing getInstructorByUserId method to find instructor profile by user account ID
    async getInstructorByUserId(userId: string) {
        const { data, error } = await supabase.from('instructors').select('*').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return data as Instructor | null;
    },

    // Fix: Added missing getInstructorBookings method to retrieve bookings assigned to a specific instructor
    async getInstructorBookings(instructorId: number) {
        const { data, error } = await supabase.from('bookings').select('*').eq('instructor_id', instructorId);
        if (error) throw error;
        return data as CreativeWritingBooking[];
    },

    // Fix: Added missing getAllScheduledSessions method to retrieve all training sessions
    async getAllScheduledSessions() {
        const { data, error } = await supabase.from('scheduled_sessions').select('*').order('session_date', { ascending: true });
        if (error) throw error;
        return data as ScheduledSession[];
    },

    // Fix: Added missing getAllPackages method to retrieve all Creative Writing packages
    async getAllPackages() {
        const { data, error } = await supabase.from('creative_writing_packages').select('*');
        if (error) throw error;
        return data as CreativeWritingPackage[];
    },

    // Fix: Added missing getAllStandaloneServices method to retrieve additional services
    async getAllStandaloneServices() {
        const { data, error } = await supabase.from('standalone_services').select('*');
        if (error) throw error;
        return data as StandaloneService[];
    },

    // Fix: Added missing getAllComparisonItems method to retrieve package comparison criteria
    async getAllComparisonItems() {
        const { data, error } = await supabase.from('comparison_items').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data as ComparisonItem[];
    },

    // Fix: Added missing getAllAttachments method to retrieve all shared files
    async getAllAttachments() {
        const { data, error } = await supabase.from('session_attachments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as SessionAttachment[];
    },

    // --- Mutations ---

    // Fix: Added missing createBooking method to process new training package orders
    async createBooking(payload: { userId: string, payload: any, receiptUrl: string }) {
        const { userId, payload: bookingData, receiptUrl } = payload;
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        
        const { data, error } = await supabase.from('bookings').insert([{
            id: bookingId,
            user_id: userId,
            user_name: bookingData.child.name, 
            child_id: bookingData.child.id,
            package_name: bookingData.package.name,
            instructor_id: bookingData.instructor.id,
            booking_date: bookingData.dateTime.date.toISOString(),
            booking_time: bookingData.dateTime.time,
            total: bookingData.total,
            status: receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع',
            receipt_url: receiptUrl,
            session_id: `ses-${uuidv4().slice(0,8)}`
        }]).select().single();

        if (error) throw error;
        return data as CreativeWritingBooking;
    },

    // Fix: Completed the updateBookingStatus method to handle session generation on confirmation
    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        const { data: booking, error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId)
            .select('*, instructors(user_id, name), child_profiles(name)')
            .single();

        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_BOOKING_STATUS', bookingId, `حجز: ${booking.package_name}`, `تغيير الحالة إلى: ${newStatus}`);

        if (newStatus === 'مؤكد') {
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');
            
            const now = new Date();
            const originalDate = new Date(booking.booking_date);
            let startDate = originalDate;
            while (startDate < now) { startDate.setDate(startDate.getDate() + 7); }

            const { data: pkg } = await supabase.from('creative_writing_packages').select('sessions').eq('name', booking.package_name).single();
            const sessionCount = parseInt(pkg?.sessions.match(/\d+/)?.[0] || '1');
            
            const sessionsToInsert = [];
            for (let i = 0; i < sessionCount; i++) {
                const sDate = new Date(startDate);
                sDate.setDate(startDate.getDate() + (i * 7));
                sessionsToInsert.push({
                    booking_id: bookingId,
                    child_id: booking.child_id,
                    instructor_id: booking.instructor_id,
                    session_date: sDate.toISOString(),
                    status: 'upcoming'
                });
            }
            await supabase.from('scheduled_sessions').insert(sessionsToInsert);
        }

        if (newStatus === 'ملغي') {
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');
        }

        return { success: true };
    },

    // Fix: Added missing updateScheduledSession method to update individual session statuses or notes
    async updateScheduledSession(sessionId: string, updates: any) {
        const { error } = await supabase.from('scheduled_sessions').update(updates).eq('id', sessionId);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing updateBookingProgressNotes method to save instructor feedback
    async updateBookingProgressNotes(bookingId: string, notes: string) {
        const { error } = await supabase.from('bookings').update({ progress_notes: notes }).eq('id', bookingId);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing saveBookingDraft method to store writing work-in-progress
    async saveBookingDraft(bookingId: string, draft: string) {
        const { error } = await supabase.from('bookings').update({ details: { draft } }).eq('id', bookingId);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing sendSessionMessage method for journey chat
    async sendSessionMessage(payload: { bookingId: string, senderId: string, role: 'instructor' | 'student' | 'user', message: string }) {
        const { error } = await supabase.from('session_messages').insert([{
            booking_id: payload.bookingId,
            sender_id: payload.senderId,
            sender_role: payload.role,
            message_text: payload.message
        }]);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing uploadSessionAttachment method for file sharing within journeys
    async uploadSessionAttachment(payload: { bookingId: string, uploaderId: string, role: 'instructor' | 'student' | 'user', file: File }) {
        const publicUrl = await cloudinaryService.uploadImage(payload.file, 'session_attachments');
        const { error } = await supabase.from('session_attachments').insert([{
            booking_id: payload.bookingId,
            uploader_id: payload.uploaderId,
            uploader_role: payload.role,
            file_name: payload.file.name,
            file_url: publicUrl
        }]);
        if (error) throw error;
        return { success: true };
    },

    // --- Instructor Management ---

    // Fix: Added missing createInstructor method for admin use
    async createInstructor(payload: any) {
        let avatarUrl = null;
        if (payload.avatarFile) {
            avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
        }
        const { avatarFile, ...rest } = payload;
        const { data, error } = await supabase.from('instructors').insert([{ ...rest, avatar_url: avatarUrl }]).select().single();
        if (error) throw error;
        return data as Instructor;
    },

    // Fix: Added missing updateInstructor method for admin use
    async updateInstructor(payload: any) {
        let avatarUrl = payload.avatar_url;
        if (payload.avatarFile) {
            avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
        }
        const { id, avatarFile, ...updates } = payload;
        const { data, error } = await supabase.from('instructors').update({ ...updates, avatar_url: avatarUrl }).eq('id', id).select().single();
        if (error) throw error;
        return data as Instructor;
    },

    // Fix: Added missing deleteInstructor method (soft delete)
    async deleteInstructor(instructorId: number) {
        const { error } = await supabase.from('instructors').update({ deleted_at: new Date().toISOString() }).eq('id', instructorId);
        if (error) throw error;
        return { success: true };
    },

    // --- CW Settings Management ---

    // Fix: Added missing createPackage method for package configuration
    async createPackage(payload: any) {
        const { data, error } = await supabase.from('creative_writing_packages').insert([payload]).select().single();
        if (error) throw error;
        return data as CreativeWritingPackage;
    },
    // Fix: Added missing updatePackage method for package configuration
    async updatePackage(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('creative_writing_packages').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as CreativeWritingPackage;
    },
    // Fix: Added missing deletePackage method
    async deletePackage(packageId: number) {
        const { error } = await supabase.from('creative_writing_packages').delete().eq('id', packageId);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing createStandaloneService method
    async createStandaloneService(payload: any) {
        const { data, error } = await supabase.from('standalone_services').insert([payload]).select().single();
        if (error) throw error;
        return data as StandaloneService;
    },
    // Fix: Added missing updateStandaloneService method
    async updateStandaloneService(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('standalone_services').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as StandaloneService;
    },
    // Fix: Added missing deleteStandaloneService method
    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase.from('standalone_services').delete().eq('id', serviceId);
        if (error) throw error;
        return { success: true };
    },

    // Fix: Added missing createComparisonItem method for the comparison matrix
    async createComparisonItem(payload: any) {
        const { data, error } = await supabase.from('comparison_items').insert([payload]).select().single();
        if (error) throw error;
        return data as ComparisonItem;
    },
    // Fix: Added missing updateComparisonItem method
    async updateComparisonItem(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('comparison_items').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as ComparisonItem;
    },
    // Fix: Added missing deleteComparisonItem method
    async deleteComparisonItem(itemId: string) {
        const { error } = await supabase.from('comparison_items').delete().eq('id', itemId);
        if (error) throw error;
        return { success: true };
    },
};
