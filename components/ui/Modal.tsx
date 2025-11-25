import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
    const modalRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    if (!isOpen || !mounted) return null;

    // Safety check: Ensure document.body exists before creating portal
    // This prevents "Minified React error #306"
    const container = typeof document !== 'undefined' ? document.body : null;
    if (!container) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <Card
                ref={modalRef}
                className={`w-full flex flex-col m-4 animate-fadeIn max-h-[90vh] ${sizeClasses[size]}`}
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle id="modal-title">{title}</CardTitle>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon" className="text-muted-foreground">
                        <X size={24} />
                    </Button>
                </CardHeader>
                <CardContent className="overflow-y-auto">
                    {children}
                </CardContent>
                {footer && (
                    <CardFooter className="justify-end gap-4 bg-muted/50 rounded-b-lg">
                        {footer}
                    </CardFooter>
                )}
            </Card>
        </div>,
        container
    );
};

export default Modal;