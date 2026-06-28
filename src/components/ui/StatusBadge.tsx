
import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, Clock, XCircle, AlertCircle, Truck, Package, Loader2 } from 'lucide-react';

type StatusType = 
    | 'بانتظار الدفع' | 'بانتظار المراجعة' | 'قيد التجهيز' | 'يحتاج مراجعة' 
    | 'تم الشحن' | 'تم التسليم' | 'مكتمل' | 'ملغي' | 'قيد التنفيذ' 
    | 'مؤكد' | 'نشط' | 'متوقف مؤقتاً' | 'جديد' | 'مقبول' | 'مرفوض';

interface StatusBadgeProps {
    status: string | null | undefined;
    className?: string;
    showIcon?: boolean;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        // Success / Completed
        case 'مكتمل':
        case 'تم التسليم':
        case 'مؤكد':
        case 'نشط':
        case 'مقبول':
        case 'تمت الموافقة':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
        
        // Processing / Active
        case 'قيد التجهيز':
        case 'قيد التنفيذ':
        case 'تم الشحن':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck };
        
        // Pending / Waiting
        case 'بانتظار الدفع':
        case 'بانتظار المراجعة':
        case 'جديد':
        case 'معلق':
        case 'جديدة':
            return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
        
        // Warning / Action Needed
        case 'يحتاج مراجعة':
        case 'متوقف مؤقتاً':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle };
        
        // Error / Cancelled
        case 'ملغي':
        case 'مرفوض':
        case 'لم يحضر':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
            
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package };
    }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showIcon = false }) => {
    if (!status) return null;
    
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap shadow-sm",
            config.color,
            className
        )}>
            {showIcon && <Icon size={12} strokeWidth={2.5} />}
            {status}
        </span>
    );
};

export default StatusBadge;
