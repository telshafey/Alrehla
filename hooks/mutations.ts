import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole, OrderStatus, BookingStatus, TicketStatus, RequestStatus, WeeklySchedule, SocialLinks, SiteBranding, ShippingCosts, CreativeWritingPackage, AdditionalService } from '../lib/database.types';

// Mock async function to simulate network delay
const mockApiCall = (data?: any, delay = 500) => new Promise(resolve => setTimeout(() => resolve(data), delay));

// Reusable generic mutation hook
const useGenericMutation = <TVariables = any, TData = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    { successMessage, invalidationKeys }: { successMessage: string; invalidationKeys: string[][] }
) => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    return useMutation({
        mutationFn: mutationFn,
        onSuccess: () => {
            addToast(successMessage, 'success');
            invalidationKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
        },
        onError: (error: any) => {
            addToast(`Error: ${error.message || 'An unknown error occurred.'}`, 'error');
        },
    });
};

// --- SPECIALIZED MUTATION HOOKS ---

export const useOrderMutations = () => {
    const createOrder = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Order created successfully (mock).', invalidationKeys: [['adminOrders'], ['userAccountData']] }
    );
    const updateOrderStatus = useGenericMutation(
        ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) => mockApiCall({ orderId, newStatus }),
        { successMessage: 'Order status updated.', invalidationKeys: [['adminOrders']] }
    );
    const updateOrderComment = useGenericMutation(
        ({ orderId, comment }: { orderId: string, comment: string }) => mockApiCall({ orderId, comment }),
        { successMessage: 'Order comment saved.', invalidationKeys: [['adminOrders']] }
    );
    const updateReceipt = useGenericMutation(
        ({ itemId, itemType, receiptFile }: { itemId: string, itemType: string, receiptFile: File }) => mockApiCall({ itemId, itemType, receiptFile: receiptFile.name }),
        { successMessage: 'Receipt uploaded successfully (mock).', invalidationKeys: [['adminOrders'], ['adminCwBookings'], ['userAccountData']] }
    );
    
    return { createOrder, updateOrderStatus, updateOrderComment, updateReceipt };
};

export const useBookingMutations = () => {
    const createBooking = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Booking created successfully (mock).', invalidationKeys: [['adminCwBookings'], ['userAccountData']] }
    );
    const updateBookingStatus = useGenericMutation(
        ({ bookingId, newStatus }: { bookingId: string, newStatus: BookingStatus }) => mockApiCall({ bookingId, newStatus }),
        { successMessage: 'Booking status updated.', invalidationKeys: [['adminCwBookings']] }
    );
    const updateBookingProgressNotes = useGenericMutation(
        ({ bookingId, notes }: { bookingId: string, notes: string }) => mockApiCall({ bookingId, notes }),
        { successMessage: 'Progress notes updated.', invalidationKeys: [['adminCwBookings'], ['studentDashboardData']] }
    );
    return { createBooking, updateBookingStatus, updateBookingProgressNotes };
};

export const useSubscriptionMutations = () => {
    const createSubscription = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Subscription created successfully (mock).', invalidationKeys: [['adminSubscriptions'], ['userAccountData']] }
    );
    const pauseSubscription = useGenericMutation(
        ({ subscriptionId }: { subscriptionId: string }) => mockApiCall({ subscriptionId }),
        { successMessage: 'تم إيقاف الاشتراك مؤقتاً.', invalidationKeys: [['adminSubscriptions'], ['userAccountData']] }
    );
    const cancelSubscription = useGenericMutation(
        ({ subscriptionId }: { subscriptionId: string }) => mockApiCall({ subscriptionId }),
        { successMessage: 'تم إلغاء الاشتراك.', invalidationKeys: [['adminSubscriptions'], ['userAccountData']] }
    );
    const reactivateSubscription = useGenericMutation(
        ({ subscriptionId }: { subscriptionId: string }) => mockApiCall({ subscriptionId }),
        { successMessage: 'تم إعادة تفعيل الاشتراك.', invalidationKeys: [['adminSubscriptions'], ['userAccountData']] }
    );
    return { createSubscription, pauseSubscription, cancelSubscription, reactivateSubscription };
};


// --- USER & AUTH MUTATIONS ---
export const useUserMutations = () => {
    const { updateCurrentUser } = useAuth();
    
    const updateUserRole = useGenericMutation(
        ({ userId, newRole }: { userId: string, newRole: UserRole }) => mockApiCall({ userId, newRole }),
        { successMessage: 'User role updated.', invalidationKeys: [['adminUsersWithRelations']] }
    );
    const createUser = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'User created successfully (mock).', invalidationKeys: [['adminUsersWithRelations']] }
    );
     const updateUser = useGenericMutation(
        (payload: { id: string; name: string }) => mockApiCall({ ...payload }).then(updatedUser => {
            updateCurrentUser({ name: payload.name });
            return updatedUser;
        }),
        { successMessage: 'تم تحديث الاسم بنجاح.', invalidationKeys: [['adminUsersWithRelations']] }
    );
    const updateUserPassword = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'تم تغيير كلمة المرور بنجاح.', invalidationKeys: [] }
    );
    const linkStudentToChildProfile = useGenericMutation(
        ({ studentUserId, childProfileId }: { studentUserId: string, childProfileId: number }) => mockApiCall({ studentUserId, childProfileId }),
        { successMessage: 'Student account linked.', invalidationKeys: [['adminUsersWithRelations'], ['adminAllChildProfiles']] }
    );
     const unlinkStudentFromChildProfile = useGenericMutation(
        ({ childProfileId }: { childProfileId: number }) => mockApiCall({ childProfileId }),
        { successMessage: 'Student account unlinked.', invalidationKeys: [['adminUsersWithRelations'], ['adminAllChildProfiles']] }
    );
    return { updateUserRole, createUser, updateUser, updateUserPassword, linkStudentToChildProfile, unlinkStudentFromChildProfile };
};

// --- COMMUNICATION MUTATIONS ---
export const useCommunicationMutations = () => {
    const createSupportTicket = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Your message has been sent!', invalidationKeys: [['adminSupportTickets']] }
    );
    const createJoinRequest = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Your application has been submitted!', invalidationKeys: [['adminJoinRequests']] }
    );
    const updateSupportTicketStatus = useGenericMutation(
        ({ ticketId, newStatus }: { ticketId: string, newStatus: TicketStatus }) => mockApiCall({ ticketId, newStatus }),
        { successMessage: 'Ticket status updated.', invalidationKeys: [['adminSupportTickets']] }
    );
    const updateJoinRequestStatus = useGenericMutation(
        ({ requestId, newStatus }: { requestId: string, newStatus: RequestStatus }) => mockApiCall({ requestId, newStatus }),
        { successMessage: 'Join request status updated.', invalidationKeys: [['adminJoinRequests']] }
    );
    return { createSupportTicket, createJoinRequest, updateSupportTicketStatus, updateJoinRequestStatus };
};

// --- PRODUCT MUTATIONS ---
export const useProductMutations = () => {
    const createPersonalizedProduct = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Product created successfully.', invalidationKeys: [['adminPersonalizedProducts'], ['publicData']] }
    );
    const updatePersonalizedProduct = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Product updated successfully.', invalidationKeys: [['adminPersonalizedProducts'], ['publicData']] }
    );
    const deletePersonalizedProduct = useGenericMutation(
        ({ productId }: { productId: number }) => mockApiCall({ productId }),
        { successMessage: 'Product deleted successfully.', invalidationKeys: [['adminPersonalizedProducts'], ['publicData']] }
    );
    return { createPersonalizedProduct, updatePersonalizedProduct, deletePersonalizedProduct };
};

// --- INSTRUCTOR MUTATIONS ---
export const useInstructorMutations = () => {
    const createInstructor = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Instructor created successfully.', invalidationKeys: [['adminInstructors']] }
    );
    const updateInstructor = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Instructor updated successfully.', invalidationKeys: [['adminInstructors']] }
    );
    const updateInstructorAvailability = useGenericMutation(
        ({ instructorId, availability }: { instructorId: number, availability: any }) => mockApiCall({ instructorId, availability }),
        { successMessage: 'Availability updated.', invalidationKeys: [['adminInstructors']] }
    );
    const requestScheduleChange = useGenericMutation(
        ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => mockApiCall({ instructorId, schedule }),
        { successMessage: 'Schedule change request submitted.', invalidationKeys: [['adminInstructors']] }
    );
    const approveInstructorSchedule = useGenericMutation(
        ({ instructorId }: { instructorId: number }) => mockApiCall({ instructorId }),
        { successMessage: 'Schedule approved.', invalidationKeys: [['adminInstructors']] }
    );
    const rejectInstructorSchedule = useGenericMutation(
        ({ instructorId }: { instructorId: number }) => mockApiCall({ instructorId }),
        { successMessage: 'Schedule rejected.', invalidationKeys: [['adminInstructors']] }
    );
    const requestSupportSession = useGenericMutation(
        ({ instructorId, childId, reason }: { instructorId: number; childId: number; reason: string }) => mockApiCall({ instructorId, childId, reason }),
        { successMessage: 'تم إرسال طلب جلسة الدعم بنجاح.', invalidationKeys: [['adminSupportSessionRequests']] }
    );
    const approveInstructorUpdate = useGenericMutation(
        ({ instructorId }: { instructorId: number }) => mockApiCall({ instructorId }),
        { successMessage: 'تمت الموافقة على تحديث ملف المدرب.', invalidationKeys: [['adminInstructors'], ['adminInstructorUpdates']] }
    );
    const rejectInstructorUpdate = useGenericMutation(
        ({ instructorId }: { instructorId: number }) => mockApiCall({ instructorId }),
        { successMessage: 'تم رفض تحديث ملف المدرب.', invalidationKeys: [['adminInstructors'], ['adminInstructorUpdates']] }
    );
     const approveSupportSessionRequest = useGenericMutation(
        ({ requestId }: { requestId: string }) => mockApiCall({ requestId }),
        { successMessage: 'تمت الموافقة على جلسة الدعم.', invalidationKeys: [['adminSupportSessionRequests']] }
    );
    const rejectSupportSessionRequest = useGenericMutation(
        ({ requestId }: { requestId: string }) => mockApiCall({ requestId }),
        { successMessage: 'تم رفض جلسة الدعم.', invalidationKeys: [['adminSupportSessionRequests']] }
    );
    const requestProfileUpdate = useGenericMutation(
        ({ instructorId, bio, rate }: { instructorId: number; bio: string; rate: number }) => mockApiCall({ instructorId, bio, rate }),
        { successMessage: 'تم إرسال طلب تحديث الملف الشخصي للمراجعة.', invalidationKeys: [['adminInstructors'], ['adminInstructorUpdates']] }
    );

    return { 
        createInstructor, updateInstructor, updateInstructorAvailability, requestScheduleChange, 
        approveInstructorSchedule, rejectInstructorSchedule, requestSupportSession,
        approveInstructorUpdate, rejectInstructorUpdate,
        approveSupportSessionRequest, rejectSupportSessionRequest,
        requestProfileUpdate
    };
};

// --- CREATIVE WRITING SETTINGS MUTATIONS ---
export const useCreativeWritingSettingsMutations = () => {
    const createCreativeWritingPackage = useGenericMutation(
        (pkg: Partial<CreativeWritingPackage>) => mockApiCall(pkg),
        { successMessage: 'Package created.', invalidationKeys: [['adminCWSettings'], ['publicData']] }
    );
    const updateCreativeWritingPackage = useGenericMutation(
        (pkg: Partial<CreativeWritingPackage>) => mockApiCall(pkg),
        { successMessage: 'Package updated.', invalidationKeys: [['adminCWSettings'], ['publicData']] }
    );
    const deleteCreativeWritingPackage = useGenericMutation(
        ({ id }: { id: number }) => mockApiCall({ id }),
        { successMessage: 'Package deleted.', invalidationKeys: [['adminCWSettings'], ['publicData']] }
    );
     const createAdditionalService = useGenericMutation(
        (srv: Partial<AdditionalService>) => mockApiCall(srv),
        { successMessage: 'Service created.', invalidationKeys: [['adminCWSettings']] }
    );
    const updateAdditionalService = useGenericMutation(
        (srv: Partial<AdditionalService>) => mockApiCall(srv),
        { successMessage: 'Service updated.', invalidationKeys: [['adminCWSettings']] }
    );
    const deleteAdditionalService = useGenericMutation(
        ({ id }: { id: number }) => mockApiCall({ id }),
        { successMessage: 'Service deleted.', invalidationKeys: [['adminCWSettings']] }
    );
    return { createCreativeWritingPackage, updateCreativeWritingPackage, deleteCreativeWritingPackage, createAdditionalService, updateAdditionalService, deleteAdditionalService };
};

// --- CONTENT MUTATIONS ---
export const useContentMutations = () => {
    const updateSiteContent = useGenericMutation(
        (content: any) => mockApiCall(content),
        { successMessage: 'Site content updated.', invalidationKeys: [['adminSiteContent'], ['publicData']] }
    );
    const createBlogPost = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Blog post created.', invalidationKeys: [['adminBlogPosts'], ['publicData']] }
    );
    const updateBlogPost = useGenericMutation(
        (payload: any) => mockApiCall(payload),
        { successMessage: 'Blog post updated.', invalidationKeys: [['adminBlogPosts'], ['publicData']] }
    );
    const deleteBlogPost = useGenericMutation(
        ({ postId }: { postId: number }) => mockApiCall({ postId }),
        { successMessage: 'Blog post deleted.', invalidationKeys: [['adminBlogPosts'], ['publicData']] }
    );
    return { updateSiteContent, createBlogPost, updateBlogPost, deleteBlogPost };
};

// --- GENERAL SETTINGS MUTATIONS ---
export const useSettingsMutations = () => {
    const updateSocialLinks = useGenericMutation(
        (links: Partial<SocialLinks>) => mockApiCall(links),
        { successMessage: 'Social links updated.', invalidationKeys: [['adminSocialLinks'], ['publicData']] }
    );
    return { updateSocialLinks };
};