

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let id = 1;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        setToasts(toasts => [...toasts, { id: id++, message, type }]);
    }, []);

    const removeToast = useCallback((toastId: number) => {
        setToasts(toasts => toasts.filter(t => t.id !== toastId));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-2 w-full max-w-sm">
                {toasts.map(toast => (
                    <Toast 
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};