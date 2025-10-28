export const getStatusColor = (status: string | null): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
        case 'تم التسليم':
        case 'مكتمل':
            return 'bg-green-100 text-green-800';
        case 'تم الشحن':
        case 'مؤكد':
            return 'bg-blue-100 text-blue-800';
        case 'قيد التجهيز':
            return 'bg-yellow-100 text-yellow-800';
        case 'بانتظار المراجعة':
            return 'bg-indigo-100 text-indigo-800';
        case 'بانتظار الدفع':
            return 'bg-gray-200 text-gray-800';
        case 'يحتاج مراجعة':
            return 'bg-orange-100 text-orange-800';
        case 'ملغي':
            return 'bg-red-100 text-red-800';
        case 'نشط':
             return 'bg-indigo-100 text-indigo-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'غير محدد';
    try {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch(e) {
        return 'تاريخ غير صالح';
    }
};

export const daysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const firstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};