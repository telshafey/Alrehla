
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
            if (error.code !== 'PGRST116') throw new Error(error.message);
            return null;
        }
        return data as Instructor | null;
    },

    // --- Mutations ---
    // Added createInstructor method
    async createInstructor(payload: any) {
        const { avatarFile, ...rest } = payload;
        let avatar_url = null;
        if (avatarFile) {
            avatar_url = await cloudinaryService.uploadImage(avatarFile, 'alrehla_instructors');
        }
        const { data, error } = await supabase.from('instructors').insert([{ ...rest, avatar_url }]).select().single();
        if (error) throw new Error(error.message);
        return data as Instructor;
    },

    // Added updateInstructor method
    async updateInstructor(payload: any) {
        const { id, avatarFile, ...updates } = payload;
        let avatar_url = updates.avatar_url;
        if (avatarFile) {
            avatar_url = await cloudinaryService.uploadImage(avatarFile, 'alrehla_instructors');
        }
        const { data, error } = await supabase.from('instructors').update({ ...updates, avatar_url }).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as Instructor;
    },

    // Added deleteInstructor method
    async deleteInstructor(instructorId: number) {
        const { error } = await supabase.from('instructors').update({ deleted_at: new Date().toISOString() }).eq('id', instructorId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Added createPackage method
    async createPackage(payload: any) {
        const { data, error } = await supabase.from('creative_writing_packages').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as CreativeWritingPackage;
    },

    // Added updatePackage method
    async updatePackage(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('creative_writing_packages').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as CreativeWritingPackage;
    },

    // Added deletePackage method
    async deletePackage(packageId: number) {
        const { error } = await supabase.from('creative_writing_packages').delete().eq('id', packageId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Added createComparisonItem method
    async createComparisonItem(payload: any) {
        const { data, error } = await supabase.from('comparison_items').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    // Added updateComparisonItem method
    async updateComparisonItem(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('comparison_items').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    // Added deleteComparisonItem method
    async deleteComparisonItem(itemId: string) {
        const { error } = await supabase.from('comparison_items').delete().eq('id', itemId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Added createStandaloneService method
    async createStandaloneService(payload: any) {
        const { data, error } = await supabase.from('standalone_services').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as StandaloneService;
    },

    // Added updateStandaloneService method
    async updateStandaloneService(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('standalone_services').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as StandaloneService;
    },

    // Added deleteStandaloneService method
    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase.from('standalone_services').delete().eq('id', serviceId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // Added getAllAttachments method
    async getAllAttachments() {
        const { data, error } = await supabase.from('session_attachments').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as SessionAttachment[];
    },

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        // 1. تحديث الحالة الأساسية
        const { data: booking, error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId)
            .select('*, instructors(user_id, name)')
            .single();

        if (error) throw new Error(error.message);

        // 2. منطق خاص عند "تأكيد" الحجز (Confirmed)
        if (newStatus === 'مؤكد') {
            // أ. تنظيف الجلسات القديمة التي قد تكون ولدت وقت الطلب ولم تعد صالحة
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');

            // ب. تحديد تاريخ البداية الجديد (أول موعد متاح في المستقبل)
            const now = new Date();
            const originalDate = new Date(booking.booking_date);
            let startDate = originalDate;

            // إذا كان الموعد الأصلي قد فات، نقوم بترحيله أسبوعاً وراء أسبوع حتى نصل للمستقبل
            while (startDate < now) {
                startDate.setDate(startDate.getDate() + 7);
            }

            // ج. إعادة توليد الجلسات
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

            // د. إرسال إشعار للمدرب
            if (booking.instructors?.user_id) {
                await supabase.from('notifications').insert([{
                    user_id: booking.instructors.user_id,
                    message: `تم تأكيد حجز جديد لبرنامج ${booking.package_name}. يرجى مراجعة جدولك.`,
                    link: `/journey/${bookingId}`,
                    type: 'booking',
                    read: false
                }]);
            }
        }

        return { success: true };
    },

    async updateScheduledSession(sessionId: string, updates: { status?: string; notes?: string; new_date?: string; reason?: string }) {
        const payload: any = {};
        if (updates.status) payload.status = updates.status;
        if (updates.notes) payload.notes = updates.notes;
        if (updates.new_date) payload.session_date = updates.new_date;

        const { error } = await supabase
            .from('scheduled_sessions')
            .update(payload)
            .eq('id', sessionId);

        if (error) throw error;
        return { success: true };
    },

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
            .select().single();
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
            .select().single();
        if (error) throw new Error(error.message);
        return data as SessionAttachment;
    },

    async createBooking(payload: any) {
        const bookingId = `bk_${Math.floor(Math.random() * 1000000)}`;
        const startDate = new Date(payload.payload.dateTime.date);
        const [h, m] = payload.payload.dateTime.time.split(':');
        startDate.setHours(parseInt(h), parseInt(m), 0);

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                id: bookingId,
                user_id: payload.userId,
                child_id: payload.payload.child.id,
                instructor_id: payload.payload.instructor.id,
                package_name: payload.payload.package.name,
                booking_date: startDate.toISOString(),
                booking_time: payload.payload.dateTime.time,
                total: payload.payload.total,
                status: 'بانتظار الدفع',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw new Error(error.message);
        return data?.[0] as CreativeWritingBooking;
    },

    async updateBookingProgressNotes(bookingId: string, notes: string) {
        const { error } = await supabase.from('bookings').update({ progress_notes: notes }).eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async saveBookingDraft(bookingId: string, draft: string) {
        const { error } = await supabase.from('bookings').update({ draft_content: draft }).eq('id', bookingId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async getAllPackages() {
        const { data } = await supabase.from('creative_writing_packages').select('*').order('price');
        return data as CreativeWritingPackage[];
    },

    async getAllStandaloneServices() {
        const { data } = await supabase.from('standalone_services').select('*').order('price');
        return data as StandaloneService[];
    },

    async getAllComparisonItems() {
        const { data } = await supabase.from('comparison_items').select('*').order('sort_order');
        return data as ComparisonItem[];
    }
};
