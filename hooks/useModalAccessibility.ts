
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
                // Ensure event doesn't bubble up unnecessarily
                event.stopPropagation();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        // Prevent background scroll while modal is open
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
            // No focusable elements? Focus the container itself so Escape works.
            if (!modalRef.current.contains(document.activeElement)) {
                (modalRef.current as HTMLElement).focus();
            }
            
            return () => {
                 document.removeEventListener('keydown', handleKeyDown);
                 document.body.style.overflow = originalStyle;
            }
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // --- FOCUS MANAGEMENT FIX ---
        // Check if focus is already inside the modal (e.g. user typing triggering a re-render).
        // We only force focus to the first element if the user is currently focused OUTSIDE the modal.
        const isFocusInside = modalRef.current.contains(document.activeElement);
        
        if (!isFocusInside) {
            const elementToFocus = initialFocusRef?.current || firstElement;
            if (elementToFocus) {
                elementToFocus.focus();
            }
        }
        // ----------------------------

        const handleTabKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    // Tab
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
            if (currentModal) {
                currentModal.removeEventListener('keydown', handleTabKeyPress);
            }
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen, onClose, modalRef, initialFocusRef]);
};
