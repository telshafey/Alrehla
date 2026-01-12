
import { useQuery } from '@tanstack/react-query';
import { publicService } from '../../../services/publicService';
import { bookingService } from '../../../services/bookingService';

export const useBookingData = () => {
    return useQuery({
        queryKey: ['creativeWritingBookingData'],
        queryFn: async () => {
            const data = await publicService.getAllPublicData();
            // جلب كافة الحجوزات النشطة لفلترة المواعيد المشغولة
            const bookingsResult = await bookingService.getAllBookings();
            
            return {
                instructors: data.instructors,
                cw_packages: data.creativeWritingPackages,
                holidays: data.publicHolidays,
                cw_services: data.standaloneServices,
                // تصحيح: تمرير إعدادات التسعير من الجذر مباشرة
                pricingConfig: data.pricingSettings,
                // نرسل فقط الحجوزات غير الملغية
                activeBookings: bookingsResult.bookings.filter(b => b.status !== 'ملغي')
            };
        },
        staleTime: 1000 * 30, // تحديث كل 30 ثانية لضمان دقة المواعيد
    });
};

export const useOrderData = () => {
    return useQuery({
        queryKey: ['enhaLakOrderData'],
        queryFn: async () => {
            const data = await publicService.getAllPublicData();
            return {
                personalizedProducts: data.personalizedProducts,
            };
        },
        staleTime: 1000 * 60 * 5,
    });
};