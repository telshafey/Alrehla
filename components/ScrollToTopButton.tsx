import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-24 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 transform
                ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
            aria-label="العودة إلى الأعلى"
        >
            <ArrowUp size={24} />
        </button>
    );
};

export default ScrollToTopButton;