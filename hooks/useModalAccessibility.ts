
import { useEffect, RefObject } from 'react';

interface UseModalAccessibilityProps {
    modalRef: RefObject<HTMLElement>;
    isOpen: boolean;
    onClose: () => void;
    initialFocusRef?: RefObject<HTMLElement>;
}

export const useModalAccessibility = ({
    modalRef,
    isOpen,
    onClose,
    initialFocusRef,
}: UseModalAccessibilityProps) => {
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
            // If no focusable elements, focus the container so Escape key works
            // Only force focus if we aren't already focused inside
            if (!modalRef.current.contains(document.activeElement)) {
                (modalRef.current as HTMLElement).focus();
            }
            
            return () => {
                 document.removeEventListener('keydown', handleKeyDown);
                 document.body.style.overflow = 'auto';
            }
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // --- CRITICAL FIX ---
        // Check if the currently focused element is ALREADY inside the modal.
        // If yes (e.g., user is typing in an input causing a re-render), DO NOT reset focus.
        // If no (e.g., modal just opened), set initial focus.
        if (!modalRef.current.contains(document.activeElement)) {
            const elementToFocus = initialFocusRef?.current || firstElement;
            elementToFocus?.focus();
        }
        // --------------------

        const handleTabKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        const currentModal = modalRef.current;
        currentModal.addEventListener('keydown', handleTabKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            currentModal?.removeEventListener('keydown', handleTabKeyPress);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose, modalRef, initialFocusRef]);
};
