import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
import type { UserRole, SocialLinks, Order, CreativeWritingBooking, SupportTicket, JoinRequest, WeeklySchedule, AvailableSlots, BlogPost, PersonalizedProduct } from '../lib/database.types.ts';

// Helper for mock mutations
const MOCK_API_DELAY = 500;
const mockMutation = (successMessage: string) => {
    return new Promise(resolve => {
        console.log(`Mock mutation: ${successMessage}`);
        setTimeout(resolve, MOCK_API_DELAY);
    });
};

export const useAppMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    // --- Generic Mutation Hook ---
    const useGenericMutation = <TData, TError, TVariables>(
        mutationFn: (vars: TVariables) => Promise<any>,
        { queryKeyToInvalidate, successMessage }: { queryKeyToInvalidate: string[], successMessage: string }
    ) => {
        return useMutation<TData, TError, TVariables>({
            mutationFn: async (variables) => {
                // In a real app, the mutationFn would contain the Supabase call.
                // For this mock setup, we just simulate a delay.
                await mockMutation(successMessage);
                return variables as any; // Return variables to simulate response
            },
            onSuccess: () => {
                addToast(successMessage, 'success');
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            },
            onError: (err: any) => {
                const errorMessage = err.message || 'حدث خطأ غير متوقع.';
                addToast(errorMessage, 'error');
                throw new Error(errorMessage);
            }
        });
    };
    
    // --- AUTH & USER MANAGEMENT ---
    const updateUserRole = useGenericMutation<void, Error, { userId: string; newRole: UserRole }>(
        async ({ userId, newRole }) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminUsers'], successMessage: 'تم تحديث دور المستخدم بنجاح.' }
    );
     const createUser = useGenericMutation<void, Error, { name: string, email: string, password?: string, role?: UserRole }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminUsers'], successMessage: 'تم إنشاء المستخدم بنجاح.' }
    );
    const updateUser = useGenericMutation<void, Error, { id: string, name: string }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminUsers'], successMessage: 'تم تحديث بيانات المستخدم.' }
    );

    // --- ORDER & BOOKING MANAGEMENT ---
    const createOrder = useGenericMutation<any, Error, any>(
         async (vars) => { return { id: `ord_${Date.now()}` } },
        { queryKeyToInvalidate: ['userAccountData'], successMessage: 'تم إنشاء الطلب بنجاح.' }
    );
    // FIX: Added createBooking mutation.
    const createBooking = useGenericMutation<any, Error, any>(
        async (vars) => { return { id: `book_${Date.now()}` } },
        { queryKeyToInvalidate: ['userAccountData', 'adminCwBookings'], successMessage: 'تم إنشاء الحجز بنجاح.' }
    );
    const createSubscription = useGenericMutation<any, Error, any>(
        async (vars) => { return { id: `sub_${Date.now()}` } },
        { queryKeyToInvalidate: ['userAccountData'], successMessage: 'تم إنشاء الاشتراك بنجاح.' }
    );
    const updateOrderStatus = useGenericMutation<void, Error, { orderId: string, newStatus: Order['status'] }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminOrders', 'userAccountData'], successMessage: 'تم تحديث حالة الطلب.' }
    );
    const updateOrderComment = useGenericMutation<void, Error, { orderId: string, comment: string }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminOrders'], successMessage: 'تم حفظ الملاحظة.' }
    );
     const updateBookingStatus = useGenericMutation<void, Error, { bookingId: string, newStatus: CreativeWritingBooking['status'] }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminCwBookings', 'userAccountData'], successMessage: 'تم تحديث حالة الحجز.' }
    );
    const updateBookingProgressNotes = useGenericMutation<void, Error, { bookingId: string, notes: string }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminCwBookings', 'studentDashboardData'], successMessage: 'تم حفظ ملاحظات التقدم.' }
    );
    const updateReceipt = useGenericMutation<void, Error, { itemId: string, itemType: string, receiptFile: File }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminOrders', 'adminCwBookings', 'userAccountData'], successMessage: 'تم رفع الإيصال بنجاح.' }
    );
    const confirmPayment = useGenericMutation<void, Error, { itemId: string, itemType: string }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminOrders', 'adminCwBookings', 'userAccountData'], successMessage: 'تم تأكيد الدفع بنجاح.' }
    );


    // --- SITE & CONTENT MANAGEMENT ---
    const updateSocialLinks = useGenericMutation<void, Error, Partial<SocialLinks>>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminSocialLinks', 'publicData'], successMessage: 'تم تحديث روابط التواصل الاجتماعي.' }
    );
    const updateSiteContent = useGenericMutation<void, Error, any>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminSiteContent'], successMessage: 'تم تحديث محتوى الموقع.' }
    );
    const createPersonalizedProduct = useGenericMutation<void, Error, Partial<PersonalizedProduct> & { imageFile: File | null }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminPersonalizedProducts'], successMessage: 'تم إضافة المنتج بنجاح.' }
    );
    const updatePersonalizedProduct = useGenericMutation<void, Error, Partial<PersonalizedProduct> & { imageFile: File | null }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminPersonalizedProducts'], successMessage: 'تم تحديث المنتج بنجاح.' }
    );
    const createBlogPost = useGenericMutation<void, Error, Partial<BlogPost> & { imageFile: File | null }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminBlogPosts'], successMessage: 'تم إنشاء المقال بنجاح.' }
    );
    const updateBlogPost = useGenericMutation<void, Error, Partial<BlogPost> & { imageFile: File | null }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminBlogPosts'], successMessage: 'تم تحديث المقال بنجاح.' }
    );
     const deleteBlogPost = useGenericMutation<void, Error, { postId: number }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminBlogPosts'], successMessage: 'تم حذف المقال بنجاح.' }
    );

    // --- SUPPORT & COMMUNICATION ---
    const createSupportTicket = useGenericMutation<void, Error, { name: string; email: string; subject: string; message: string }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminSupportTickets'], successMessage: 'تم إرسال رسالتك بنجاح.' }
    );
     const updateSupportTicketStatus = useGenericMutation<void, Error, { ticketId: string, newStatus: SupportTicket['status'] }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminSupportTickets'], successMessage: 'تم تحديث حالة الرسالة.' }
    );
    const createJoinRequest = useGenericMutation<void, Error, { name: string; email: string; role: string; message: string }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminJoinRequests'], successMessage: 'تم إرسال طلبك للانضمام بنجاح.' }
    );
    const updateJoinRequestStatus = useGenericMutation<void, Error, { requestId: string, newStatus: JoinRequest['status'] }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminJoinRequests'], successMessage: 'تم تحديث حالة الطلب.' }
    );
    
    // --- INSTRUCTOR MANAGEMENT ---
     const createInstructor = useGenericMutation<void, Error, any>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تمت إضافة المدرب بنجاح.' }
    );
    const updateInstructor = useGenericMutation<void, Error, any>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تم تحديث بيانات المدرب.' }
    );
    const requestScheduleChange = useGenericMutation<void, Error, { instructorId: number, schedule: WeeklySchedule }>(
         async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تم إرسال طلب تعديل الجدول للمراجعة.' }
    );
     const approveInstructorSchedule = useGenericMutation<void, Error, { instructorId: number }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تم اعتماد الجدول.' }
    );
    const rejectInstructorSchedule = useGenericMutation<void, Error, { instructorId: number }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تم رفض الجدول.' }
    );
     const updateInstructorAvailability = useGenericMutation<void, Error, { instructorId: number, availability: AvailableSlots }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminInstructors'], successMessage: 'تم تحديث المواعيد المتاحة.' }
    );
    const linkStudentToChildProfile = useGenericMutation<void, Error, { studentUserId: string, childProfileId: number }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminAllChildProfiles', 'adminUsers'], successMessage: 'تم ربط الحساب بنجاح.' }
    );
    const unlinkStudentFromChildProfile = useGenericMutation<void, Error, { childProfileId: number }>(
        async (vars) => { /* Supabase call here */ },
        { queryKeyToInvalidate: ['adminAllChildProfiles', 'adminUsers'], successMessage: 'تم إلغاء ربط الحساب.' }
    );


    return {
        updateUserRole,
        createUser,
        updateUser,
        createOrder,
        createBooking,
        createSubscription,
        updateOrderStatus,
        updateOrderComment,
        updateBookingStatus,
        updateBookingProgressNotes,
        updateReceipt,
        confirmPayment,
        updateSocialLinks,
        updateSiteContent,
        createPersonalizedProduct,
        updatePersonalizedProduct,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        createSupportTicket,
        updateSupportTicketStatus,
        createJoinRequest,
        updateJoinRequestStatus,
        createInstructor,
        updateInstructor,
        requestScheduleChange,
        approveInstructorSchedule,
        rejectInstructorSchedule,
        updateInstructorAvailability,
        linkStudentToChildProfile,
        unlinkStudentFromChildProfile
    };
};
