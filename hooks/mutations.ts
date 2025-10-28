import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabaseClient';
import type { Prices, SiteBranding, ShippingCosts, UserRole, UserProfile, OrderStatus, TicketStatus, RequestStatus, BookingStatus, WeeklySchedule, AvailableSlots } from '../lib/database.types';

// This is a mock implementation of mutations.
// In a real app, these would make API calls to a backend.

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==================================
// GENERAL SETTINGS MUTATIONS
// ==================================
export const useProductSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updatePrices = useMutation({
        mutationFn: async (newPrices: Prices) => {
            console.log("Updating prices (mock):", newPrices);
            await sleep(500);
            return newPrices;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prices'] });
            addToast('تم تحديث الأسعار بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الأسعار: ${error.message}`, 'error');
        }
    });
    
    const updateBranding = useMutation({
        mutationFn: async (newBranding: Partial<SiteBranding>) => {
            console.log("Updating branding (mock):", newBranding);
            await sleep(500);
            return newBranding;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteBranding'] });
            addToast('تم تحديث العلامة التجارية بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث العلامة التجارية: ${error.message}`, 'error');
        }
    });

    const updateShippingCosts = useMutation({
        mutationFn: async (newCosts: ShippingCosts) => {
            console.log("Updating shipping costs (mock):", newCosts);
            await sleep(500);
            return newCosts;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shippingCosts'] });
            addToast('تم تحديث تكاليف الشحن بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث تكاليف الشحن: ${error.message}`, 'error');
        }
    });

    return { updatePrices, updateBranding, updateShippingCosts };
};

export const useSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateSocialLinks = useMutation({
        mutationFn: async (links: any) => {
            await sleep(500);
            console.log("Updating social links (mock)", links);
            return links;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSocialLinks'] });
            // This toast is handled in the component
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الروابط: ${error.message}`, 'error');
        }
    });

    return { updateSocialLinks };
}


// ==================================
// USER & AUTH MUTATIONS
// ==================================
export const useUserMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateUser = useMutation({
        mutationFn: async (payload: { id: string, name: string }) => {
            await sleep(500);
            console.log("Updating user (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] }); // To update name in UI
            addToast('تم تحديث المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث المستخدم: ${error.message}`, 'error');
        }
    });
    
    const updateUserPassword = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating user password (mock)", payload.userId);
            addToast('تم تحديث كلمة المرور بنجاح (محاكاة).', 'success');
            return { success: true };
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث كلمة المرور: ${error.message}`, 'error');
        }
    });

    const createUser = useMutation({
        mutationFn: async (payload: { name: string, email: string, password: string }) => {
            await sleep(500);
            console.log("Creating user (mock)", payload);
            return { ...payload, id: `usr_${Math.random()}` };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            addToast('تم إنشاء المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء المستخدم: ${error.message}`, 'error');
        }
    });
    
    const deleteUser = useMutation({
        mutationFn: async ({ userId }: { userId: string }) => {
            await sleep(500);
            console.log("Deleting user (mock)", userId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            addToast('تم حذف المستخدم بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حذف المستخدم: ${error.message}`, 'error');
        }
    });

    const createAndLinkStudentAccount = useMutation({
        mutationFn: async (payload: { name: string, email: string, password: string, childProfileId: number }) => {
            await sleep(800);
            console.log("Creating and linking student account (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
             queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم إنشاء وربط حساب الطالب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الحساب: ${error.message}`, 'error');
        }
    });

    const linkStudentToChildProfile = useMutation({
        mutationFn: async (payload: { studentUserId: string, childProfileId: number }) => {
            await sleep(500);
            console.log("Linking student (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم ربط الحساب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل ربط الحساب: ${error.message}`, 'error');
        }
    });
    
    const unlinkStudentFromChildProfile = useMutation({
        mutationFn: async (payload: { childProfileId: number }) => {
            await sleep(500);
            console.log("Unlinking student (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminAllChildProfiles'] });
            addToast('تم إلغاء ربط الحساب بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل إلغاء الربط: ${error.message}`, 'error');
        }
    });

     const deleteChildProfile = useMutation({
        mutationFn: async ({ childId }: { childId: number }) => {
            await sleep(500);
            console.log("Deleting child profile (mock)", childId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userAccountData'] });
            addToast('تم حذف ملف الطفل بنجاح.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حذف الملف: ${error.message}`, 'error');
        }
    });

    return { updateUser, updateUserPassword, createUser, deleteUser, createAndLinkStudentAccount, linkStudentToChildProfile, unlinkStudentFromChildProfile, deleteChildProfile };
};


// ==================================
// ORDER / BOOKING / SUBSCRIPTION MUTATIONS
// ==================================
export const useOrderMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createOrder = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating order (mock)", payload);
            return { ...payload, id: `ord_${Math.random()}` };
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الطلب: ${error.message}`, 'error');
        }
    });

    const updateOrderStatus = useMutation({
        mutationFn: async ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) => {
            await sleep(300);
            console.log("Updating order status (mock)", { orderId, newStatus });
            return { success: true };
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast(`تم تحديث حالة الطلب ${vars.orderId} بنجاح.`, 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل تحديث الحالة: ${error.message}`, 'error');
        }
    });
    
    const updateOrderComment = useMutation({
        mutationFn: async ({ orderId, comment }: { orderId: string, comment: string }) => {
            await sleep(300);
            console.log("Updating order comment (mock)", { orderId, comment });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            addToast('تم حفظ الملاحظة.', 'success');
        },
        onError: (error: Error) => {
            addToast(`فشل حفظ الملاحظة: ${error.message}`, 'error');
        }
    });

    const updateReceipt = useMutation({
        mutationFn: async (payload: { itemId: string; itemType: string; receiptFile: File }) => {
             await sleep(1000);
             console.log("Uploading receipt (mock)", payload);
             return { success: true, url: 'https://example.com/mock-receipt.jpg' };
        },
        onSuccess: () => {
            addToast('تم رفع الإيصال بنجاح. طلبك قيد المراجعة.', 'success');
            queryClient.invalidateQueries({ queryKey: ['userAccountData']});
        },
        onError: (error: Error) => {
            addToast(`فشل رفع الإيصال: ${error.message}`, 'error');
        }
    });
    
    return { createOrder, updateOrderStatus, updateOrderComment, updateReceipt };
};

export const useBookingMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createBooking = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating booking (mock)", payload);
            return { ...payload, id: `bk_${Math.random()}` };
        },
         onError: (error: Error) => {
            addToast(`فشل إنشاء الحجز: ${error.message}`, 'error');
        }
    });
    
    const updateBookingStatus = useMutation({
        mutationFn: async ({ bookingId, newStatus }: { bookingId: string, newStatus: BookingStatus }) => {
            await sleep(300);
            console.log("Updating booking status (mock)", { bookingId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            addToast('تم تحديث حالة الحجز.', 'success');
        },
         onError: (error: Error) => {
            addToast(`فشل تحديث الحالة: ${error.message}`, 'error');
        }
    });

    const updateBookingProgressNotes = useMutation({
        mutationFn: async ({ bookingId, notes }: { bookingId: string, notes: string }) => {
            await sleep(500);
            console.log("Updating progress notes (mock)", { bookingId, notes });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRawCwBookings'] });
            queryClient.invalidateQueries({ queryKey: ['trainingJourney'] });
        },
         onError: (error: Error) => {
            addToast(`فشل حفظ الملاحظات: ${error.message}`, 'error');
        }
    });

    return { createBooking, updateBookingStatus, updateBookingProgressNotes };
};

export const useSubscriptionMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createSubscription = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log("Creating subscription (mock)", payload);
            return { ...payload, id: `sub_${Math.random()}` };
        },
        onError: (error: Error) => {
            addToast(`فشل إنشاء الاشتراك: ${error.message}`, 'error');
        }
    });
    
    const pauseSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Pausing subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إيقاف الاشتراك مؤقتاً.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    const cancelSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Cancelling subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إلغاء الاشتراك.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });
    
    const reactivateSubscription = useMutation({
        mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
            await sleep(500);
            console.log("Reactivating subscription (mock)", subscriptionId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            addToast('تم إعادة تفعيل الاشتراك.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    return { createSubscription, pauseSubscription, cancelSubscription, reactivateSubscription };
};


// ==================================
// NOTIFICATION MUTATIONS
// ==================================
export const useNotificationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const markNotificationAsRead = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: number }) => {
            await sleep(200);
            console.log('Marking as read:', notificationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
        },
    });

    const markAllNotificationsAsRead = useMutation({
        mutationFn: async () => {
            await sleep(500);
            console.log('Marking all as read');
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            addToast('تم تحديد الكل كمقروء', 'success');
        },
    });
    
     const deleteNotification = useMutation({
        mutationFn: async ({ notificationId }: { notificationId: number }) => {
            await sleep(200);
            console.log('Deleting notification:', notificationId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            addToast('تم حذف الإشعار', 'info');
        },
    });

    return { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification };
};

// ==================================
// COMMUNICATION MUTATIONS (Support, Join)
// ==================================
export const useCommunicationMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createSupportTicket = useMutation({
        mutationFn: async (data: { name: string, email: string, subject: string, message: string }) => {
            await sleep(500);
            console.log('Creating support ticket (mock)', data);
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الرسالة: ${err.message}`, 'error');
        }
    });

     const createJoinRequest = useMutation({
        mutationFn: async (data: { name: string, email: string, role: string, message: string }) => {
            await sleep(500);
            console.log('Creating join request (mock)', data);
            return { success: true };
        },
        onSuccess: () => {
            addToast('تم إرسال طلبك بنجاح! سنراجعه ونتواصل معك.', 'success');
        },
        onError: (err: Error) => {
            addToast(`فشل إرسال الطلب: ${err.message}`, 'error');
        }
    });

    const updateSupportTicketStatus = useMutation({
        mutationFn: async ({ ticketId, newStatus }: { ticketId: string, newStatus: TicketStatus }) => {
            await sleep(300);
            console.log("Updating ticket status (mock)", { ticketId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
            addToast('تم تحديث حالة الرسالة.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    const updateJoinRequestStatus = useMutation({
        mutationFn: async ({ requestId, newStatus }: { requestId: string, newStatus: RequestStatus }) => {
            await sleep(300);
            console.log("Updating request status (mock)", { requestId, newStatus });
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminJoinRequests'] });
            addToast('تم تحديث حالة الطلب.', 'success');
        },
        onError: (error: Error) => addToast(`فشل: ${error.message}`, 'error'),
    });

    return { createSupportTicket, createJoinRequest, updateSupportTicketStatus, updateJoinRequestStatus };
};

// ==================================
// CONTENT MUTATIONS (Blog, Site Content)
// ==================================
export const useContentMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const updateSiteContent = useMutation({
        mutationFn: async (content: any) => {
            await sleep(800);
            console.log('Updating site content (mock)', content);
            return content;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSiteContent'] });
            queryClient.invalidateQueries({ queryKey: ['publicData'] });
            addToast('تم حفظ محتوى الموقع بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الحفظ: ${err.message}`, 'error'),
    });

    const createBlogPost = useMutation({
        mutationFn: async (payload: any) => {
             await sleep(500);
             console.log("Creating post (mock)", payload);
             return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم إنشاء المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateBlogPost = useMutation({
        mutationFn: async (payload: any) => {
             await sleep(500);
             console.log("Updating post (mock)", payload);
             return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم تحديث المقال بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteBlogPost = useMutation({
        mutationFn: async ({ postId }: { postId: number }) => {
            await sleep(500);
            console.log("Deleting post (mock)", postId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
            addToast('تم حذف المقال بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return { updateSiteContent, createBlogPost, updateBlogPost, deleteBlogPost };
};

// ==================================
// PERSONALIZED PRODUCTS MUTATIONS
// ==================================
export const useProductMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createPersonalizedProduct = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating product (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم إنشاء المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updatePersonalizedProduct = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating product (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم تحديث المنتج بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deletePersonalizedProduct = useMutation({
        mutationFn: async ({ productId }: { productId: number }) => {
            await sleep(500);
            console.log("Deleting product (mock)", productId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPersonalizedProducts'] });
            addToast('تم حذف المنتج بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return { createPersonalizedProduct, updatePersonalizedProduct, deletePersonalizedProduct };
}

// ==================================
// INSTRUCTOR MUTATIONS
// ==================================
export const useInstructorMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createInstructor = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Creating instructor (mock)", payload);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إضافة المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateInstructor = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            console.log("Updating instructor (mock)", payload);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المدرب بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const approveInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Approving schedule for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تمت الموافقة على الجدول.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const rejectInstructorSchedule = useMutation({
        mutationFn: async ({ instructorId }: { instructorId: number }) => {
            await sleep(300);
            console.log("Rejecting schedule for instructor:", instructorId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم رفض الجدول.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateInstructorAvailability = useMutation({
        mutationFn: async ({ instructorId, availability }: { instructorId: number, availability: AvailableSlots }) => {
            await sleep(500);
            console.log("Updating availability for instructor:", {instructorId, availability});
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم تحديث المواعيد المتاحة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const requestScheduleChange = useMutation({
        mutationFn: async ({ instructorId, schedule }: { instructorId: number, schedule: WeeklySchedule }) => {
            await sleep(500);
            console.log("Requesting schedule change for instructor:", {instructorId, schedule});
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إرسال طلب تعديل الجدول للمراجعة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const requestProfileUpdate = useMutation({
        mutationFn: async (payload: { instructorId: number, updates: any, justification: string }) => {
            await sleep(500);
            console.log("Requesting profile update (mock)", payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
            addToast('تم إرسال طلب تحديث ملفك الشخصي للمراجعة.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });

    const approveSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            await sleep(300);
            console.log("Approving support request:", requestId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تمت الموافقة على طلب الدعم.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const rejectSupportSessionRequest = useMutation({
        mutationFn: async ({ requestId }: { requestId: string }) => {
            await sleep(300);
            console.log("Rejecting support request:", requestId);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم رفض طلب الدعم.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const createSupportSessionRequest = useMutation({
        mutationFn: async (payload: { instructorId: number, childId: number, reason: string }) => {
            await sleep(500);
            console.log("Creating support session request (mock)", payload);
            return { ...payload, id: `sup_req_${Math.random()}` };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSupportSessionRequests'] });
            addToast('تم إرسال طلبك للإدارة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل إرسال الطلب: ${err.message}`, 'error'),
    });


    return { createInstructor, updateInstructor, approveInstructorSchedule, rejectInstructorSchedule, updateInstructorAvailability, requestScheduleChange, requestProfileUpdate, approveSupportSessionRequest, rejectSupportSessionRequest, createSupportSessionRequest };
}


// ==================================
// CREATIVE WRITING SETTINGS MUTATIONS
// ==================================
export const useCreativeWritingSettingsMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const createCreativeWritingPackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const updateCreativeWritingPackage = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الباقة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteCreativeWritingPackage = useMutation({
        mutationFn: async ({ packageId }: { packageId: number }) => {
            await sleep(500);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الباقة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const createAdditionalService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return { ...payload, id: Math.random() };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم إنشاء الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });
    
    const updateAdditionalService = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(500);
            return payload;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم تحديث الخدمة بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    const deleteAdditionalService = useMutation({
        mutationFn: async ({ serviceId }: { serviceId: number }) => {
            await sleep(500);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCWSettings'] });
            addToast('تم حذف الخدمة بنجاح.', 'info');
        },
        onError: (err: Error) => addToast(`فشل: ${err.message}`, 'error'),
    });

    return {
        createCreativeWritingPackage,
        updateCreativeWritingPackage,
        deleteCreativeWritingPackage,
        createAdditionalService,
        updateAdditionalService,
        deleteAdditionalService
    };
}


// ==================================
// SCHEDULING MUTATIONS
// ==================================
export const useSchedulingMutations = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToast();

    const scheduleSubscriptionSessions = useMutation({
        mutationFn: async (payload: any) => {
            await sleep(1000);
            console.log('Scheduling sessions (mock)', payload);
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminScheduledSessions'] });
            addToast('تمت جدولة الجلسات بنجاح.', 'success');
        },
        onError: (err: Error) => addToast(`فشل الجدولة: ${err.message}`, 'error'),
    });

    return { scheduleSubscriptionSessions };
};
