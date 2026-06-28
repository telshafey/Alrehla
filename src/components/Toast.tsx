import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const toastConfig = {
    success: {
        icon: <CheckCircle className="text-green-500" />,
        bgClass: 'bg-green-50 border-green-200',
    },
    error: {
        icon: <AlertCircle className="text-red-500" />,
        bgClass: 'bg-red-50 border-red-200',
    },
    info: {
        icon: <Info className="text-blue-500" />,
        bgClass: 'bg-blue-50 border-blue-200',
    },
    warning: {
        icon: <AlertTriangle className="text-yellow-500" />,
        bgClass: 'bg-yellow-50 border-yellow-200',
    },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const { icon, bgClass } = toastConfig[type];

    return (
        <div 
            className={`flex items-start justify-between w-full p-4 rounded-lg shadow-lg border animate-fadeIn ${bgClass}`}
            role="status"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{icon}</div>
                <p className="text-sm font-semibold text-gray-700">{message}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;