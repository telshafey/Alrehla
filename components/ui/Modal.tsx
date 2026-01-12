
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from './Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
    const modalRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // Wait for animation
    };

    // Cast refs to any to bypass strict type checking between HTMLElement and specific element types
    useModalAccessibility({ 
        modalRef, 
        isOpen, 
        onClose: handleClose, 
        initialFocusRef: closeButtonRef as any 
    });

    if (!isOpen || !mounted) return null;

    const container = typeof document !== 'undefined' ? document.body : null;
    if (!container) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal Content - Bottom Sheet on Mobile, Centered Card on Desktop */}
            <Card
                ref={modalRef as any}
                className={`
                    relative w-full flex flex-col bg-background shadow-2xl
                    animate-slideUp sm:animate-fadeIn
                    rounded-t-2xl sm:rounded-xl
                    max-h-[85vh] sm:max-h-[90vh]
                    ${sizeClasses[size]}
                    border-b-0 sm:border-b
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Drag Handle Indicator */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden cursor-pointer" onClick={handleClose}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b sm:border-b-0">
                    <CardTitle id="modal-title" className="text-lg sm:text-xl">{title}</CardTitle>
                    <Button ref={closeButtonRef as any} onClick={handleClose} variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted rounded-full">
                        <X size={20} />
                    </Button>
                </CardHeader>
                
                <CardContent className="overflow-y-auto px-6 py-4 custom-scrollbar">
                    {children}
                </CardContent>
                
                {footer && (
                    <CardFooter className="justify-end gap-3 bg-muted/30 px-6 py-4 rounded-b-xl mt-auto border-t">
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>,
        container
    );
};

export default Modal;
