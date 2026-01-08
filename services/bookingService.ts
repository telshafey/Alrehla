
import { supabase } from '../lib/supabaseClient';
import { cloudinaryService } from './cloudinaryService';
import { reportingService } from './reportingService';
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
    async createInstructor(payload: any) {
        const { avatarFile, ...rest } = payload;
        let avatar_url = null;
        if (avatarFile) {
            avatar_url = await cloudinaryService.uploadImage(avatarFile, 'alrehla_instructors');
        }
        const { data, error } = await supabase.from('instructors').insert([{ ...rest, avatar_url }]).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('CREATE_INSTRUCTOR', data.id.toString(), `مدرب: ${data.name}`, `إضافة مدرب جديد للمنصة`);
        return data as Instructor;
    },

    async updateInstructor(payload: any) {
        const { id, avatarFile, ...updates } = payload;
        let avatar_url = updates.avatar_url;
        if (avatarFile) {
            avatar_url = await cloudinaryService.uploadImage(avatarFile, 'alrehla_instructors');
        }
        const { data, error } = await supabase.from('instructors').update({ ...updates, avatar_url }).eq('id', id).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_INSTRUCTOR', id.toString(), `مدرب: ${data.name}`, `تحديث بيانات المدرب مباشرة من الإدارة`);
        return data as Instructor;
    },

    async deleteInstructor(instructorId: number) {
        const { data: instructor } = await supabase.from('instructors').select('name').eq('id', instructorId).single();
        const { error } = await supabase.from('instructors').update({ deleted_at: new Date().toISOString() }).eq('id', instructorId);
        if (error) throw new Error(error.message);

        await reportingService.logAction('DELETE_INSTRUCTOR', instructorId.toString(), `مدرب: ${instructor?.name}`, `حذف ناعم لملف المدرب`);
        return { success: true };
    },

    async createPackage(payload: any) {
        const { data, error } = await supabase.from('creative_writing_packages').insert([payload]).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('CREATE_CW_PACKAGE', data.id.toString(), `باقة: ${data.name}`, `إضافة باقة تدريبية جديدة`);
        return data as CreativeWritingPackage;
    },

    async updatePackage(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('creative_writing_packages').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_CW_PACKAGE', id.toString(), `باقة: ${data.name}`, `تعديل ميزات أو سعر الباقة`);
        return data as CreativeWritingPackage;
    },

    async deletePackage(packageId: number) {
        const { error } = await supabase.from('creative_writing_packages').delete().eq('id', packageId);
        if (error) throw new Error(error.message);

        await reportingService.logAction('DELETE_CW_PACKAGE', packageId.toString(), `باقة ID: ${packageId}`, `حذف باقة تدريبية`);
        return { success: true };
    },

    async createComparisonItem(payload: any) {
        const { data, error } = await supabase.from('comparison_items').insert([payload]).select().single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    async updateComparisonItem(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('comparison_items').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as ComparisonItem;
    },

    async deleteComparisonItem(itemId: string) {
        const { error } = await supabase.from('comparison_items').delete().eq('id', itemId);
        if (error) throw new Error(error.message);
        return { success: true };
    },

    async createStandaloneService(payload: any) {
        const { data, error } = await supabase.from('standalone_services').insert([payload]).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('CREATE_CW_SERVICE', data.id.toString(), `خدمة: ${data.name}`, `إضافة خدمة إبداعية جديدة`);
        return data as StandaloneService;
    },

    async updateStandaloneService(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase.from('standalone_services').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_CW_SERVICE', id.toString(), `خدمة: ${data.name}`, `تحديث بيانات الخدمة الإبداعية`);
        return data as StandaloneService;
    },

    async deleteStandaloneService(serviceId: number) {
        const { error } = await supabase.from('standalone_services').delete().eq('id', serviceId);
        if (error) throw new Error(error.message);

        await reportingService.logAction('DELETE_CW_SERVICE', serviceId.toString(), `خدمة ID: ${serviceId}`, `حذف خدمة إبداعية`);
        return { success: true };
    },

    async getAllAttachments() {
        const { data, error } = await supabase.from('session_attachments').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return data as SessionAttachment[];
    },

    async updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
        const { data: booking, error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', bookingId)
            .select('*, instructors(user_id, name), child_profiles(name)')
            .single();

        if (error) throw new Error(error.message);

        await reportingService.logAction('UPDATE_BOOKING_STATUS', bookingId, `حجز: ${booking.package_name} لـ ${booking.child_profiles?.name}`, `تغيير الحالة إلى: ${newStatus}`);

        if (newStatus === 'مؤكد') {
            await supabase.from('scheduled_sessions').delete().eq('booking_id', bookingId).eq('status', 'upcoming');
            const now = new Date();
            const originalDate = new Date(booking.booking_date);
            let startDate = originalDate;
            while (startDate < now) {
                startDate.setDate(startDate.getDate() + 7);
            }
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

        const { error } = await supabase.from('scheduled_sessions').update(payload).eq('id', sessionId);
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
