
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../../services/bookingService';
import { userService } from '../../../services/userService';
import { orderService } from '../../../services/orderService';
import type { ScheduledSession } from '../../../lib/database.types';

export const useAdminScheduledSessions = () => useQuery({
    queryKey: ['adminScheduledSessions'],
    queryFn: async () => {
        const [sessions, instructors, children, bookings, subscriptions, serviceOrders, standaloneServices] = await Promise.all([
            bookingService.getAllScheduledSessions(),
            bookingService.getAllInstructors(),
            userService.getAllChildProfiles(),
            bookingService.getAllBookings(),
            orderService.getAllSubscriptions(),
            orderService.getAllServiceOrders(),
            bookingService.getAllStandaloneServices()
        ]);

        return sessions
            .map(session => {
                const booking = bookings.find(b => b.id === session.booking_id);
                const subscription = subscriptions.find(s => s.id === session.subscription_id);
                
                // تحديد الحالة: إذا لم يوجد حجز أو اشتراك، نعتبرها "قادمة" طالما لم يتم إلغاؤها
                const status = booking?.status || (subscription ? 'نشط' : 'active');

                // تحديد مسمى الخدمة/الباقة
                let packageName = 'جلسة خاصة';
                if (booking) {
                    packageName = booking.package_name;
                } else if (subscription) {
                    packageName = `صندوق الرحلة (${subscription.plan_name})`;
                } else {
                    // قد تكون الجلسة مرتبطة بطلب خدمة إبداعية مباشرة
                    const relatedServiceOrder = serviceOrders.find(so => so.child_id === session.child_id && so.assigned_instructor_id === session.instructor_id);
                    if (relatedServiceOrder) {
                        const serviceDef = standaloneServices.find(s => s.id === relatedServiceOrder.service_id);
                        packageName = serviceDef?.name || 'خدمة إبداعية';
                    }
                }

                return {
                    ...session,
                    instructor_name: instructors.find(i => i.id === session.instructor_id)?.name || 'غير محدد',
                    child_name: children.find(c => c.id === session.child_id)?.name || 'غير محدد',
                    type: session.subscription_id ? 'اشتراك' : (booking ? 'حجز باقة' : 'خدمة فردية'),
                    package_name: packageName,
                    booking_status: status
                };
            })
            // استبعاد الملغي فقط، والسماح للبقية بالظهور لضمان عدم فراغ القائمة
            .filter(session => session.booking_status !== 'ملغي');
    },
});
