
import type { Subscription } from '../lib/database.types';
import { supportedCountries, exchangeRates } from '../data/mockData';

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

export const formatCurrency = (amount: number | null | undefined, userCurrency: string = 'EGP'): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-';
    
    // Simple conversion for display (In real app, backend handles this)
    let convertedAmount = amount;
    let currencyCode = userCurrency;
    
    if (userCurrency !== 'EGP') {
        const rate = exchangeRates[userCurrency] || 1;
        convertedAmount = amount * rate;
    }

    // Round to avoid decimals if possible for clean UI
    convertedAmount = Math.ceil(convertedAmount);

    return new Intl.NumberFormat('ar-EG', { 
        style: 'currency', 
        currency: currencyCode,
        minimumFractionDigits: 0
    }).format(convertedAmount);
};

export const getStatusColor = (status: string | null): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const s = status.trim();

    if (['مكتمل', 'تم التسليم', 'مؤكد', 'نشط', 'مقبول', 'تمت الموافقة'].includes(s)) return 'bg-green-100 text-green-800 border-green-200';
    if (['تم الشحن', 'قيد التنفيذ'].includes(s)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['قيد التجهيز', 'جديد', 'جديدة'].includes(s)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (['بانتظار المراجعة', 'بانتظار الدفع', 'معلق'].includes(s)) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    if (['يحتاج مراجعة', 'متوقف مؤقتاً'].includes(s)) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (['ملغي', 'مرفوض', 'لم يحضر', 'cancelled'].includes(s)) return 'bg-red-100 text-red-800 border-red-200';
    
    return 'bg-gray-100 text-gray-800';
};

// Updated: Uses user's browser timezone automatically or explicitly if passed
export const formatDate = (dateString: string | null | undefined, includeTime: boolean = false, timeZone?: string): string => {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'تاريخ غير صالح';

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            // If timeZone is undefined, it defaults to browser's local time
            timeZone: timeZone || undefined
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

export const formatTime = (dateString: string | null | undefined, timeZone?: string): string => {
    if (!dateString) return '--:--';
    try {
        return new Intl.DateTimeFormat('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timeZone || undefined, // Dynamic timezone
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

/**
 * Generates a Google Calendar event URL
 */
export const generateGoogleCalendarUrl = (
    title: string,
    description: string,
    startTime: string, // ISO String
    durationMinutes: number = 60
): string => {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const formatGCalTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        details: description,
        dates: `${formatGCalTime(startDate)}/${formatGCalTime(endDate)}`,
        location: 'Alrehla Platform (Online)'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
