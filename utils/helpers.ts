
import type { Subscription } from '../lib/database.types';

export const calculateAge = (birthDateString: string | null | undefined): number | null => {
    if (!birthDateString) return null;
    try {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 0 ? 0 : age;
    } catch (e) {
        return null;
    }
};

export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

export const getStatusColor = (status: string | null): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    // تطبيع الحالة لإزالة المسافات الزائدة
    const s = status.trim();

    if (['مكتمل', 'تم التسليم', 'مؤكد', 'نشط', 'مقبول', 'تمت الموافقة'].includes(s)) return 'bg-green-100 text-green-800 border-green-200';
    if (['تم الشحن', 'قيد التنفيذ'].includes(s)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['قيد التجهيز', 'جديد', 'جديدة'].includes(s)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (['بانتظار المراجعة', 'بانتظار الدفع', 'معلق'].includes(s)) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (['يحتاج مراجعة', 'متوقف مؤقتاً'].includes(s)) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (['ملغي', 'مرفوض', 'لم يحضر', 'cancelled'].includes(s)) return 'bg-red-100 text-red-800 border-red-200';
    
    return 'bg-gray-100 text-gray-800';
};

// دالة موحدة لجميع تواريخ الموقع
export const formatDate = (dateString: string | null | undefined, includeTime: boolean = false): string => {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        // التحقق من صحة التاريخ
        if (isNaN(date.getTime())) return 'تاريخ غير صالح';

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Africa/Cairo'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.hour12 = true;
        }

        return new Intl.DateTimeFormat('ar-EG', options).format(date);
    } catch(e) {
        return 'تاريخ غير صالح';
    }
};

export const formatTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '--:--';
    try {
        return new Intl.DateTimeFormat('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Cairo',
            hour12: true
        }).format(new Date(dateString));
    } catch(e) {
        return '--:--';
    }
};

export const daysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const firstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};
