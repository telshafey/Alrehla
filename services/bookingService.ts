
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { storageService } from './storageService';
import { reportingService } from './reportingService';
import type { 
    CreativeWritingBooking, 
    ScheduledSession, 
    Instructor,
    BookingStatus,
    CreativeWritingPackage,
    StandaloneService,
    SessionAttachment,
    ComparisonItem
} from '../lib/database.types';
import { v4 as uuidv4 } from 'uuid';

// Types for Mutations
interface CreateBookingPayload {
    child: { id: number; name: string };
    package: { name: string };
    instructor: { id: number };
    dateTime: { date: Date; time: string };
    total: number;
}

interface CreateInstructorPayload {
    name: string;
    specialty: string;
    slug: string;
    bio: string;
    avatarFile?: File | null;
    avatar_url?: string | null;
    [key: string]: any;
}

const parseSessionCount = (sessionString: string | undefined): number => {
    if (!sessionString) return 1;
    if (sessionString.includes('واحدة')) return 1;
    const match = sessionString.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
};

export const bookingService = {
    // --- Queries (SAFE MODE) ---
    
    async getAllBookings() {
        try {
            const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
            if (error) return [];
            return data as CreativeWritingBooking[];
        } catch { return []; }
    },

    async getAllInstructors() {
        try {
            const { data, error } = await supabase.from('instructors').select('*').is('deleted_at', null);
            if (error) return [];
            return data as Instructor[];
        } catch { return []; }
    },

    async getInstructorByUserId(userId: string) {
        try {
            const { data, error } = await supabase.from('instructors').select('*').eq('user_id', userId).maybeSingle();
            if (error) return null;
            return data as Instructor | null;
        } catch { return null; }
    },

    async getInstructorBookings(instructorId: number) {
        try {
            const { data, error } = await supabase.from('bookings').select('*').eq('instructor_id', instructorId);
            if (error) return [];
            return data as CreativeWritingBooking[];
        } catch { return []; }
    },

    async getAllScheduledSessions() {
        try {
            const { data, error } = await supabase.from('scheduled_sessions').select('*').order('session_date', { ascending: true });
            if (error) return [];
            return data as ScheduledSession[];
        } catch { return []; }
    },

    async getAllPackages() {
        try {
            const { data, error } = await supabase.from('creative_writing_packages').select('*');
            if (error) return [];
            return data as CreativeWritingPackage[];
        } catch { return []; }
    },

    async getAllStandaloneServices() {
        try {
            const { data, error } = await supabase.from('standalone_services').select('*');
            if (error) return [];
            return data as StandaloneService[];
        } catch { return []; }
    },

    async getAllComparisonItems() {
        try {
            const { data, error } = await supabase.from('comparison_items').select('*').order('sort_order', { ascending: true });
            if (error) return [];
            return data as ComparisonItem[];
        } catch { return []; }
    },

    async getAllAttachments() {
        try {
            const { data, error } = await supabase.from('session_attachments').select('*').order('created_at', { ascending: false });
            if (error) return [];
            return data as SessionAttachment[];
        } catch { return []; }
    },

    // --- Validation ---
    
    async checkSlotAvailability(instructorId: number, dateStr: string, time: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('id')
                .eq('instructor_id', instructorId)
                .eq('booking_time', time)
                .ilike('booking_date', `${dateStr.split('T')[0]}%`)
                .neq('status', 'ملغي');

            if (error) return true;
            return data.length === 0;
        } catch { return true; }
    },

    // --- Mutations (Can Throw) ---

    async createBooking(payload: { userId: string, payload: CreateBookingPayload, receiptUrl: string }) {
        const { userId, payload: bookingData, receiptUrl } = payload;
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        
        const [hours, minutes] = bookingData.dateTime.time.split(':');
        const bookingDate = new Date(bookingData.dateTime.date);
        bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const { data, error } = await (supabase.from('bookings') as any).insert([{
            id: bookingId,
            user_id: userId,
            user_name: bookingData.child.name, 
            child_id: bookingData.child.id,
            package_name: bookingData.package.name,
            instructor_id: bookingData.instructor.id,
            booking_date: bookingDate.toISOString(),
            booking_time: bookingData.dateTime.time,
            total: bookingData.total,
            status: receiptUrl ? 'بانتظار المراجعة' : 'بانتظار الدفع',
            receipt_url: receiptUrl,
            session_id: `ses-${uuidv4().slice(0,8)}`
        }]).select().single();

        if (error) throw error;
        return data as CreativeWritingBooking;
    },

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        const { data: booking, error } = await (supabase.from('bookings') as any)
            .update({ status: newStatus })
            .eq('id', bookingId)
            .select('*, instructors(user_id, name), child_profiles(name)')
            .single();

        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_BOOKING_STATUS', bookingId, `حجز: ${booking.package_name}`, `تغيير الحالة إلى: ${newStatus}`);

        if (newStatus === 'مؤكد') {
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');
            
            const { data: pkgData } = await supabase.from('creative_writing_packages').select('sessions').eq('name', booking.package_name).single();
            const pkg = pkgData as any;
            const sessionCount = pkg ? parseSessionCount(pkg.sessions) : 1;
            
            const now = new Date();
            const originalDate = new Date(booking.booking_date);
            let startDate = originalDate;
            
            if (startDate < now) {
                while (startDate < now) { 
                    startDate.setDate(startDate.getDate() + 7); 
                }
            }

            const sessionsToInsert = [];
            for (let i = 0; i < sessionCount; i++) {
                const sDate = new Date(startDate);
                sDate.setDate(startDate.getDate() + (i * 7));
                
                sessionsToInsert.push({
                    id: uuidv4(),
                    booking_id: bookingId,
                    child_id: booking.child_id,
                    instructor_id: booking.instructor_id,
                    session_date: sDate.toISOString(),
                    status: 'upcoming'
                });
            }
            
            await (supabase.from('scheduled_sessions') as any).insert(sessionsToInsert);
        }

        if (newStatus === 'ملغي') {
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');
        }

        return { success: true };
    },

    async updateScheduledSession(sessionId: string, updates: any) {
        const { error } = await (supabase.from('scheduled_sessions') as any).update(updates).eq('id', sessionId);
        if (error) throw error;
        return { success: true };
    },

    async updateBookingProgressNotes(bookingId: string, notes: string) {
        const { error } = await (supabase.from('bookings') as any).update({ progress_notes: notes }).eq('id', bookingId);
        if (error) throw error;
        return { success: true };
    },

    async saveBookingDraft(bookingId: string, draft: string) {
        // First get current details
        const { data: current, error: fetchError } = await supabase
            .from('bookings')
            .select('details')
            .eq('id', bookingId)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        // Merge to preserve other info (like file URLs or custom notes)
        const currentDetails = current?.details || {};
        const updatedDetails = { ...currentDetails, draft };

        const { error } = await (supabase.from('bookings') as any)
            .update({ details: updatedDetails })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true };
    },

    async sendSessionMessage(payload: { bookingId: string, senderId: string, role: 'instructor' | 'student' | 'user', message: string }) {
        const { error } = await (supabase.from('session_messages') as any).insert([{
            booking_id: payload.bookingId,
            sender_id: payload.senderId,
            sender_role: payload.role,
            message_text: payload.message
        }]);
        if (error) throw error;
        return { success: true };
    },

    async uploadSessionAttachment(payload: { bookingId: string, uploaderId: string, role: 'instructor' | 'student' | 'user', file: File }) {
        // Upload file to Supabase 'receipts' bucket (as specified for files)
        const publicUrl = await storageService.uploadFile(payload.file, 'receipts', `attachments/${payload.bookingId}`);
        
        const { error } = await (supabase.from('session_attachments') as any).insert([{
            booking_id: payload.bookingId,
            uploader_id: payload.uploaderId,
            uploader_role: payload.role,
            file_name: payload.file.name,
            file_url: publicUrl
        }]);
        if (error) throw error;
        return { success: true };
    },

    async createInstructor(payload: CreateInstructorPayload) {
        let avatarUrl = null;
        if (payload.avatarFile) {
            avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
        }
        const { avatarFile, ...rest } = payload;
        const { data, error } = await (supabase.from('instructors') as any).insert([{ ...rest, avatar_url: avatarUrl }]).select().single();
        if (error) throw error;
        return data as Instructor;
    },

    async updateInstructor(payload: Partial<Instructor> & { avatarFile?: File | null }) {
        let avatarUrl = payload.avatar_url;
        if (payload.avatarFile) {
            avatarUrl = await cloudinaryService.uploadImage(payload.avatarFile, 'alrehla_instructors');
        }
        const { id, avatarFile, ...updates } = payload;
        if (!id) throw new Error("Instructor ID is required");
        
        const { data, error } = await (supabase.from('instructors') as any).update({ ...updates, avatar_url: avatarUrl }).eq('id', id).select().single();
        if (error) throw error;
        return data as Instructor;
    },

    async deleteInstructor(instructorId: number) {
        const { error } = await (supabase.from('instructors') as any).update({ deleted_at: new Date().toISOString() }).eq('id', instructorId);
        if (error) throw error;
        return { success: true };
    },

    async createPackage(payload: Partial<CreativeWritingPackage>) {
        const { data, error } = await (supabase.from('creative_writing_packages') as any).insert([payload]).select().single();
        if (error) throw error;
        return data as CreativeWritingPackage;
    },
    async updatePackage(payload: Partial<CreativeWritingPackage>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("ID required");
        const { data, error } = await (supabase.from('creative_writing_packages') as any).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as CreativeWritingPackage;
    },
    async deletePackage(packageId: number) {
        const { error } = await supabase.from('creative_writing_packages').delete().eq('id', packageId);
        if (error) throw error;
        return { success: true };
    },

    async createStandaloneService(payload: Partial<StandaloneService>) {
        const { data, error } = await (supabase.from('standalone_services') as any).insert([payload]).select().single();
        if (error) throw error;
        return data as StandaloneService;
    },
    async updateStandaloneService(payload: Partial<StandaloneService>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("ID required");
        const { data, error } = await (supabase.from('standalone_services') as any).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as StandaloneService;
    },
    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase.from('standalone_services').delete().eq('id', serviceId);
        if (error) throw error;
        return { success: true };
    },

    async createComparisonItem(payload: Partial<ComparisonItem>) {
        const { data, error } = await (supabase.from('comparison_items') as any).insert([payload]).select().single();
        if (error) throw error;
        return data as ComparisonItem;
    },
    async updateComparisonItem(payload: Partial<ComparisonItem>) {
        const { id, ...updates } = payload;
        if (!id) throw new Error("ID required");
        const { data, error } = await (supabase.from('comparison_items') as any).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data as ComparisonItem;
    },
    async deleteComparisonItem(itemId: string) {
        const { error } = await supabase.from('comparison_items').delete().eq('id', itemId);
        if (error) throw error;
        return { success: true };
    },
};
