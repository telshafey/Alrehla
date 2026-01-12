
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

// helper to safely extract session count from package name if needed as fallback
const getSessionCountFromPackage = (packageName: string): number => {
    const match = packageName.match(/(\d+)/);
    if (match && match[1]) return parseInt(match[1], 10);
    if (packageName.includes('أربع') || packageName.includes('4')) return 4;
    if (packageName.includes('ثمان') || packageName.includes('8')) return 8;
    return 1;
};

// --- FAIL-FAST HELPER ---
const executeWithRetry = async <T>(operation: () => Promise<{ data: T | null; error: any }>): Promise<T | null> => {
    // Attempt 1
    let { data, error } = await operation();
    
    if (!error) return data;

    const errorMsg = error.message || '';
    
    // CRITICAL FIX: STOP RETRYING IF COLUMN IS MISSING
    if (errorMsg.includes('Could not find the') && errorMsg.includes('column')) {
         console.error("❌ Schema Mismatch: Column missing in DB.");
         if (typeof window !== 'undefined') localStorage.setItem('db_schema_error', 'true');
         // Throw a user-friendly error immediately
         throw new Error(`خطأ في قاعدة البيانات: العمود المطلوب غير موجود. يرجى الذهاب إلى: لوحة التحكم -> إعدادات النظام -> إصلاح الطوارئ، وتنفيذ كود SQL.`);
    }

    // Only retry for generic cache errors (PGRST204 without specific column name usually means cache reload needed)
    if (error.code === 'PGRST204' && !errorMsg.includes('column')) {
        console.warn("⚠️ Stale Cache detected. Trying reload...");
        await supabase.rpc('reload_schema_cache');
        await new Promise(r => setTimeout(r, 1000));
        const res2 = await operation();
        if (!res2.error) return res2.data;
    }

    throw error;
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

    // --- Validation (Deep Check) ---
    
    async checkSlotAvailability(instructorId: number, dateStr: string, time: string): Promise<boolean> {
        try {
            // 1. Get all active bookings for this instructor at this specific TIME (e.g. 10:00)
            const { data: bookingsData, error } = await supabase
                .from('bookings')
                .select('booking_date, package_name')
                .eq('instructor_id', instructorId)
                .eq('booking_time', time)
                .neq('status', 'ملغي');

            if (error || !bookingsData) return true; // If error, assume open (fail open) or handle better

            // Explicitly cast to any[] to fix TypeScript 'never' error
            const bookings = bookingsData as any[];

            const requestedDate = new Date(dateStr);
            requestedDate.setHours(0, 0, 0, 0);

            // 2. Check overlap logic in memory
            for (const booking of bookings) {
                const bookingStart = new Date(booking.booking_date);
                bookingStart.setHours(0, 0, 0, 0);

                const diffTime = requestedDate.getTime() - bookingStart.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // If diffDays is negative, it means requested date is BEFORE this booking, so no conflict 
                // UNLESS the requested booking is long enough to overlap THIS booking. 
                // For simplicity, we assume strictly FCFS (First Come First Served) for now.
                // However, checking forward overlap:
                
                if (diffDays >= 0 && diffDays % 7 === 0) {
                    const sessionCount = getSessionCountFromPackage(booking.package_name);
                    const sessionIndex = diffDays / 7;
                    
                    if (sessionIndex < sessionCount) {
                         // Conflict found!
                         return false; 
                    }
                }
            }

            return true;
        } catch { return true; }
    },

    // --- Mutations (Can Throw) ---

    async createBooking(payload: { userId: string, payload: CreateBookingPayload, receiptUrl: string }) {
        const { userId, payload: bookingData, receiptUrl } = payload;
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        
        const [hours, minutes] = bookingData.dateTime.time.split(':');
        const bookingDate = new Date(bookingData.dateTime.date);
        bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // 1. Create Booking Record
        const { data, error } = await (supabase.from('bookings') as any).insert([{
            id: bookingId,
            user_id: userId,
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

        // 2. Notify Instructor
        try {
            const { data: instructorData } = await supabase
                .from('instructors')
                .select('user_id')
                .eq('id', bookingData.instructor.id)
                .single();
            
            const safeInstructor = instructorData as any;
            if (safeInstructor && safeInstructor.user_id) {
                await (supabase.from('notifications') as any).insert([{
                    user_id: safeInstructor.user_id,
                    message: `حجز جديد: ${bookingData.package.name} للطالب ${bookingData.child.name}`,
                    link: '/admin/journeys', 
                    type: 'booking',
                    created_at: new Date().toISOString(),
                    read: false
                }]);
            }
        } catch (e) {
            console.error("Failed to notify instructor:", e);
        }

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
        const { data: current, error: fetchError } = await supabase
            .from('bookings')
            .select('details')
            .eq('id', bookingId)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        const currentDetails = (current as any)?.details || {};
        const updatedDetails = { ...currentDetails, draft };

        const { error } = await (supabase.from('bookings') as any)
            .update({ details: updatedDetails })
            .eq('id', bookingId);

        if (error) throw error;
        return { success: true };
    },

    async sendSessionMessage(payload: { bookingId: string, senderId: string, role: string, message: string }) {
        if (!payload.role) throw new Error("Role is missing");
        
        let safeRole = payload.role;
        if (!['user', 'parent', 'student', 'instructor', 'super_admin', 'general_supervisor', 'creative_writing_supervisor'].includes(safeRole)) {
             safeRole = 'user'; 
        }

        // Wrapped in Fail-Fast Logic
        await executeWithRetry(() => (supabase.from('session_messages') as any).insert([{
            booking_id: payload.bookingId,
            sender_id: payload.senderId,
            sender_role: safeRole, 
            message_text: payload.message,
            created_at: new Date().toISOString()
        }]));

        return { success: true };
    },

    async uploadSessionAttachment(payload: { bookingId: string, uploaderId: string, role: string, file: File }) {
        let publicUrl = '';

        if (payload.file.type.startsWith('image/')) {
            publicUrl = await cloudinaryService.uploadImage(payload.file, 'alrehla_attachments');
        } else {
            const folderPath = `session_files/${payload.bookingId}`;
            publicUrl = await storageService.uploadFile(payload.file, 'receipts', folderPath);
        }

        let safeRole = payload.role;
        if (!['user', 'parent', 'student', 'instructor', 'super_admin', 'general_supervisor', 'creative_writing_supervisor'].includes(safeRole)) {
             safeRole = 'user';
        }

        // Wrapped in Fail-Fast Logic
        await executeWithRetry(() => (supabase.from('session_attachments') as any).insert([{
            booking_id: payload.bookingId,
            uploader_id: payload.uploaderId,
            uploader_role: safeRole,
            file_name: payload.file.name,
            file_url: publicUrl,
            created_at: new Date().toISOString()
        }]));

        return { success: true, url: publicUrl };
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
        const payloadWithId = {
            ...payload,
            id: payload.id || Math.floor(Math.random() * 2147483647) 
        };
        const { data, error } = await (supabase.from('creative_writing_packages') as any).insert([payloadWithId]).select().single();
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
        const payloadWithId = {
            ...payload,
            id: payload.id || Math.floor(Math.random() * 2147483647)
        };
        const { data, error } = await (supabase.from('standalone_services') as any).insert([payloadWithId]).select().single();
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
