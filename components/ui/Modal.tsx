import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-2xl shadow-xl w-full flex flex-col m-4 animate-fadeIn max-h-[90vh] ${sizeClasses[size]}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-6 border-b">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-800">{title}</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </Button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
                {footer && (
                    <footer className="flex justify-end gap-4 p-6 border-t bg-gray-50 rounded-b-2xl">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Modal;
