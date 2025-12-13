
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
            .is('deleted_at', null) // Filter active instructors only
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
        
        // It's possible the user is an instructor but hasn't been linked yet, or query failed
        if (error && error.code !== 'PGRST116') throw new Error(error.message);
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

    // --- Mutations: Instructors ---
    async createInstructor(payload: any) {
        // Handle Avatar Upload if a file is provided
        let avatarUrl = payload.avatar_url;
        if (payload.avatarFile) {
            const fileName = `avatars/${Date.now()}_${payload.avatarFile.name}`;
            const { error: uploadError } = await supabase.storage.from('Helio').upload(fileName, payload.avatarFile); // Changed bucket
            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('Helio').getPublicUrl(fileName); // Changed bucket
                avatarUrl = publicUrlData.publicUrl;
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
            const fileName = `avatars/${Date.now()}_${payload.avatarFile.name}`;
            const { error: uploadError } = await supabase.storage.from('Helio').upload(fileName, payload.avatarFile); // Changed bucket
            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('Helio').getPublicUrl(fileName); // Changed bucket
                avatarUrl = publicUrlData.publicUrl;
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
        // Perform Soft Delete by setting deleted_at
        const { error } = await supabase
            .from('instructors')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', instructorId);
        
        if (error) throw new Error(error.message);
        return { success: true };
    },

    // --- Mutations: Bookings ---
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

    // --- Mutations: Packages ---
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
        
        if (!id) throw new Error("لم يتم تحديد معرف الباقة (ID) للتحديث");

        const { data, error } = await supabase
            .from('creative_writing_packages')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw new Error(error.message);
        
        if (!data || data.length === 0) {
            const { count } = await supabase.from('creative_writing_packages').select('*', { count: 'exact', head: true }).eq('id', id);
            
            if (count && count > 0) {
                throw new Error("فشل التحديث: يرجى التحقق من سياسات الأمان (RLS Policies).");
            } else {
                throw new Error(`لم يتم العثور على الباقة رقم ${id}. ربما تم حذفها.`);
            }
        }
        
        return data[0] as CreativeWritingPackage;
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
        const { id, ...rest } = payload;
        const { data, error } = await supabase
            .from('standalone_services')
            .insert([rest])
            .select();
            
        if (error) throw new Error(error.message);
        return data?.[0] as StandaloneService;
    },

    async updateStandaloneService(payload: any) {
        const { id, ...updates } = payload;
        const { data, error } = await supabase
            .from('standalone_services')
            .update(updates)
            .eq('id', id)
            .select();
            
        if (error) throw new Error(error.message);
        
        if (!data || data.length === 0) {
             const { count } = await supabase.from('standalone_services').select('*', { count: 'exact', head: true }).eq('id', id);
             if (count && count > 0) {
                throw new Error("فشل التحديث: يرجى التحقق من سياسات الأمان (RLS Policies).");
            } else {
                throw new Error("لم يتم العثور على الخدمة للتحديث");
            }
        }
        return data[0] as StandaloneService;
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
